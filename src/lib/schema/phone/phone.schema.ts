import { ParseError, parsePhoneNumberWithError } from "libphonenumber-js/min";
import { z } from "zod";

export const phone_schema = z
  .string()
  .trim()
  .transform((val, ctx) => {
    try {
      const parsed = parsePhoneNumberWithError(val, "ZA");
      if (!parsed.isValid()) {
        ctx.addIssue({
          code: "custom",
          path: ["phone"],
          message: "Invalid phone number",
        });
        return z.NEVER;
      }

      return parsed.format("E.164");
    } catch (e) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message:
          e instanceof ParseError ? `Invalid phone number: ${e.message}` : "Invalid phone number",
      });
      return z.NEVER;
    }
  });
