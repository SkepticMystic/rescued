<script lang="ts">
  import { PhoneUtil } from "$lib/utils/phone/phone.util";
  import type { ComponentProps } from "svelte";
  import Anchor from "./Anchor.svelte";

  let {
    phone,
    ...rest
  }: {
    phone: string;
  } & Omit<ComponentProps<typeof Anchor>, "href"> = $props();

  const formatted = $derived(PhoneUtil.formatNationalZA(phone));
</script>

<Anchor
  icon="lucide/phone"
  href="tel:{phone}"
  {...rest}
>
  {formatted}
</Anchor>
