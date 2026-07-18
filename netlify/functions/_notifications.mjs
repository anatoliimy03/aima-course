const TELEGRAM_API_BASE = 'https://api.telegram.org';

export const COURSE_NAME = 'Курс "Інтернет-магазин за 21 урок"';

export const COURSE_VARIANTS = {
  '/online-shop-21-days/': { priceUah: 1390, design: 'old', label: 'Старий дизайн 1390 грн', pagePath: '/online-shop-21-days-1390/' },
  '/online-shop-21-days-990/': { priceUah: 1390, design: 'old', label: 'Старий дизайн 1390 грн', pagePath: '/online-shop-21-days-1390/' },
  '/online-shop-21-days-1390/': { priceUah: 1390, design: 'old', label: 'Старий дизайн 1390 грн' },
  '/online-shop-21-days-new/': { priceUah: 1390, design: 'new', label: 'Новий дизайн 1390 грн', pagePath: '/online-shop-21-days-new-1390/' },
  '/online-shop-21-days-new-990/': { priceUah: 1390, design: 'new', label: 'Новий дизайн 1390 грн', pagePath: '/online-shop-21-days-new-1390/' },
  '/online-shop-21-days-new-1390/': { priceUah: 1390, design: 'new', label: 'Новий дизайн 1390 грн' },
  '/online-shop-21-days-new-design/': { priceUah: 1390, design: 'new', label: 'Новий дизайн 1390 грн', pagePath: '/online-shop-21-days-new-1390/' }
};

export function normalizePagePath(pagePath) {
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

export function getCourseVariant(pagePath) {
  const normalizedPath = normalizePagePath(pagePath);
  const variant = COURSE_VARIANTS[normalizedPath] || COURSE_VARIANTS['/online-shop-21-days-new-1390/'];
  return {
    pagePath: variant.pagePath || normalizedPath,
    priceUah: variant.priceUah,
    priceKopiyky: variant.priceUah * 100,
    design: variant.design,
    label: variant.label
  };
}

export function parseReference(reference) {
  if (typeof reference !== 'string') return {};

  const match = reference.match(/^aima-(old|new|new_design)-(\d+)-/);
  if (!match) return { reference };

  return {
    reference,
    design: match[1],
    priceUah: Number(match[2])
  };
}

export function formatMoneyFromKopiyky(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'невідомо';
  return `${Math.round(value / 100)} грн`;
}

export function formatDateTime(date = new Date()) {
  return new Intl.DateTimeFormat('uk-UA', {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: 'Europe/Kyiv'
  }).format(date);
}

export function sanitizeText(value, maxLength = 160) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export function getBaseUrl(event) {
  const configuredUrl = process.env.PUBLIC_SITE_URL || process.env.URL;
  if (configuredUrl) return configuredUrl.replace(/\/+$/, '');

  const host = getHeader(event.headers, 'host');
  const forwardedProto = getHeader(event.headers, 'x-forwarded-proto') || 'https';
  const protocol = forwardedProto.split(',')[0].trim();

  if (host) return `${protocol}://${host}`.replace(/\/+$/, '');
  return 'https://malinovskyi.in.ua';
}

export function getHeader(headers, name) {
  const key = Object.keys(headers || {}).find((header) => header.toLowerCase() === name.toLowerCase());
  return key ? headers[key] : '';
}

export function parseJsonBody(event) {
  if (!event.body) return {};

  try {
    const body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body;
    return JSON.parse(body);
  } catch (error) {
    return {};
  }
}

export function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

export function isSameOriginRequest(event) {
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

export async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured');
    return { ok: false, skipped: true };
  }

  const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('[telegram] sendMessage failed', response.status, payload);
    return { ok: false, status: response.status, details: payload };
  }

  return { ok: true };
}

export async function notifyTelegram(text) {
  try {
    return await sendTelegramMessage(text);
  } catch (error) {
    console.error('[telegram] notification failed', error);
    return { ok: false, error: error && error.message ? error.message : 'Unknown error' };
  }
}
