<script lang="ts">
  import type { ResolvedPathname } from "$app/types";
  import ExtractSnippet from "$lib/components/util/ExtractSnippet.svelte";
  import type { MaybeSnippet } from "$lib/interfaces/svelte/svelte.type";
  import Anchor from "../anchor/Anchor.svelte";

  let {
    href = ".",
    children,
  }: {
    href?: ResolvedPathname | ".";
    children?: MaybeSnippet;
  } = $props();
</script>

<Anchor
  {href}
  class="text-sm"
  icon="lucide/arrow-left"
>
  {#if children}
    <ExtractSnippet snippet={children} />
  {:else}
    Go Back
  {/if}
</Anchor>
