export const IMAGES = {
  SIZES: {
    // Matches size-4 of Icon.svelte
    ICON: {
      width: 16,
      height: 16,
    },
    AVATAR: {
      width: 32,
      height: 32,
    },
    LIST_MEDIA: {
      width: 100,
      height: 100,
    },
    THUMBNAIL: {
      width: 180,
      height: 180,
    },
    THUMBNAIL_LG: {
      width: 200,
      height: 200,
    },
    PREVIEW: {
      width: 270,
      height: 270,
    },
    FULL: {
      width: 800,
      height: 800,
    },
  } satisfies Record<string, { width: number; height: number }>,
};
