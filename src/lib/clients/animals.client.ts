import { delete_animal_remote } from "$lib/remote/animals/animals.remote";
import { Client } from "./index.client";

export const AnimalClient = {
  delete: Client.wrap(delete_animal_remote),
};
