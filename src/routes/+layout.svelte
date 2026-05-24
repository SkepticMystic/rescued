<script lang="ts">
  import { dev } from "$app/environment";
  import { page } from "$app/state";
  import {
    PUBLIC_UMAMI_BASE_URL,
    PUBLIC_UMAMI_WEBSITE_ID,
  } from "$env/static/public";
  import SEO from "$lib/components/blocks/head/SEO.svelte";
  import FlashAlert from "$lib/components/ui/alert/FlashAlert.svelte";
  import Sonner from "$lib/components/ui/sonner/sonner.svelte";
  import { get_session_remote } from "$lib/remote/auth/session.remote";
  import { ModeWatcher } from "mode-watcher";
  import { onMount } from "svelte";
  import { getFlash } from "sveltekit-flash-message";
  import "./layout.css";

  let { children } = $props();

  onMount(() => {
    get_session_remote().then((s) => {
      if (s && window.umami) {
        window.umami.identify(s.user.id, {
          name: s.user.name,
          email: s.user.email,
          session_id: s.session.id,
          ip_address: s.session.ipAddress,
          user_agent: s.session.userAgent,
        });
      }

      return;
    });
  });

  const flash = getFlash(page);
</script>

<svelte:head>
  <!-- Svelte says to use %sveltekit.env.[NAME]%
       But at this point, there's enough js stuff that I think this is fine
       SOURCE: https://svelte.dev/docs/kit/project-structure#Project-files-tsconfig.json -->
  {#if PUBLIC_UMAMI_BASE_URL && PUBLIC_UMAMI_WEBSITE_ID}
    <script
      defer
      async
      data-do-not-track="true"
      data-tag={dev ? "dev" : "prod"}
      src="{PUBLIC_UMAMI_BASE_URL}/script.js"
      data-website-id={PUBLIC_UMAMI_WEBSITE_ID}
    ></script>
  {/if}
</svelte:head>

<!-- NOTE: Don't put this in svelte:head! It does that itself -->
<SEO />

<Sonner />
<ModeWatcher />

<FlashAlert flash={$flash} />

{@render children?.()}
