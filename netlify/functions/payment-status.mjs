import {
  getHeader,
  isSameOriginRequest,
  json,
  sanitizeText
} from './_notifications.mjs';
import { connectPaymentAttemptsStore, getPaymentAttempt, updatePaymentAttempt } from './_payment-attempts.mjs';

const MONO_INVOICE_STATUS_URL = 'https://api.monobank.ua/api/merchant/invoice/status';
const PAID_STATUS = 'success';
const TERMINAL_UNPAID_STATUSES = new Set(['failure', 'expired', 'reversed']);

function getResponseHeaders(event) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  };
  const origin = getHeader(event.headers, 'origin');
  if (origin && isSameOriginRequest(event)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
  }
  return headers;
}

function jsonResponse(event, statusCode, body) {
  return {
    ...json(statusCode, body),
    headers: getResponseHeaders(event)
  };
}

function getReference(event) {
  const params = event.queryStringParameters || {};
  return sanitizeText(params.reference || '', 180);
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

async function refreshAttemptStatus(attempt) {
  if (!attempt || !attempt.invoiceId || attempt.paid || attempt.status === PAID_STATUS) {
    return attempt;
  }

  const monoStatus = await fetchMonoInvoiceStatus(attempt.invoiceId);
  if (!monoStatus) return attempt;

  const status = sanitizeText(monoStatus.status || attempt.status || 'invoice_created', 40);
  const paid = status === PAID_STATUS;
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

function makeClientStatus(attempt) {
  const status = sanitizeText(attempt.status || 'invoice_created', 40);
  const paid = Boolean(attempt.paid || status === PAID_STATUS);

  return {
    ok: true,
    paid,
    status,
    terminal_unpaid: TERMINAL_UNPAID_STATUSES.has(status),
    reference: attempt.reference,
    invoice_id: attempt.invoiceId || '',
    price_uah: attempt.priceUah || null,
    design: attempt.design || '',
    updated_at: attempt.updatedAt || attempt.createdAt || ''
  };
}

export async function handler(event) {
  connectPaymentAttemptsStore(event);

  if (event.httpMethod === 'OPTIONS') {
    if (!isSameOriginRequest(event)) {
      return jsonResponse(event, 403, { ok: false, error: 'origin_not_allowed' });
    }
    return { statusCode: 204, headers: getResponseHeaders(event), body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return jsonResponse(event, 405, { ok: false, error: 'method_not_allowed' });
  }

  if (!isSameOriginRequest(event)) {
    return jsonResponse(event, 403, { ok: false, error: 'origin_not_allowed' });
  }

  const reference = getReference(event);
  if (!reference) {
    return jsonResponse(event, 400, { ok: false, error: 'reference_required' });
  }

  let attempt = null;
  try {
    attempt = await getPaymentAttempt(reference);
  } catch (error) {
    console.error('[payment-status] read failed', error);
    return jsonResponse(event, 500, { ok: false, error: 'payment_status_read_failed' });
  }

  if (!attempt) {
    return jsonResponse(event, 404, { ok: false, error: 'payment_not_found' });
  }

  try {
    attempt = await refreshAttemptStatus(attempt);
  } catch (error) {
    console.error('[payment-status] mono refresh failed', error);
  }

  return jsonResponse(event, 200, makeClientStatus(attempt));
}
