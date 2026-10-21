import { describe, expect, it } from "vitest";

import { collectFieldErrors, fieldMessage, type FieldValidity } from "@/lib/checkout-form";

const ok: FieldValidity = {
  valid: true,
  valueMissing: false,
  typeMismatch: false,
  patternMismatch: false,
  tooShort: false,
  tooLong: false,
};
const bad = (flags: Partial<FieldValidity>): FieldValidity => ({ ...ok, valid: false, ...flags });

describe("fieldMessage", () => {
  it("says nothing for a valid field", () => {
    expect(fieldMessage("email", ok)).toBeUndefined();
  });

  it("asks for missing fields by name, with a fallback for unknown ones", () => {
    expect(fieldMessage("email", bad({ valueMissing: true }))).toBe("Add an email for the receipt.");
    expect(fieldMessage("postalCode", bad({ valueMissing: true }))).toBe("Add a postal or ZIP code.");
    expect(fieldMessage("nickname", bad({ valueMissing: true }))).toBe("This one is needed.");
  });

  it("explains a bad email and a bad postal code specifically", () => {
    expect(fieldMessage("email", bad({ typeMismatch: true }))).toMatch(/email looks off/);
    expect(fieldMessage("postalCode", bad({ patternMismatch: true }))).toMatch(/A1A 1A1/);
  });

  it("prefers 'missing' over other problems and handles length limits", () => {
    expect(fieldMessage("name", bad({ valueMissing: true, tooShort: true }))).toBe("Who is this board for?");
    expect(fieldMessage("name", bad({ tooShort: true }))).toMatch(/short/);
    expect(fieldMessage("city", bad({ tooLong: true }))).toMatch(/longer/);
    expect(fieldMessage("city", bad({}))).toBe("Check this one.");
  });
});

describe("collectFieldErrors", () => {
  it("keeps only invalid named controls, in order, first message wins", () => {
    const errors = collectFieldErrors([
      { name: "name", validity: bad({ valueMissing: true }) },
      { name: "email", validity: ok },
      { name: "", validity: bad({ valueMissing: true }) },
      { name: "postalCode", validity: bad({ patternMismatch: true }) },
      { name: "name", validity: bad({ tooShort: true }) },
    ]);
    expect(Object.keys(errors)).toEqual(["name", "postalCode"]);
    expect(errors.name).toBe("Who is this board for?");
  });
});
