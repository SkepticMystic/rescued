<script lang="ts">
  import { resolve } from "$app/paths";
  import ButtonGroup from "$lib/components/ui/button-group/button-group.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { APP } from "$lib/const/app.const";
  import { get_session_remote } from "$lib/remote/auth/session.remote";

  let { children } = $props();

  const session = $derived(get_session_remote());
</script>

<div class="flex min-h-screen w-full flex-col">
  <header>
    <nav class="mx-auto flex h-16 max-w-5xl items-center justify-between px-3">
      <Button
        href="/"
        variant="ghost"
      >
        {APP.NAME}
      </Button>

      <ButtonGroup>
        <Button
          href={resolve("/(public)/shelters")}
          variant="ghost"
        >
          Shelters
        </Button>

        {#if session.current?.user}
          <Button href={resolve("/app/home")}>Home</Button>
        {:else}
          <Button href={resolve("/auth/signin")}>Login</Button>
          <Button href={resolve("/auth/signup")}>Signup</Button>
        {/if}
      </ButtonGroup>
    </nav>
  </header>

  <main
    class="
    mx-auto mt-1 mb-12 w-full max-w-4xl grow px-2
    sm:px-3
    md:px-5
  "
  >
    {@render children?.()}
  </main>
</div>
