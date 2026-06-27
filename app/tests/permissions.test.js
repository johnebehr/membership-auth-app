import { describe, expect, it } from "vitest";
import { getGroupCapabilities } from "../server/utils/permissions.js";

describe("getGroupCapabilities", () => {
  it("returns admin privileges for the admin group", () => {
    const capabilities = getGroupCapabilities("admin");

    expect(capabilities.canManageUsers).toBe(true);
    expect(capabilities.canManageMemberships).toBe(true);
    expect(capabilities.canViewLookup).toBe(true);
  });

  it("prevents new-user creation for membership users", () => {
    const capabilities = getGroupCapabilities("membership");

    expect(capabilities.canManageUsers).toBe(false);
    expect(capabilities.canManageMemberships).toBe(true);
    expect(capabilities.canViewLookup).toBe(true);
  });

  it("limits organizing users to lookup access", () => {
    const capabilities = getGroupCapabilities("organizer");

    expect(capabilities.canManageUsers).toBe(false);
    expect(capabilities.canManageMemberships).toBe(false);
    expect(capabilities.canViewLookup).toBe(true);
  });
});
