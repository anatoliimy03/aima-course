import {
  COURSE_NAME,
  formatDateTime,
  json,
  notifyTelegram,
  sanitizeText
} from './_notifications.mjs';
import { connectPaymentAttemptsStore, listPaymentAttempts, updatePaymentAttempt } from './_payment-attempts.mjs';

export const config = {
  schedule: '* * * * *'
};

const MONO_INVOICE_STATUS_URL = 'https://api.monobank.ua/api/merchant/invoice/status';
const REMINDER_DELAY_MS = 10 * 60 * 1000;
const REMINDER_ELIGIBLE_STATUSES = new Set(['invoice_created', 'created', 'processing', 'hold']);
const TERMINAL_UNPAID_STATUSES = new Set(['failure', 'expired', 'reversed']);

function getCreatedAtMs(attempt) {
  const value = Date.parse(attempt.createdAt || '');
  return Number.isFinite(value) ? value : 0;
}

function getElapsedMinutes(createdAtMs, nowMs) {
  if (!createdAtMs) return 0;
  return Math.max(0, Math.floor((nowMs - createdAtMs) / 60000));
}

function getStatusLabel(status) {
  const labels = {
    invoice_created: 'рахунок створено',
    created: 'рахунок створено',
    success: 'успішна оплата',
    failure: 'неуспішна оплата',
    expired: 'рахунок протерміновано',
    reversed: 'повернення',
    processing: 'обробляється',
    hold: 'холд'
  };

  return labels[status] || status || 'невідомий статус';
}

async function fetchMonoInvoiceStatus(invoiceId) {
  const token = process.env.MONOBANK_TOKEN;
  if (!token || !invoiceId) return null;

  const url = new URL(MONO_INVOICE_STATUS_URL);
  url.searchParams.set('invoiceId', invoiceId);

  const response = await fetch(url, {
    headers: { 'X-Token': token }
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Mono invoice status failed: ${response.status}`);
  }

  return payload;
}

function isAttemptDue(attempt, nowMs) {
  if (!attempt || !attempt.reference || attempt.reminderSent || attempt.paid) return false;

  const createdAtMs = getCreatedAtMs(attempt);
  if (!createdAtMs || nowMs - createdAtMs < REMINDER_DELAY_MS) return false;

  const status = sanitizeText(attempt.status || 'invoice_created', 40);
  return REMINDER_ELIGIBLE_STATUSES.has(status);
}

async function updateAttemptFromMono(attempt) {
  const monoStatus = await fetchMonoInvoiceStatus(attempt.invoiceId);
  if (!monoStatus) return attempt;

  const status = sanitizeText(monoStatus.status || attempt.status || 'invoice_created', 40);
  const paid = status === 'success';

  const updates = {
    status,
    paid,
    lastMonoStatusCheckedAt: new Date().toISOString(),
    monoStatusPayload: {
      status,
      amount: monoStatus.amount,
      errCode: monoStatus.errCode || '',
      failureReason: sanitizeText(monoStatus.failureReason || '', 220)
    }
  };

  if (paid) updates.paidAt = new Date().toISOString();

  return await updatePaymentAttempt(attempt.reference, updates) || {
    ...attempt,
    ...updates
  };
}

async function sendUnpaidReminder(attempt, nowMs) {
  const createdAtMs = getCreatedAtMs(attempt);
  const customer = attempt.customer || {};
  const phone = sanitizeText(customer.phone || '', 40);
  const name = sanitizeText(customer.name || '', 80);
  const status = sanitizeText(attempt.status || 'invoice_created', 40);

  await notifyTelegram([
    '⏰ Оплата не завершена 10 хв',
    '',
    `Набрати: ${phone || 'телефон не вказано'}`,
    name ? `Ім’я: ${name}` : 'Ім’я: не вказано',
    phone ? `Телефон: ${phone}` : 'Телефон: не вказано',
    `Курс: ${COURSE_NAME}`,
    `Варіант: ${attempt.variantLabel || `${attempt.design || 'unknown'} ${attempt.priceUah || ''} грн`}`,
    attempt.priceUah ? `Ціна: ${attempt.priceUah} грн` : '',
    attempt.pagePath ? `Сторінка: ${attempt.pagePath}` : '',
    `Кнопка: ${attempt.location || 'unknown'}${attempt.buttonLabel ? ` / ${attempt.buttonLabel}` : ''}`,
    attempt.invoiceId ? `Invoice ID: ${attempt.invoiceId}` : '',
    `Reference: ${attempt.reference}`,
    `Статус mono: ${getStatusLabel(status)}`,
    `Минуло: ${getElapsedMinutes(createdAtMs, nowMs)} хв`,
    createdAtMs ? `Старт оплати: ${formatDateTime(new Date(createdAtMs))}` : '',
    `Час нагадування: ${formatDateTime()}`
  ].filter(Boolean).join('\n'));

  await updatePaymentAttempt(attempt.reference, {
    reminderSent: true,
    reminderSentAt: new Date().toISOString()
  });
}

export async function handler(event) {
  connectPaymentAttemptsStore(event);

  const nowMs = Date.now();
  const summary = {
    checked: 0,
    due: 0,
    reminded: 0,
    paid: 0,
    terminalUnpaid: 0,
    errors: 0
  };

  let attempts = [];
  try {
    attempts = await listPaymentAttempts();
  } catch (error) {
    console.error('[payment-reminder] list attempts failed', error);
    return json(500, { ok: false, error: 'payment_attempts_list_failed' });
  }

  summary.checked = attempts.length;

  for (const attempt of attempts) {
    if (!isAttemptDue(attempt, nowMs)) continue;
    summary.due += 1;

    try {
      const updatedAttempt = await updateAttemptFromMono(attempt);
      const status = sanitizeText(updatedAttempt.status || 'invoice_created', 40);

      if (updatedAttempt.paid || status === 'success') {
        summary.paid += 1;
        continue;
      }

      if (TERMINAL_UNPAID_STATUSES.has(status)) {
        summary.terminalUnpaid += 1;
        continue;
      }

      await sendUnpaidReminder(updatedAttempt, nowMs);
      summary.reminded += 1;
    } catch (error) {
      summary.errors += 1;
      console.error('[payment-reminder] attempt failed', attempt.reference, error);
    }
  }

  return json(200, { ok: true, summary });
}
