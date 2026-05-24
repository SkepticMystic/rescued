<script lang="ts">
  import { type WithElementRef } from "$lib/utils/shadcn.util.js";
  import type { HTMLAnchorAttributes } from "svelte/elements";
  import { badgeVariants, type BadgeVariant } from ".";
  import Icon from "../icon/Icon.svelte";

  let {
    ref = $bindable(null),
    href,
    class: className,
    variant = "default",
    children,
    content,
    icon,
    ...restProps
  }: WithElementRef<HTMLAnchorAttributes> & {
    variant?: BadgeVariant;
    content?: string;
    icon?: string;
  } = $props();
</script>

<svelte:element
  this={href ? "a" : "span"}
  {href}
  data-slot="badge"
  class={[badgeVariants({ variant }), className]}
  bind:this={ref}
  {...restProps}
>
  <Icon {icon} />

  {#if children}
    {@render children()}
  {:else if content}
    {content}
  {/if}
</svelte:element>
