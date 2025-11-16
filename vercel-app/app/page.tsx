'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 18, marginBottom: 12 }}>Отслеживание курьеров</h1>
      <p>Откройте <Link href="/dashboard">дашборд</Link> для просмотра позиций.</p>
    </div>
  );
}


