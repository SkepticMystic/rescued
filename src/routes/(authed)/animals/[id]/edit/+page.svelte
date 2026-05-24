<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import AnimalForm from "$lib/components/form/animal/AnimalForm.svelte";
  import Header from "$lib/components/ui/elements/Header.svelte";

  let { data } = $props();
</script>

<article>
  <Header
    title="Edit animal"
    back={{ href: resolve("/(authed)/animals") }}
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
    on_success={() => goto(resolve("/(authed)/animals"))}
  />
</article>
