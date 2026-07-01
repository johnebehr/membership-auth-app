<script setup>
import { onMounted, ref } from "vue";

const loading = ref(true);
const error = ref("");
const success = ref("");
const pending = ref(false);
const locals = ref([]);
const form = ref({
  local_number: "",
  local_name: "",
  created_by: 1,
  updated_by: 1,
});

async function loadLocals() {
  loading.value = true;
  error.value = "";

  try {
    const response = await fetch("/api/locals");
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Unable to load locals.");
    }

    locals.value = payload.locals || [];
  } catch (err) {
    error.value = err?.message || "Unable to load locals.";
  } finally {
    loading.value = false;
  }
}

async function submitLocal() {
  if (!form.value.local_number.trim() || !form.value.local_name.trim()) {
    error.value = "Please enter both a local number and a local name.";
    return;
  }

  pending.value = true;
  error.value = "";
  success.value = "";

  try {
    const response = await fetch("/api/locals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form.value),
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Unable to save local.");
    }

    form.value = {
      local_number: "",
      local_name: "",
      created_by: 1,
      updated_by: 1,
    };
    success.value = "Local saved.";
    await loadLocals();
  } catch (err) {
    error.value = err?.message || "Unable to save local.";
  } finally {
    pending.value = false;
  }
}

onMounted(() => {
  loadLocals();
});
</script>

<template>
  <div class="page-shell">
    <div class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Local Administration</p>
          <h1>Manage locals</h1>
          <p class="subtitle">
            Maintain the lookup values available for member intake.
          </p>
        </div>
        <div class="action-row">
          <NuxtLink class="ghost-button" to="/members"
            >Back to members</NuxtLink
          >
          <NuxtLink class="ghost-button" to="/">Back to dashboard</NuxtLink>
        </div>
      </div>

      <section class="panel-card">
        <h2>Add a local</h2>
        <form class="form" @submit.prevent="submitLocal">
          <label class="field">
            <span>Local number</span>
            <input v-model="form.local_number" placeholder="6086" required />
          </label>
          <label class="field">
            <span>Local name</span>
            <input
              v-model="form.local_name"
              placeholder="Local 6086"
              required
            />
          </label>
          <button type="submit" :disabled="pending">
            {{ pending ? "Saving..." : "Save local" }}
          </button>
        </form>
        <p v-if="error" class="error">{{ error }}</p>
        <p v-else-if="success" class="success">{{ success }}</p>
      </section>

      <section class="panel-card">
        <div class="list-head">
          <h2>Existing locals</h2>
          <span v-if="!loading" class="pill">{{ locals.length }} total</span>
        </div>
        <p v-if="loading" class="muted">Loading locals...</p>
        <ul v-else-if="locals.length" class="local-list">
          <li v-for="local in locals" :key="local.local_id" class="local-item">
            <strong>{{ local.local_number }}</strong>
            <p>{{ local.local_name || "Unnamed local" }}</p>
          </li>
        </ul>
        <p v-else class="muted">No locals found yet.</p>
      </section>
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
  width: min(860px, 100%);
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
h2 {
  color: var(--primary-navy);
  margin: 0 0 0.45rem;
}

.subtitle,
.muted {
  color: var(--text-muted);
}

.action-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.panel-card {
  border: 1px solid rgba(15, 37, 55, 0.08);
  border-radius: 18px;
  padding: 1.2rem;
  background: linear-gradient(135deg, var(--bg-light), var(--bg-white));
  margin-bottom: 1rem;
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

input {
  border: 1px solid rgba(15, 37, 55, 0.14);
  border-radius: 12px;
  padding: 0.8rem 0.95rem;
  font: inherit;
}

button,
.ghost-button {
  border: 0;
  border-radius: 999px;
  padding: 0.8rem 1rem;
  font-weight: 700;
  cursor: pointer;
  color: var(--bg-white);
  background: var(--primary-navy);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ghost-button {
  border: 1px solid rgba(15, 37, 55, 0.12);
  background: var(--bg-white);
  color: var(--primary-navy);
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

.local-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.local-item {
  border: 1px solid rgba(15, 37, 55, 0.08);
  border-radius: 14px;
  padding: 0.85rem;
  background: var(--bg-white);
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
