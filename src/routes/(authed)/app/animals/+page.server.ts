import { ERROR } from "$lib/const/error.const";
import { db } from "$lib/server/db/drizzle.db";
import { Repo } from "$lib/server/db/repos/index.repo";
import { get_session } from "$lib/server/services/auth.service";
import { result } from "$lib/utils/result.util";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
  const session = await get_session();
  if (!session.ok) {
    error(session.error.status ?? 401, session.error);
  } else if (!session.data.session.org_id) {
    error(403, ERROR.FORBIDDEN);
  }

  const animals = await Repo.query(
    db.query.animal.findMany({
      where: {
        org_id: session.data.session.org_id,
      },

      orderBy: { createdAt: "desc" },

      columns: {
        id: true,
        short_id: true,
        name: true,
        species: true,
        status: true,
        createdAt: true,
      },
    }),
  ).then((r) => result.unwrap_or(r, []));

  return { animals };
}) satisfies PageServerLoad;
