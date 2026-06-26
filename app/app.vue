<script setup>
import { onBeforeUnmount, onMounted, watch } from "vue";
import {
  initializeAuthSession,
  isAuthenticated,
  isRouteProtected,
} from "~/composables/useAuth";

const route = useRoute();
const router = useRouter();

function handleAuthLogout() {
  if (route.path !== "/login") {
    navigateTo("/login");
  }
}

function enforceAuthProtection() {
  const isProtectedRoute = isRouteProtected(route.path);
  if (isProtectedRoute && !isAuthenticated()) {
    router.replace("/login");
  }
}

onMounted(() => {
  initializeAuthSession();
  enforceAuthProtection();
  window.addEventListener("auth:logout", handleAuthLogout);
});

watch(
  () => route.path,
  () => {
    enforceAuthProtection();
  },
);

onBeforeUnmount(() => {
  window.removeEventListener("auth:logout", handleAuthLogout);
});
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>
