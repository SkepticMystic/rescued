# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Rescued** is an animal shelter management application built with SvelteKit. It helps shelters and rescues track animals, manage intake/adoption status, upload photos, and run their day-to-day operations.

Core domain entities:

- **Organization** (a shelter operator / rescue) — multi-tenant root, owns everything below
- **Shelter** — a physical location belonging to an organization (name, address, contact email/phone, geolocation)
- **Animal** — an animal in a shelter's care (species: dog/cat/other; sex; date of birth; status: intake/available/fostered/adopted/medical_hold/archived)
- **Image** — photos attached to animals or shelters via a polymorphic resource link

**Tech Stack**: Node 24, pnpm 10.23.0, Svelte 5, SvelteKit, TypeScript, Drizzle ORM, PostgreSQL (Neon) + PostGIS, Redis (Upstash), Better-Auth, Paystack (subscriptions), Resend (email), Pino (logging), Cloudflare R2 (image storage), libphonenumber-js (ZA phone validation). Deployed on Vercel.

## Development Commands

### Package Manager

This project uses **pnpm** (v10.23.0). Always use `pnpm` commands instead of `npm`.

### Core Commands

- `pnpm install` — Install dependencies
- `pnpm dev` — Start development server (port 5173)
- `pnpm build` — Build for production
- `pnpm preview` — Preview production build

### Type Checking & Linting

- `pnpm check:slow` — Run svelte-check for type checking
- `pnpm lint` — Run oxlint (type-aware), eslint, and prettier checks
- `pnpm format` — Format code with prettier

### Testing

- `pnpm test` — Vite+ test runner (watch)
- `pnpm test:run` — Single test run
- `pnpm test:integration` — Integration project (passes with no tests if empty)
- `pnpm test:coverage` — With coverage

### Database Commands

Database commands use a custom script wrapper (`scripts/drizzle/kit.script.ts`) that invokes drizzle-kit:

- `pnpm db:push` — Push schema changes to database (development)
- `pnpm db:generate` — Generate migrations (production env)
- `pnpm db:check` — Check migration status (production env)
- `pnpm db:migrate` — Apply migrations (used in Vercel build)
- `pnpm db:studio` — Open Drizzle Studio

### Other Tools

- `pnpm knip` — Find unused files, dependencies, and exports

## Architecture

### Directory Layout

```
src/
  lib/
    auth.ts, auth-client.ts        Better-Auth config (server + client)
    clients/                       Browser-side wrappers (e.g. ImageClient)
    components/
      blocks/                      Page-level composite blocks
      form/                        Domain forms (animal, shelter, image, ...)
      image/                       Picture, DeleteImageButton, ...
      input/                       EmailInput, TelInput, ...
      selector/                    Async selectors (ShelterNativeSelect, ...)
      ui/                          Primitive UI kit (button, input, native-select, ...)
    const/                         Domain constants (animal.const, image, ...)
    remote/                        Remote functions, one folder per domain
      animals/  shelters/  image/  auth/  contact/  subscription/  tasks/  transaction/
    schema/                        Reusable Zod schemas (phone, password, query)
    server/
      db/
        drizzle.db.ts              DB client
        models/                    Drizzle table definitions + Zod refinements
        repos/                     Query helpers wrapping db.query with Result
      services/                    Server business logic (animal, shelter, image, ...)
    stores/                        Svelte stores
    utils/                         Pure utilities (result, phone, logger, ...)
  routes/
    (authed)/                      Auth-required group: animals, shelters, tasks, settings, admin, home
    (marketing)/                   Public group: landing, auth, contact, onboarding
```

### Authentication Architecture

- **Better-Auth** integration with custom configuration in `src/lib/auth.ts`
- Split between client (`auth-client.ts`) and server (`server/services/auth.service.ts`)
- Database session storage disabled in favor of cookie caching
- Custom session fields for organization membership (`member_id`, `member_role`, `org_id`)
- Automatic organization creation on first login via database hook (an org maps to a shelter operator)
- Supports multiple auth providers:
  - Email/Password with verification
  - Google OAuth
  - Generic OAuth (Pocket ID)
  - Passkeys
- **Permissions** managed through `src/lib/auth/permissions.ts` with AccessControl

### Database Architecture

- **Drizzle ORM** with PostgreSQL (Neon) + **PostGIS** for shelter locations
- Schema files use `*.model.ts` naming convention in `src/lib/server/db/models/`
- All tables use UUID primary keys via `Schema.id()` from `index.schema.ts`
- Many tables also have a human-friendly `short_id` via `Schema.short_id()`
- Timestamps use `Schema.timestamps` helper (`createdAt`, `updatedAt`)
- Columns are `snake_case` (configured in `drizzle.config.ts`)
- Never use BetterAuth's nanoid generation; custom UUID generation is configured
- Redis configured as secondary storage for Better-Auth (rate limiting, caching)

Current models:

- `auth.model.ts` — User, Session, Account, Organization, Member, Invitation, Passkey, Verification
- `shelter.model.ts` — Shelter (with PostGIS `geometry(point, 4326)` location)
- `animal.model.ts` — Animal (linked to Shelter and Organization; enums for species/sex/status)
- `image.model.ts` — Polymorphic image attachments (`resource_kind`, `resource_id`)
- `subscription.model.ts` — Paystack subscription state
- `task.model.ts` — Background task state
- `postgis.model.ts` — PostGIS column type helpers
- `index.schema.ts` — Shared schema utilities (ID generation, timestamps, short_id)

### Domain Conventions

- An animal **must** belong to a shelter and an organization (FKs with `onDelete: "cascade"`)
- A shelter has a single PostGIS point `location` plus a denormalised address breakdown (`street_number`, `street_name`, `suburb`, `city`, `province`, `postal_code`, `country`) and a `google_place_id` selected from a Places autocomplete
- `contact_phone` is validated and normalised to E.164 via `phone_schema` (ZA default region); display formatting uses `PhoneUtil.formatNationalZA`
- Animal species/sex/status are Postgres enums backed by const arrays in `src/lib/const/animal.const.ts` (`ANIMALS.SPECIES`, `ANIMALS.SEX`, `ANIMALS.STATUS`) — add new values in both places
- Images are attached via a `resource_kind` + `resource_id` pair (currently `"animal" | "shelter"`); the resource service centralises the polymorphism
- Image sizes live in `IMAGES.SIZES` in `src/lib/const/image/image.const.ts` (e.g. `LIST_MEDIA`, `THUMBNAIL_LG`) — spread these into `<Picture>` rather than hardcoding dimensions

### SvelteKit Configuration

- **Experimental features enabled**:
  - `remoteFunctions: true` — Server functions callable from client (see Remote Functions pattern below)
  - `async: true` — Async components in Svelte 5
- Vercel adapter for deployment
- Build command includes database migration: `vite build && pnpm db migrate`

### Remote Functions Pattern

Remote functions (in `src/lib/remote/<domain>/<domain>.remote.ts`) use SvelteKit's experimental feature to call server code from client:

- Use `form()` from `$app/server` to create type-safe forms
- Use `query()` from `$app/server` to create type-safe queries (preloaded on the client; great for selectors)
- Use `command()` from `$app/server` to create type-safe commands
- First argument: Zod schema for validation
- Second argument: async handler function with validated input
- `form` handler can call `invalid(issue.fieldName(message))` to return field-specific errors
- Use `result.err({ message })` for general errors
- Use `redirect()` to navigate after successful operations
- Queries that feed `NativeSelect`/selector components should return a plain array (use `result.unwrap_or(r, [])`) so the component can `.then(...)` directly
- Example: `src/lib/remote/shelters/shelters.remote.ts` (`list_my_shelters_remote` powers `ShelterNativeSelect`)

### Forms & Inputs

- Domain form components live in `src/lib/components/form/<domain>/`
- Shared input wrappers: `EmailInput`, `TelInput` (in `src/lib/components/input/`) — these bundle `type`, `icon`, `inputmode`, `enterkeyhint`, `autocomplete`, etc., so callers don't repeat the attribute soup
- Async selectors: `<ShelterNativeSelect>` wraps `NativeSelect` and resolves options from a remote query; auto-selects when only one option is returned
- When using svelte remote forms, spreading `field.as(type)` onto the input already adds the `type="..."` attribute — don't duplicate it
- `DeleteImageButton` (in `src/lib/components/image/`) takes an image `id` and an optional `on_delete` callback; use it instead of inlining the delete `Button` on edit pages

### Phone Numbers

- Validation & normalisation: `phone_schema` in `src/lib/schema/phone/phone.schema.ts` — parses with `libphonenumber-js` defaulting to region `"ZA"`, returns E.164, emits a `custom` Zod issue on invalid input
- Display formatting: `PhoneUtil.formatNationalZA` in `src/lib/utils/phone/phone.util.ts` — formats E.164 ZA numbers as national (`082 123 4567`) with safe fallback to the raw input
- `<PhoneAnchor>` in `src/lib/components/ui/anchor/` renders a `tel:` link with the formatted national display value

### State Management

- Svelte 5 runes for reactive state (`$state`, `$derived`, `$props`, `$bindable`)
- Stores in `src/lib/stores/` for shared state (organizations, session)
- Better-Auth client provides session management

### Logging & Errors

- Custom logging utility using **Pino** (`src/lib/utils/logger.util`)
- Configured with pretty-printing in development
- Use `Log.info()`, `Log.error()`, `Log.debug()`, etc. throughout the codebase
- Log level controlled by `LOG_LEVEL` environment variable
- Use `result.err({ message })` utility for consistent error responses
- Use Sentry `captureException` for unexpected errors
- Custom error codes defined in `$lib/auth-client` as `$ERROR_CODES`

## Key Patterns and Conventions

### Naming

- Database schema files: `*.model.ts`
- Remote functions: `*.remote.ts`
- Services: `*.service.ts`
- Repos: `*.repo.ts`
- Utilities: `*.util.ts`
- Tests: `*.test.ts` co-located with the file under test
- Import aliases: use `$lib`, `$app`, `$env` SvelteKit aliases
- TypeScript namespaces preferred for organising related types (e.g. `AnimalSchema.InsertIn`, `IAuth.ProviderId`)

### Result Pattern

- Server services return `App.Result<T>` (success/error union)
- Unwrap with `result.unwrap_or(r, fallback)` when you have a sensible default (e.g. `[]` for a list)
- Check `result.ok` and branch when the error matters
- `Repo.query(...)` wraps Drizzle queries and returns a Result

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp lint`, `pnpm check:slow` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.

<!--VITE PLUS END-->
