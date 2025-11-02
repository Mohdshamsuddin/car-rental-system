import { NextResponse } from 'next/server';
import { verifyToken } from './util/jwt-access';

export async function middleware(request) {
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Add CORS headers to all API responses
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }

  // List of protected route prefixes
  const protectedPaths = ['/dashboard', '/admin', '/profile'];

  // Check if the request URL starts with a protected path
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    try {
      // Extract token from cookie or Authorization header
      const token =
        request.cookies.get('authToken')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '');

      if (!token) {
        console.log('Middleware: No token found, redirecting to login');
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Verify the token (throws if invalid)
      await verifyToken(token);

      console.log('Middleware: Token valid, proceeding');
      return NextResponse.next();
    } catch (error) {
      console.log('Middleware: Invalid token, redirecting to login', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // For non-protected routes, proceed as normal
  return NextResponse.next();
}

// Matcher config to specify which URLs the middleware runs on
export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/admin/:path*', '/profile/:path*'],
};
