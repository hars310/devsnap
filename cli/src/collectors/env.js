// ⚠ NEVER collect env variable values. Collect KEYS only.
// Values contain secrets (API keys, passwords, tokens).

export async function collectEnv() {
  return Object.keys(process.env).sort();
}