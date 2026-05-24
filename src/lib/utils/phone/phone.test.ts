import { describe, expect, it } from "vite-plus/test";
import { PhoneUtil } from "./phone.util";

describe("Phone.formatNationalZA", () => {
  it("formats E.164 ZA mobile", () => {
    expect(PhoneUtil.formatNationalZA("+27821234567")).toBe("082 123 4567");
  });

  it("formats E.164 ZA landline", () => {
    expect(PhoneUtil.formatNationalZA("+27211234567")).toBe("021 123 4567");
  });

  it("formats already-national ZA number", () => {
    expect(PhoneUtil.formatNationalZA("0821234567")).toBe("082 123 4567");
  });

  it("strips spaces and punctuation before formatting", () => {
    expect(PhoneUtil.formatNationalZA("+27 82 123 4567")).toBe("082 123 4567");
  });

  it("returns input unchanged when not a recognised ZA number", () => {
    expect(PhoneUtil.formatNationalZA("+14155552671")).toBe("+14155552671");
    expect(PhoneUtil.formatNationalZA("")).toBe("");
    expect(PhoneUtil.formatNationalZA("123")).toBe("123");
  });
});
