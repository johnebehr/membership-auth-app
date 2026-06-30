import { getDatabasePool } from "../utils/database.js";
import { validatePassword, verifyPassword } from "../utils/password.js";

function normalizeLoginIdentifier(identifier) {
  const trimmedIdentifier = identifier?.trim();

  if (!trimmedIdentifier) {
    return { lookup: "", fallback: null };
  }

  if (trimmedIdentifier.includes("@")) {
    return { lookup: trimmedIdentifier, fallback: null };
  }

  const defaultDomain = process.env.DEFAULT_EMAIL_DOMAIN?.trim();

  if (!defaultDomain) {
    return { lookup: trimmedIdentifier, fallback: `${trimmedIdentifier}@%` };
  }

  return { lookup: `${trimmedIdentifier}@${defaultDomain}`, fallback: null };
}

export function buildLoginQuery({ fallback = false } = {}) {
  const baseQuery = `SELECT users.id, users.name, users.email, users.password_hash,
      GROUP_CONCAT(DISTINCT user_groups.id ORDER BY user_groups.name SEPARATOR ',') AS group_ids,
      GROUP_CONCAT(DISTINCT user_groups.slug ORDER BY user_groups.name SEPARATOR ',') AS group_slugs,
      GROUP_CONCAT(DISTINCT user_groups.name ORDER BY user_groups.name SEPARATOR ',') AS group_names
    FROM users
    LEFT JOIN user_group_memberships ON user_group_memberships.user_id = users.id
    LEFT JOIN user_groups ON user_groups.id = user_group_memberships.group_id
    WHERE users.email = ?`;

  return fallback
    ? `${baseQuery} OR users.email LIKE ? GROUP BY users.id LIMIT 1`
    : `${baseQuery} GROUP BY users.id LIMIT 1`;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body?.email?.trim() || !body?.password?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email and password are required.",
    });
  }

  const passwordCheck = validatePassword(body.password);

  if (!passwordCheck.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: passwordCheck.message,
    });
  }

  const pool = await getDatabasePool();
  const { lookup, fallback } = normalizeLoginIdentifier(body.email);
  const query = buildLoginQuery({ fallback });

  const [rows] = await pool.query(
    query,
    fallback ? [lookup, fallback] : [lookup],
  );

  const user = rows?.[0];

  if (!user || !verifyPassword(body.password.trim(), user.password_hash)) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password.",
    });
  }

  const groupIds = user.group_ids
    ? user.group_ids.split(",").map((groupId) => Number(groupId))
    : user.group_id
      ? [Number(user.group_id)]
      : [];
  const groupSlugs = user.group_slugs
    ? user.group_slugs.split(",")
    : user.group_slug
      ? [user.group_slug]
      : [];
  const groupNames = user.group_names
    ? user.group_names.split(",")
    : user.group_name
      ? [user.group_name]
      : [];

  return {
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      group_ids: groupIds,
      group_slugs: groupSlugs,
      group_names: groupNames,
      group_id: groupIds[0] ?? null,
      group_slug: groupSlugs[0] ?? null,
      group_name: groupNames[0] ?? null,
    },
  };
});
