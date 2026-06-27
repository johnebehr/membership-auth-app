import mysql from "mysql2/promise";

let cachedPool = null;

export function getDatabaseConfig() {
  const appEnv =
    process.env.NUXT_PUBLIC_APP_ENV || process.env.NODE_ENV || "development";
  const isProduction = appEnv === "production";

  if (isProduction) {
    return {
      host: process.env.DB_HOST || "prod-db.internal",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "membership_prod",
      password: process.env.DB_PASSWORD || "prod-secret",
      database: process.env.DB_DATABASE || "membership_prod",
    };
  }

  return {
    host: process.env.DB_HOST || "192.168.100.213",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "membership_dev",
    password: process.env.DB_PASSWORD || "dev-secret",
    database: process.env.DB_DATABASE || "membership_dev",
  };
}

export async function getDatabasePool() {
  if (cachedPool) {
    return cachedPool;
  }

  const config = getDatabaseConfig();
  cachedPool = mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  return cachedPool;
}

export async function closeDatabasePool() {
  if (!cachedPool) {
    return;
  }

  await cachedPool.end();
  cachedPool = null;
}
