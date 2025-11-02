import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const allowedOrigin = 'http://localhost:3000'; // Update for production

export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    },
  });
}

export async function GET() {
  try {
    const providers = await prisma.provider.findMany();
    return NextResponse.json(
      { success: true, providers },
      { headers: { 'Access-Control-Allow-Origin': allowedOrigin } }
    );
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch providers' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': allowedOrigin } }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    // Validate required fields as per your Provider schema
    if (!data.email || !data.name || !data.mobile) {
      return NextResponse.json(
        { success: false, error: 'Email, name, and mobile are required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': allowedOrigin } }
      );
    }

    // Do NOT store password here since not part of Provider schema

    // Create a new provider as per your real schema fields
    const newProvider = await prisma.provider.create({
      data: {
        email: data.email.toLowerCase().trim(),
        name: data.name.trim(),
        mobile: data.mobile.trim(),
        // add other required fields like address, cityId, stateId, zipcode as needed
        is_active: true, // default active status
        registration_status: 'PENDING' // or 'APPROVED' depending on logic
      }
    });

    return NextResponse.json(
      { success: true, provider: newProvider },
      { status: 201, headers: { 'Access-Control-Allow-Origin': allowedOrigin } }
    );
  } catch (error) {
    console.error('Error creating provider:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create provider' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': allowedOrigin } }
    );
  }
}
