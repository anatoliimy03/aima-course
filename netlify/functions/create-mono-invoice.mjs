import {
  COURSE_NAME,
  formatDateTime,
  getBaseUrl,
  getCourseVariant,
  getHeader,
  isSameOriginRequest,
  json,
  notifyTelegram,
  parseJsonBody,
  sanitizeText
} from './_notifications.mjs';

const MONO_CREATE_INVOICE_URL = 'https://api.monobank.ua/api/merchant/invoice/create';
const COURSE_CODE = 'online-shop-21-days';

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

function getResponseHeaders(event) {
  const headers = Object.assign({}, jsonHeaders);
  const origin = getHeader(event.headers, 'origin');
  if (origin && isSameOriginRequest(event)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
  }
  return headers;
}

function jsonResponse(event, statusCode, body) {
  const response = json(statusCode, body);
  response.headers = getResponseHeaders(event);
  return response;
}

function makeReference(priceVariant) {
  const randomPart = Math.random().toString(16).slice(2, 10);
  return `aima-${priceVariant.design}-${priceVariant.priceUah}-${Date.now()}-${randomPart}`;
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    if (!isSameOriginRequest(event)) {
      return jsonResponse(event, 403, { error: 'Origin is not allowed' });
    }
    return { statusCode: 204, headers: getResponseHeaders(event), body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(event, 405, { error: 'Method not allowed' });
  }

  if (!isSameOriginRequest(event)) {
    return jsonResponse(event, 403, { error: 'Origin is not allowed' });
  }

  const token = process.env.MONOBANK_TOKEN;
  if (!token) {
    return jsonResponse(event, 500, { error: 'MONOBANK_TOKEN is not configured' });
  }

  const body = parseJsonBody(event);
  const priceVariant = getCourseVariant(body.page_path);
  const baseUrl = getBaseUrl(event);
  const reference = makeReference(priceVariant);
  const redirectUrl = `${baseUrl}${priceVariant.pagePath}thank-you/?payment=mono&reference=${encodeURIComponent(reference)}`;
  const webHookUrl = `${baseUrl}/.netlify/functions/mono-webhook`;
  const location = sanitizeText(body.location || 'unknown', 80);
  const buttonLabel = sanitizeText(body.button_label || '', 120);

  const invoice = {
    amount: priceVariant.priceKopiyky,
    ccy: 980,
    redirectUrl,
    webHookUrl,
    validity: 3600,
    paymentType: 'debit',
    merchantPaymInfo: {
      reference,
      destination: COURSE_NAME,
      comment: 'Курс Анатолія Маліновського',
      basketOrder: [
        {
          name: COURSE_NAME,
          qty: 1,
          sum: priceVariant.priceKopiyky,
          total: priceVariant.priceKopiyky,
          unit: 'шт.',
          code: COURSE_CODE
        }
      ]
    }
  };

  try {
    const response = await fetch(MONO_CREATE_INVOICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Token': token
      },
      body: JSON.stringify(invoice)
    });

    const responseText = await response.text();
    let monoData = {};
    try {
      monoData = responseText ? JSON.parse(responseText) : {};
    } catch (error) {
      monoData = { raw: responseText };
    }

    if (!response.ok) {
      return jsonResponse(event, 502, {
        error: 'Mono invoice create failed',
        status: response.status,
        details: monoData
      });
    }

    if (!monoData.pageUrl || !monoData.invoiceId) {
      return jsonResponse(event, 502, {
        error: 'Mono invoice response is incomplete',
        details: monoData
      });
    }

    await notifyTelegram([
      '🟦 Нова спроба оплати',
      '',
      `Курс: ${COURSE_NAME}`,
      `Варіант: ${priceVariant.label}`,
      `Ціна: ${priceVariant.priceUah} грн`,
      `Сторінка: ${priceVariant.pagePath}`,
      `Кнопка: ${location}${buttonLabel ? ` / ${buttonLabel}` : ''}`,
      `Invoice ID: ${monoData.invoiceId}`,
      `Reference: ${reference}`,
      `Час: ${formatDateTime()}`
    ].join('\n'));

    return jsonResponse(event, 200, {
      invoiceId: monoData.invoiceId,
      pageUrl: monoData.pageUrl,
      reference,
      amount: priceVariant.priceUah,
      currency: 'UAH',
      design: priceVariant.design,
      pagePath: priceVariant.pagePath,
      location
    });
  } catch (error) {
    return jsonResponse(event, 502, {
      error: 'Mono invoice request failed',
      message: error && error.message ? error.message : 'Unknown error'
    });
  }
}
