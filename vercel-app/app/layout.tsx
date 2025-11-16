'use client';

import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Отслеживание курьеров</title>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body style={{ margin: 0, background: '#0b0f14', color: '#e6eef7' }}>
        {children}
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" />
      </body>
    </html>
  );
}


