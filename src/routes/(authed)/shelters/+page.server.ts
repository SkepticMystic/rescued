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

  const shelters = await Repo.query(
    db.query.shelter.findMany({
      where: { org_id: session.data.session.org_id },

      orderBy: { createdAt: "desc" },

      columns: {
        id: true,
        short_id: true,
        name: true,
        slug: true,
        address: true,
        contact_email: true,
        createdAt: true,
      },

      with: {
        animals: { columns: { id: true } },
      },
    }),
  ).then((r) => result.unwrap_or(r, []));

  return { shelters };
}) satisfies PageServerLoad;
