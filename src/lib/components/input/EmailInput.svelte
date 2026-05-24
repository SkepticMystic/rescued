<script lang="ts">
  import Input from "$lib/components/ui/input/input.svelte";
  import type { ComponentProps } from "svelte";

  let {
    value = $bindable(),
    ...rest
  }: ComponentProps<typeof Input> = $props();
</script>

<Input
  type="email"
  icon="lucide/mail"
  align="inline-start"
  inputmode="email"
  enterkeyhint="next"
  autocomplete="email"
  autocapitalize="off"
  autocorrect="off"
  spellcheck="false"
  {...rest}
  bind:value
/>
