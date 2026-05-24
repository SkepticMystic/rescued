import { query } from "$app/server";
import { get_session } from "$lib/server/services/auth.service";

export const get_session_remote = query(async () => {
  const res = await get_session();

  if (res.ok) {
    return res.data;
  } else {
    return null;
  }
});
