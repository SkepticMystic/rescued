import { invalidateAll } from "$app/navigation";
import { BetterAuthClient } from "$lib/auth-client";
import {
  accept_invitation_remote,
  cancel_invitation_remote,
} from "$lib/remote/auth/organization/invitation.remote";
import {
  leave_organization_remote,
  remove_member_remote,
  update_member_role_remote,
} from "$lib/remote/auth/organization/member.remote";
import {
  admin_delete_organization_remote,
  owner_delete_organization_remote,
  set_active_organization_remote,
} from "$lib/remote/auth/organization/organization.remote";
import { get_session_remote } from "$lib/remote/auth/session.remote";
import { result } from "$lib/utils/result.util";
import { Client } from "../index.client";

const set_active_org = async (organizationId: string | null | undefined) => {
  const res = await set_active_organization_remote(organizationId ?? null);

  // Refresh session, then re-run all load() functions and remote queries so
  // every org-scoped surface picks up the new session.
  await Promise.all([get_session_remote().refresh(), invalidateAll()]);
  BetterAuthClient.$store.notify("$sessionSignal");

  return res;
};

export const OrganizationClient = {
  set_active: Client.wrap(set_active_org),

  leave: Client.wrap(
    async (/** Fallbacks to active org_id */ org_id?: string) => {
      const organizationId = org_id ?? get_session_remote().current?.session.activeOrganizationId;

      if (!organizationId) {
        return result.err({ message: "Organization ID is required" });
      }

      return await leave_organization_remote(organizationId);
    },
    {
      confirm: "Are you sure you want to leave this organization?",
      suc_msg: "Left organization",
    },
  ),

  delete: Client.wrap(owner_delete_organization_remote, {
    confirm: "Are you sure you want to delete this organization?",
    suc_msg: "Organization deleted",
  }),

  admin_delete: Client.wrap(admin_delete_organization_remote, {
    confirm: "Are you sure you want to delete this organization?",
  }),

  invitation: {
    accept: Client.wrap(accept_invitation_remote, {
      suc_msg: "Invitation accepted",
      on_success: (d) => set_active_org(d.member.organizationId),
    }),

    cancel: Client.wrap(cancel_invitation_remote, {
      confirm: "Are you sure you want to cancel this invitation?",
    }),
  },

  member: {
    update_role: Client.wrap(update_member_role_remote, {
      suc_msg: "Member role updated",
      confirm: "Are you sure you want to update this member's role?",
    }),

    remove: Client.wrap(remove_member_remote, {
      confirm: "Are you sure you want to remove this member?",
      suc_msg: "Member removed",
    }),
  },
};
