<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { AnimalClient } from "$lib/clients/animals.client";
  import Picture from "$lib/components/image/Picture.svelte";
  import Anchor from "$lib/components/ui/anchor/Anchor.svelte";
  import Badge from "$lib/components/ui/badge/badge.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
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

<article>
  <Header
    title={display_name}
    back={{ href: resolve("/(authed)/animals") }}
  >
    {#snippet actions()}
      <Button
        variant="outline"
        icon="lucide/pencil"
        href={resolve("/(authed)/animals/[id]/edit", animal)}
      >
        Edit
      </Button>

      <Button
        variant="destructive"
        icon="lucide/trash-2"
        onclick={() =>
          AnimalClient.delete(animal.id, {
            prompt: display_name,
            suc_msg: "Animal deleted",
            on_success: () => goto(resolve("/(authed)/animals")),
          })}
      >
        Delete
      </Button>
    {/snippet}
  </Header>

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
      href={resolve("/(authed)/shelters/[id]", animal.shelter)}
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
    <TermDescription term="ID">{animal.short_id}</TermDescription>

    <TermDescription term="Date of birth">
      <Time
        date={animal.date_of_birth}
        fallback="—"
      />
    </TermDescription>

    <TermDescription term="Created">
      <Time date={animal.createdAt} />
    </TermDescription>

    <TermDescription term="Updated">
      <Time date={animal.updatedAt} />
    </TermDescription>

    {#if animal.description}
      <TermDescription
        term="Description"
        class="sm:col-span-2"
      >
        <p class="whitespace-pre-wrap">{animal.description}</p>
      </TermDescription>
    {/if}
  </dl>
</article>
