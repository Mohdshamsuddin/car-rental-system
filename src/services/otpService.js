import { OtpDAL } from '../dal/otpDAL.js';
import { sendEmail } from '../util/emailSender.js';


export class OTPService {
  static generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async resendEmailOtp(email) {
    // Invalidate previous unused OTPs
    await OtpDAL.invalidatePreviousOtps(email, 'email');

    // Generate new OTP
    const otp = this.generateOtp();

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    // Create new OTP record
    await OtpDAL.createOtpRecord({
      email,
      otp,
      type: 'email',
      is_used: false,
      expires_at: expiresAt,
      created_at: new Date(),
    });

    // Send OTP email
    await sendEmail({
      to: email,
      subject: 'Your OTP Code',
      html: `<p>Your OTP is: <strong>${otp}</strong>. It expires in 15 minutes.</p>`,
    });
  }
}
