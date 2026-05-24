import { ERROR } from "$lib/const/error.const";
import { db } from "$lib/server/db/drizzle.db";
import {
  ShelterTable,
  type Shelter,
  type ShelterSchema,
} from "$lib/server/db/models/shelter.model";
import { Repo } from "$lib/server/db/repos/index.repo";
import { Log } from "$lib/utils/logger.util";
import { result } from "$lib/utils/result.util";
import { Strings } from "$lib/utils/strings.util";
import { captureException } from "@sentry/sveltekit";
import { waitUntil } from "@vercel/functions";
import { operators } from "drizzle-orm";
import { ImageService } from "../image/image.service";

const log = Log.child({ service: "shelter" });

const build_slug = (
  input: Pick<
    ShelterSchema.InsertOut,
    "name" | "street_number" | "street_name" | "suburb" | "city"
  >,
): string => {
  const address_parts = [input.street_number, input.street_name, input.suburb, input.city].filter(
    Boolean,
  );

  const parts = address_parts.length > 0 ? [input.name, ...address_parts] : [input.name];
  return Strings.slugify(parts.join(" "));
};

export namespace ShelterService {
  export async function create(
    input: ShelterSchema.InsertOut & { image?: File },
    session: App.Session,
  ): Promise<App.Result<Shelter>> {
    try {
      if (!session.session.org_id) {
        return result.err(ERROR.FORBIDDEN);
      }

      const { image, ...values } = input;
      const slug = build_slug(values);

      const shelter = await Repo.insert_one(
        db
          .insert(ShelterTable)
          .values({
            ...values,
            slug,
            org_id: session.session.org_id,
          })
          .returning(),
      );
      if (!shelter.ok) return shelter;

      if (image && image.size > 0) {
        await ImageService.upload(
          {
            file: image,
            resource_kind: "shelter",
            resource_id: shelter.data.id,
          },
          session,
        );
      }

      return shelter;
    } catch (error) {
      log.error(error, "create.error unknown");

      captureException(error, { extra: { input } });

      return result.err(ERROR.INTERNAL_SERVER_ERROR);
    }
  }

  export async function update(
    input: ShelterSchema.UpdateOut & { image?: File },
    session: App.Session,
  ): Promise<App.Result<Shelter>> {
    try {
      if (!session.session.org_id) {
        return result.err(ERROR.FORBIDDEN);
      }

      const { image, ...values } = input;
      const slug = build_slug(values);

      const shelter = await Repo.update_one(
        db
          .update(ShelterTable)
          .set({ ...values, slug })
          .where(
            operators.and(
              operators.eq(ShelterTable.id, input.id),
              operators.eq(ShelterTable.org_id, session.session.org_id),
            ),
          )
          .returning(),
      );
      if (!shelter.ok) return shelter;

      if (image && image.size > 0) {
        await ImageService.upload(
          {
            file: image,
            resource_kind: "shelter",
            resource_id: shelter.data.id,
          },
          session,
        );
      }

      return shelter;
    } catch (error) {
      log.error(error, "update.error unknown");

      captureException(error, { extra: { input } });

      return result.err(ERROR.INTERNAL_SERVER_ERROR);
    }
  }

  export async function del(shelter_id: string, session: App.Session): Promise<App.Result<void>> {
    try {
      if (!session.session.org_id) {
        return result.err(ERROR.FORBIDDEN);
      }

      const res = await Repo.delete_one(
        db
          .delete(ShelterTable)
          .where(
            operators.and(
              operators.eq(ShelterTable.id, shelter_id),
              operators.eq(ShelterTable.org_id, session.session.org_id),
            ),
          )
          .execute(),
      );

      if (!res.ok) return res;

      waitUntil(
        ImageService.delete_many({ resource_kind: "shelter", resource_id: shelter_id }, session),
      );

      return res;
    } catch (error) {
      log.error(error, "delete.error unknown");

      captureException(error, { extra: { shelter_id } });

      return result.err(ERROR.INTERNAL_SERVER_ERROR);
    }
  }

  export async function owns(
    shelter_id: string,
    session: App.Session,
  ): Promise<App.Result<undefined>> {
    if (!session.session.org_id) {
      return result.err(ERROR.FORBIDDEN);
    }

    const shelter = await Repo.query(
      db.query.shelter.findFirst({
        columns: { id: true },
        where: { id: shelter_id, org_id: session.session.org_id },
      }),
    );

    if (!shelter.ok) return shelter;
    else if (!shelter.data) return result.err(ERROR.FORBIDDEN);
    return result.suc(undefined);
  }
}
