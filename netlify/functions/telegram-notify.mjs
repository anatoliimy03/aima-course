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
    payment_form_started: 'Старт заповнення форми',
    telegram_access_click: 'Перехід у Telegram',
    thank_you_contact_view: 'Сторінка подяки'
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

  if (!['payment_form_started', 'telegram_access_click', 'thank_you_contact_view'].includes(eventName)) {
    return json(400, { error: 'Unsupported event' });
  }

  const pagePath = sanitizeText(body.page_path || '', 120);
  const variant = getCourseVariant(pagePath);
  const reference = sanitizeText(body.reference || '', 160);
  const buttonLabel = sanitizeText(body.button_label || 'telegram', 120);
  const location = sanitizeText(body.location || '', 80);
  const customerName = sanitizeText(body.name || '', 80);
  const customerPhone = sanitizeText(body.phone || '', 40);
  const invoiceId = sanitizeText(body.invoice_id || '', 120);
  const submittedPrice = sanitizeText(body.price_uah || '', 20);

  const detailsByEvent = {
    payment_form_started: [
      customerName ? `Ім’я: ${customerName}` : 'Ім’я: почав вводити',
      location ? `Кнопка: ${location}` : '',
      buttonLabel ? `Текст: ${buttonLabel}` : ''
    ],
    thank_you_contact_view: [
      customerName || customerPhone ? `Контакт: ${[customerName, customerPhone].filter(Boolean).join(' / ')}` : 'Контакт: не збережено',
      invoiceId ? `Invoice: ${invoiceId}` : '',
      submittedPrice ? `Ціна: ${submittedPrice} грн` : ''
    ],
    telegram_access_click: [
      buttonLabel ? `Кнопка: ${buttonLabel}` : ''
    ]
  };

  const icon = eventName === 'payment_form_started' ? '📝'
    : eventName === 'telegram_access_click' ? '🚀'
      : '✅';

  const notification = await notifyTelegram([
    `${icon} ${getEventTitle(eventName)}`,
    '',
    `Варіант: ${variant.label}`,
    ...(detailsByEvent[eventName] || []),
    pagePath ? `Сторінка: ${pagePath}` : '',
    reference ? `Ref: ${reference}` : '',
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
