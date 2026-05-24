<script lang="ts">
  import Input from "$lib/components/ui/input/input.svelte";
  import type { ComponentProps } from "svelte";

  let {
    value = $bindable(),
    ...rest
  }: ComponentProps<typeof Input> = $props();
</script>

<Input
  type="tel"
  icon="lucide/phone"
  align="inline-start"
  inputmode="tel"
  enterkeyhint="next"
  autocomplete="tel"
  placeholder="+27 ..."
  {...rest}
  bind:value
/>
