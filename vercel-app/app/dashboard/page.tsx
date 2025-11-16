'use client';

import React, { useEffect, useRef, useState } from 'react';

type Location = {
  courierId: string;
  lat: number;
  lng: number;
  speed?: number | null;
  heading?: number | null;
  jobId?: string | null;
  battery?: number | null;
  timestamp: number;
};

export default function DashboardPage() {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const [couriers, setCouriers] = useState<Location[]>([]);

  useEffect(() => {
    function init() {
      const L = (window as any).L;
      if (!L || mapRef.current) return;
      mapRef.current = L.map('map', { zoomControl: true }).setView([20, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }
    init();
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/couriers', { cache: 'no-store' });
        const data = await res.json();
        if (Array.isArray(data.couriers)) {
          setCouriers(data.couriers);
          const L = (window as any).L;
          if (!L || !mapRef.current) return;
          data.couriers.forEach((loc: Location) => {
            const key = loc.courierId;
            const latlng: [number, number] = [loc.lat, loc.lng];
            const heading = typeof loc.heading === 'number' ? loc.heading : 0;
            const rotation = `rotate(${heading}deg)`;
            const iconHtml = `
              <div style="width:24px;height:24px;transform:${rotation}">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M12 2 L15 14 L12 11 L9 14 Z" fill="#4da3ff" />
                </svg>
              </div>
            `;
            const icon = L.divIcon({ html: iconHtml, className: '', iconSize: [24, 24], iconAnchor: [12, 12] });
            if (markersRef.current[key]) {
              markersRef.current[key].setLatLng(latlng);
              markersRef.current[key].setIcon(icon);
            } else {
              markersRef.current[key] = L.marker(latlng, { icon }).addTo(mapRef.current).bindPopup(`<b>${key}</b>`);
            }
          });
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: '100vh' }}>
      <aside style={{ borderRight: '1px solid #1b2533', overflow: 'auto', background: '#0f1520' }}>
        <div style={{ padding: 12, color: '#9fb3c8', fontSize: 13 }}>Курьеры</div>
        <div style={{ padding: 8 }}>
          {couriers
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
            .map((c) => (
              <div key={c.courierId}
                   onClick={() => {
                     if (mapRef.current && Number.isFinite(c.lat) && Number.isFinite(c.lng)) {
                       mapRef.current.setView([c.lat, c.lng], 15);
                     }
                   }}
                   style={{ background: '#0b1220', border: '1px solid #1b2533', borderRadius: 10, padding: 10, marginBottom: 8, cursor: 'pointer' }}>
                <div><strong>{c.courierId}</strong> {c.jobId ? `· ${c.jobId}` : ''}</div>
                <div style={{ fontSize: 12, color: '#9fb3c8' }}>
                  {c.lat.toFixed(5)}, {c.lng.toFixed(5)}
                  {' · скорость '}{c.speed ?? '-'} м/с
                  {' · курс '}{c.heading ?? '-'}
                  {' · батарея '}{c.battery != null ? Math.round(c.battery * 100) + '%' : '-'}
                  {' · '}{new Date(c.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
        </div>
      </aside>
      <main>
        <div id="map" style={{ height: '100vh', width: '100%' }} />
      </main>
    </div>
  );
}


