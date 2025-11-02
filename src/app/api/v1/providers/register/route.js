import { NextResponse } from 'next/server';
import { ProviderService } from '../../../../../services/providerService.js';

export async function POST(request) {
  try {
    const body = await request.json();

    const newProvider = await ProviderService.registerProvider(body);

    return NextResponse.json({
      statusCode: "201",
      message: "Provider registered successfully. Please verify your email and mobile with OTP.",
      data: {
        id: newProvider.id,
        name: newProvider.name,
        email: newProvider.email,
        mobile: newProvider.mobile,
        registration_status: newProvider.registration_status,
        emailOTP: newProvider.emailOTP,     // OTP included for testing
        mobileOTP: newProvider.mobileOTP    // OTP included for testing
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      statusCode: "400",
      message: error.message
    }, { status: 400 });
  }
}
