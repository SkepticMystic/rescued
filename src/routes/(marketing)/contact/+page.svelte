<script lang="ts">
  import CaptchaField from "$lib/components/form/auth/captcha/CaptchaField.svelte";
  import FormButton from "$lib/components/form/FormButton.svelte";
  import FormErrors from "$lib/components/form/FormErrors.svelte";
  import Card from "$lib/components/ui/card/Card.svelte";
  import Field from "$lib/components/ui/field/Field.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import Textarea from "$lib/components/ui/textarea/textarea.svelte";
  import { get_session_remote } from "$lib/remote/auth/session.remote";
  import { contact_us_remote } from "$lib/remote/contact/contact.remote";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";

  const form = contact_us_remote;

  let reset_captcha = $state<() => void>();

  onMount(() => {
    get_session_remote().then((s) => {
      if (s) {
        form.fields.name.set(s.user.name);
        form.fields.email.set(s.user.email);
      }

      return;
    });
  });
</script>

<article class="mx-auto max-w-xs">
  <Card description="Fill out the form below to get in touch.">
    {#snippet title()}
      <header>
        <h1>Contact Us</h1>
      </header>
    {/snippet}

    {#snippet children()}
      <form
        class="space-y-3"
        {...form.enhance(async (e) => {
          await e.submit();

          if (form.fields.allIssues()?.length) {
            reset_captcha?.();
          }

          const res = form.result;
          if (res?.ok) {
            toast.success("Message sent");

            e.form.reset();
          } else if (res?.error) {
            toast.error(res.error.message);
          }
        })}
      >
        <Field
          label="Name"
          field={form.fields.name}
        >
          {#snippet input({ props, field })}
            <Input
              {...props}
              {...field?.as("text")}
              required
              autocomplete="name"
              placeholder="Your name"
            />
          {/snippet}
        </Field>

        <Field
          label="Email"
          field={form.fields.email}
        >
          {#snippet input({ props, field })}
            <Input
              {...props}
              {...field?.as("email")}
              required
              inputmode="email"
              autocomplete="email"
              placeholder="Your email address"
            />
          {/snippet}
        </Field>

        <Field
          label="Message"
          field={form.fields.message}
        >
          {#snippet input({ props, field })}
            <Textarea
              {...props}
              {...field?.as("text")}
              required
              class="max-h-72 min-h-24"
              placeholder="Your message"
            />
          {/snippet}
        </Field>

        <CaptchaField
          {form}
          bind:reset={reset_captcha}
        />

        <FormButton
          {form}
          class="w-full"
          icon="lucide/send"
        >
          Send Message
        </FormButton>

        <FormErrors {form} />
      </form>
    {/snippet}
  </Card>
</article>
