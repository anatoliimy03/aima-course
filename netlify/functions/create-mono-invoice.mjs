const MONO_CREATE_INVOICE_URL = 'https://api.monobank.ua/api/merchant/invoice/create';
const DEFAULT_COURSE_PRICE_UAH = 490;
const PRICE_VARIANTS = {
  '/online-shop-21-days/': 490,
  '/online-shop-21-days-990/': 990,
  '/online-shop-21-days-1390/': 1390,
  '/online-shop-21-days-new/': 490,
  '/online-shop-21-days-new-990/': 990,
  '/online-shop-21-days-new-1390/': 1390
};
const COURSE_CODE = 'online-shop-21-days';
const COURSE_NAME = 'Курс "Інтернет-магазин за 21 урок"';

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

function json(event, statusCode, body) {
  return {
    statusCode,
    headers: getResponseHeaders(event),
    body: JSON.stringify(body)
  };
}

function getHeader(headers, name) {
  const key = Object.keys(headers || {}).find((header) => header.toLowerCase() === name.toLowerCase());
  return key ? headers[key] : '';
}

function getBaseUrl(event) {
  const configuredUrl = process.env.PUBLIC_SITE_URL || process.env.URL;
  if (configuredUrl) return configuredUrl.replace(/\/+$/, '');

  const host = getHeader(event.headers, 'host');
  const forwardedProto = getHeader(event.headers, 'x-forwarded-proto') || 'https';
  const protocol = forwardedProto.split(',')[0].trim();

  if (host) return `${protocol}://${host}`.replace(/\/+$/, '');
  return 'https://malinovskyi.in.ua';
}

function isSameOriginRequest(event) {
  const origin = getHeader(event.headers, 'origin');
  if (!origin) return true;

  const host = getHeader(event.headers, 'host');
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch (error) {
    return false;
  }
}

function parseBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch (error) {
    return {};
  }
}

function makeReference() {
  const randomPart = Math.random().toString(16).slice(2, 10);
  return `aima-course-${Date.now()}-${randomPart}`;
}

function normalizePagePath(pagePath) {
  if (typeof pagePath !== 'string') return '/online-shop-21-days/';

  try {
    if (pagePath.startsWith('http://') || pagePath.startsWith('https://')) {
      pagePath = new URL(pagePath).pathname;
    }
  } catch (error) {
    pagePath = '/online-shop-21-days/';
  }

  const normalized = pagePath.split('?')[0].split('#')[0].replace(/\/index\.html$/, '/');
  return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

function getPriceVariant(pagePath) {
  const normalizedPath = normalizePagePath(pagePath);
  const priceUah = PRICE_VARIANTS[normalizedPath] || DEFAULT_COURSE_PRICE_UAH;
  return {
    pagePath: normalizedPath,
    priceUah,
    priceKopiyky: priceUah * 100
  };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    if (!isSameOriginRequest(event)) {
      return json(event, 403, { error: 'Origin is not allowed' });
    }
    return { statusCode: 204, headers: getResponseHeaders(event), body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return json(event, 405, { error: 'Method not allowed' });
  }

  if (!isSameOriginRequest(event)) {
    return json(event, 403, { error: 'Origin is not allowed' });
  }

  const token = process.env.MONOBANK_TOKEN;
  if (!token) {
    return json(event, 500, { error: 'MONOBANK_TOKEN is not configured' });
  }

  const body = parseBody(event);
  const priceVariant = getPriceVariant(body.page_path);
  const baseUrl = getBaseUrl(event);
  const reference = makeReference();
  const redirectUrl = `${baseUrl}${priceVariant.pagePath}thank-you/?payment=mono&reference=${encodeURIComponent(reference)}`;

  const invoice = {
    amount: priceVariant.priceKopiyky,
    ccy: 980,
    redirectUrl,
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
      return json(event, 502, {
        error: 'Mono invoice create failed',
        status: response.status,
        details: monoData
      });
    }

    if (!monoData.pageUrl || !monoData.invoiceId) {
      return json(event, 502, {
        error: 'Mono invoice response is incomplete',
        details: monoData
      });
    }

    return json(event, 200, {
      invoiceId: monoData.invoiceId,
      pageUrl: monoData.pageUrl,
      reference,
      amount: priceVariant.priceUah,
      currency: 'UAH',
      location: typeof body.location === 'string' ? body.location.slice(0, 80) : null
    });
  } catch (error) {
    return json(event, 502, {
      error: 'Mono invoice request failed',
      message: error && error.message ? error.message : 'Unknown error'
    });
  }
}
