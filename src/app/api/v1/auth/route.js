import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../../../../util/jwt-access.js';

// Initialize Prisma client
const prisma = new PrismaClient();

export async function POST(request) {
  try {
    console.log('Auth API called');
    
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { message: "Invalid JSON in request body", statusCode: 400 },
        { status: 400 }
      );
    }

    const { username, password } = body;
    
    console.log('Login attempt for username:', username);
    
    if (!username || !password) {
      console.log('Missing credentials');
      return NextResponse.json(
        { message: "Username and password are required", statusCode: 400 },
        { status: 400 }
      );
    }

    // Test database connection first
    try {
      await prisma.$connect();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { message: "Database connection failed", statusCode: 500 },
        { status: 500 }
      );
    }

    // Find user in database by mobile or email
    let userFromDb;
    try {
      // Try to find user by mobile first, then by email
      userFromDb = await prisma.user.findFirst({
        where: {
          OR: [
            { mobile: username },
            { email: username }
          ]
        },
        select: {
          id: true,
          name: true,
          mobile: true,
          email: true,
          password: true,
          role: true,
          is_active: true,
          createdAt: true,
          updatedAt: true
        }
      });
      console.log('User found:', userFromDb ? 'Yes' : 'No');
      if (userFromDb) {
        console.log('User has password field:', !!userFromDb.password);
      }
    } catch (dbQueryError) {
      console.error('Database query error:', dbQueryError);
      return NextResponse.json(
        { message: "Database query failed", statusCode: 500 },
        { status: 500 }
      );
    }
    
    if (!userFromDb) {
      console.log('User not found in database');
      return NextResponse.json(
        { message: "Invalid username or password", statusCode: 401 },
        { status: 401 }
      );
    }
    
    console.log('User is_active:', userFromDb.is_active);
    
    if (!userFromDb.is_active) {
      console.log('User account is inactive');
      return NextResponse.json(
        { message: "Account is deactivated", statusCode: 403 },
        { status: 403 }
      );
    }
    
    // Verify password
    let isPasswordValid;
    try {
      isPasswordValid = await bcrypt.compare(password, userFromDb.password);
      console.log('Password valid:', isPasswordValid);
    } catch (bcryptError) {
      console.error('Password comparison error:', bcryptError);
      return NextResponse.json(
        { message: "Password verification failed", statusCode: 500 },
        { status: 500 }
      );
    }
    
    if (!isPasswordValid) {
      console.log('Password verification failed');
      return NextResponse.json(
        { message: "Invalid username or password", statusCode: 401 },
        { status: 401 }
      );
    }

    // Check if user has ADMIN role
    if (userFromDb.role !== 'ADMIN') {
      console.log('Access denied: User is not an admin. Role:', userFromDb.role);
      return NextResponse.json(
        { message: "Invalid credentials", statusCode: 401 },
        { status: 401 }
      );
    }
    
    console.log('Admin role verified');

    // Generate token
    let token;
    try {
      const tokenPayload = {
        userId: userFromDb.id,
        username: userFromDb.username || userFromDb.mobile,
        name: userFromDb.name,
        role: userFromDb.role
      };
      
      token = await generateToken(tokenPayload);
      console.log('Token generated successfully');
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return NextResponse.json(
        { message: "Token generation failed", statusCode: 500 },
        { status: 500 }
      );
    }

    // Log the successful login to LoginHistory
    try {
      await prisma.loginHistory.create({
        data: {
          userId: userFromDb.id,
          email: userFromDb.email,
          mobile: userFromDb.mobile,
          name: userFromDb.name,
          role: userFromDb.role,
          status: 'SUCCESS',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent'),
        }
      });
      console.log('Login history recorded');
    } catch (historyError) {
      console.error('Error recording login history:', historyError);
      // Don't fail the login, just log the error
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = userFromDb;
    
    // Create response with token
    const response = NextResponse.json({
      message: "Login Successful",
      data: {
        token,
        user: userWithoutPassword
      },
      statusCode: 200
    });

    // Set secure HTTP-only cookie
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 24 hours
      path: '/'
    });
    
    return response;

  } catch (error) {
    console.error('Unexpected login error:', error);
    return NextResponse.json(
      { 
        message: "Internal server error", 
        error: error.message,
        statusCode: 500 
      },
      { status: 500 }
    );
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Prisma disconnect error:', disconnectError);
    }
  }
}

export async function GET(request) {
  try {
    console.log('Auth GET: Fetching login statistics');
    
    // Connect to database
    try {
      await prisma.$connect();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { message: "Database connection failed", statusCode: 500 },
        { status: 500 }
      );
    }

    // Get total login count
    const totalLogins = await prisma.loginHistory.count();
    console.log('Total logins:', totalLogins);

    // Get logins by status
    const loginsByStatus = await prisma.loginHistory.groupBy({
      by: ['status'],
      _count: true
    });
    console.log('Logins by status:', loginsByStatus);

    // Get unique users who logged in
    const uniqueUsers = await prisma.loginHistory.groupBy({
      by: ['userId'],
      _count: true
    });
    const uniqueUserCount = uniqueUsers.length;
    console.log('Unique users logged in:', uniqueUserCount);

    // Get logins by role
    const loginsByRole = await prisma.loginHistory.groupBy({
      by: ['role'],
      _count: true
    });
    console.log('Logins by role:', loginsByRole);

    // Get recent logins (last 10)
    const recentLogins = await prisma.loginHistory.findMany({
      take: 10,
      orderBy: {
        loginTime: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        loginTime: true,
        ipAddress: true
      }
    });
    console.log('Recent logins retrieved:', recentLogins.length);

    // Get today's login count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(today);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const todayLogins = await prisma.loginHistory.count({
      where: {
        loginTime: {
          gte: today,
          lt: tomorrowStart
        }
      }
    });
    console.log('Logins today:', todayLogins);

    // Build response
    const response = NextResponse.json({
      message: "Login Statistics",
      data: {
        totalLogins,
        uniqueUsers: uniqueUserCount,
        todayLogins,
        loginsByStatus: Object.fromEntries(
          loginsByStatus.map(item => [item.status, item._count])
        ),
        loginsByRole: Object.fromEntries(
          loginsByRole.map(item => [item.role || 'unknown', item._count])
        ),
        recentLogins: recentLogins.map(login => ({
          name: login.name,
          email: login.email,
          mobile: login.mobile,
          role: login.role,
          status: login.status,
          loginTime: login.loginTime,
          ipAddress: login.ipAddress
        }))
      },
      statusCode: 200
    }, { status: 200 });

    return response;

  } catch (error) {
    console.error('Error fetching login statistics:', error);
    return NextResponse.json(
      { 
        message: "Failed to fetch login statistics", 
        error: error.message,
        statusCode: 500 
      },
      { status: 500 }
    );
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Prisma disconnect error:', disconnectError);
    }
  }
}
