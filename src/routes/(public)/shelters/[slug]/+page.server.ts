import { db } from "$lib/server/db/drizzle.db";
import { Repo } from "$lib/server/db/repos/index.repo";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params }) => {
  const shelter = await Repo.query(
    db.query.shelter.findFirst({
      where: { slug: params.slug },

      columns: {
        id: true,
        short_id: true,
        slug: true,
        name: true,
        description: true,
        address: true,
        contact_email: true,
        contact_phone: true,
        suburb: true,
        city: true,
        province: true,
        createdAt: true,
      },

      with: {
        images: {
          columns: { id: true, url: true, thumbhash: true },
        },
        animals: {
          columns: {
            id: true,
            short_id: true,
            name: true,
            species: true,
            status: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
  );

  if (!shelter.ok || !shelter.data) {
    error(404, "Shelter not found");
  }

  return { shelter: shelter.data };
}) satisfies PageServerLoad;
