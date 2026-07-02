import { getDatabasePool } from "./database.js";
import { hashPassword } from "./password.js";

export async function seedInitialAdminUsers(adminUsers = []) {
  const pool = await getDatabasePool();

  const createdUsers = [];

  for (const adminUser of adminUsers) {
    const email = adminUser.email?.trim();
    const name = adminUser.name?.trim();
    const password = adminUser.password;

    if (!email || !name || !password) {
      continue;
    }

    const [existingRows] = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    if (existingRows?.length) {
      continue;
    }

    const passwordHash = hashPassword(password);
    const [insertResult] = await pool.query(
      "INSERT INTO users (first_name, email, password_hash, is_admin, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())",
      [name, email, passwordHash, 1],
    );

    createdUsers.push({
      id: insertResult.insertId,
      name,
      email,
    });
  }

  return createdUsers;
}
