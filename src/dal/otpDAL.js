import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class OtpDAL {
  static async invalidatePreviousOtps(email, type) {
    await prisma.otp.updateMany({
      where: { email, type, is_used: false },
      data: { is_used: true }
    });
  }

  static async createOtpRecord(data) {
    return await prisma.otp.create({
      data,
    });
  }
}
