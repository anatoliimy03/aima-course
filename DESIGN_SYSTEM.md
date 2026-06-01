# Design System для рекламних креативів

Цей файл описує стиль лендингу курсу **“Інтернет-магазин за 21 урок”** і правила для генерації рекламних картинок у тій самій візуальній мові.

Головна задача: рекламний креатив має виглядати як продовження сайту, а не як випадковий банер з шаблону.

---

## 1. Суть стилю

**Відчуття:** практичний, сучасний, довірливий, без зайвої технічності.  
**Позиціонування:** курс не про “складну розробку”, а про швидкий і зрозумілий запуск інтернет-магазину на Aima.  
**Тон:** простими словами, під кутом Aima, без глибоких технічних деталей.

Креатив має показувати:
- людину, яка запускає магазин без хаосу;
- простий шлях “з нуля до магазину”;
- Aima як зрозумілу платформу для старту;
- конкретну вигоду: 21 урок, 490 грн, Telegram-доступ, бонуси, гарантія.

---

## 2. Кольори

| Роль | HEX | Використання |
|---|---:|---|
| Темний фон / hero | `#0F1922` | головні блоки, фон великих карток |
| Основний синій | `#185FA5` | Aima-акцент, посилання, частина графіки |
| Небесний синій | `#85B7EB` | акценти на темному фоні, цифри, іконки |
| Світлий синій | `#E6F1FB` | фони під іконки, легкі підкладки |
| Червоний CTA | `#E24B4A` | знижка, таймер, “онлайн-курс”, кнопки |
| CTA gradient | `#F45B5A → #D9363E` | головні кнопки покупки |
| Telegram gradient | `#2AABEE → #168ACF` | кнопка доступу в Telegram |
| Зелений успіх | `#639922` | “оплата успішна”, позитивні стани |
| Золотий trust | `#F2CE78`, `#D8A84E` | гарантія, довіра, “100% повернення” |
| Фон сторінки | `#F6F7F9` | зовнішній фон |
| Білі картки | `#FFFFFF` | контентні картки |
| Вторинні блоки | `#EEEEF2` | сірі підкладки |

Правило: **темний фон + білий текст + червона CTA + синій акцент** — основна комбінація для продажних креативів.

---

## 3. Шрифти

На сайті:
- **Manrope** — заголовки, кнопки, цифри, бейджі.
- **Onest** — основний текст і пояснення.

Для генерації зображень, якщо точні шрифти недоступні:
- заголовки: геометричний сучасний sans-serif, жирний, схожий на Manrope;
- текст: чистий округлий sans-serif, схожий на Onest;
- не використовувати рукописні, декоративні, serif або надто “маркетплейсні” шрифти.

Важливо: AI часто погано генерує український текст. Для рекламних картинок краще генерувати фон/композицію без дрібного тексту, а фінальний текст накладати вручну в Figma/Canva/редакторі.

---

## 4. Геометрія і компоненти

Основні форми:
- великі темні картки з радіусом `14–28px`;
- внутрішні білі/напівпрозорі картки з радіусом `10–14px`;
- аватар або фото спікера — квадрат із заокругленням, не круглий;
- бейджі — компактні прямокутники з радіусом `5–8px`;
- іконки — тонкі line icons у стилі Tabler.

Відступи:
- дрібні: `8–12px`;
- стандартні: `16–24px`;
- великі: `32–40px`.

Тіні:
- м’які, без “важкого” 3D;
- для CTA: червоне світіння `rgba(226,75,74,0.28–0.34)`;
- для dark card: велика м’яка тінь `rgba(15,25,34,0.18–0.24)`.

---

## 5. Візуальні мотиви

Повторювані елементи стилю:
- фото Анатолія або аватар у маленькому brand-блоці;
- ноутбук/екран із прикладом інтернет-магазину;
- Telegram-інтерфейс як місце доступу до курсу;
- бейдж “Онлайн-курс” червоним;
- знижка “−86%” червоним;
- стара ціна перекреслена, нова ціна жирна;
- таймер/терміновість, але без агресивного “жовтого спаму”;
- напівпрозорі іконки на фоні: `package`, `chart-line`, `sparkles`, `gift`, `shield-check`, `building-store`, `brand-telegram`;
- приклади магазинів як proof: скрін або mockup сайту на екрані.

Не використовувати:
- випадкові stock-люди замість Анатолія;
- технічний код, сервери, складні схеми;
- перенасичені neon/cyberpunk кольори;
- мультяшних маскотів, якщо це не скрін магазину-кейсу;
- надто багато різних кольорів в одному креативі.

---

## 6. Основні формати реклами

### 1:1 Post

Розмір: `1080 × 1080`

Композиція:
- фон `#F6F7F9`;
- по центру темна картка `#0F1922`;
- зверху маленький brand-блок: аватар + “Курс Анатолія Маліновського”;
- великий заголовок 2–4 рядки;
- синій акцент на ключовій фразі;
- фото/ноутбук/магазин у нижній частині;
- червона CTA-кнопка або бейдж ціни.

### 4:5 Feed Ad

Розмір: `1080 × 1350`

Композиція:
- більше повітря зверху і знизу;
- hero-style dark card займає 80–90% площі;
- фото/мокап більший, але не перекриває обличчя;
- CTA внизу, широка кнопка;
- можна додати 2–3 короткі benefit cards.

### 9:16 Story / Reels Cover

Розмір: `1080 × 1920`

Композиція:
- темний card-фон майже на весь екран;
- зверху brand-блок;
- великий заголовок;
- посередині фото спікера + ноутбук/магазин;
- внизу price block і CTA;
- не ставити важливий текст в самий низ, бо Instagram UI може перекрити.

---

## 7. Типові макети

### Макет A: головна продажна обкладинка

Текст:
- “Запусти свій інтернет-магазин за 21 урок”
- “з нуля”
- “490 грн замість 3490 грн”

Візуал:
- Анатолій за ноутбуком;
- на екрані приклад магазину;
- бейдж “Онлайн-курс”;
- червона кнопка “Записатися”.

### Макет B: біль / рішення

Текст:
- “Хочеш продавати онлайн, але не знаєш з чого почати?”
- “Покажу простий шлях запуску магазину на Aima”

Візуал:
- темна картка;
- 3 маленькі картки: “товари”, “оплата”, “доставка”;
- іконки line style;
- синій акцент на “простий шлях”.

### Макет C: програма курсу

Текст:
- “21 короткий урок”
- “по 5–10 хв”
- “від ідеї до першого магазину”

Візуал:
- вертикальний список модулів;
- кольорові бейджі модулів;
- невеликі іконки: book, store, chart, trophy.

### Макет D: бонуси

Текст:
- “8 бонусів безкоштовно”
- “чек-листи, інструкції, таблиці”

Візуал:
- подарункова картка;
- список бонусів як premium items;
- бейджі “Безкоштовно”;
- червоний або золотий акцент.

### Макет E: довіра / гарантія

Текст:
- “Гарантія результату — 21 день”
- “не запустиш магазин після виконання дій — повернемо кошти”

Візуал:
- темний блок;
- золота іконка shield-check;
- 3 умови: “пройшов уроки”, “виконав дії”, “повертаємо 100%”.

### Макет F: Telegram-доступ

Текст:
- “Оплатив — переходиш у Telegram”
- “уроки, матеріали й бонуси в одному місці”

Візуал:
- mockup iPhone з Telegram-інтерфейсом;
- синя Telegram-кнопка;
- маленька зелена status-позначка “доступ відкрито”.

---

## 8. Copy bank

Короткі заголовки:
- “Запусти інтернет-магазин за 21 урок”
- “Створи магазин без програмістів”
- “Від ідеї до першого магазину”
- “Курс для старту онлайн-продажів”
- “Інтернет-магазин з нуля”
- “Aima: простий запуск магазину”

Підзаголовки:
- “Короткі практичні уроки по 5–10 хв”
- “Покроково створиш магазин, товари, оплату і доставку”
- “Без складних технічних моментів”
- “Пояснюю простими словами і показую на практиці”

CTA:
- “Записатися за 490 грн”
- “Оплатити курс”
- “Перейти до навчання”
- “Отримати доступ у Telegram”

Акценти:
- “Онлайн-курс”
- “−86%”
- “490 грн”
- “21 урок”
- “8 бонусів безкоштовно”
- “Гарантія 21 день”

---

## 9. AI prompt template

Використовуй цей шаблон для генерації фону/композиції:

```text
Create a modern Ukrainian advertising creative for an online course about launching an e-commerce store in 21 lessons.

Style: clean premium landing-page design, dark navy hero card (#0F1922) on light gray background (#F6F7F9), rounded corners, soft shadows, minimal UI, practical and trustworthy.

Brand feel: Aima platform, simple e-commerce launch, not technical, beginner-friendly, modern Ukrainian course.

Visual elements: speaker photo placeholder, laptop with e-commerce store screen, small Telegram access hint, red online-course badge, blue accent highlights, subtle transparent line icons (package, chart, sparkles, store), red CTA button.

Typography: bold geometric sans-serif similar to Manrope for headings, clean rounded sans-serif similar to Onest for body. Large headline, short readable text areas.

Colors: dark navy #0F1922, sky blue #85B7EB, Aima blue #185FA5, red CTA #E24B4A / #F45B5A to #D9363E, white cards, light gray background.

Composition: lots of whitespace, mobile-first landing-page aesthetic, premium but simple, Ukrainian digital course ad.

Avoid: cyberpunk, neon, cluttered marketplace design, complex code, random logos, stock corporate people, childish style, too many colors, unreadable tiny text.
```

---

## 10. Приклади готових prompt-ів

### Продажний креатив 4:5

```text
Generate a 1080x1350 Instagram feed ad in the style of a premium Ukrainian landing page.

Main concept: online course “Launch your e-commerce store in 21 lessons”.

Use a large dark navy rounded hero card on a light gray background. Add a confident male course creator sitting near a laptop, face clearly visible. On the laptop screen show a clean e-commerce store interface. Add a small red badge “Онлайн-курс”, a blue highlight area for “21 урок”, and a red CTA button area at the bottom.

Visual style: clean, practical, trustworthy, Aima platform vibe, modern Ukrainian online course, Manrope-like bold typography, Onest-like body typography, soft shadows, rounded rectangles, subtle line icons.

Colors: #0F1922, #85B7EB, #185FA5, #E24B4A, #F6F7F9, white.

Leave enough empty space for manual Ukrainian text overlay. Do not generate messy text.
```

### Story 9:16 з Telegram-доступом

```text
Create a 1080x1920 vertical story ad for a Ukrainian online course.

Theme: after payment, student gets access to the course in Telegram.

Use a dark navy rounded card, a modern iPhone mockup with Telegram chat interface, blue Telegram gradient button, small green success badge, and subtle Aima-style icons in the background.

Mood: clean, trustworthy, simple, not overly technical. Premium but accessible.

Colors: dark navy #0F1922, Telegram blue #2AABEE to #168ACF, sky blue #85B7EB, red accent #E24B4A, light gray background #F6F7F9.

Leave space for headline and CTA text. Avoid fake readable chat text; use abstract message bubbles.
```

### Бонуси 1:1

```text
Create a 1080x1080 square ad creative for bonus materials included with an online course.

Design a clean dark navy card on a light gray background. Show 8 premium bonus cards as small white rounded rectangles with line icons: checklist, analytics, Facebook Pixel, domain, Google search, Instagram Shopping, spreadsheet, orders table. Add red “Безкоштовно” badges and a gold gift accent.

Style: same as a modern Ukrainian landing page, Aima course design, practical, minimal, trustworthy. Use soft shadows, rounded corners, clean spacing, Manrope-like typography.

Leave empty areas for manual Ukrainian text overlay. No clutter, no random logos.
```

### Гарантія 1:1

```text
Create a 1080x1080 trust-focused ad creative for an online course guarantee.

Use a premium dark navy rounded card with a gold shield-check icon, subtle gold glow, and three small condition cards. Visual message: 21-day result guarantee, money back if student completes all lessons and actions but does not launch the store.

Style: serious, clean, reliable, not aggressive. Use #0F1922 background, gold #F2CE78 accents, white text areas, subtle blue details, rounded UI cards.

Leave space for Ukrainian text overlay. Avoid legal-looking documents, avoid scary warning style.
```

---

## 11. Правила для тексту на рекламних картинках

Добре:
- 1 сильний заголовок;
- 1 короткий підзаголовок;
- 1 CTA;
- максимум 1–2 бейджі.

Погано:
- багато дрібного тексту;
- довгі технічні пояснення;
- “налаштуй індексацію, домен, аналітику...” в одному банері;
- 5 різних акцентів одночасно.

Формула:

```text
Заголовок: що людина отримає
Підзаголовок: чому це просто
CTA/ціна: що зробити зараз
```

Приклад:

```text
Запусти інтернет-магазин за 21 урок
Покроково, без програмістів і складних технічних моментів
Записатися за 490 грн
```

---

## 12. Використання реальних assets

Основні файли:
- `online-shop-21-days/avatar.png` — аватар/фото Анатолія для brand-блоку.
- `online-shop-21-days/photo-v2.png` — hero photo з ноутбуком.
- `online-shop-21-days/hero-screen-*.png` — скріни магазинів для екрана ноутбука.
- `online-shop-21-days/case1.jpg` ... `case6.jpg` — кейси магазинів.
- `online-shop-21-days/review1.jpg` ... `review3.jpg` — скріни відгуків.
- `online-shop-21-days/brand-aima.png`, `brand-znaesh.svg`, `brand-tred.png` — логотипи проєктів.

Правило: якщо креатив про курс або довіру — краще використовувати фото Анатолія. Якщо креатив про результат — показувати ноутбук/магазин/кейси.

---

## 13. Checklist перед публікацією

- Чи видно основну думку за 1 секунду?
- Чи є один головний акцент, а не п’ять?
- Чи збережені кольори сайту?
- Чи CTA червоний або Telegram-синій залежно від дії?
- Чи немає складної технічної мови?
- Чи текст українською без помилок?
- Чи стиль схожий на лендинг, а не на випадковий Canva-шаблон?
- Чи не використані чужі логотипи або випадкові бренди?
- Чи є достатньо повітря навколо тексту?
