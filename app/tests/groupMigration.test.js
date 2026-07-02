import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetDatabasePool } = vi.hoisted(() => ({
  mockGetDatabasePool: vi.fn(),
}));

vi.mock("../server/utils/database.js", () => ({
  getDatabasePool: mockGetDatabasePool,
}));

describe("migrateLegacyAdminFlags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks matching users as admins when migrating legacy memberships", async () => {
    const pool = {
      query: vi
        .fn()
        .mockResolvedValueOnce([[{ id: 1 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]),
    };

    mockGetDatabasePool.mockResolvedValue(pool);

    const { migrateLegacyAdminFlags } =
      await import("../server/utils/migrateLegacyGroupMemberships.js");

    const result = await migrateLegacyAdminFlags({
      userIds: [1],
      is_admin: true,
    });

    expect(result.created).toBe(1);
    expect(pool.query).toHaveBeenCalledWith(
      "UPDATE users SET is_admin = ? WHERE id = ?",
      [1, 1],
    );
  });
});
