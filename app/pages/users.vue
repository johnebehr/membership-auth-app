<script setup>
import { onMounted, ref } from "vue";

const users = ref([]);
const groups = ref([]);
const loading = ref(true);
const error = ref("");
const groupForm = ref({ slug: "", name: "", description: "" });
const groupPending = ref(false);
const editingGroupId = ref(null);
const editGroupForm = ref({ slug: "", name: "", description: "" });
const form = ref({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  group_ids: [],
});
const pending = ref(false);
const editingUserId = ref(null);
const editForm = ref({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  group_ids: [],
});

function resetCreateForm() {
  form.value = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    group_ids: [],
  };
}

function resetEditForm() {
  editingUserId.value = null;
  editForm.value = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    group_ids: [],
  };
}

function resetGroupForm() {
  groupForm.value = { slug: "", name: "", description: "" };
}

function resetGroupEditForm() {
  editingGroupId.value = null;
  editGroupForm.value = { slug: "", name: "", description: "" };
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
    groups.value = payload.groups || [];
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

  try {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form.value),
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

async function createGroup() {
  if (!groupForm.value.slug.trim() || !groupForm.value.name.trim()) {
    error.value = "Please complete the group fields.";
    return;
  }

  groupPending.value = true;
  error.value = "";

  try {
    const response = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(groupForm.value),
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Unable to create group.");
    }

    resetGroupForm();
    await loadUsers();
  } catch (err) {
    error.value = err?.message || "Unable to create group.";
  } finally {
    groupPending.value = false;
  }
}

function startGroupEditing(group) {
  editingGroupId.value = group.id;
  editGroupForm.value = {
    slug: group.slug || "",
    name: group.name || "",
    description: group.description || "",
  };
}

async function updateGroup() {
  if (!editingGroupId.value) {
    return;
  }

  if (!editGroupForm.value.slug.trim() || !editGroupForm.value.name.trim()) {
    error.value = "Please complete the group fields.";
    return;
  }

  groupPending.value = true;
  error.value = "";

  try {
    const response = await fetch(`/api/groups/${editingGroupId.value}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editGroupForm.value),
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Unable to update group.");
    }

    resetGroupEditForm();
    await loadUsers();
  } catch (err) {
    error.value = err?.message || "Unable to update group.";
  } finally {
    groupPending.value = false;
  }
}

async function deleteGroup(id) {
  try {
    const response = await fetch(`/api/groups/${id}`, { method: "DELETE" });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Unable to remove group.");
    }

    await loadUsers();
  } catch (err) {
    error.value = err?.message || "Unable to remove group.";
  }
}

function startEditing(user) {
  editingUserId.value = user.id;
  editForm.value = {
    first_name: user.first_name || user.name?.split(" ")[0] || "",
    last_name: user.last_name || user.name?.split(" ").slice(1).join(" ") || "",
    email: user.email || "",
    password: "",
    group_ids: user.group_ids || [],
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

  try {
    const response = await fetch(`/api/users/${editingUserId.value}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm.value),
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Unable to update user.");
    }

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
              <span>Groups</span>
              <select v-model="form.group_ids" multiple size="4">
                <option
                  v-for="group in groups"
                  :key="group.id"
                  :value="Number(group.id)"
                >
                  {{ group.name }}
                </option>
              </select>
            </label>
            <button type="submit" :disabled="pending">
              {{ pending ? "Creating..." : "Create user" }}
            </button>
          </form>
        </section>

        <section class="panel-card">
          <h2>Groups</h2>
          <form class="form" @submit.prevent="createGroup">
            <label class="field">
              <span>Slug</span>
              <input
                v-model="groupForm.slug"
                placeholder="membership"
                required
              />
            </label>
            <label class="field">
              <span>Name</span>
              <input
                v-model="groupForm.name"
                placeholder="Membership"
                required
              />
            </label>
            <label class="field">
              <span>Description</span>
              <input v-model="groupForm.description" placeholder="Optional" />
            </label>
            <button type="submit" :disabled="groupPending">
              {{ groupPending ? "Saving..." : "Create group" }}
            </button>
          </form>

          <ul v-if="groups.length" class="user-list">
            <li v-for="group in groups" :key="group.id" class="user-item">
              <div v-if="editingGroupId !== group.id">
                <strong>{{ group.name }}</strong>
                <p>{{ group.slug }}</p>
                <p class="group-label">
                  {{ group.description || "No description" }}
                </p>
              </div>
              <div v-else class="edit-form">
                <label class="field compact-field">
                  <span>Slug</span>
                  <input v-model="editGroupForm.slug" required />
                </label>
                <label class="field compact-field">
                  <span>Name</span>
                  <input v-model="editGroupForm.name" required />
                </label>
                <label class="field compact-field">
                  <span>Description</span>
                  <input v-model="editGroupForm.description" />
                </label>
                <div class="inline-actions">
                  <button
                    class="ghost-button compact-button"
                    type="button"
                    @click="resetGroupEditForm()"
                  >
                    Cancel
                  </button>
                  <button
                    class="compact-button"
                    type="button"
                    @click="updateGroup()"
                  >
                    Save
                  </button>
                </div>
              </div>
              <div v-if="editingGroupId !== group.id" class="inline-actions">
                <button
                  class="ghost-button compact-button"
                  type="button"
                  @click="startGroupEditing(group)"
                >
                  Edit
                </button>
                <button class="remove-button" @click="deleteGroup(group.id)">
                  Remove
                </button>
              </div>
            </li>
          </ul>
        </section>

        <section class="panel-card">
          <div class="list-head">
            <h2>Existing users</h2>
            <span v-if="!loading" class="pill">{{ users.length }} total</span>
          </div>

          <p v-if="error" class="error">{{ error }}</p>
          <p v-if="loading" class="muted">Loading users...</p>
          <ul v-else-if="users.length" class="user-list">
            <li v-for="user in users" :key="user.id" class="user-item">
              <div v-if="editingUserId !== user.id">
                <strong>{{ user.name }}</strong>
                <p>{{ user.email }}</p>
                <p class="group-label">
                  {{
                    user.group_names?.length
                      ? user.group_names.join(", ")
                      : "No group"
                  }}
                </p>
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
                  <span>Groups</span>
                  <select v-model="editForm.group_ids" multiple size="4">
                    <option
                      v-for="group in groups"
                      :key="group.id"
                      :value="Number(group.id)"
                    >
                      {{ group.name }}
                    </option>
                  </select>
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

.group-label {
  font-size: 0.9rem;
  color: var(--secondary-teal);
  font-weight: 600;
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
