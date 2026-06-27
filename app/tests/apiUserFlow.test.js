import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetDatabasePool } = vi.hoisted(() => ({
  mockGetDatabasePool: vi.fn(),
}));

vi.mock("../server/utils/database.js", () => ({
  getDatabasePool: mockGetDatabasePool,
}));

describe("database-backed user management flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("defineEventHandler", (handler) => handler);
    vi.stubGlobal("readBody", async (event) => event.body);
    vi.stubGlobal("createError", (error) => {
      const err = new Error(error?.statusMessage || "Request failed");
      err.statusCode = error?.statusCode;
      err.statusMessage = error?.statusMessage;
      throw err;
    });
  });

  it("persists a created user with its assigned group and returns it to the client", async () => {
    const pool = {
      query: vi
        .fn()
        .mockResolvedValueOnce([{ insertId: 42 }])
        .mockResolvedValueOnce([
          [
            {
              id: 42,
              name: "Casey",
              email: "casey@example.com",
              group_id: 2,
              group_name: "Membership",
              group_slug: "membership",
            },
          ],
        ]),
    };

    mockGetDatabasePool.mockResolvedValue(pool);

    const { default: usersPostHandler } =
      await import("../server/api/users.post.js");

    const result = await usersPostHandler({
      body: {
        name: "Casey",
        email: "casey@example.com",
        password: "s3cr3t",
        group_id: 2,
      },
    });

    expect(result.ok).toBe(true);
    expect(result.user).toMatchObject({
      id: 42,
      name: "Casey",
      email: "casey@example.com",
      group_id: 2,
      group_name: "Membership",
      group_slug: "membership",
    });
  });

  it("returns group details when a user logs in", async () => {
    const pool = {
      query: vi.fn().mockResolvedValueOnce([
        [
          {
            id: 7,
            name: "Casey",
            email: "casey@example.com",
            password_hash: "s3cr3t",
            group_id: 2,
            group_slug: "membership",
            group_name: "Membership",
          },
        ],
      ]),
    };

    mockGetDatabasePool.mockResolvedValue(pool);

    const { default: loginPostHandler } =
      await import("../server/api/login.post.js");

    const result = await loginPostHandler({
      body: { email: "casey@example.com", password: "s3cr3t" },
    });

    expect(result.ok).toBe(true);
    expect(result.user).toMatchObject({
      id: 7,
      name: "Casey",
      email: "casey@example.com",
      group_id: 2,
      group_name: "Membership",
      group_slug: "membership",
    });
  });
});
