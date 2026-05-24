import { command, form } from "$app/server";
import { AnimalSchema, type Animal } from "$lib/server/db/models/animal.model";
import { AnimalService } from "$lib/server/services/animal/animal.service";
import { get_session } from "$lib/server/services/auth.service";
import { invalid } from "@sveltejs/kit";
import { z } from "zod";

export const create_animal_remote = form(
  AnimalSchema.insert.extend({
    image: z.file().optional(),
  }),
  async (input): Promise<App.Result<Animal>> => {
    const session = await get_session();
    if (!session.ok) return session;

    const res = await AnimalService.create(input, session.data);
    if (!res.ok && res.error.path) {
      invalid(res.error);
    }

    return res;
  },
);

export const update_animal_remote = form(
  AnimalSchema.update.extend({
    image: z.file().optional(),
  }),
  async (input) => {
    const session = await get_session();
    if (!session.ok) return session;

    const res = await AnimalService.update(input, session.data);
    if (!res.ok && res.error.path) {
      invalid(res.error);
    }

    return res;
  },
);

export const delete_animal_remote = command(
  z.uuid(), //
  async (animal_id) => {
    const session = await get_session();
    if (!session.ok) return session;

    const res = await AnimalService.del(animal_id, session.data);

    return res;
  },
);
