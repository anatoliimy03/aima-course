import { connectLambda, getStore } from '@netlify/blobs';

const STORE_NAME = 'payment-attempts';
const KEY_PREFIX = 'attempt:';

function getAttemptKey(reference) {
  return `${KEY_PREFIX}${reference}`;
}

function getPaymentAttemptsStore() {
  return getStore(STORE_NAME);
}

export function connectPaymentAttemptsStore(event) {
  if (event) connectLambda(event);
}

function normalizeAttemptData(data) {
  return {
    reminderSent: false,
    paid: false,
    status: 'invoice_created',
    ...data
  };
}

export async function savePaymentAttempt(data) {
  if (!data || !data.reference) return null;

  const attempt = normalizeAttemptData(data);
  await getPaymentAttemptsStore().setJSON(getAttemptKey(attempt.reference), attempt);
  return attempt;
}

export async function getPaymentAttempt(reference) {
  if (!reference) return null;

  const attempt = await getPaymentAttemptsStore().get(getAttemptKey(reference), { type: 'json' });
  return attempt ? normalizeAttemptData(attempt) : null;
}

export async function updatePaymentAttempt(reference, updates) {
  if (!reference) return null;

  const current = await getPaymentAttempt(reference);
  if (!current) return null;

  const next = normalizeAttemptData({
    ...current,
    ...updates,
    updatedAt: new Date().toISOString()
  });

  await getPaymentAttemptsStore().setJSON(getAttemptKey(reference), next);
  return next;
}

export async function listPaymentAttempts() {
  const store = getPaymentAttemptsStore();
  const attempts = [];

  for await (const page of store.list({ prefix: KEY_PREFIX, paginate: true })) {
    for (const blob of page.blobs || []) {
      const attempt = await store.get(blob.key, { type: 'json' });
      if (attempt) attempts.push(normalizeAttemptData(attempt));
    }
  }

  return attempts;
}
