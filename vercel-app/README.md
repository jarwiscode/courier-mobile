Полный деплой на Vercel (Next.js)

Что внутри
- `app/api/locations` — POST приём геолокации (JSON).
- `app/api/couriers` — GET список последних координат.
- `app/dashboard` — дашборд с Leaflet и опросом каждые 3 сек.
- `lib/store.js` — хранилище: Upstash KV (если заданы переменные) или in-memory fallback.

Локальный запуск
```bash
cd vercel-app
npm install
npm run dev
# http://localhost:3000/dashboard
```

Отправка тестовой локации
```bash
curl -X POST http://localhost:3000/api/locations \
  -H 'Content-Type: application/json' \
  -d '{ "courierId": "c1", "lat": 55.7558, "lng": 37.6173, "speed": 8.3, "heading": 135, "jobId": "job-123", "battery": 0.76, "timestamp": 1730899200000 }'
```

Upstash KV (опционально, бесплатно на старте)
1) Подключите интеграцию Vercel → Upstash KV, получите переменные:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
2) Включите их в настройках проекта Vercel (Environment Variables).
3) Без этих переменных данные будут храниться в памяти инстанса и могут пропадать при холодном старте.

Деплой на Vercel
1) Подключите репозиторий GitHub.
2) Root Directory: `vercel-app`
3) Build Command: `npm run build`
4) Output: (по умолчанию Next.js)
5) Deploy.

Мобильная интеграция
- Отправляйте локации на `https://<ваш_верцел_домен>/api/locations`.
- Пример в `../mobile/README.md` — замените `SERVER_URL` на продовый URL.

Примечания
- WebSocket не используется — дашборд опрашивает API каждые ~3 сек (совместимо с serverless).
- Для реального продакшена включите KV/БД и авторизацию запросов.


