Вариант A: деплой сервера (Railway/Render) и дашборда (Vercel)

Обзор
- Сервер (`server/`): Node.js + Express + Socket.IO, порт 8080.
- Дашборд (`dashboard/`): статический сайт (Leaflet + Socket.IO CDN), конфиг через `BACKEND_URL`.

1) Подготовка репозитория
- Создайте репозиторий на GitHub и запушьте весь проект.
- Структура:
  - server/ — бэкенд
  - dashboard/ — фронтенд (Vercel)

2) Деплой сервера на Railway (или Render)
- Railway (пример):
  1. Перейдите в Railway → New Project → Deploy from GitHub Repo → выберите репозиторий.
  2. В настройках сервиса укажите Root Directory = `server`.
  3. Railway сам определит Node.js и запустит `npm install`, затем `npm start`.
  4. Порт: переменная среды `PORT` будет выставлена автоматически; в коде используется `process.env.PORT || 8080` — готово.
  5. После деплоя получите домен, например `https://api-myapp.railway.app`.
- Render (аналогично):
  1. New → Web Service → Connect repo.
  2. Root Directory: `server`.
  3. Build Command: `npm install`
  4. Start Command: `npm start`
  5. Free tier подойдёт для MVP; получите URL вида `https://myapp.onrender.com`.

3) Деплой дашборда на Vercel
- Настройка:
  1. Подключите репозиторий GitHub к Vercel.
  2. В настройках проекта укажите Root Directory = `dashboard`.
  3. Build Command: `npm run build` (создаёт `config.js` с `BACKEND_URL`).
  4. Output Directory: `.` (корень `dashboard`, статическая выдача).
  5. Переменные окружения:
     - `BACKEND_URL`: укажите публичный URL сервера, например `https://api-myapp.railway.app`.
  6. Запустите деплой. Vercel раздаст `index.html`, `config.js` и остальное.

4) Локальная проверка дашборда
```bash
cd dashboard
BACKEND_URL=http://localhost:8080 npm run build
npx serve -s .
```
Откройте http://localhost:3000 (или указанный порт).

5) Мобильная интеграция
- В приложении укажите `SERVER_URL = '<BACKEND_URL>/v1/locations'`, см. `mobile/README.md`.
- Для эмулятора Android: `http://10.0.2.2:8080` (если сервер локальный).
- Для прод: используйте домен Railway/Render, например `https://api-myapp.onrender.com/v1/locations`.

Примечания
- CORS уже разрешён `'*'` в сервере для простоты. В продакшене ограничьте список доменов.
- Для HTTPS/WSS используйте публичные домены платформ (они выдают сертификаты автоматически).
- Для долговременного хранения добавьте БД и аутентификацию (JWT, API-ключи).


