<script lang="ts">
  import ExtractSnippet from "$lib/components/util/ExtractSnippet.svelte";
  import type { MaybeSnippet } from "$lib/interfaces/svelte/svelte.type";
  import type { ComponentProps, Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";
  import BackButton from "../button/BackButton.svelte";

  let {
    back,
    title,
    description,
    level = "h1",
    actions,
    class: klass,
  }: {
    class?: ClassValue;
    title: MaybeSnippet;
    description?: MaybeSnippet;
    level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    back?: ComponentProps<typeof BackButton>;
    actions?: Snippet;
  } = $props();
</script>

<header class={["flex flex-wrap items-end justify-between gap-3", klass]}>
  <div>
    {#if back}
      <BackButton {...back} />
    {/if}
    <svelte:element this={level}>
      <ExtractSnippet snippet={title} />
    </svelte:element>

    {#if description}
      <p class="text-sm text-muted-foreground">
        <ExtractSnippet snippet={description} />
      </p>
    {/if}
  </div>

  {#if actions}
    <div class="flex flex-wrap gap-2">
      {@render actions()}
    </div>
  {/if}
</header>
