<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import AnimalForm from "$lib/components/form/animal/AnimalForm.svelte";
  import UploadImagesForm from "$lib/components/form/image/UploadImagesForm.svelte";
  import DeleteImageButton from "$lib/components/image/DeleteImageButton.svelte";
  import Picture from "$lib/components/image/Picture.svelte";
  import VanillaCarousel from "$lib/components/ui/carousel/VanillaCarousel.svelte";
  import Header from "$lib/components/ui/elements/Header.svelte";
  import { IMAGES } from "$lib/const/image/image.const";

  let { data } = $props();

  let images = $derived(data.animal.images);
</script>

<article>
  <Header
    title="Edit animal"
    back={{ href: resolve("/(authed)/app/animals") }}
  />

  <AnimalForm
    mode="update"
    initial={{
      ...data.animal,
      name: data.animal.name ?? "",
      description: data.animal.description ?? "",
      date_of_birth: data.animal.date_of_birth
        ? data.animal.date_of_birth.toISOString().slice(0, 10)
        : "",
    }}
    on_success={() => goto(resolve("/(authed)/app/animals"))}
  />

  <section>
    <Header
      title="Photos"
      level="h2"
    />

    {#if images.length > 0}
      <VanillaCarousel>
        {#each images as image (image.id)}
          <div class="relative shrink-0">
            <Picture
              {image}
              alt=""
              {...IMAGES.SIZES.THUMBNAIL_LG}
              class="object-cover"
            />

            <DeleteImageButton
              class="absolute top-1 right-1"
              id={image.id}
              on_delete={(id) => (images = images.filter((i) => i.id !== id))}
            />
          </div>
        {/each}
      </VanillaCarousel>
    {/if}

    <UploadImagesForm
      resource_kind="animal"
      resource_id={data.animal.id}
      after_upload={(results) => {
        if (!results.ok) return;

        images = [
          ...images,
          ...results.data.flatMap((r) => (r.ok ? [r.data] : [])),
        ];
      }}
    />
  </section>
</article>
