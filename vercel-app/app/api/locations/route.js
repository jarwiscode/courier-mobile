import { NextResponse } from 'next/server';
import { saveLocation } from '../../../lib/store';

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function validate(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return ['Invalid JSON body'];
  const { courierId, lat, lng, speed, heading, jobId, battery, timestamp } = payload;
  if (!courierId || typeof courierId !== 'string') errors.push('courierId must be a non-empty string');
  if (!isFiniteNumber(lat) || lat < -90 || lat > 90) errors.push('lat must be a number in [-90, 90]');
  if (!isFiniteNumber(lng) || lng < -180 || lng > 180) errors.push('lng must be a number in [-180, 180]');
  if (speed !== undefined && !isFiniteNumber(speed)) errors.push('speed must be a number if provided');
  if (heading !== undefined && !isFiniteNumber(heading)) errors.push('heading must be a number if provided');
  if (battery !== undefined && !isFiniteNumber(battery)) errors.push('battery must be a number (0..1) if provided');
  if (timestamp !== undefined && !isFiniteNumber(timestamp)) errors.push('timestamp must be a number (ms since epoch) if provided');
  if (jobId !== undefined && typeof jobId !== 'string') errors.push('jobId must be a string if provided');
  return errors;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const errors = validate(body);
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }
    const {
      courierId,
      lat,
      lng,
      speed = null,
      heading = null,
      jobId = null,
      battery = null,
    } = body;
    const timestamp = isFiniteNumber(body.timestamp) ? body.timestamp : Date.now();
    const location = { courierId, lat, lng, speed, heading, jobId, battery, timestamp };
    await saveLocation(location);
    return NextResponse.json({ status: 'accepted' }, { status: 202 });
  } catch (e) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
}


