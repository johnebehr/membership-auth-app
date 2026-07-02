<script setup>
import { computed } from "vue";
import { getCurrentUser, isAdminUser, logoutUser } from "~/composables/useAuth";

const router = useRouter();
const user = computed(() => getCurrentUser());
const canManageUsers = computed(() => isAdminUser(user.value));

function signOut() {
  logoutUser();
  router.push("/login");
}
</script>

<template>
  <header class="app-header">
    <div class="brand-block">
      <span class="brand-mark">LH</span>
      <span class="brand-text">Local 8068</span>
    </div>

    <nav class="nav-links" aria-label="Primary">
      <NuxtLink to="/">Dashboard</NuxtLink>
      <NuxtLink v-if="canManageUsers" to="/users">Manage Users</NuxtLink>
      <NuxtLink to="/members">Add Members</NuxtLink>
    </nav>

    <button class="ghost-button" @click="signOut">Log out</button>
  </header>
</template>

<style scoped>
.app-header {
  width: min(960px, 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 999px;
  background: var(--bg-white);
  box-shadow: 0 10px 28px rgba(15, 37, 55, 0.08);
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  color: var(--primary-navy);
}

.brand-mark {
  display: inline-grid;
  place-items: center;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--primary-navy),
    var(--secondary-teal)
  );
  color: var(--bg-white);
}

.nav-links {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.nav-links a {
  color: var(--text-muted);
  font-weight: 600;
}

.nav-links a.router-link-active {
  color: var(--primary-navy);
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

@media (max-width: 720px) {
  .app-header {
    flex-direction: column;
    border-radius: 24px;
  }

  .nav-links {
    justify-content: center;
  }
}
</style>
