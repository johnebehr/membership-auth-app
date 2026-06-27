import { getDatabasePool } from "../../utils/database.js";

export default defineEventHandler(async (event) => {
  const id = event.context?.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "User id is required.",
    });
  }

  const pool = await getDatabasePool();
  await pool.query("DELETE FROM users WHERE id = ?", [id]);

  return {
    ok: true,
  };
});
