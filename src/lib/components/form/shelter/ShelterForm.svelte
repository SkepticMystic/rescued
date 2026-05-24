<!-- svelte-ignore state_referenced_locally -->
<script lang="ts">
  import FormErrors from "$lib/components/form/FormErrors.svelte";
  import EmailInput from "$lib/components/input/EmailInput.svelte";
  import GooglePlaceInput from "$lib/components/input/GooglePlaceInput.svelte";
  import TelInput from "$lib/components/input/TelInput.svelte";
  import Field from "$lib/components/ui/field/Field.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import Textarea from "$lib/components/ui/textarea/textarea.svelte";
  import type { MaybePromise } from "$lib/interfaces";
  import {
    create_shelter_remote,
    update_shelter_remote,
  } from "$lib/remote/shelters/shelters.remote";
  import type {
    Shelter,
    ShelterSchema,
  } from "$lib/server/db/models/shelter.model";
  import { FormUtil } from "$lib/utils/form/form.util.svelte";
  import { toast } from "svelte-sonner";
  import FormButton from "../FormButton.svelte";

  const CREATE_DEFAULTS = {
    name: "",
    description: "",
    contact_email: "",
    contact_phone: "",

    address: "",
    google_place_id: "",
    location: { x: "0", y: "0" },

    street_number: "",
    street_name: "",
    suburb: "",
    city: "",
    province: "",
    postal_code: "",
    country: "",
  } satisfies ShelterSchema.InsertIn;

  let props: (
    | {
        mode: "create";
        initial?: Partial<ShelterSchema.InsertIn>;
      }
    | {
        mode: "update";
        initial: ShelterSchema.UpdateIn;
      }
  ) & {
    on_success?: (d: Shelter) => MaybePromise<unknown>;
  } = $props();

  if (props.mode === "update") {
    FormUtil.init(update_shelter_remote, () => props.initial);
  } else {
    FormUtil.init(create_shelter_remote, () => ({
      ...CREATE_DEFAULTS,
      ...props.initial,
    }));
  }

  const form =
    props.mode === "create" ? create_shelter_remote : update_shelter_remote;
</script>

<form
  class="space-y-3"
  enctype="multipart/form-data"
  {...form.enhance(async ({ submit }) => {
    await submit();

    FormUtil.count_issue_metrics(form, "shelter_form");

    const res = form.result;
    if (res?.ok) {
      toast.success(
        props.mode === "create" ? "Shelter created" : "Shelter updated",
      );

      await props.on_success?.(res.data);
    } else if (res?.error) {
      toast.error(res.error.message);
    }
  })}
>
  {#if props.mode === "update"}
    <input
      {...update_shelter_remote.fields.id.as("hidden", props.initial.id)}
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
        required
        class="w-full"
        placeholder="e.g. Happy Paws"
      />
    {/snippet}
  </Field>

  <Field
    label="Description"
    field={form.fields.description}
  >
    {#snippet input({ props, field })}
      <Textarea
        {...props}
        {...field?.as("text")}
        placeholder="A short bio for the shelter"
      />
    {/snippet}
  </Field>

  <div class="flex gap-x-2">
    <Field
      label="Contact email"
      class="grow"
      field={form.fields.contact_email}
    >
      {#snippet input({ props, field })}
        <EmailInput
          {...props}
          {...field?.as("email")}
          class="w-full"
          placeholder="hello@happypaws.org"
        />
      {/snippet}
    </Field>

    <Field
      label="Contact phone"
      class="grow"
      field={form.fields.contact_phone}
    >
      {#snippet input({ props, field })}
        <TelInput
          {...props}
          {...field?.as("tel")}
          class="w-full"
        />
      {/snippet}
    </Field>
  </div>

  <input
    class="hidden"
    {...form.fields.google_place_id.as("text")}
  />
  <input
    class="hidden"
    {...form.fields.address.as("text")}
  />
  <input
    class="hidden"
    {...form.fields.location.x.as("text")}
  />
  <input
    class="hidden"
    {...form.fields.location.y.as("text")}
  />
  <input
    class="hidden"
    {...form.fields.street_number.as("text")}
  />
  <input
    class="hidden"
    {...form.fields.street_name.as("text")}
  />
  <input
    class="hidden"
    {...form.fields.suburb.as("text")}
  />
  <input
    class="hidden"
    {...form.fields.city.as("text")}
  />
  <input
    class="hidden"
    {...form.fields.province.as("text")}
  />
  <input
    class="hidden"
    {...form.fields.postal_code.as("text")}
  />
  <input
    class="hidden"
    {...form.fields.country.as("text")}
  />

  <Field
    label="Address"
    description={form.fields.address.value()}
    issues={form.fields
      .allIssues()
      ?.filter(
        (i) =>
          i.path.includes("google_place_id") ||
          i.path.includes("address") ||
          i.path.includes("location"),
      )}
  >
    {#snippet input({ props })}
      <GooglePlaceInput
        {...props}
        value={form.fields.address.value()}
        on_change={(data) => {
          form.fields.address.set(data.formatted_address ?? "");
          form.fields.google_place_id.set(data.google_place_id ?? "");
          form.fields.location.x.set(data.location.lng.toString());
          form.fields.location.y.set(data.location.lat.toString());

          const ac = data.address_components;
          form.fields.street_number.set(ac.street_number ?? "");
          form.fields.street_name.set(ac.street_name ?? "");
          form.fields.suburb.set(ac.suburb ?? "");
          form.fields.city.set(ac.city ?? "");
          form.fields.province.set(ac.province ?? "");
          form.fields.postal_code.set(ac.postal_code ?? "");
          form.fields.country.set(ac.country ?? "");
        }}
      />
    {/snippet}
  </Field>

  {#if props.mode === "create"}
    <Field
      label="Photo"
      field={form.fields.image}
    >
      {#snippet input({ props, field })}
        <Input
          {...props}
          {...field!.as("file")}
          accept="image/*"
        />
      {/snippet}
    </Field>
  {/if}

  <FormButton
    {form}
    class="w-full"
    icon="lucide/check"
  >
    Save shelter
  </FormButton>

  <FormErrors {form} />
</form>
