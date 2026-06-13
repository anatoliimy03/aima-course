# Aima Course — Лендінг курсу

## Що це
Лендінг для курсу "Інтернет-магазин за 21 урок" на платформі Aima.
Аудиторія — початківці з нульовим рівнем.

- **Головна сторінка:** порожня заглушка в `index.html`
- **Лендінг курсу:** `online-shop-21-days/index.html`
- **Майбутній URL курсу:** https://malinovskyi.in.ua/online-shop-21-days/

---

## Стек
- **Фронтенд:** чистий HTML + CSS + JS
- **Хостинг:** Netlify → https://aima-course.netlify.app
- **Репозиторій:** GitHub → https://github.com/anatoliimy03/aima-course
- **Оплата:** monobank acquiring через Netlify Function
- **Telegram сповіщення:** Netlify Functions + Telegram Bot API

---

## Дизайн-система

### Шрифти
- **Заголовки:** Manrope (800/700/600) — Google Fonts
- **Текст:** Onest (400/500) — Google Fonts

### Кольори
| Назва | HEX | Де використовується |
|-------|-----|---------------------|
| Ink | #0F1922 | Фон hero, navbar, темні блоки |
| Signal Blue | #185FA5 | Акцент, кнопки, посилання |
| Sky | #85B7EB | Hover, деталі на темному фоні |
| Blue Light | #E6F1FB | Фон іконок, підказки |
| Success | #639922 | Прогрес, успішні стани |
| Danger | #E24B4A | Таймер dot |
| BG | #F6F7F9 | Фон сторінки |
| Surface | #FFFFFF | Картки |
| Surface-2 | #EEEEF2 | Другорядні поверхні |

### Відступи
4px / 8px / 12px / 16px / 24px / 40px

### Border radius
- md: 10px
- lg: 14px

---

## Структура сайту (секції online-shop-21-days/index.html)
1. **Hero** — логотип, заголовок, фото спікера, ціна, CTA кнопка
2. **Для кого** — 6 типів аудиторії
3. **Результати** — 6 карток що отримає учень
4. **Як проходить** — Telegram, короткі уроки, доступ назавжди
5. **Програма** — 4 модулі, акордеон зі списком уроків
6. **Спікер** — Анатолій Маліновський, статистика, цитата
7. **Кейси** — 4 магазини (фото з case1-4.jpg)
8. **Відгуки** — 3 відгуки реальних учнів
9. **Бонуси** — 8 бонусів списком
10. **Гарантія** — 21 день, повернення грошей
11. **CTA з таймером** — сесійний таймер 10 хв, ціна 490 ₴
12. **FAQ** — 6 питань, акордеон

---

## Оплата
- Усі CTA кнопки запускають `goToPayment()` і створюють рахунок mono через `/.netlify/functions/create-mono-invoice`
- Секретний mono token зберігається тільки в Netlify env var `MONOBANK_TOKEN`
- Mono webhook URL передається в інвойс як `/.netlify/functions/mono-webhook`
- Webhook перевіряє підпис mono через `x-sign` і відкритий ключ з `/api/merchant/pubkey`
- Підтримуються 6 сторінок покупки: old/new дизайн та ціни 490/990/1390 грн
- Return URL mono веде на відповідну сторінку `thank-you/` для кожного варіанту
- Посилання на Telegram-доступ після оплати задається на сторінці подяки у змінній `TELEGRAM_ACCESS_URL`
- Для стабільного production URL можна додати Netlify env var `PUBLIC_SITE_URL=https://malinovskyi.in.ua`

### Telegram сповіщення
- `create-mono-invoice` надсилає сповіщення, коли створено рахунок mono
- `mono-webhook` надсилає сповіщення, коли mono повертає статус оплати
- `telegram-notify` надсилає сповіщення, коли людина натиснула Telegram на сторінці подяки
- Секрети зберігаються тільки в Netlify env vars:
  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_CHAT_ID`

---

## Робочий процес
Після кожної зміни файлу:
```bash
cd ~/projects/aima-course
cp ~/Downloads/aima-landing.html index.html
git add . && git commit -m "що змінив" && git push
```
Netlify автоматично деплоїть зміни через ~1 хв.

---

## Як продовжити в новому чаті
1. Скинь цей `README.md`
2. Скинь поточний `index.html`
3. Скажи що хочеш зробити
