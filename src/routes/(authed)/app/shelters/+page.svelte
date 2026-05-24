<script lang="ts">
  import { resolve } from "$app/paths";
  import { ShelterClient } from "$lib/clients/shelter.client";
  import ShelterForm from "$lib/components/form/shelter/ShelterForm.svelte";
  import Anchor from "$lib/components/ui/anchor/Anchor.svelte";
  import { renderComponent } from "$lib/components/ui/data-table";
  import DataTable from "$lib/components/ui/data-table/data-table.svelte";
  import Header from "$lib/components/ui/elements/Header.svelte";
  import Sheet from "$lib/components/ui/sheet/Sheet.svelte";
  import { Arrays } from "$lib/utils/array/array.util";
  import { CellHelpers } from "$lib/utils/tanstack/table.util.js";
  import { createColumnHelper } from "@tanstack/table-core";

  let { data } = $props();
  let shelters = $derived(data.shelters);

  const column = createColumnHelper<(typeof shelters)[number]>();

  const columns = [
    column.accessor("short_id", {
      meta: { label: "ID" },
      cell: ({ getValue }) => getValue(),
    }),

    column.accessor("name", {
      meta: { label: "Name" },
      cell: ({ row }) =>
        renderComponent(Anchor, {
          href: resolve("/(authed)/app/shelters/[id]", row.original),
          content: row.original.name,
        }),
    }),

    column.accessor("address", {
      meta: { label: "Address" },
      cell: ({ getValue }) => getValue(),
    }),

    column.accessor((row) => row.animals.length, {
      id: "animal_count",
      meta: { label: "Animals" },
      cell: (c) => CellHelpers.number(c),
    }),

    column.accessor("createdAt", {
      meta: { label: "Created" },
      cell: CellHelpers.time,
    }),
  ];
</script>

<article>
  <Header title="Shelters">
    {#snippet actions()}
      <Sheet
        icon="lucide/plus"
        title="New shelter"
        description="Add a shelter location to the organization"
      >
        {#snippet children({ close })}
          <ShelterForm
            mode="create"
            on_success={(shelter) => {
              shelters = [{ ...shelter, animals: [] }, ...shelters];
              close();
            }}
          />
        {/snippet}
      </Sheet>
    {/snippet}
  </Header>

  <DataTable
    {columns}
    data={shelters}
    states={{
      sorting: [{ id: "createdAt", desc: true }],
    }}
    actions={(row) => [
      {
        title: "View shelter",
        icon: "lucide/eye",
        href: resolve("/(authed)/app/shelters/[id]", row),
      },

      {
        title: "Edit shelter",
        icon: "lucide/pencil",
        href: resolve("/(authed)/app/shelters/[id]/edit", row),
      },

      {
        title: "Delete shelter",
        icon: "lucide/trash-2",
        variant: "destructive",
        onselect: () =>
          ShelterClient.delete(row.original.id, {
            prompt: row.original.name,
            suc_msg: "Shelter deleted",
            on_success: () => (shelters = Arrays.remove(shelters, row.id)),
          }),
      },
    ]}
  />
</article>
