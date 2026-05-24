<script lang="ts">
  import NativeSelectOption from "$lib/components/ui/native-select/native-select-option.svelte";
  import NativeSelect from "$lib/components/ui/native-select/native-select.svelte";
  import { list_my_shelters_remote } from "$lib/remote/shelters/shelters.remote";
  import type { ComponentProps } from "svelte";

  let {
    value = $bindable(),
    ...rest
  }: Omit<ComponentProps<typeof NativeSelect>, "options"> = $props();
</script>

<NativeSelect
  {...rest}
  options={list_my_shelters_remote().then((d) => {
    if (d.length === 1) {
      value = d[0]!.id;
      rest.on_value_select?.(value);
    }

    return d.map((s) => ({
      value: s.id,
      label: s.name,
    }));
  })}
  bind:value
>
  <NativeSelectOption value="">Select a shelter</NativeSelectOption>
</NativeSelect>
