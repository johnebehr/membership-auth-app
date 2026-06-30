import { getDatabasePool } from "../../utils/database.js";

export default defineEventHandler(async (event) => {
  const id = event.context?.params?.id;
  const body = await readBody(event);
  const slug = body?.slug?.trim();
  const name = body?.name?.trim();
  const description = body?.description?.trim() || null;

  if (!id || !slug || !name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Group id, slug, and name are required.",
    });
  }

  const pool = await getDatabasePool();
  await pool.query(
    "UPDATE user_groups SET slug = ?, name = ?, description = ? WHERE id = ?",
    [slug, name, description, id],
  );

  return { ok: true };
});
