import { NextResponse } from 'next/server';
import { getAllLocations } from '../../../lib/store';

export async function GET() {
  const couriers = await getAllLocations();
  return NextResponse.json({ couriers });
}


