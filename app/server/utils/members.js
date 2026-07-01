import crypto from "node:crypto";

export function generateClockId() {
  return crypto.randomBytes(16).toString("hex");
}

export function validateMemberPayload(payload = {}) {
  const firstName = String(payload?.first_name || "").trim();
  const lastName = String(payload?.last_name || "").trim();
  const localNumber = String(payload?.local_number || "").trim();
  const createdBy = Number(payload?.created_by);
  const updatedBy = Number(payload?.updated_by);

  if (!firstName || !lastName) {
    return {
      ok: false,
      message: "First name and last name are required.",
    };
  }

  if (!/^[0-9]{4}$/.test(localNumber)) {
    return {
      ok: false,
      message: "A valid 4-digit local number is required.",
    };
  }

  if (!Number.isInteger(createdBy) || createdBy <= 0) {
    return {
      ok: false,
      message: "A valid created_by user id is required.",
    };
  }

  if (!Number.isInteger(updatedBy) || updatedBy <= 0) {
    return {
      ok: false,
      message: "A valid updated_by user id is required.",
    };
  }

  return {
    ok: true,
    data: {
      first_name: firstName,
      last_name: lastName,
      local_number: localNumber,
      created_by: createdBy,
      updated_by: updatedBy,
    },
  };
}
