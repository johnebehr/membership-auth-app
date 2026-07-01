export function validateLocalPayload(payload = {}) {
  const localNumber = String(payload?.local_number || "").trim();
  const localName = String(payload?.local_name || "").trim();
  const createdBy = Number(payload?.created_by);
  const updatedBy = Number(payload?.updated_by);

  if (!/^[0-9]{4}$/.test(localNumber)) {
    return {
      ok: false,
      message: "A valid 4-digit local number is required.",
    };
  }

  if (!localName) {
    return {
      ok: false,
      message: "A local name is required.",
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
      local_number: localNumber,
      local_name: localName,
      created_by: createdBy,
      updated_by: updatedBy,
    },
  };
}
