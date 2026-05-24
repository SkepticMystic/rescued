/**
 * Format a ZA phone number for display.
 *
 * Inputs are expected to be E.164 strings (e.g. `+27821234567`) — the format
 * `phone_schema` produces. Anything else falls back to the raw input so we
 * never throw at the UI layer.
 *
 * NATIONAL format: `082 123 4567` (3-3-4).
 */
const formatNationalZA = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");

  let national: string | undefined;
  if (digits.length === 11 && digits.startsWith("27")) {
    national = "0" + digits.slice(2);
  } else if (digits.length === 10 && digits.startsWith("0")) {
    national = digits;
  }

  if (!national) return phone;

  return `${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
};

export const PhoneUtil = {
  formatNationalZA,
};
