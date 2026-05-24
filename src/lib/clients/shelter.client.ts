import { delete_shelter_remote } from "$lib/remote/shelters/shelters.remote";
import { Client } from "./index.client";

export const ShelterClient = {
  delete: Client.wrap(delete_shelter_remote),
};
