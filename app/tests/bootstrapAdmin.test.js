import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetDatabasePool } = vi.hoisted(() => ({
  mockGetDatabasePool: vi.fn(),
}));

vi.mock("../server/utils/database.js", () => ({
  getDatabasePool: mockGetDatabasePool,
}));

describe("seedInitialAdminUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new admin account with a hashed password when none exists", async () => {
    const pool = {
      query: vi
        .fn()
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 99 }]),
    };

    mockGetDatabasePool.mockResolvedValue(pool);

    const { seedInitialAdminUsers } =
      await import("../server/utils/bootstrapAdmin.js");

    const created = await seedInitialAdminUsers([
      {
        name: "System Admin",
        email: "admin@example.com",
        password: "StrongPassword123!",
      },
    ]);

    expect(created).toHaveLength(1);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO users"),
      expect.any(Array),
    );

    const insertArgs = pool.query.mock.calls[1][1];
    expect(insertArgs[2]).not.toBe("StrongPassword123!");
    expect(insertArgs[2]).toContain("scrypt$");
  });
});
