import { ERROR } from "$lib/const/error.const";
import { db } from "$lib/server/db/drizzle.db";
import { AnimalTable, type Animal, type AnimalSchema } from "$lib/server/db/models/animal.model";
import { Repo } from "$lib/server/db/repos/index.repo";
import { Log } from "$lib/utils/logger.util";
import { result } from "$lib/utils/result.util";
import { captureException } from "@sentry/sveltekit";
import { operators } from "drizzle-orm";
import { ImageService } from "../image/image.service";

const log = Log.child({ service: "animal" });

export namespace AnimalService {
  export async function create(
    input: AnimalSchema.InsertOut & { image?: File },
    session: App.Session,
  ): Promise<App.Result<Animal>> {
    try {
      if (!session.session.org_id) {
        return result.err(ERROR.FORBIDDEN);
      }

      const { image, ...values } = input;

      const animal = await Repo.insert_one(
        db
          .insert(AnimalTable)
          .values({
            ...values,

            org_id: session.session.org_id,
          })
          .returning(),
      );
      if (!animal.ok) return animal;

      if (image) {
        await ImageService.upload(
          {
            file: image,
            resource_kind: "animal",
            resource_id: animal.data.id,
          },
          session,
        );
      }

      return animal;
    } catch (error) {
      log.error(error, "create.error unknown");

      captureException(error, { extra: { input } });

      return result.err(ERROR.INTERNAL_SERVER_ERROR);
    }
  }

  export async function update(
    input: AnimalSchema.UpdateOut & { image?: File },
    session: App.Session,
  ): Promise<App.Result<Animal>> {
    try {
      if (!session.session.org_id) {
        return result.err(ERROR.FORBIDDEN);
      }

      const { image, ...values } = input;

      const animal = await Repo.update_one(
        db
          .update(AnimalTable)
          .set(values)
          .where(
            operators.and(
              operators.eq(AnimalTable.id, input.id), //
              operators.eq(AnimalTable.org_id, session.session.org_id),
            ),
          )
          .returning(),
      );
      if (!animal.ok) return animal;

      if (image) {
        await ImageService.upload(
          {
            file: image,
            resource_kind: "animal",
            resource_id: animal.data.id,
          },
          session,
        );
      }

      return animal;
    } catch (error) {
      log.error(error, "update.error unknown");

      captureException(error, { extra: { input } });

      return result.err(ERROR.INTERNAL_SERVER_ERROR);
    }
  }

  export async function del(animal_id: string, session: App.Session): Promise<App.Result<void>> {
    try {
      if (!session.session.org_id) {
        return result.err(ERROR.FORBIDDEN);
      }

      const res = await Repo.delete_one(
        db
          .delete(AnimalTable)
          .where(
            operators.and(
              operators.eq(AnimalTable.id, animal_id), //
              operators.eq(AnimalTable.org_id, session.session.org_id),
            ),
          )
          .execute(),
      );

      return res;
    } catch (error) {
      log.error(error, "delete.error unknown");

      captureException(error, { extra: { animal_id } });

      return result.err(ERROR.INTERNAL_SERVER_ERROR);
    }
  }
}
