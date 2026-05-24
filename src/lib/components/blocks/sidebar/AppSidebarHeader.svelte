<script lang="ts">
  import { BetterAuthClient } from "$lib/auth-client";
  import { OrganizationClient } from "$lib/clients/auth/organization.client";
  import Icon from "$lib/components/ui/icon/Icon.svelte";
  import NativeSelect from "$lib/components/ui/native-select/native-select.svelte";
  import SidebarMenuItem from "$lib/components/ui/sidebar/sidebar-menu-item.svelte";
  import SidebarMenu from "$lib/components/ui/sidebar/sidebar-menu.svelte";
  import { get_session_remote } from "$lib/remote/auth/session.remote";

  const session = $derived(get_session_remote());
  const organizations = BetterAuthClient.useListOrganizations();

  const active_org = $derived(
    $organizations.data?.find((o) => o.id === session.current?.session.activeOrganizationId),
  );
  const has_multiple = $derived(($organizations.data?.length ?? 0) > 1);
</script>

<SidebarMenu>
  <SidebarMenuItem class="flex w-full items-center gap-2.5 pl-2.5">
    <Icon icon="lucide/at-sign" />

    {#if has_multiple}
      <NativeSelect
        class="w-full"
        options={$organizations.data!.map((org) => ({
          value: org.id,
          label: org.name,
          disabled: org.id === session.current?.session.activeOrganizationId,
        }))}
        bind:value={
          () => session.current?.session.activeOrganizationId ?? undefined,
          (v) =>
            OrganizationClient.set_active(v, {
              suc_msg: "Active organization updated",
            })
        }
      />
    {:else}
      <span class="block truncate px-2 text-sm font-medium">
        {active_org?.name ?? $organizations.data?.[0]?.name ?? ""}
      </span>
    {/if}
  </SidebarMenuItem>
</SidebarMenu>
