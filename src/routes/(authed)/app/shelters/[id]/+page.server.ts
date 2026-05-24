import { db } from "$lib/server/db/drizzle.db";
import { Repo } from "$lib/server/db/repos/index.repo";
import { get_session } from "$lib/server/services/auth.service";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params }) => {
  const session = await get_session();
  if (!session.ok) {
    error(session.error.status ?? 401, session.error);
  } else if (!session.data.session.activeOrganizationId) {
    redirect(302, "/onboarding");
  }

  const shelter = await Repo.query(
    db.query.shelter.findFirst({
      where: {
        id: params.id,
        org_id: session.data.session.activeOrganizationId,
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
