import { command, form, query } from "$app/server";
import { db } from "$lib/server/db/drizzle.db";
import { ShelterSchema, type Shelter } from "$lib/server/db/models/shelter.model";
import { Repo } from "$lib/server/db/repos/index.repo";
import { get_session } from "$lib/server/services/auth.service";
import { ShelterService } from "$lib/server/services/shelter/shelter.service";
import { result } from "$lib/utils/result.util";
import { invalid } from "@sveltejs/kit";
import { z } from "zod";

export const list_my_shelters_remote = query(async () => {
  const session = await get_session();
  if (!session.ok) return [];
  else if (!session.data.session.org_id) return [];

  const shelters = await Repo.query(
    db.query.shelter.findMany({
      columns: { id: true, name: true },
      where: { org_id: session.data.session.org_id },
    }),
  ).then((r) => result.unwrap_or(r, []));

  return shelters;
});

export const create_shelter_remote = form(
  ShelterSchema.insert.extend({
    image: z.file().optional(),
  }),
  async (input): Promise<App.Result<Shelter>> => {
    const session = await get_session();
    if (!session.ok) return session;

    const res = await ShelterService.create(input, session.data);
    if (!res.ok && res.error.path) {
      invalid(res.error);
    }

    return res;
  },
);

export const update_shelter_remote = form(
  ShelterSchema.update.extend({
    image: z.file().optional(),
  }),
  async (input) => {
    const session = await get_session();
    if (!session.ok) return session;

    const res = await ShelterService.update(input, session.data);
    if (!res.ok && res.error.path) {
      invalid(res.error);
    }

    return res;
  },
);

export const delete_shelter_remote = command(
  z.uuid(), //
  async (shelter_id) => {
    const session = await get_session();
    if (!session.ok) return session;

    const res = await ShelterService.del(shelter_id, session.data);

    return res;
  },
);
