import { geometry, index, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { phone_schema } from "../../../schema/phone/phone.schema";
import { OrganizationTable } from "./auth.model";
import { Schema } from "./index.schema";

export const ShelterTable = pgTable(
  "shelter",
  {
    ...Schema.id(),
    ...Schema.short_id(),

    org_id: uuid()
      .notNull()
      .references(() => OrganizationTable.id, { onDelete: "cascade" }),

    name: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 255 }).notNull(),
    description: text(),

    contact_email: varchar({ length: 255 }),
    contact_phone: varchar({ length: 50 }),

    address: text().notNull(),
    google_place_id: text().notNull(),
    location: geometry("location", {
      type: "point",
      mode: "xy",
      srid: 4326,
    }).notNull(),

    street_number: varchar({ length: 50 }),
    street_name: varchar({ length: 255 }),
    suburb: varchar({ length: 255 }),
    city: varchar({ length: 255 }),
    province: varchar({ length: 255 }),
    postal_code: varchar({ length: 20 }),
    country: varchar({ length: 2 }),

    ...Schema.timestamps,
  },
  (t) => [
    index("idx_shelter_org_id").on(t["org_id"]),
    index("idx_shelter_slug").on(t["slug"]),
    index("idx_shelter_short_id").on(t["short_id"]),
    index("idx_shelter_location_gist").using("gist", t.location),
  ],
);

export type Shelter = typeof ShelterTable.$inferSelect;

const pick = {
  name: true,
  description: true,
  contact_email: true,
  contact_phone: true,

  address: true,
  google_place_id: true,
  location: true,

  street_number: true,
  street_name: true,
  suburb: true,
  city: true,
  province: true,
  postal_code: true,
  country: true,
} satisfies Partial<Record<keyof Shelter, true>>;

const optional_string = z
  .union([z.string().trim(), z.literal("").transform(() => undefined)])
  .optional();

const refinements = {
  name: z.string().trim().min(1, "Name is required"),

  description: z
    .union([
      z.string().trim().max(1000, "Description must be at most 1000 characters"),
      z.literal("").transform(() => undefined),
    ])
    .optional(),

  contact_email: z
    .union([z.email("Must be a valid email"), z.literal("").transform(() => undefined)])
    .optional(),

  contact_phone: z.union([z.literal("").transform(() => undefined), phone_schema]).optional(),

  address: z.string().trim().min(1, "Address is required"),
  google_place_id: z.string().trim().min(1, "Please select an address from the dropdown"),
  location: z.object({
    x: z.coerce
      .number<string>()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180"),
    y: z.coerce
      .number<string>()
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90"),
  }),

  street_number: optional_string,
  street_name: optional_string,
  suburb: optional_string,
  city: optional_string,
  province: optional_string,
  postal_code: optional_string,
  country: optional_string,
};

export const ShelterSchema = {
  insert: createInsertSchema(ShelterTable, refinements).pick(pick),
  update: createUpdateSchema(ShelterTable, refinements).pick(pick).extend({ id: z.uuid() }),
};

export namespace ShelterSchema {
  export type InsertIn = z.input<typeof ShelterSchema.insert>;
  export type InsertOut = z.output<typeof ShelterSchema.insert>;
  export type UpdateIn = z.input<typeof ShelterSchema.update>;
  export type UpdateOut = z.output<typeof ShelterSchema.update>;
}
