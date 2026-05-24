import { timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const Schema = {
  id: () => ({
    id: uuid().primaryKey().defaultRandom(),
  }),

  short_id: (length = 8) => ({
    short_id: varchar({ length })
      .notNull()
      .$defaultFn(() =>
        nanoid()
          .replaceAll(/[-_o0i1l]/gi, "")
          .slice(0, length)
          .toUpperCase(),
      ),
  }),

  timestamps: {
    createdAt: timestamp({ mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => /* @__PURE__ */ new Date()),
  },
};
