import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export class ProviderDAL {
  static async findByEmail(email) {
    return await prisma.provider.findUnique({ where: { email } });
  }

  static async findByMobile(mobile) {
    return await prisma.provider.findFirst({ where: { mobile } });
  }

  static async findByAlternateMobile(alternate_mobile) {
    return await prisma.provider.findFirst({
      where: {
        OR: [
          { mobile: alternate_mobile },
          { alternate_mobile }
        ]
      }
    });
  }

  static async createProvider(data) {
    return await prisma.provider.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        alternate_mobile: true,
        address: true,
        cityId: true,
        stateId: true,
        zipcode: true,
        registration_status: true,
        is_active: true,
        emailOTP: true,
        mobileOTP: true,
        createdAt: true,
      }
    });
  }

  static async findCityById(cityId) {
    return await prisma.city.findUnique({ where: { id: cityId } });
  }

  static async findStateById(stateId) {
    return await prisma.state.findUnique({ where: { id: stateId } });
  }
}
