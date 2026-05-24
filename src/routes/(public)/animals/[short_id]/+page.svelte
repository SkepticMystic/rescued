<script lang="ts">
  import { resolve } from "$app/paths";
  import Picture from "$lib/components/image/Picture.svelte";
  import Anchor from "$lib/components/ui/anchor/Anchor.svelte";
  import Badge from "$lib/components/ui/badge/badge.svelte";
  import VanillaCarousel from "$lib/components/ui/carousel/VanillaCarousel.svelte";
  import Header from "$lib/components/ui/elements/Header.svelte";
  import TermDescription from "$lib/components/ui/elements/TermDescription.svelte";
  import Time from "$lib/components/ui/elements/Time.svelte";
  import { ANIMALS } from "$lib/const/animal.const";
  import { IMAGES } from "$lib/const/image/image.const";

  let { data } = $props();

  let animal = $derived(data.animal);
  let images = $derived(animal.images);
  let species = $derived(ANIMALS.SPECIES.MAP[animal.species]);
  let sex = $derived(ANIMALS.SEX.MAP[animal.sex]);
  let status = $derived(ANIMALS.STATUS.MAP[animal.status]);
  let display_name = $derived(animal.name ?? animal.short_id);
</script>

<article class="space-y-4">
  <Header
    title={display_name}
    back={{
      href: resolve("/(public)/shelters/[slug]", animal.shelter),
    }}
  />

  <div class="flex flex-wrap items-center gap-2">
    <Badge content={species.label} />
    <Badge
      variant={status.variant}
      icon={status.icon}
      content={status.label}
    />
    <Badge
      variant="secondary"
      content={sex.label}
    />
    <Anchor
      class="text-sm"
      href={resolve("/(public)/shelters/[slug]", animal.shelter)}
    >
      at {animal.shelter.name}
    </Anchor>
  </div>

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
    <TermDescription term="Date of birth">
      <Time
        date={animal.date_of_birth}
        fallback="—"
      />
    </TermDescription>

    <TermDescription term="At shelter since">
      <Time date={animal.createdAt} />
    </TermDescription>

    {#if animal.description}
      <TermDescription
        term="About"
        class="sm:col-span-2"
      >
        <p class="whitespace-pre-wrap">{animal.description}</p>
      </TermDescription>
    {/if}
  </dl>
</article>
