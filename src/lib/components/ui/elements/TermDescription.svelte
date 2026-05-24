<script lang="ts">
  import ExtractSnippet from "$lib/components/util/ExtractSnippet.svelte";
  import type { MaybeSnippet } from "$lib/interfaces/svelte/svelte.type";
  import type { ClassValue } from "svelte/elements";

  let {
    term,
    children,
    class: klass,
    sr_only,
    horizontal,
  }: {
    term: string;
    class?: ClassValue;
    children: MaybeSnippet;
    sr_only?: boolean;
    horizontal?: boolean;
  } = $props();
</script>

<div class={[horizontal ? "flex flex-row gap-x-2" : "flex flex-col", klass]}>
  <dt class={[sr_only ? "sr-only" : "text-muted-foreground"]}>
    {term}
  </dt>

  <dd>
    <ExtractSnippet snippet={children} />
  </dd>
</div>
