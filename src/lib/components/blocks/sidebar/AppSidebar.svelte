<script lang="ts">
  import { page } from "$app/state";
  import type { ResolvedPathname } from "$app/types";
  import Icon from "$lib/components/ui/icon/Icon.svelte";
  import { useSidebar } from "$lib/components/ui/sidebar/context.svelte";
  import SidebarContent from "$lib/components/ui/sidebar/sidebar-content.svelte";
  import SidebarFooter from "$lib/components/ui/sidebar/sidebar-footer.svelte";
  import SidebarGroupContent from "$lib/components/ui/sidebar/sidebar-group-content.svelte";
  import SidebarGroupLabel from "$lib/components/ui/sidebar/sidebar-group-label.svelte";
  import SidebarGroup from "$lib/components/ui/sidebar/sidebar-group.svelte";
  import SidebarHeader from "$lib/components/ui/sidebar/sidebar-header.svelte";
  import SidebarMenuAction from "$lib/components/ui/sidebar/sidebar-menu-action.svelte";
  import SidebarMenuButton from "$lib/components/ui/sidebar/sidebar-menu-button.svelte";
  import SidebarMenuItem from "$lib/components/ui/sidebar/sidebar-menu-item.svelte";
  import SidebarRail from "$lib/components/ui/sidebar/sidebar-rail.svelte";
  import SidebarRoot from "$lib/components/ui/sidebar/sidebar-root.svelte";
  import AppSidebarFooter from "./AppSidebarFooter.svelte";
  import AppSidebarHeader from "./AppSidebarHeader.svelte";

  const groups: {
    label: string;
    items: {
      label: string;
      href: ResolvedPathname;
      icon: string;

      action?: { kind: "href"; href: string; icon: string };
    }[];
  }[] = [
    {
      label: "Shelter",
      items: [
        {
          href: "/home",
          label: "Home",
          icon: "lucide/home",
        },
        {
          href: "/shelters",
          label: "Shelters",
          icon: "lucide/building-2",

          action: {
            kind: "href",
            href: "/shelters#create",
            icon: "lucide/plus",
          },
        },
        {
          href: "/animals",
          label: "Animals",
          icon: "lucide/paw-print",

          action: {
            kind: "href",
            href: "/animals#create",
            icon: "lucide/plus",
          },
        },
      ],
    },
    {
      label: "Workspace",
      items: [
        {
          href: "/tasks",
          label: "Tasks",
          icon: "lucide/check-square",

          action: {
            kind: "href",
            href: "/tasks#create",
            icon: "lucide/plus",
          },
        },
      ],
    },
  ];

  const sidebar = useSidebar();
</script>

<!-- NOTE: If you ever need to use SidebarInset instead, checkout the "Sidebar.Footer" section of this doc page:
 https://shadcn-svelte.com/docs/components/sidebar -->

<SidebarRoot collapsible="icon">
  <SidebarHeader>
    <AppSidebarHeader />
  </SidebarHeader>

  <SidebarContent>
    {#each groups as group (group.label)}
      <SidebarGroup>
        <SidebarGroupLabel>
          {group.label}
        </SidebarGroupLabel>

        <SidebarGroupContent>
          {#each group.items as item (item.href)}
            <SidebarMenuItem class="group">
              <SidebarMenuButton
                isActive={page.url.pathname === item.href ||
                  page.url.pathname.startsWith(item.href + "/")}
              >
                {#snippet child({ props })}
                  <a
                    {...props}
                    href={item.href}
                    onclick={() => sidebar.setOpenMobile(false)}
                  >
                    <Icon
                      icon={item.icon}
                      title={item.label}
                    />

                    <span>{item.label}</span>
                  </a>
                {/snippet}
              </SidebarMenuButton>

              {#if item.action}
                <SidebarMenuAction
                  class="
                  hidden
                  group-hover:inline
                "
                >
                  {#snippet child({ props })}
                    {#if item.action?.kind === "href"}
                      <a
                        {...props}
                        href={item.action.href}
                        onclick={() => sidebar.setOpenMobile(false)}
                      >
                        <Icon icon={item.action.icon} />
                      </a>
                    {:else}{/if}
                  {/snippet}
                </SidebarMenuAction>
              {/if}
            </SidebarMenuItem>
          {/each}
        </SidebarGroupContent>
      </SidebarGroup>
    {/each}
  </SidebarContent>

  <SidebarFooter>
    <AppSidebarFooter />
  </SidebarFooter>

  <SidebarRail />
</SidebarRoot>
