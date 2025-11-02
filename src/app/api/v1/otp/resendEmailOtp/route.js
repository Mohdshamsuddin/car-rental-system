import { NextResponse } from 'next/server';
import { OTPService } from '../../../../../services/otpService.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim() : '';

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
    }

    await OTPService.resendEmailOtp(email);

    return NextResponse.json({ message: 'OTP resent to your email' }, { status: 200 });
  } catch (error) {
    console.error('Error in resendemailotp:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
