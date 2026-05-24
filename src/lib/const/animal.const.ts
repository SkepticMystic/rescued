import type { BadgeVariant } from "$lib/components/ui/badge";

const SPECIES_IDS = ["dog", "cat", "other"] as const;

type SpeciesId = (typeof SPECIES_IDS)[number];

const SPECIES_MAP = {
  dog: {
    label: "Dog",
  },
  cat: {
    label: "Cat",
  },
  other: {
    label: "Other",
  },
} satisfies Record<SpeciesId, { label: string }>;

const SEX_IDS = ["male", "female", "unknown"] as const;

type SexId = (typeof SEX_IDS)[number];

const SEX_MAP = {
  male: {
    label: "Male",
  },
  female: {
    label: "Female",
  },
  unknown: {
    label: "Unknown",
  },
} satisfies Record<SexId, { label: string }>;

const STATUS_IDS = [
  "intake",
  "available",
  "fostered",
  "adopted",
  "medical_hold",
  "archived",
] as const;

type StatusId = (typeof STATUS_IDS)[number];

const STATUS_MAP = {
  intake: {
    label: "Intake",
    variant: "default",
    icon: "plus",
  },
  available: {
    label: "Available",
    variant: "success",
    icon: "check",
  },
  fostered: {
    label: "Fostered",
    variant: "warning",
    icon: "home",
  },
  adopted: {
    label: "Adopted",
    variant: "default",
    icon: "heart",
  },
  medical_hold: {
    label: "Medical Hold",
    variant: "destructive",
    icon: "cross",
  },
  archived: {
    label: "Archived",
    variant: "secondary",
    icon: "archive",
  },
} satisfies Record<StatusId, { label: string; variant: BadgeVariant; icon: string }>;

export const ANIMALS = {
  SPECIES: {
    IDS: SPECIES_IDS,
    MAP: SPECIES_MAP,
    OPTIONS: SPECIES_IDS.map((id) => ({
      value: id,
      label: SPECIES_MAP[id].label,
    })),
  },
  SEX: {
    IDS: SEX_IDS,
    MAP: SEX_MAP,
    OPTIONS: SEX_IDS.map((id) => ({
      value: id,
      label: SEX_MAP[id].label,
    })),
  },
  STATUS: {
    IDS: STATUS_IDS,
    MAP: STATUS_MAP,
    OPTIONS: STATUS_IDS.map((id) => ({
      value: id,
      label: STATUS_MAP[id].label,
    })),
  },
};
