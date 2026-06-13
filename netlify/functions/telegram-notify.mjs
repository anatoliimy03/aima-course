import {
  formatDateTime,
  getCourseVariant,
  isSameOriginRequest,
  json,
  notifyTelegram,
  parseJsonBody,
  sanitizeText
} from './_notifications.mjs';

function getEventTitle(eventName) {
  const titles = {
    telegram_access_click: 'Перехід у Telegram після оплати',
    thank_you_contact_view: 'Контакт відкрив сторінку подяки'
  };

  return titles[eventName] || 'Подія на сайті';
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: json(204, {}).headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  if (!isSameOriginRequest(event)) {
    return json(403, { error: 'Origin is not allowed' });
  }

  const body = parseJsonBody(event);
  const eventName = sanitizeText(body.event_name || '', 80);

  if (!['telegram_access_click', 'thank_you_contact_view'].includes(eventName)) {
    return json(400, { error: 'Unsupported event' });
  }

  const pagePath = sanitizeText(body.page_path || '', 120);
  const variant = getCourseVariant(pagePath);
  const reference = sanitizeText(body.reference || '', 160);
  const buttonLabel = sanitizeText(body.button_label || 'telegram', 120);
  const customerName = sanitizeText(body.name || '', 80);
  const customerPhone = sanitizeText(body.phone || '', 40);
  const invoiceId = sanitizeText(body.invoice_id || '', 120);
  const submittedPrice = sanitizeText(body.price_uah || '', 20);

  const details = eventName === 'thank_you_contact_view'
    ? [
        customerName ? `Ім’я: ${customerName}` : 'Ім’я: не вказано',
        customerPhone ? `Телефон: ${customerPhone}` : 'Телефон: не вказано',
        invoiceId ? `Invoice ID: ${invoiceId}` : '',
        submittedPrice ? `Ціна з форми: ${submittedPrice} грн` : ''
      ]
    : [
        `Кнопка: ${buttonLabel}`
      ];

  const notification = await notifyTelegram([
    '✅ ' + getEventTitle(eventName),
    '',
    `Варіант: ${variant.label}`,
    `Ціна: ${variant.priceUah} грн`,
    `Сторінка: ${pagePath || variant.pagePath}`,
    ...details,
    reference ? `Reference: ${reference}` : '',
    `Час: ${formatDateTime()}`
  ].filter(Boolean).join('\n'));

  return json(200, {
    ok: true,
    notification: {
      ok: Boolean(notification && notification.ok),
      skipped: Boolean(notification && notification.skipped),
      status: notification && notification.status ? notification.status : null,
      error: notification && notification.error ? notification.error : null,
      description: notification && notification.details && notification.details.description
        ? notification.details.description
        : null
    }
  });
}
