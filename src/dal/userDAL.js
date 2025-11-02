
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserDAL {
  static async findMany(options = {}) {
    const { skip = 0, take = 10, where = {}, orderBy = {} } = options;
    
    try {
      const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take,
          orderBy,
          select: {
            id: true,
            name: true,
            mobile: true,
            email: true,
            password: true,
            role: true,
            is_active: true,
            emailVerified: true,
            mobileVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.user.count({ where }),
      ]);

      return { users, totalCount };
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          mobile: true,
          email: true,
          password: true,
          role: true,
          is_active: true,
          emailVerified: true,
          mobileVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  static async findByEmail(email) {
    try {
      return await prisma.user.findFirst({
        where: { email },
      });
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  static async findByMobile(mobile) {
    try {
      return await prisma.user.findUnique({
        where: { mobile },
      });
    } catch (error) {
      throw new Error(`Failed to find user by mobile: ${error.message}`);
    }
  }

  // Keep this for backward compatibility but use mobile instead
  static async findByUsername(username) {
    try {
      // Try to find by mobile or email
      return await prisma.user.findFirst({
        where: {
          OR: [
            { mobile: username },
            { email: username }
          ]
        }
      });
    } catch (error) {
      throw new Error(`Failed to find user by username: ${error.message}`);
    }
  }

  static async create(userData) {
    try {
      return await prisma.user.create({
        data: userData,
        select: {
          id: true,
          name: true,
          mobile: true,
          email: true,
          password: true,
          role: true,
          is_active: true,
          emailVerified: true,
          mobileVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  static async update(id, userData) {
    try {
      return await prisma.user.update({
        where: { id },
        data: userData,
        select: {
          id: true,
          name: true,
          mobile: true,
          email: true,
          password: true,
          role: true,
          is_active: true,
          emailVerified: true,
          mobileVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      return await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  static async findProviders(options = {}) {
    return this.findMany({
      ...options,
      where: {
        ...options.where,
        role: 'provider',
      },
    });
  }
}
