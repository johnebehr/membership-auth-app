<script setup>
import { computed } from "vue";
import { getCurrentUser, isAdminUser } from "~/composables/useAuth";

const user = computed(() => getCurrentUser());
const isAdmin = computed(() => isAdminUser(user.value));
</script>

<template>
  <div class="page-shell">
    <AppHeader />
    <div class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Membership Management</p>
          <h1>Welcome back, {{ user?.name || "there" }}</h1>
          <p class="subtitle">
            Review the latest activity and jump into your most common tasks.
          </p>
        </div>
        <div class="status-pill">
          {{ isAdmin ? "Admin access" : "Standard access" }}
        </div>
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
        <div class="stat-card">
          <strong>12</strong>
          <span>Pending follow-ups</span>
        </div>
      </div>

      <div class="action-card">
        <h2>Quick actions</h2>
        <div class="action-list">
          <NuxtLink to="/members" class="action-link"
            >Add a new member</NuxtLink
          >
          <NuxtLink v-if="isAdmin" to="/users" class="action-link">
            Manage user accounts
          </NuxtLink>
          <NuxtLink to="/locals" class="action-link"
            >Review local records</NuxtLink
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-shell {
  min-height: 100vh;
  padding: 2rem;
  background: var(--bg-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
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

.status-pill {
  padding: 0.5rem 0.8rem;
  border-radius: 999px;
  background: rgba(45, 127, 132, 0.12);
  color: var(--secondary-teal);
  font-weight: 700;
  white-space: nowrap;
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

.action-card {
  margin-top: 1.25rem;
  padding: 1.1rem 1.2rem;
  border-radius: 16px;
  background: var(--bg-light);
  border: 1px solid rgba(15, 37, 55, 0.06);
}

.action-card h2 {
  margin: 0 0 0.8rem;
  color: var(--primary-navy);
  font-size: 1.05rem;
}

.action-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.action-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 0.95rem;
  border-radius: 999px;
  background: var(--bg-white);
  color: var(--primary-navy);
  font-weight: 700;
  text-decoration: none;
  border: 1px solid rgba(15, 37, 55, 0.1);
}
</style>
