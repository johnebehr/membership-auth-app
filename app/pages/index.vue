<script setup>
import { computed } from "vue";
import { getCurrentUser, logoutUser } from "~/composables/useAuth";

const router = useRouter();
const user = computed(() => getCurrentUser());

function signOut() {
  logoutUser();
  router.push("/login");
}
</script>

<template>
  <div class="page-shell">
    <div class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Membership Management</p>
          <h1>Welcome back, {{ user?.name || "there" }}</h1>
          <p class="subtitle">
            Manage members, renewals, and communications from one place.
          </p>
        </div>
        <button class="ghost-button" @click="signOut">Log out</button>
      </div>
      <div class="card-grid">
        <div class="stat-card">
          <strong>1,248</strong>
          <span>Active members</span>
        </div>
        <div class="stat-card">
          <strong>96%</strong>
          <span>Renewal rate</span>
        </div>
      </div>

      <div class="action-row">
        <NuxtLink class="ghost-button" to="/users">Manage users</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
  background: var(--bg-light);
}

.panel {
  width: min(720px, 100%);
  background: var(--bg-white);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 20px 45px rgba(15, 37, 55, 0.12);
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
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

h1 {
  color: var(--primary-navy);
  font-size: 2rem;
  margin: 0 0 0.6rem;
}

.subtitle {
  color: var(--text-muted);
  margin-bottom: 0;
}

.ghost-button {
  border: 1px solid rgba(15, 37, 55, 0.12);
  background: var(--bg-white);
  color: var(--primary-navy);
  border-radius: 999px;
  padding: 0.7rem 1rem;
  font-weight: 700;
  cursor: pointer;
}

.card-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.action-row {
  margin-top: 1.25rem;
}

.stat-card {
  background: linear-gradient(135deg, var(--bg-light), var(--bg-white));
  border: 1px solid rgba(15, 37, 55, 0.06);
  border-radius: 16px;
  padding: 1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.stat-card strong {
  color: var(--primary-navy);
  font-size: 1.4rem;
}

.stat-card span {
  color: var(--text-muted);
}
</style>
