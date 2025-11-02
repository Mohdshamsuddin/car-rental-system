
import { UserDAL } from '../dal/userDAL.js';
import bcrypt from 'bcryptjs';

export class UserService {
  static async getUsers(options = {}) {
    const { skip, take, sortField, sortOrder, filters } = options;

    // Build where clause for filtering
    const where = {};
    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }
    if (filters.mobile) {
      where.mobile = { contains: filters.mobile, mode: 'insensitive' };
    }
    if (filters.email) {
      where.email = { contains: filters.email, mode: 'insensitive' };
    }
    if (filters.role) {
      where.role = filters.role;
    }

    // Build orderBy clause
    const orderBy = {};
    if (sortField) {
      orderBy[sortField] = sortOrder === 1 ? 'asc' : 'desc';
    }

    return await UserDAL.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  static async createUser(userData) {
    const { mobile, email, password, name, role } = userData;

    // Validation
    if (!mobile || !password || !name || !role) {
      throw new Error('Mobile, password, name, and role are required');
    }

    // Check if user already exists
    if (email) {
      const existingUserByEmail = await UserDAL.findByEmail(email);
      if (existingUserByEmail) {
        throw new Error('User with this email already exists');
      }
    }

    const existingUserByMobile = await UserDAL.findByMobile(mobile);
    if (existingUserByMobile) {
      throw new Error('User with this mobile number already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    return await UserDAL.create({
      mobile,
      email: email || null,
      password: hashedPassword,
      name,
      role: role,
      is_active: true,
    });
  }

  static async updateUser(id, userData) {
    const { mobile, email, name, role, password } = userData;

    // Check if user exists
    const existingUser = await UserDAL.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Check for duplicate email/mobile (excluding current user)
    if (email && email !== existingUser.email) {
      const userWithEmail = await UserDAL.findByEmail(email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new Error('User with this email already exists');
      }
    }

    if (mobile && mobile !== existingUser.mobile) {
      const userWithMobile = await UserDAL.findByMobile(mobile);
      if (userWithMobile && userWithMobile.id !== id) {
        throw new Error('User with this mobile number already exists');
      }
    }

    // Prepare update data
    const updateData = {};
    if (mobile) updateData.mobile = mobile;
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    
    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    return await UserDAL.update(id, updateData);
  }

  static async deleteUser(id) {
    const existingUser = await UserDAL.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    return await UserDAL.delete(id);
  }

  static async getProviders(options = {}) {
    return await UserDAL.findProviders(options);
  }
}
