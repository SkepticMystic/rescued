<script lang="ts">
  import { PUBLIC_GOOGLE_MAPS_API_KEY } from "$env/static/public";
  import ButtonGroup from "$lib/components/ui/button-group/button-group.svelte";
  import type { MaybePromise } from "$lib/interfaces";
  import * as Sentry from "@sentry/sveltekit";
  import { PlaceAutocomplete } from "places-autocomplete-svelte";
  import type {
    ComponentOptions,
    RequestParams,
  } from "places-autocomplete-svelte/interfaces";
  import { toast } from "svelte-sonner";

  export interface AddressComponents {
    street_number?: string;
    street_name?: string;
    suburb?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    country?: string;
  }

  let {
    value,
    on_change,

    ...rest_props
  }: {
    value?: string;
    on_change?: (data: {
      name?: string;
      google_place_id: string;
      formatted_address?: string;
      location: {
        lat: number;
        lng: number;
      };
      address_components: AddressComponents;
    }) => MaybePromise<unknown>;
  } = $props();

  function parse_address_components(
    components: { longText: string; shortText: string; types: string[] }[],
  ): AddressComponents {
    const find = (type: string) =>
      components.find((c) => c.types.includes(type));

    return {
      street_number: find("street_number")?.longText,
      street_name: find("route")?.longText,
      suburb:
        find("sublocality_level_1")?.longText ?? find("sublocality")?.longText,
      city: find("locality")?.longText,
      province: find("administrative_area_level_1")?.longText,
      postal_code: find("postal_code")?.longText,
      country: find("country")?.shortText,
    };
  }

  const requestParams: Partial<RequestParams> = $derived({
    region: "ZA",
    language: "en-ZA",
    input: value ?? "",
    includedRegionCodes: ["ZA"],
  });

  const fetchFields: string[] = $state([
    "id",
    "displayName",
    "formattedAddress",
    "location",
    "addressComponents",
  ]);

  const options: Partial<ComponentOptions> = $state({
    debounce: 200,
    distance: true,
    distance_units: "km",

    clear_input: false,
    placeholder: "Search for an address...",

    classes: {
      section: "grow",
      container: "relative z-10 transform rounded-md",
      icon_container: "hidden",

      input: `
        flex h-9 px-3 py-1 w-full min-w-0 rounded-md border border-input bg-background
        text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30
        focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50
        aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40
        `,

      kbd_container: "absolute inset-y-0 right-0 flex py-1.5 pr-1.5",
      kbd_escape:
        "inline-flex items-center rounded border border-gray-300 px-1 font-sans text-xs text-gray-500 w-8 mr-1",
      kbd_up:
        "inline-flex items-center justify-center rounded border border-gray-300 px-1 font-sans text-xs text-gray-500 w-6",
      kbd_down:
        "inline-flex items-center rounded border border-gray-400 px-1 font-sans text-xs text-gray-500 justify-center w-6",
      kbd_active: "bg-accent text-accent-foreground",

      ul: "absolute z-50 -mb-2 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm divide-y divide-gray-100",
      li: "z-50 cursor-default select-none py-2 px-2 lg:px-4 text-gray-900 hover:bg-accent hover:text-accent-foreground",
      li_current: "bg-accent",
      li_a: "block w-full flex justify-between",
      li_a_current: "text-white",
      li_div_container: "flex min-w-0 gap-x-4",
      li_div_one: "min-w-0 flex-auto",
      li_div_one_p: "text-sm/6 ",
      li_div_two: "shrink-0 flex flex-col items-end min-w-16",
      li_div_two_p: "mt-1 text-xs/5",
      highlight: "font-bold",
    },
  });
</script>

<ButtonGroup class="sm:min-w-[300px]">
  <PlaceAutocomplete
    {...rest_props}
    {options}
    {fetchFields}
    {requestParams}
    {PUBLIC_GOOGLE_MAPS_API_KEY}
    onError={(error) => {
      toast.error(error);

      Sentry.metrics.count("GooglePlacesInput.onError", 1, {
        unit: "error",
        attributes: { error },
      });
    }}
    onResponse={(response) => {
      value = response.formattedAddress;

      on_change?.({
        google_place_id: (response.id ?? "") as string,
        formatted_address: response.formattedAddress ?? "",
        name: (response.name ?? response.displayName) as string | undefined,
        location: {
          lat: response.location?.lat ?? 0,
          lng: response.location?.lng ?? 0,
        },
        address_components: parse_address_components(
          response.addressComponents ?? [],
        ),
      });
    }}
  />
</ButtonGroup>
