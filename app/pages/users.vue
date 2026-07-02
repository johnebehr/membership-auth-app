<script setup>
import { onMounted, ref } from "vue";
import { refreshAuthSession } from "../composables/useAuth.js";

const users = ref([]);
const loading = ref(true);
const error = ref("");
const successMessage = ref("");
const form = ref({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  is_admin: false,
  auto_logout_minutes: 10,
});
const pending = ref(false);
const editingUserId = ref(null);
const editingUserSnapshot = ref(null);
let successToastTimer = null;
const editForm = ref({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  is_admin: false,
  auto_logout_minutes: 10,
});

function resetCreateForm() {
  form.value = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    is_admin: false,
    auto_logout_minutes: 10,
  };
}

function resetEditForm() {
  editingUserId.value = null;
  editingUserSnapshot.value = null;
  editForm.value = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    is_admin: false,
    auto_logout_minutes: 10,
  };
}

function formatAutoLogoutLabel(user) {
  const value = Number(user?.auto_logout_minutes ?? user?.timeoutMinutes ?? 10);
  const normalizedValue =
    Number.isFinite(value) && value > 0 ? Math.floor(value) : 10;

  return `${normalizedValue} minute${normalizedValue === 1 ? "" : "s"}`;
}

async function loadUsers() {
  loading.value = true;
  error.value = "";

  try {
    const response = await fetch("/api/users");
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Unable to load users.");
    }

    users.value = payload.users || [];
  } catch (err) {
    error.value = err?.message || "Unable to load users.";
  } finally {
    loading.value = false;
  }
}

async function createUser() {
  if (
    !form.value.first_name.trim() ||
    !form.value.last_name.trim() ||
    !form.value.email.trim() ||
    !form.value.password.trim()
  ) {
    error.value = "Please complete all fields.";
    return;
  }

  pending.value = true;
  error.value = "";

  const autoLogoutMinutes = Number(form.value.auto_logout_minutes);
  const normalizedAutoLogoutMinutes =
    Number.isFinite(autoLogoutMinutes) && autoLogoutMinutes > 0
      ? Math.floor(autoLogoutMinutes)
      : 10;

  try {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form.value,
        auto_logout_minutes: normalizedAutoLogoutMinutes,
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Unable to create user.");
    }

    resetCreateForm();
    await loadUsers();
  } catch (err) {
    error.value = err?.message || "Unable to create user.";
  } finally {
    pending.value = false;
  }
}

async function removeUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Unable to remove user.");
    }

    await loadUsers();
  } catch (err) {
    error.value = err?.message || "Unable to remove user.";
  }
}

function startEditing(user) {
  editingUserId.value = user.id;
  editingUserSnapshot.value = {
    first_name: user.first_name || user.name?.split(" ")[0] || "",
    last_name: user.last_name || user.name?.split(" ").slice(1).join(" ") || "",
    email: user.email || "",
    is_admin: Boolean(user.is_admin),
    auto_logout_minutes: Number(
      user.auto_logout_minutes ?? user.timeoutMinutes ?? 10,
    ),
  };
  editForm.value = {
    first_name: user.first_name || user.name?.split(" ")[0] || "",
    last_name: user.last_name || user.name?.split(" ").slice(1).join(" ") || "",
    email: user.email || "",
    password: "",
    is_admin: Boolean(user.is_admin),
    auto_logout_minutes: Number(
      user.auto_logout_minutes ?? user.timeoutMinutes ?? 10,
    ),
  };
}

async function updateUser() {
  if (!editingUserId.value) {
    return;
  }

  if (
    !editForm.value.first_name.trim() ||
    !editForm.value.last_name.trim() ||
    !editForm.value.email.trim()
  ) {
    error.value = "Please complete the editable fields.";
    return;
  }

  pending.value = true;
  error.value = "";
  successMessage.value = "";
  if (successToastTimer) {
    clearTimeout(successToastTimer);
  }

  const autoLogoutMinutes = Number(editForm.value.auto_logout_minutes);
  const normalizedAutoLogoutMinutes =
    Number.isFinite(autoLogoutMinutes) && autoLogoutMinutes > 0
      ? Math.floor(autoLogoutMinutes)
      : 10;

  try {
    const response = await fetch(`/api/users/${editingUserId.value}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm.value,
        auto_logout_minutes: normalizedAutoLogoutMinutes,
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Unable to update user.");
    }

    const currentSession = window.localStorage.getItem("membership-auth");
    if (currentSession) {
      try {
        const storedSession = JSON.parse(currentSession);
        if (storedSession?.user?.id === editingUserId.value) {
          refreshAuthSession(
            {
              ...storedSession.user,
              auto_logout_minutes: normalizedAutoLogoutMinutes,
              timeoutMinutes: normalizedAutoLogoutMinutes,
            },
            Date.now(),
          );
        }
      } catch {
        // Ignore session refresh failures and fall back to the next login.
      }
    }

    const previousValues = editingUserSnapshot.value || {};
    const changedFields = [];

    if (
      editForm.value.first_name.trim() !== (previousValues.first_name || "")
    ) {
      changedFields.push(`first name to “${editForm.value.first_name.trim()}”`);
    }
    if (editForm.value.last_name.trim() !== (previousValues.last_name || "")) {
      changedFields.push(`last name to “${editForm.value.last_name.trim()}”`);
    }
    if (editForm.value.email.trim() !== (previousValues.email || "")) {
      changedFields.push(`email to “${editForm.value.email.trim()}”`);
    }
    if (
      normalizedAutoLogoutMinutes !==
      Number(previousValues.auto_logout_minutes ?? 10)
    ) {
      changedFields.push(
        `auto-logout to ${normalizedAutoLogoutMinutes} minute${normalizedAutoLogoutMinutes === 1 ? "" : "s"}`,
      );
    }
    if (Boolean(editForm.value.is_admin) !== Boolean(previousValues.is_admin)) {
      changedFields.push(
        `admin access to ${Boolean(editForm.value.is_admin) ? "enabled" : "disabled"}`,
      );
    }

    const userName =
      payload.user?.name ||
      `${editForm.value.first_name.trim()} ${editForm.value.last_name.trim()}`.trim() ||
      "the selected user";

    if (changedFields.length) {
      successMessage.value = `Updated ${userName}: ${changedFields.join(", ")}.`;
    } else {
      successMessage.value = `Updated ${userName}.`;
    }

    if (successToastTimer) {
      clearTimeout(successToastTimer);
    }
    successToastTimer = window.setTimeout(() => {
      successMessage.value = "";
    }, 4000);

    resetEditForm();
    await loadUsers();
  } catch (err) {
    error.value = err?.message || "Unable to update user.";
  } finally {
    pending.value = false;
  }
}

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="page-shell">
    <div class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">User Management</p>
          <h1>Manage users</h1>
          <p class="subtitle">
            Create and remove user accounts from the shared database.
          </p>
        </div>
        <NuxtLink to="/" class="ghost-button">Back to dashboard</NuxtLink>
      </div>

      <div class="card-grid">
        <section class="panel-card">
          <h2>Create user</h2>
          <form class="form" @submit.prevent="createUser">
            <label class="field">
              <span>First name</span>
              <input v-model="form.first_name" placeholder="Jane" required />
            </label>
            <label class="field">
              <span>Last name</span>
              <input v-model="form.last_name" placeholder="Doe" required />
            </label>
            <label class="field">
              <span>Email</span>
              <input
                v-model="form.email"
                type="email"
                placeholder="jane@example.com"
                required
              />
            </label>
            <label class="field">
              <span>Password</span>
              <input
                v-model="form.password"
                type="password"
                placeholder="User password"
                required
              />
            </label>
            <label class="field">
              <span>Auto-logout (minutes)</span>
              <input
                v-model.number="form.auto_logout_minutes"
                type="number"
                min="1"
                step="1"
                placeholder="10"
              />
            </label>
            <label class="field">
              <span>Admin access</span>
              <label class="checkbox-row">
                <input v-model="form.is_admin" type="checkbox" />
                <span>Grant admin privileges</span>
              </label>
            </label>
            <button type="submit" :disabled="pending">
              {{ pending ? "Creating..." : "Create user" }}
            </button>
          </form>
        </section>

        <section class="panel-card">
          <div class="list-head">
            <h2>Existing users</h2>
            <span v-if="!loading" class="pill">{{ users.length }} total</span>
          </div>

          <p v-if="error" class="error">{{ error }}</p>
          <div
            v-if="successMessage"
            class="toast-banner"
            role="status"
            aria-live="polite"
          >
            {{ successMessage }}
          </div>
          <p v-if="loading" class="muted">Loading users...</p>
          <ul v-else-if="users.length" class="user-list">
            <li v-for="user in users" :key="user.id" class="user-item">
              <div v-if="editingUserId !== user.id" class="user-summary">
                <strong>{{ user.name }}</strong>
                <p>{{ user.email }}</p>
                <div class="meta-row">
                  <span class="group-label">
                    {{ user.is_admin ? "Admin" : "User" }}
                  </span>
                  <span class="timeout-pill">
                    Auto-logout: {{ formatAutoLogoutLabel(user) }}
                  </span>
                </div>
              </div>
              <div v-else class="edit-form">
                <label class="field compact-field">
                  <span>First name</span>
                  <input v-model="editForm.first_name" required />
                </label>
                <label class="field compact-field">
                  <span>Last name</span>
                  <input v-model="editForm.last_name" required />
                </label>
                <label class="field compact-field">
                  <span>Email</span>
                  <input v-model="editForm.email" type="email" required />
                </label>
                <label class="field compact-field">
                  <span>Password</span>
                  <input
                    v-model="editForm.password"
                    type="password"
                    placeholder="Leave blank to keep current"
                  />
                </label>
                <label class="field compact-field">
                  <span>Auto-logout (minutes)</span>
                  <input
                    v-model.number="editForm.auto_logout_minutes"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="10"
                  />
                </label>
                <label class="field compact-field">
                  <span>Admin access</span>
                  <label class="checkbox-row">
                    <input v-model="editForm.is_admin" type="checkbox" />
                    <span>Grant admin privileges</span>
                  </label>
                </label>
                <div class="inline-actions">
                  <button
                    class="ghost-button compact-button"
                    type="button"
                    @click="resetEditForm()"
                  >
                    Cancel
                  </button>
                  <button
                    class="compact-button"
                    type="button"
                    @click="updateUser()"
                    :disabled="pending"
                  >
                    Save
                  </button>
                </div>
              </div>
              <div v-if="editingUserId !== user.id" class="inline-actions">
                <button
                  class="ghost-button compact-button"
                  type="button"
                  @click="startEditing(user)"
                >
                  Edit
                </button>
                <button class="remove-button" @click="removeUser(user.id)">
                  Remove
                </button>
              </div>
            </li>
          </ul>
          <p v-else class="muted">No users found yet.</p>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-shell {
  min-height: 100vh;
  padding: 2rem;
  background: var(--bg-light);
}

.toast-banner {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1100;
  max-width: min(420px, calc(100vw - 2rem));
  padding: 0.8rem 1rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #2f6e4a, #3a8a5c);
  color: #fff;
  box-shadow: 0 14px 30px rgba(15, 37, 55, 0.18);
  font-weight: 700;
  line-height: 1.4;
}

.panel {
  width: min(980px, 100%);
  margin: 0 auto;
  background: var(--bg-white);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 20px 45px rgba(15, 37, 55, 0.12);
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.24em;
  color: var(--secondary-teal);
  font-weight: 700;
  margin-bottom: 0.6rem;
}

h1,
h2 {
  color: var(--primary-navy);
  margin: 0 0 0.45rem;
}

.subtitle,
.muted {
  color: var(--text-muted);
}

.card-grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.panel-card {
  border: 1px solid rgba(15, 37, 55, 0.08);
  border-radius: 18px;
  padding: 1.2rem;
  background: linear-gradient(135deg, var(--bg-light), var(--bg-white));
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field span {
  font-weight: 600;
  color: var(--text-dark);
}

input,
select {
  border: 1px solid rgba(15, 37, 55, 0.14);
  border-radius: 12px;
  padding: 0.8rem 0.95rem;
  font: inherit;
}

button {
  border: 0;
  border-radius: 999px;
  padding: 0.8rem 1rem;
  font-weight: 700;
  cursor: pointer;
  color: var(--bg-white);
  background: var(--primary-navy);
}

.ghost-button {
  border: 1px solid rgba(15, 37, 55, 0.12);
  background: var(--bg-white);
  color: var(--primary-navy);
  border-radius: 999px;
  padding: 0.7rem 1rem;
  font-weight: 700;
  text-decoration: none;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-weight: 600;
  color: var(--text-dark);
}

.list-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.8rem;
}

.pill {
  border-radius: 999px;
  padding: 0.35rem 0.65rem;
  background: rgba(45, 127, 132, 0.12);
  color: var(--secondary-teal);
  font-size: 0.85rem;
  font-weight: 700;
}

.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(15, 37, 55, 0.08);
}

.user-item strong {
  color: var(--primary-navy);
}

.user-item p {
  margin: 0.2rem 0 0;
  color: var(--text-muted);
}

.user-summary {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.25rem;
}

.group-label {
  font-size: 0.9rem;
  color: var(--secondary-teal);
  font-weight: 600;
}

.timeout-pill {
  border-radius: 999px;
  padding: 0.25rem 0.6rem;
  background: rgba(45, 127, 132, 0.12);
  color: var(--secondary-teal);
  font-size: 0.9rem;
  font-weight: 700;
}

.remove-button {
  background: var(--data-red);
  padding: 0.6rem 0.8rem;
}

.error {
  color: var(--data-red);
  margin-top: 0;
}
</style>
