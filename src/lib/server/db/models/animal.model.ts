import { index, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { ANIMALS } from "../../../const/animal.const";
import { OrganizationTable } from "./auth.model";
import { Schema } from "./index.schema";
import { ShelterTable } from "./shelter.model";

export const animal_species_enum = pgEnum("animal_species", ANIMALS.SPECIES.IDS);
export const animal_sex_enum = pgEnum("animal_sex", ANIMALS.SEX.IDS);
export const animal_status_enum = pgEnum("animal_status", ANIMALS.STATUS.IDS);

export const AnimalTable = pgTable(
  "animal",
  {
    ...Schema.id(),
    ...Schema.short_id(),

    org_id: uuid()
      .notNull()
      .references(() => OrganizationTable.id, { onDelete: "cascade" }),
    shelter_id: uuid()
      .notNull()
      .references(() => ShelterTable.id, { onDelete: "cascade" }),

    name: varchar({ length: 255 }),
    species: animal_species_enum().notNull(),
    sex: animal_sex_enum().default("unknown").notNull(),
    date_of_birth: timestamp({ mode: "date" }),
    status: animal_status_enum().default("intake").notNull(),
    description: text(),

    ...Schema.timestamps,
  },
  (table) => [
    index("idx_animal_org_id").on(table["org_id"]),
    index("idx_animal_shelter_id").on(table["shelter_id"]),
    index("idx_animal_short_id").on(table["short_id"]),
  ],
);

export type Animal = typeof AnimalTable.$inferSelect;

const pick = {
  shelter_id: true,
  name: true,
  species: true,
  sex: true,
  date_of_birth: true,
  status: true,
  description: true,
} satisfies Partial<Record<keyof Animal, true>>;

const refinements = {
  shelter_id: z.uuid("Shelter is required"),
  name: z
    .string()
    .trim()
    .transform((v) => v || undefined)
    .optional(),
  description: z
    .string()
    .trim()
    .transform((v) => v || undefined)
    .optional(),
  date_of_birth: z
    .union([z.literal("").transform((_) => undefined), z.coerce.date<string>("Invalid date")])
    .optional(),
};

export const AnimalSchema = {
  insert: createInsertSchema(AnimalTable, refinements).pick(pick),
  update: createUpdateSchema(AnimalTable, refinements).pick(pick).extend({ id: z.uuid() }),
};

export namespace AnimalSchema {
  export type InsertIn = z.input<typeof AnimalSchema.insert>;
  export type InsertOut = z.output<typeof AnimalSchema.insert>;
  export type UpdateIn = z.input<typeof AnimalSchema.update>;
  export type UpdateOut = z.output<typeof AnimalSchema.update>;
}
