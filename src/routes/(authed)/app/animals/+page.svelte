<script lang="ts">
  import { resolve } from "$app/paths";
  import { AnimalClient } from "$lib/clients/animals.client";
  import AnimalForm from "$lib/components/form/animal/AnimalForm.svelte";
  import Anchor from "$lib/components/ui/anchor/Anchor.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { renderComponent } from "$lib/components/ui/data-table";
  import DataTable from "$lib/components/ui/data-table/data-table.svelte";
  import Header from "$lib/components/ui/elements/Header.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import MultiSelect from "$lib/components/ui/select/MultiSelect.svelte";
  import Sheet from "$lib/components/ui/sheet/Sheet.svelte";
  import { ANIMALS } from "$lib/const/animal.const";
  import { Arrays } from "$lib/utils/array/array.util";
  import { CellHelpers } from "$lib/utils/tanstack/table.util.js";
  import { createColumnHelper } from "@tanstack/table-core";

  let { data } = $props();
  let animals = $derived(data.animals);

  const column = createColumnHelper<(typeof animals)[number]>();

  const columns = [
    column.accessor("short_id", {
      meta: { label: "ID" },

      cell: ({ getValue }) => getValue(),
    }),

    column.accessor("name", {
      meta: { label: "Name" },

      cell: ({ row }) =>
        renderComponent(Anchor, {
          href: resolve("/(authed)/app/animals/[id]", row.original),
          content: row.original.name ?? `?`,
        }),
    }),

    column.accessor("species", {
      meta: { label: "Species" },
      filterFn: "arrIncludesSome",

      cell: (c) => CellHelpers.label(c, ANIMALS.SPECIES.MAP),
    }),

    column.accessor("status", {
      meta: { label: "Status" },
      filterFn: "arrIncludesSome",

      cell: (c) => CellHelpers.badge(c, ANIMALS.STATUS.MAP),
    }),

    column.accessor("createdAt", {
      meta: { label: "Created" },

      cell: CellHelpers.time,
    }),
  ];
</script>

<article>
  <Header title="Animals">
    {#snippet actions()}
      <Sheet
        icon="lucide/plus"
        title="New animal"
        description="Add an animal to the shelter"
      >
        {#snippet children({ close })}
          <AnimalForm
            mode="create"
            on_success={(animal) => {
              animals = [animal, ...animals];
              close();
            }}
          />
        {/snippet}
      </Sheet>
    {/snippet}
  </Header>

  <DataTable
    {columns}
    data={animals}
    states={{
      sorting: [{ id: "createdAt", desc: true }],
    }}
    actions={(row) => [
      {
        title: "View animal",
        icon: "lucide/eye",
        href: resolve("/(authed)/app/animals/[id]", row),
      },

      {
        title: "Edit animal",
        icon: "lucide/pencil",
        href: resolve("/(authed)/app/animals/[id]/edit", row),
      },

      {
        title: "Delete animal",
        icon: "lucide/trash-2",
        variant: "destructive",
        onselect: () =>
          AnimalClient.delete(row.original.id, {
            prompt: row.original.name ?? row.original.short_id,
            suc_msg: "Animal deleted",
            on_success: () => (animals = Arrays.remove(animals, row.id)),
          }),
      },
    ]}
  >
    {#snippet header(table)}
      <div class="flex gap-1.5">
        <Input
          class="max-w-sm"
          placeholder="Name"
          bind:value={
            () => table.getColumn("name")?.getFilterValue() ?? "",
            (value) => table.getColumn("name")?.setFilterValue(value)
          }
        />

        <MultiSelect
          options={ANIMALS.SPECIES.OPTIONS}
          placeholder="Species"
          bind:value={
            () =>
              (table.getColumn("species")?.getFilterValue() ?? []) as string[],
            (value) => table.getColumn("species")?.setFilterValue(value)
          }
        />

        <MultiSelect
          options={ANIMALS.STATUS.OPTIONS}
          placeholder="Status"
          bind:value={
            () =>
              (table.getColumn("status")?.getFilterValue() ?? []) as string[],
            (value) => table.getColumn("status")?.setFilterValue(value)
          }
        />

        {#if table.getState().columnFilters.length}
          <Button
            icon="lucide/x"
            variant="ghost"
            onclick={() => table.resetColumnFilters()}
          >
            Clear
          </Button>
        {/if}
      </div>
    {/snippet}
  </DataTable>
</article>
