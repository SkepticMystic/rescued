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

  const animal = await Repo.query(
    db.query.animal.findFirst({
      where: {
        id: params.id,
        org_id: session.data.session.activeOrganizationId,
      },
      columns: {
        id: true,
        short_id: true,
        shelter_id: true,
        name: true,
        species: true,
        sex: true,
        status: true,
        date_of_birth: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
      with: {
        images: {
          columns: { id: true, url: true, thumbhash: true },
        },
        shelter: {
          columns: { id: true, name: true },
        },
      },
    }),
  );

  if (!animal.ok || !animal.data) {
    error(404, "Animal not found");
  }

  return { animal: animal.data };
}) satisfies PageServerLoad;
