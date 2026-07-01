<script setup>
import { onMounted, ref } from "vue";

const loading = ref(true);
const error = ref("");
const pending = ref(false);
const members = ref([]);
const locals = ref([]);
const form = ref({
  first_name: "",
  last_name: "",
  local_number: "",
  created_by: 1,
  updated_by: 1,
});
async function loadMembers() {
  loading.value = true;
  error.value = "";

  try {
    const response = await fetch("/api/members");
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Unable to load members.");
    }

    members.value = payload.members || [];
    locals.value = payload.locals || [];
  } catch (err) {
    error.value = err?.message || "Unable to load members.";
  } finally {
    loading.value = false;
  }
}

async function submitMember() {
  if (!form.value.first_name.trim() || !form.value.last_name.trim()) {
    error.value = "Please complete the required fields.";
    return;
  }

  if (!form.value.local_number) {
    error.value = "Please choose a local number.";
    return;
  }

  pending.value = true;
  error.value = "";

  try {
    const response = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form.value),
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Unable to create member.");
    }

    form.value = {
      first_name: "",
      last_name: "",
      local_number: "",
      created_by: 1,
      updated_by: 1,
    };

    await loadMembers();
  } catch (err) {
    error.value = err?.message || "Unable to create member.";
  } finally {
    pending.value = false;
  }
}

onMounted(() => {
  loadMembers();
});
</script>

<template>
  <div class="page-shell">
    <div class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Member Intake</p>
          <h1>Add a new member</h1>
          <p class="subtitle">
            Capture the core member record and store the selected local number.
          </p>
        </div>
        <div class="action-row">
          <NuxtLink class="ghost-button" to="/locals">Manage locals</NuxtLink>
          <NuxtLink class="ghost-button" to="/">Back to dashboard</NuxtLink>
        </div>
      </div>

      <div class="card-grid">
        <section class="panel-card">
          <h2>Member details</h2>
          <form class="form" @submit.prevent="submitMember">
            <label class="field">
              <span>First name</span>
              <input v-model="form.first_name" placeholder="Jane" required />
            </label>
            <label class="field">
              <span>Last name</span>
              <input v-model="form.last_name" placeholder="Doe" required />
            </label>
            <label class="field">
              <span>Local number</span>
              <select v-model="form.local_number" required>
                <option value="">Choose a local</option>
                <option
                  v-for="local in locals"
                  :key="local.local_id"
                  :value="local.local_number"
                >
                  {{ local.local_number }} -
                  {{ local.local_name || "Unnamed local" }}
                </option>
              </select>
            </label>
            <button type="submit" :disabled="pending">
              {{ pending ? "Saving..." : "Save member" }}
            </button>
          </form>
          <p v-if="error" class="error">{{ error }}</p>
        </section>

        <section class="panel-card">
          <div class="list-head">
            <h2>Existing members</h2>
            <span v-if="!loading" class="pill">{{ members.length }} total</span>
          </div>
          <p v-if="loading" class="muted">Loading members...</p>
          <ul v-else-if="members.length" class="member-list">
            <li
              v-for="member in members"
              :key="member.central_id"
              class="member-item"
            >
              <strong>{{ member.first_name }} {{ member.last_name }}</strong>
              <p>Local {{ member.local_number }}</p>
              <p class="muted">Clock ID: {{ member.clock_id }}</p>
            </li>
          </ul>
          <p v-else class="muted">No members found yet.</p>
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
  gap: 1rem;
  align-items: flex-start;
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
h2,
h3 {
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

.member-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.member-item {
  border: 1px solid rgba(15, 37, 55, 0.08);
  border-radius: 14px;
  padding: 0.85rem;
  background: var(--bg-white);
}

.compact-list-head {
  margin-top: 1rem;
}

.error {
  color: #b42318;
  margin-top: 0.75rem;
}

.success {
  color: #067647;
  margin-top: 0.75rem;
}
</style>
