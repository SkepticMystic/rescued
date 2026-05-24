import { db } from "$lib/server/db/drizzle.db";
import { Repo } from "$lib/server/db/repos/index.repo";
import { result } from "$lib/utils/result.util";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
  const shelters = await Repo.query(
    db.query.shelter.findMany({
      orderBy: { createdAt: "desc" },

      columns: {
        id: true,
        short_id: true,
        slug: true,
        name: true,
        description: true,
        suburb: true,
        city: true,
        province: true,
      },

      with: {
        images: {
          columns: { id: true, url: true, thumbhash: true },
          limit: 1,
        },
        animals: { columns: { id: true } },
      },
    }),
  ).then((r) => result.unwrap_or(r, []));

  return { shelters };
}) satisfies PageServerLoad;
