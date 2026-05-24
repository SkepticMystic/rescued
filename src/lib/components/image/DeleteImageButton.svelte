<script lang="ts">
  import { ImageClient } from "$lib/clients/image.client";
  import Button from "$lib/components/ui/button/button.svelte";
  import type { MaybePromise } from "$lib/interfaces";
  import type { ComponentProps } from "svelte";

  let {
    id,
    on_delete,
    ...rest
  }: Omit<ComponentProps<typeof Button>, "onclick"> & {
    id: string;
    on_delete?: (id: string) => MaybePromise<unknown>;
  } = $props();
</script>

<Button
  icon="lucide/x"
  variant="destructive"
  {...rest}
  onclick={() =>
    ImageClient.delete(id, {
      on_success: () => on_delete?.(id),
    })}
/>
