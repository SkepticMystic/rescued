<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import UploadImagesForm from "$lib/components/form/image/UploadImagesForm.svelte";
  import ShelterForm from "$lib/components/form/shelter/ShelterForm.svelte";
  import DeleteImageButton from "$lib/components/image/DeleteImageButton.svelte";
  import Picture from "$lib/components/image/Picture.svelte";
  import VanillaCarousel from "$lib/components/ui/carousel/VanillaCarousel.svelte";
  import Header from "$lib/components/ui/elements/Header.svelte";
  import { IMAGES } from "$lib/const/image/image.const";

  let { data } = $props();

  let images = $derived(data.shelter.images);
</script>

<article>
  <Header
    title="Edit shelter"
    back={{ href: resolve("/(authed)/app/shelters") }}
  />

  <ShelterForm
    mode="update"
    initial={{
      ...data.shelter,
      description: data.shelter.description ?? "",
      contact_email: data.shelter.contact_email ?? "",
      contact_phone: data.shelter.contact_phone ?? "",
      street_number: data.shelter.street_number ?? "",
      street_name: data.shelter.street_name ?? "",
      suburb: data.shelter.suburb ?? "",
      city: data.shelter.city ?? "",
      province: data.shelter.province ?? "",
      postal_code: data.shelter.postal_code ?? "",
      country: data.shelter.country ?? "",
      location: {
        x: data.shelter.location.x.toString(),
        y: data.shelter.location.y.toString(),
      },
    }}
    on_success={() => goto(resolve("/(authed)/app/shelters"))}
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
      resource_kind="shelter"
      resource_id={data.shelter.id}
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
