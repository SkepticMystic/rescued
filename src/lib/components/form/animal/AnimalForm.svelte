<!-- svelte-ignore state_referenced_locally -->
<script lang="ts">
  import FormErrors from "$lib/components/form/FormErrors.svelte";
  import Field from "$lib/components/ui/field/Field.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import NativeSelect from "$lib/components/ui/native-select/native-select.svelte";
  import Textarea from "$lib/components/ui/textarea/textarea.svelte";
  import { ANIMALS } from "$lib/const/animal.const";
  import type { MaybePromise } from "$lib/interfaces";
  import {
    create_animal_remote,
    update_animal_remote,
  } from "$lib/remote/animals/animals.remote";
  import type { Animal, AnimalSchema } from "$lib/server/db/models/animal.model";
  import { FormUtil } from "$lib/utils/form/form.util.svelte";
  import { toast } from "svelte-sonner";
  import FormButton from "../FormButton.svelte";

  let props: (
    | {
        mode: "create";
        initial: AnimalSchema.InsertIn;
      }
    | {
        mode: "update";
        initial: AnimalSchema.UpdateIn;
      }
  ) & {
    on_success?: (d: Animal) => MaybePromise<unknown>;
  } = $props();

  if (props.mode === "update") {
    FormUtil.init(update_animal_remote, () => props.initial);
  } else {
    FormUtil.init(create_animal_remote, () => props.initial);
  }

  const form =
    props.mode === "create" ? create_animal_remote : update_animal_remote;
</script>

<form
  class="space-y-3"
  {...form.enhance(async ({ submit }) => {
    await submit();

    FormUtil.count_issue_metrics(form, "animal_form");

    const res = form.result;
    if (res?.ok) {
      toast.success(
        props.mode === "create" ? "Animal created" : "Animal updated",
      );

      await props.on_success?.(res.data);
    } else if (res?.error) {
      toast.error(res.error.message);
    }
  })}
>
  {#if props.mode === "update"}
    <input
      {...update_animal_remote.fields.id.as(
        "hidden",
        update_animal_remote.fields.id.value() ?? "",
      )}
    />
  {/if}

  <Field
    label="Name"
    field={form.fields.name}
  >
    {#snippet input({ props, field })}
      <Input
        {...props}
        {...field?.as("text")}
        class="w-full"
        placeholder="Optional — short ID is used if left blank"
      />
    {/snippet}
  </Field>

  <div class="flex gap-x-2">
    <Field
      label="Species"
      class="grow"
      field={form.fields.species}
    >
      {#snippet input({ props, field })}
        <NativeSelect
          {...props}
          {...field?.as("select")}
          required
          class="w-full"
          placeholder="Select species"
          options={ANIMALS.SPECIES.OPTIONS}
        />
      {/snippet}
    </Field>

    <Field
      label="Sex"
      class="grow"
      field={form.fields.sex}
    >
      {#snippet input({ props, field })}
        <NativeSelect
          {...props}
          {...field?.as("select")}
          required
          class="w-full"
          placeholder="Select sex"
          options={ANIMALS.SEX.OPTIONS}
        />
      {/snippet}
    </Field>
  </div>

  <div class="flex gap-x-2">
    <Field
      label="Status"
      class="grow"
      field={form.fields.status}
    >
      {#snippet input({ props, field })}
        <NativeSelect
          {...props}
          {...field?.as("select")}
          required
          class="w-full"
          placeholder="Select status"
          options={ANIMALS.STATUS.OPTIONS}
        />
      {/snippet}
    </Field>

    <Field
      label="Date of birth"
      class="grow"
      field={form.fields.date_of_birth}
    >
      {#snippet input({ props, field })}
        <Input
          {...props}
          {...field?.as("date")}
          class="w-full"
        />
      {/snippet}
    </Field>
  </div>

  <Field
    label="Description"
    field={form.fields.description}
  >
    {#snippet input({ props, field })}
      <Textarea
        {...props}
        {...field?.as("text")}
        placeholder="Notes about this animal"
      />
    {/snippet}
  </Field>

  <FormButton
    {form}
    class="w-full"
    icon="lucide/check"
  >
    Save animal
  </FormButton>

  <FormErrors {form} />
</form>
