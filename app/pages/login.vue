<script setup>
import { onMounted, ref } from "vue";
import { getCurrentUser, loginUser } from "~/composables/useAuth";

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const error = ref("");
const pending = ref(false);
const route = useRoute();
const router = useRouter();

onMounted(() => {
  if (getCurrentUser()) {
    router.replace("/");
  }
});

async function submit() {
  error.value = "";
  pending.value = true;

  const result = await loginUser({
    email: email.value,
    password: password.value,
  });

  if (!result.ok) {
    pending.value = false;
    error.value = result.message;
    return;
  }

  pending.value = false;
  await navigateTo({ path: "/", query: route.query });
}
</script>

<template>
  <div class="auth-shell">
    <form class="auth-card" @submit.prevent="submit">
      <div class="brand-block">
        <p class="eyebrow">Local 8068 Membership</p>
        <h1>Sign in</h1>
        <p class="subtitle">Sign in with your account credentials.</p>
      </div>

      <label class="field">
        <span>Email</span>
        <input
          v-model="email"
          type="email"
          placeholder="admin@membership.test"
          required
        />
      </label>

      <label class="field">
        <span>Password</span>
        <div class="password-input">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="password123"
            required
          />
          <button
            type="button"
            class="toggle-button"
            :aria-pressed="showPassword"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? "Hide" : "Show" }}
          </button>
        </div>
      </label>

      <p v-if="error" class="error">{{ error }}</p>

      <button type="submit" :disabled="pending">
        {{ pending ? "Signing in..." : "Continue" }}
      </button>

      <p class="hint">
        The app will authenticate against the configured backend API.
      </p>
    </form>
  </div>
</template>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
  background: linear-gradient(
    135deg,
    var(--primary-navy),
    var(--secondary-teal)
  );
}

.auth-card {
  width: min(440px, 100%);
  background: var(--bg-white);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 18px 40px rgba(15, 37, 55, 0.18);
}

.eyebrow {
  color: var(--secondary-teal);
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
}

h1 {
  color: var(--primary-navy);
  margin: 0 0 0.4rem;
}

.subtitle,
.hint {
  color: var(--text-muted);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: 1rem;
}

.field span {
  color: var(--text-dark);
  font-weight: 600;
}

input {
  border: 1px solid rgba(15, 37, 55, 0.14);
  border-radius: 12px;
  padding: 0.8rem 0.95rem;
  font: inherit;
  width: 100%;
}

.password-input {
  position: relative;
}

.toggle-button {
  position: absolute;
  top: 50%;
  right: 0.5rem;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  color: var(--secondary-teal);
  font-weight: 700;
  cursor: pointer;
  padding: 0.25rem 0.4rem;
  margin: 0;
  width: auto;
}

button[type="submit"] {
  width: 100%;
  margin-top: 1.2rem;
  border: 0;
  border-radius: 999px;
  padding: 0.9rem 1rem;
  font-weight: 700;
  color: var(--bg-white);
  background: var(--primary-navy);
  cursor: pointer;
}

button:disabled {
  opacity: 0.8;
  cursor: wait;
}

.error {
  margin: 0.9rem 0 0;
  color: var(--data-red);
  font-size: 0.95rem;
}
</style>
