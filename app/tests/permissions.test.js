import { describe, expect, it } from "vitest";
import { getGroupCapabilities } from "../server/utils/permissions.js";

describe("getGroupCapabilities", () => {
  it("returns admin privileges for admin users", () => {
    const capabilities = getGroupCapabilities(true);

    expect(capabilities.canManageUsers).toBe(true);
    expect(capabilities.canManageMemberships).toBe(true);
    expect(capabilities.canViewLookup).toBe(true);
  });

  it("limits regular users to read-only access", () => {
    const capabilities = getGroupCapabilities(false);

    expect(capabilities.canManageUsers).toBe(false);
    expect(capabilities.canManageMemberships).toBe(false);
    expect(capabilities.canViewLookup).toBe(false);
  });
});
