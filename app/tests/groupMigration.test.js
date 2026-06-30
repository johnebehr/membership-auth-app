import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetDatabasePool } = vi.hoisted(() => ({
  mockGetDatabasePool: vi.fn(),
}));

vi.mock("../server/utils/database.js", () => ({
  getDatabasePool: mockGetDatabasePool,
}));

describe("migrateLegacyGroupMemberships", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates memberships for users that are missing them", async () => {
    const pool = {
      query: vi
        .fn()
        .mockResolvedValueOnce([
          [
            { id: 1, slug: "admin" },
            { id: 2, slug: "membership" },
          ],
        ])
        .mockResolvedValueOnce([[{ id: 1 }]])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ affectedRows: 2 }]),
    };

    mockGetDatabasePool.mockResolvedValue(pool);

    const { migrateLegacyGroupMemberships } =
      await import("../server/utils/migrateLegacyGroupMemberships.js");

    const result = await migrateLegacyGroupMemberships({
      groupSlugs: ["admin", "membership"],
    });

    expect(result.created).toBe(2);
    expect(pool.query).toHaveBeenCalledWith(
      "INSERT INTO user_group_memberships (user_id, group_id) VALUES ?",
      [
        [
          [1, 1],
          [1, 2],
        ],
      ],
    );
  });
});
