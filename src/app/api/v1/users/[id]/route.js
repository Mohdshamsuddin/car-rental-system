import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { mobile, email, name, role, password } = body;

    // Validation
    if (!mobile || !name || !role) {
      return NextResponse.json(
        { message: "Mobile, name, and role are required", statusCode: 400 },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found", statusCode: 404 },
        { status: 404 }
      );
    }

    // Check if mobile or email is taken by another user
    const duplicateUser = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { mobile: mobile },
              ...(email ? [{ email: email }] : [])
            ]
          }
        ]
      }
    });

    if (duplicateUser) {
      return NextResponse.json(
        { message: "Mobile or email already taken by another user", statusCode: 400 },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData = {
      mobile,
      email: email || null,
      name,
      role: role
    };

    // Only update password if provided
    if (password && password.trim()) {
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        mobile: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        emailVerified: true,
        mobileVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: "Failed to update user", error: error.message, statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found", statusCode: 404 },
        { status: 404 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "User deleted successfully",
      statusCode: 200
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: "Failed to delete user", error: error.message, statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
