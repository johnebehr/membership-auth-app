import { describe, expect, it } from "vitest";
import {
  generateClockId,
  validateMemberPayload,
} from "../server/utils/members.js";
import { validateLocalPayload } from "../server/utils/locals.js";

describe("member helpers", () => {
  it("generates a 32-character hex clock id", () => {
    const clockId = generateClockId();

    expect(clockId).toHaveLength(32);
    expect(clockId).toMatch(/^[0-9a-f]{32}$/);
  });

  it("requires first and last name and a valid local number", () => {
    const missingName = validateMemberPayload({
      first_name: "",
      last_name: "",
      local_number: "6086",
      created_by: 1,
      updated_by: 1,
    });

    expect(missingName.ok).toBe(false);
    expect(missingName.message).toContain("First name");

    const invalidLocal = validateMemberPayload({
      first_name: "Jane",
      last_name: "Doe",
      local_number: "invalid",
      created_by: 1,
      updated_by: 1,
    });

    expect(invalidLocal.ok).toBe(false);
    expect(invalidLocal.message).toContain("local number");
  });

  it("requires a valid local number and name", () => {
    const invalidNumber = validateLocalPayload({
      local_number: "abc",
      local_name: "Local 6086",
      created_by: 1,
      updated_by: 1,
    });

    expect(invalidNumber.ok).toBe(false);
    expect(invalidNumber.message).toContain("local number");

    const missingName = validateLocalPayload({
      local_number: "6086",
      local_name: "",
      created_by: 1,
      updated_by: 1,
    });

    expect(missingName.ok).toBe(false);
    expect(missingName.message).toContain("local name");
  });
});
