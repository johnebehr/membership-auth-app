import { beforeEach, describe, expect, it } from "vitest";
import { getDatabaseConfig } from "../server/utils/database.js";

describe("getDatabaseConfig", () => {
  beforeEach(() => {
    delete process.env.NUXT_PUBLIC_APP_ENV;
    delete process.env.NODE_ENV;
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_DATABASE;
    delete process.env.STAGING_DB_HOST;
    delete process.env.STAGING_DB_PORT;
    delete process.env.STAGING_DB_USER;
    delete process.env.STAGING_DB_PASSWORD;
    delete process.env.STAGING_DB_NAME;
    delete process.env.PROD_DB_HOST;
    delete process.env.PROD_DB_PORT;
    delete process.env.PROD_DB_USER;
    delete process.env.PROD_DB_PASSWORD;
    delete process.env.PROD_DB_NAME;
  });

  it("uses the staging database settings for non-production environments", () => {
    process.env.NUXT_PUBLIC_APP_ENV = "development";
    process.env.DB_HOST = "dev-db.internal";
    process.env.DB_PORT = "3307";
    process.env.DB_USER = "membership_dev";
    process.env.DB_PASSWORD = "dev-secret";
    process.env.DB_DATABASE = "membership_dev";

    const config = getDatabaseConfig();

    expect(config.host).toBe("dev-db.internal");
    expect(config.port).toBe(3307);
    expect(config.user).toBe("membership_dev");
    expect(config.database).toBe("membership_dev");
  });

  it("uses the production database settings when the app is running in production", () => {
    process.env.NUXT_PUBLIC_APP_ENV = "production";
    process.env.DB_HOST = "prod-db.internal";
    process.env.DB_PORT = "3306";
    process.env.DB_USER = "membership_prod";
    process.env.DB_PASSWORD = "prod-secret";
    process.env.DB_DATABASE = "membership_prod";

    const config = getDatabaseConfig();

    expect(config.host).toBe("prod-db.internal");
    expect(config.port).toBe(3306);
    expect(config.user).toBe("membership_prod");
    expect(config.database).toBe("membership_prod");
  });
});
