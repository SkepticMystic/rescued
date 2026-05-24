<script lang="ts">
  import { resolve } from "$app/paths";
  import Picture from "$lib/components/image/Picture.svelte";
  import Anchor from "$lib/components/ui/anchor/Anchor.svelte";
  import Header from "$lib/components/ui/elements/Header.svelte";
  import { IMAGES } from "$lib/const/image/image.const";

  let { data } = $props();
  let shelters = $derived(data.shelters);

  const format_location = (s: (typeof shelters)[number]) =>
    [s.suburb, s.city, s.province].filter(Boolean).join(", ");
</script>

<article class="space-y-6">
  <Header
    title="Shelters"
    description="Browse shelters and the animals looking for homes"
  />

  {#if shelters.length === 0}
    <p class="text-sm text-muted-foreground">No shelters yet.</p>
  {:else}
    <ul
      class="
        grid gap-4
        sm:grid-cols-2
        lg:grid-cols-3
      "
    >
      {#each shelters as shelter (shelter.id)}
        {@const image = shelter.images[0]}
        {@const location = format_location(shelter)}

        <li>
          <Anchor
            class="
              flex h-full flex-col gap-3 rounded-md border p-3 no-underline!
              hover:bg-accent
            "
            href={resolve("/(public)/shelters/[slug]", shelter)}
          >
            <Picture
              {image}
              alt=""
              fallback="🏠"
              {...IMAGES.SIZES.PREVIEW}
              class="h-40 w-full object-cover"
            />

            <div class="flex flex-col gap-1">
              <span class="font-medium">{shelter.name}</span>

              {#if location}
                <span class="text-xs text-muted-foreground">{location}</span>
              {/if}

              <span class="text-xs text-muted-foreground">
                {shelter.animals.length}
                {shelter.animals.length === 1 ? "animal" : "animals"}
              </span>
            </div>
          </Anchor>
        </li>
      {/each}
    </ul>
  {/if}
</article>
