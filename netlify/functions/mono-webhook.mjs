import crypto from 'node:crypto';

import {
  COURSE_NAME,
  formatDateTime,
  formatMoneyFromKopiyky,
  getHeader,
  json,
  notifyTelegram,
  parseReference,
  sanitizeText
} from './_notifications.mjs';
import { updatePaymentAttempt } from './_payment-attempts.mjs';

const MONO_PUBLIC_KEY_URL = 'https://api.monobank.ua/api/merchant/pubkey';
let cachedPublicKey = null;

function getRawBodyBuffer(event) {
  if (!event.body) return Buffer.from('');
  return event.isBase64Encoded ? Buffer.from(event.body, 'base64') : Buffer.from(event.body, 'utf8');
}

async function getMonoPublicKey() {
  if (cachedPublicKey) return cachedPublicKey;

  const token = process.env.MONOBANK_TOKEN;
  if (!token) throw new Error('MONOBANK_TOKEN is not configured');

  const response = await fetch(MONO_PUBLIC_KEY_URL, {
    headers: { 'X-Token': token }
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.key) {
    throw new Error(`Mono public key request failed: ${response.status}`);
  }

  cachedPublicKey = payload.key;
  return cachedPublicKey;
}

async function verifyMonoSignature(event, rawBodyBuffer) {
  const signatureHeader = getHeader(event.headers, 'x-sign');
  if (!signatureHeader) return false;

  const publicKeyBase64 = await getMonoPublicKey();
  const publicKeyBuffer = Buffer.from(publicKeyBase64, 'base64');
  const signature = Buffer.from(signatureHeader, 'base64');

  const verifier = crypto.createVerify('SHA256');
  verifier.update(rawBodyBuffer);
  verifier.end();

  return verifier.verify(publicKeyBuffer, signature);
}

function parseMonoPayload(rawBodyBuffer) {
  try {
    return JSON.parse(rawBodyBuffer.toString('utf8'));
  } catch (error) {
    return {};
  }
}

function isSuccessfulStatus(status) {
  return status === 'success';
}

function getStatusLabel(status) {
  const labels = {
    success: 'успішна оплата',
    failure: 'неуспішна оплата',
    expired: 'рахунок протерміновано',
    reversed: 'повернення',
    processing: 'обробляється',
    hold: 'холд'
  };

  return labels[status] || status || 'невідомий статус';
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const rawBodyBuffer = getRawBodyBuffer(event);
  let verified = false;

  try {
    verified = await verifyMonoSignature(event, rawBodyBuffer);
  } catch (error) {
    console.error('[mono-webhook] signature verification failed', error);
    return json(500, { error: 'Signature verification failed' });
  }

  if (!verified) {
    return json(401, { error: 'Invalid signature' });
  }

  const payload = parseMonoPayload(rawBodyBuffer);
  const status = sanitizeText(payload.status || '', 40);
  const referenceData = parseReference(payload.reference || payload.merchantPaymInfo?.reference || '');
  const amountText = typeof payload.amount === 'number'
    ? formatMoneyFromKopiyky(payload.amount)
    : (referenceData.priceUah ? `${referenceData.priceUah} грн` : 'невідомо');

  const isPaid = isSuccessfulStatus(status);
  const icon = isPaid ? '✅' : 'ℹ️';
  const title = isPaid ? 'Успішна оплата mono' : 'Оновлення статусу mono';

  if (referenceData.reference) {
    try {
      await updatePaymentAttempt(referenceData.reference, {
        status: status || 'unknown',
        paid: isPaid,
        paidAt: isPaid ? new Date().toISOString() : undefined,
        invoiceId: payload.invoiceId || undefined,
        monoPayload: {
          status,
          amount: payload.amount,
          errCode: payload.errCode || '',
          failureReason: sanitizeText(payload.failureReason || '', 220)
        }
      });
    } catch (error) {
      console.error('[payment-attempts] webhook update failed', error);
    }
  }

  await notifyTelegram([
    `${icon} ${title}`,
    '',
    `Статус: ${getStatusLabel(status)}`,
    `Курс: ${COURSE_NAME}`,
    `Сума: ${amountText}`,
    referenceData.design ? `Дизайн: ${referenceData.design}` : '',
    payload.invoiceId ? `Invoice ID: ${payload.invoiceId}` : '',
    referenceData.reference ? `Reference: ${referenceData.reference}` : '',
    referenceData.reference ? 'Контакт: шукай попередню спробу оплати з таким самим Reference' : '',
    payload.errCode ? `Код помилки: ${payload.errCode}` : '',
    payload.failureReason ? `Причина: ${sanitizeText(payload.failureReason, 220)}` : '',
    `Час: ${formatDateTime()}`
  ].filter(Boolean).join('\n'));

  return json(200, { ok: true });
}
