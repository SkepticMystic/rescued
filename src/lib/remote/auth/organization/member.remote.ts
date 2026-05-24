import { command } from "$app/server";
import { ORGANIZATION } from "$lib/const/auth/organization.const";
import { MemberService } from "$lib/server/services/auth/organization/member.services";
import { z } from "zod";

export const remove_member_remote = command(
  z.uuid(), // NOTE: member_email is allowed by BA, but we enforce member_id for the optimistic update on the client
  async (member_id) => {
    const res = await MemberService.remove(member_id);

    return res;
  },
);

export const leave_organization_remote = command(
  z.uuid(), //
  async (org_id) => {
    const res = await MemberService.leave(org_id);

    return res;
  },
);

export const update_member_role_remote = command(
  z.object({
    memberId: z.uuid(),
    role: z.enum(ORGANIZATION.ROLES.IDS),
    organizationId: z.uuid().optional(),
  }),
  async (input) => {
    const res = await MemberService.update_role(input);

    return res;
  },
);
