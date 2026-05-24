import { db } from "$lib/server/db/drizzle.db";
import { Repo } from "$lib/server/db/repos/index.repo";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params }) => {
  const animal = await Repo.query(
    db.query.animal.findFirst({
      where: { short_id: params.short_id },

      columns: {
        id: true,
        short_id: true,
        name: true,
        species: true,
        sex: true,
        status: true,
        date_of_birth: true,
        description: true,
        createdAt: true,
      },

      with: {
        images: {
          columns: { id: true, url: true, thumbhash: true },
        },
        shelter: {
          columns: { id: true, slug: true, name: true },
        },
      },
    }),
  );

  if (!animal.ok || !animal.data) {
    error(404, "Animal not found");
  }

  return { animal: animal.data };
}) satisfies PageServerLoad;
