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
      "INSERT INTO users (first_name, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())",
      [name, email, passwordHash],
    );

    let groupRows = [];

    try {
      [groupRows] = await pool.query(
        "SELECT id FROM user_groups WHERE slug = 'admin' LIMIT 1",
      );
    } catch {
      groupRows = [];
    }

    if (Array.isArray(groupRows) && groupRows.length) {
      await pool.query(
        "INSERT INTO user_group_memberships (user_id, group_id) VALUES (?, ?)",
        [insertResult.insertId, groupRows[0].id],
      );
    }

    createdUsers.push({
      id: insertResult.insertId,
      name,
      email,
    });
  }

  return createdUsers;
}
