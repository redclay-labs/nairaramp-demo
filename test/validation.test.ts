import { describe, expect, it } from "vitest";
import { validateOptionalAmount } from "../lib/validation";

describe("validateOptionalAmount", () => {
  it("returns undefined for empty or whitespace strings", () => {
    expect(validateOptionalAmount("")).toEqual({ ok: true, value: undefined });
    expect(validateOptionalAmount("   ")).toEqual({ ok: true, value: undefined });
  });

  it("accepts valid positive integers and decimals", () => {
    expect(validateOptionalAmount("50")).toEqual({ ok: true, value: "50" });
    expect(validateOptionalAmount(" 10.25 ")).toEqual({
      ok: true,
      value: "10.25",
    });
  });

  it("rejects non-numeric, negative, or zero values", () => {
    expect(validateOptionalAmount("abc").ok).toBe(false);
    expect(validateOptionalAmount("-5").ok).toBe(false);
    expect(validateOptionalAmount("0")).toEqual({
      ok: false,
      error: "Amount must be greater than zero.",
    });
    expect(validateOptionalAmount("0.00")).toEqual({
      ok: false,
      error: "Amount must be greater than zero.",
    });
  });
});

