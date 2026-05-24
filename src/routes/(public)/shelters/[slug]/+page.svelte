<script lang="ts">
  import { resolve } from "$app/paths";
  import Picture from "$lib/components/image/Picture.svelte";
  import Anchor from "$lib/components/ui/anchor/Anchor.svelte";
  import EmailAnchor from "$lib/components/ui/anchor/EmailAnchor.svelte";
  import PhoneAnchor from "$lib/components/ui/anchor/PhoneAnchor.svelte";
  import Badge from "$lib/components/ui/badge/badge.svelte";
  import VanillaCarousel from "$lib/components/ui/carousel/VanillaCarousel.svelte";
  import Header from "$lib/components/ui/elements/Header.svelte";
  import TermDescription from "$lib/components/ui/elements/TermDescription.svelte";
  import { ANIMALS } from "$lib/const/animal.const";
  import { IMAGES } from "$lib/const/image/image.const";

  let { data } = $props();

  let shelter = $derived(data.shelter);
  let images = $derived(shelter.images);
  let animals = $derived(shelter.animals);
</script>

<article class="space-y-6">
  <Header
    title={shelter.name}
    description={shelter.address}
    back={{ href: resolve("/(public)/shelters") }}
  />

  {#if images.length > 0}
    <section>
      <VanillaCarousel>
        {#each images as image (image.id)}
          <Picture
            {image}
            alt=""
            {...IMAGES.SIZES.PREVIEW}
            class="shrink-0 object-cover"
          />
        {/each}
      </VanillaCarousel>
    </section>
  {/if}

  <dl class="grid gap-4 text-sm sm:grid-cols-2">
    {#if shelter.contact_email}
      <TermDescription term="Contact email">
        <EmailAnchor email={shelter.contact_email} />
      </TermDescription>
    {/if}

    {#if shelter.contact_phone}
      <TermDescription term="Contact phone">
        <PhoneAnchor phone={shelter.contact_phone} />
      </TermDescription>
    {/if}

    {#if shelter.description}
      <TermDescription
        term="About"
        class="sm:col-span-2"
      >
        <p class="whitespace-pre-wrap">{shelter.description}</p>
      </TermDescription>
    {/if}
  </dl>

  <section class="space-y-3">
    <Header
      title="Animals"
      description="{animals.length} at this shelter"
      level="h2"
    />

    {#if animals.length === 0}
      <p class="text-sm text-muted-foreground">No animals yet.</p>
    {:else}
      <ul class="divide-y rounded-md border">
        {#each animals as animal (animal.id)}
          {@const status = ANIMALS.STATUS.MAP[animal.status]}
          {@const species = ANIMALS.SPECIES.MAP[animal.species]}

          <li>
            <Anchor
              class="flex items-center justify-between gap-3 p-3 no-underline! hover:bg-accent"
              href={resolve("/(public)/animals/[short_id]", animal)}
            >
              <div class="flex flex-col">
                <span class="font-medium"
                  >{animal.name ?? animal.short_id}</span
                >
                <span class="text-xs text-muted-foreground"
                  >{species.label}</span
                >
              </div>

              <Badge
                variant={status.variant}
                icon={status.icon}
                content={status.label}
              />
            </Anchor>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</article>
