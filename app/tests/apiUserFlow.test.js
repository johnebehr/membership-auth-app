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

  it("persists a created user with multiple group memberships and returns them to the client", async () => {
    const pool = {
      query: vi
        .fn()
        .mockResolvedValueOnce([{ insertId: 42 }])
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([
          [
            {
              id: 42,
              name: "Casey Test",
              email: "casey@example.com",
              group_ids: "2,3",
              group_names: "Membership,Accounting",
              group_slugs: "membership,accounting",
            },
          ],
        ]),
    };

    mockGetDatabasePool.mockResolvedValue(pool);

    const { default: usersPostHandler } =
      await import("../server/api/users.post.js");

    const result = await usersPostHandler({
      body: {
        first_name: "Casey",
        last_name: "Test",
        email: "casey@example.com",
        password: "StrongPassword123!",
        group_ids: [2, 3],
      },
    });

    expect(result.ok).toBe(true);
    expect(result.user).toMatchObject({
      id: 42,
      name: "Casey Test",
      email: "casey@example.com",
      group_ids: [2, 3],
      group_names: ["Membership", "Accounting"],
      group_slugs: ["membership", "accounting"],
    });
  });

  it("orders users by last name then first name when listing them", async () => {
    const pool = {
      query: vi.fn().mockResolvedValueOnce([[]]).mockResolvedValueOnce([[]]),
    };

    mockGetDatabasePool.mockResolvedValue(pool);

    const { default: usersGetHandler } =
      await import("../server/api/users.get.js");

    await usersGetHandler({});

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining(
        "ORDER BY users.last_name ASC, users.first_name ASC, users.created_at DESC",
      ),
    );
  });

  it("persists a created user with the selected group memberships when creating a user", async () => {
    const pool = {
      query: vi
        .fn()
        .mockResolvedValueOnce([{ insertId: 42 }])
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([
          [
            {
              id: 42,
              name: "Casey Test",
              email: "casey@example.com",
              group_ids: "2,3",
              group_names: "Membership,Accounting",
              group_slugs: "membership,accounting",
            },
          ],
        ]),
    };

    mockGetDatabasePool.mockResolvedValue(pool);

    const { default: usersPostHandler } =
      await import("../server/api/users.post.js");

    const result = await usersPostHandler({
      body: {
        first_name: "Casey",
        last_name: "Test",
        email: "casey@example.com",
        password: "StrongPassword123!",
        group_ids: [2, 3],
      },
    });

    expect(result.ok).toBe(true);
    expect(pool.query).toHaveBeenCalledWith(
      "INSERT INTO user_group_memberships (user_id, group_id) VALUES ?",
      [
        [
          [42, 2],
          [42, 3],
        ],
      ],
    );
  });

  it("updates an existing user and their memberships", async () => {
    const pool = {
      query: vi
        .fn()
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([
          [
            {
              id: 42,
              name: "Casey Test",
              email: "casey@example.com",
              group_ids: "2,3",
              group_names: "Membership,Accounting",
              group_slugs: "membership,accounting",
            },
          ],
        ]),
    };

    mockGetDatabasePool.mockResolvedValue(pool);

    const { default: usersPutHandler } =
      await import("../server/api/users/[id].put.js");

    const result = await usersPutHandler({
      context: { params: { id: 42 } },
      body: {
        first_name: "Casey",
        last_name: "Test",
        email: "casey@example.com",
        group_ids: [2, 3],
      },
    });

    expect(result.ok).toBe(true);
    expect(result.user).toMatchObject({
      id: 42,
      name: "Casey Test",
      email: "casey@example.com",
      group_ids: [2, 3],
      group_names: ["Membership", "Accounting"],
      group_slugs: ["membership", "accounting"],
    });
  });

  it("returns the available groups from the database for the create-user select", async () => {
    const pool = {
      query: vi
        .fn()
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([
          [
            { id: 1, name: "Admin" },
            { id: 2, name: "Membership" },
            { id: 3, name: "Organizer" },
          ],
        ]),
    };

    mockGetDatabasePool.mockResolvedValue(pool);

    const { default: usersGetHandler } =
      await import("../server/api/users.get.js");

    const result = await usersGetHandler({});

    expect(result.groups).toEqual([
      { id: 1, name: "Admin" },
      { id: 2, name: "Membership" },
      { id: 3, name: "Organizer" },
    ]);
  });

  it("returns group details when a user logs in", async () => {
    const pool = {
      query: vi.fn().mockResolvedValueOnce([
        [
          {
            id: 7,
            name: "Casey",
            email: "casey@example.com",
            password_hash: "StrongPassword123!",
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
      body: { email: "casey@example.com", password: "StrongPassword123!" },
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

  it("accepts a short login identifier and resolves it to the full email address", async () => {
    const originalDomain = process.env.DEFAULT_EMAIL_DOMAIN;
    process.env.DEFAULT_EMAIL_DOMAIN = "example.com";

    const pool = {
      query: vi.fn().mockResolvedValueOnce([
        [
          {
            id: 7,
            name: "Casey",
            email: "casey@example.com",
            password_hash: "StrongPassword123!",
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
      body: { email: "casey", password: "StrongPassword123!" },
    });

    expect(result.ok).toBe(true);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("WHERE users.email = ?"),
      ["casey@example.com"],
    );

    if (originalDomain === undefined) {
      delete process.env.DEFAULT_EMAIL_DOMAIN;
    } else {
      process.env.DEFAULT_EMAIL_DOMAIN = originalDomain;
    }
  });

  it("falls back to a domain-style match when no default domain is configured", async () => {
    const originalDomain = process.env.DEFAULT_EMAIL_DOMAIN;
    delete process.env.DEFAULT_EMAIL_DOMAIN;

    const pool = {
      query: vi.fn().mockResolvedValueOnce([
        [
          {
            id: 7,
            name: "Casey",
            email: "casey@example.com",
            password_hash: "StrongPassword123!",
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
      body: { email: "casey", password: "StrongPassword123!" },
    });

    expect(result.ok).toBe(true);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("WHERE users.email = ? OR users.email LIKE ?"),
      ["casey", "casey@%"],
    );

    if (originalDomain === undefined) {
      delete process.env.DEFAULT_EMAIL_DOMAIN;
    } else {
      process.env.DEFAULT_EMAIL_DOMAIN = originalDomain;
    }
  });
});
