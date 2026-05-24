<script lang="ts">
  import type { ComponentProps } from "svelte";
  import Anchor from "./Anchor.svelte";

  let {
    email,
    ...rest
  }: {
    email: string;
  } & Omit<ComponentProps<typeof Anchor>, "href"> = $props();
</script>

<Anchor
  icon="lucide/mail"
  href="mailto:{email}"
  {...rest}
>
  {email}
</Anchor>
