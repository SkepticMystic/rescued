import type { Pathname } from "$app/types";
import { APP } from "$lib/const/app.const";
import { db } from "$lib/server/db/drizzle.db";
import { Repo } from "$lib/server/db/repos/index.repo";
import { result } from "$lib/utils/result.util";
import type { RequestHandler } from "@sveltejs/kit";
import * as sitemap from "super-sitemap";

export const prerender = true;

export const GET: RequestHandler = async () => {
  const [shelters, animals] = await Promise.all([
    Repo.query(
      db.query.shelter.findMany({
        columns: { slug: true, updatedAt: true },
      }),
    ).then((r) => result.unwrap_or(r, [])),
    Repo.query(
      db.query.animal.findMany({
        columns: { short_id: true, updatedAt: true },
      }),
    ).then((r) => result.unwrap_or(r, [])),
  ]);

  return await sitemap.response({
    origin: APP.URL,

    // NOTE: Exclusions check /(groups)
    excludeRoutePatterns: [
      // Shelter-internal (authenticated app)
      "^/\\(authed\\)",

      // Onboarding + auth flows (keep signin/signup discoverable)
      "^/\\(marketing\\)/onboarding",
      "^/\\(marketing\\)/auth/verify-email",
      "^/\\(marketing\\)/auth/reset-password",
      "^/\\(marketing\\)/auth/forgot-password",
      "^/\\(marketing\\)/auth/two-factor",
      "^/\\(marketing\\)/auth/account-deleted",
      "^/\\(marketing\\)/auth/organization",
    ],

    paramValues: {
      "/shelters/[slug]": shelters.map((s) => ({
        values: [s.slug],
        lastmod: s.updatedAt?.toISOString().split("T")[0],
      })),
      "/animals/[short_id]": animals.map((a) => ({
        values: [a.short_id],
        lastmod: a.updatedAt?.toISOString().split("T")[0],
      })),
    } satisfies Partial<Record<Pathname, sitemap.ParamValues[string]>>,
  });
};
