/**
 * Copy for the checkout form's own error messages. The form uses the browser's
 * constraint validation (required, type, pattern, length) but shows these in
 * the page's error style instead of the browser's tooltip.
 */
export type FieldValidity = Pick<
  ValidityState,
  "valid" | "valueMissing" | "typeMismatch" | "patternMismatch" | "tooShort" | "tooLong"
>;

const MISSING: Record<string, string> = {
  name: "Who is this board for?",
  email: "Add an email for the receipt.",
  line1: "Add a street address.",
  city: "Add a city.",
  region: "Add a province or state.",
  postalCode: "Add a postal or ZIP code.",
};

export function fieldMessage(name: string, v: FieldValidity): string | undefined {
  if (v.valid) return undefined;
  if (v.valueMissing) return MISSING[name] ?? "This one is needed.";
  if (name === "email" && v.typeMismatch) return "That email looks off. Check the @ and the domain.";
  if (name === "postalCode" && v.patternMismatch) return "Use a postal code like A1A 1A1 or a ZIP like 12345.";
  if (v.tooShort) return "A bit short. Add the rest.";
  if (v.tooLong) return "That is longer than this field takes.";
  return "Check this one.";
}

/** Every invalid named control in a form, keyed by name, in document order. */
export function collectFieldErrors(
  controls: Iterable<{ name: string; validity: FieldValidity }>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const c of controls) {
    const msg = c.name ? fieldMessage(c.name, c.validity) : undefined;
    if (msg && !(c.name in out)) out[c.name] = msg;
  }
  return out;
}
