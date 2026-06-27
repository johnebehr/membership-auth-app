<script setup>
import { onMounted, ref } from "vue";

const users = ref([]);
const loading = ref(true);
const error = ref("");
const form = ref({
  name: "",
  email: "",
  password: "",
  group_id: "",
});
const pending = ref(false);

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
    !form.value.name.trim() ||
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

    form.value = { name: "", email: "", password: "", group_id: "" };
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
              <span>Name</span>
              <input v-model="form.name" placeholder="Jane Doe" required />
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
                placeholder="Initial password"
                required
              />
            </label>
            <label class="field">
              <span>Group</span>
              <select v-model="form.group_id">
                <option value="">No group</option>
                <option value="1">Admin</option>
                <option value="2">Membership</option>
                <option value="3">Organizer</option>
              </select>
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
          <p v-if="loading" class="muted">Loading users...</p>
          <ul v-else-if="users.length" class="user-list">
            <li v-for="user in users" :key="user.id" class="user-item">
              <div>
                <strong>{{ user.name }}</strong>
                <p>{{ user.email }}</p>
                <p class="group-label">{{ user.group_name || "No group" }}</p>
              </div>
              <button class="remove-button" @click="removeUser(user.id)">
                Remove
              </button>
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
