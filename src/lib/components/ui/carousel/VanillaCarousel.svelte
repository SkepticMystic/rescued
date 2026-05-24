<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";

  let {
    children,
    snap = false,
    class: klass,
  }: {
    snap?: boolean;
    children: Snippet;
    class?: ClassValue;
  } = $props();
</script>

<div
  class={[
    "flex items-stretch gap-3 overflow-x-auto pb-2",
    snap && "snap-x snap-mandatory",
    klass,
  ]}
>
  {@render children()}
</div>
