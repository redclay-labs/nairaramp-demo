export type AmountValidationResult =
  | { ok: true; value: string | undefined }
  | { ok: false; error: string };

/**
 * Validates an optional positive numeric amount string.
 * Empty or whitespace-only input is valid and resolves to `undefined`.
 */
export function validateOptionalAmount(raw: string): AmountValidationResult {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return { ok: true, value: undefined };
  }

  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return {
      ok: false,
      error: "Amount must be a positive number (e.g. 50 or 10.5).",
    };
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return {
      ok: false,
      error: "Amount must be greater than zero.",
    };
  }

  return { ok: true, value: trimmed };
}

