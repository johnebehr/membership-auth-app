import { getDatabasePool } from "../utils/database.js";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const slug = body?.slug?.trim();
  const name = body?.name?.trim();
  const description = body?.description?.trim() || null;

  if (!slug || !name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Group slug and name are required.",
    });
  }

  const pool = await getDatabasePool();
  const [result] = await pool.query(
    "INSERT INTO user_groups (slug, name, description) VALUES (?, ?, ?)",
    [slug, name, description],
  );

  return {
    ok: true,
    group: {
      id: result.insertId,
      slug,
      name,
      description,
    },
  };
});
