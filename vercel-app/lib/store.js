import { Redis } from '@upstash/redis';

const hasKV = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
const redis = hasKV ? new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
}) : null;

// Fallback: in-memory (per lambda instance)
const globalState = globalThis.__MEM_STORE__ || { map: new Map() };
globalThis.__MEM_STORE__ = globalState;

export async function saveLocation(loc) {
  if (redis) {
    const key = `courier:${loc.courierId}`;
    await redis.hset(key, loc);
    await redis.sadd('couriers', loc.courierId);
    return;
  }
  globalState.map.set(loc.courierId, loc);
}

export async function getAllLocations() {
  if (redis) {
    const ids = await redis.smembers('couriers');
    if (!ids || ids.length === 0) return [];
    const results = await Promise.all(ids.map((id) => redis.hgetall(`courier:${id}`)));
    // Upstash returns strings; coerce numeric fields
    return results.filter(Boolean).map((r) => ({
      courierId: String(r.courierId),
      lat: Number(r.lat),
      lng: Number(r.lng),
      speed: r.speed != null ? Number(r.speed) : null,
      heading: r.heading != null ? Number(r.heading) : null,
      jobId: r.jobId != null ? String(r.jobId) : null,
      battery: r.battery != null ? Number(r.battery) : null,
      timestamp: Number(r.timestamp),
    }));
  }
  return Array.from(globalState.map.values());
}


