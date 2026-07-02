import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetDatabasePool } = vi.hoisted(() => ({
  mockGetDatabasePool: vi.fn(),
}));

vi.mock("../server/utils/database.js", () => ({
  getDatabasePool: mockGetDatabasePool,
}));

vi.mock("../../server/utils/database.js", () => ({
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

  it("persists a created user with admin access and returns it to the client", async () => {
    const pool = {
      query: vi
        .fn()
        .mockResolvedValueOnce([{ insertId: 42 }])
        .mockResolvedValueOnce([
          [
            {
              id: 42,
              name: "Casey Test",
              email: "casey@example.com",
              is_admin: 1,
              auto_logout_minutes: 18,
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
        is_admin: true,
        auto_logout_minutes: 18,
      },
    });

    expect(result.ok).toBe(true);
    expect(result.user).toMatchObject({
      id: 42,
      name: "Casey Test",
      email: "casey@example.com",
      is_admin: true,
      auto_logout_minutes: 18,
    });
  });

  it("orders users by last name then first name when listing them", async () => {
    const pool = {
      query: vi.fn().mockResolvedValueOnce([[]]),
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

  it("persists a created user with the selected admin flag when creating a user", async () => {
    const pool = {
      query: vi
        .fn()
        .mockResolvedValueOnce([{ insertId: 42 }])
        .mockResolvedValueOnce([
          [
            {
              id: 42,
              name: "Casey Test",
              email: "casey@example.com",
              is_admin: 1,
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
        is_admin: true,
      },
    });

    expect(result.ok).toBe(true);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO users"),
      expect.any(Array),
    );
  });

  it("updates an existing user and their admin flag", async () => {
    const pool = {
      query: vi
        .fn()
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([
          [
            {
              id: 42,
              name: "Casey Test",
              email: "casey@example.com",
              is_admin: 1,
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
        is_admin: true,
      },
    });

    expect(result.ok).toBe(true);
    expect(result.user).toMatchObject({
      id: 42,
      name: "Casey Test",
      email: "casey@example.com",
      is_admin: true,
    });
  });

  it("persists auto_logout_minutes when updating an existing user", async () => {
    const pool = {
      query: vi
        .fn()
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([
          [
            {
              id: 42,
              name: "Casey Test",
              email: "casey@example.com",
              is_admin: 1,
              auto_logout_minutes: 18,
            },
          ],
        ]),
    };

    mockGetDatabasePool.mockResolvedValue(pool);

    const { default: usersPutHandler } =
      await import("../../server/api/users/[id].put.js");

    const result = await usersPutHandler({
      context: { params: { id: 42 } },
      body: {
        first_name: "Casey",
        last_name: "Test",
        email: "casey@example.com",
        is_admin: true,
        auto_logout_minutes: 18,
      },
    });

    expect(result.ok).toBe(true);
    expect(result.user).toMatchObject({
      id: 42,
      auto_logout_minutes: 18,
    });
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("auto_logout_minutes"),
      expect.any(Array),
    );
  });

  it("returns the available users from the database for the management page", async () => {
    const pool = {
      query: vi.fn().mockResolvedValueOnce([
        [
          { id: 1, name: "Admin", is_admin: 1 },
          { id: 2, name: "Membership", is_admin: 0 },
          { id: 3, name: "Organizer", is_admin: 0 },
        ],
      ]),
    };

    mockGetDatabasePool.mockResolvedValue(pool);

    const { default: usersGetHandler } =
      await import("../server/api/users.get.js");

    const result = await usersGetHandler({});

    expect(result.users).toEqual([
      { id: 1, name: "Admin", is_admin: true, auto_logout_minutes: 10 },
      { id: 2, name: "Membership", is_admin: false, auto_logout_minutes: 10 },
      { id: 3, name: "Organizer", is_admin: false, auto_logout_minutes: 10 },
    ]);
  });

  it("returns admin state when a user logs in", async () => {
    const pool = {
      query: vi.fn().mockResolvedValueOnce([
        [
          {
            id: 7,
            name: "Casey",
            email: "casey@example.com",
            password_hash: "StrongPassword123!",
            is_admin: 1,
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
      is_admin: true,
      role: "Admin",
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
            is_admin: 1,
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
            is_admin: 1,
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
