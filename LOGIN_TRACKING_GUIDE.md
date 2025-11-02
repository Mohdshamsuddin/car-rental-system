# Login Tracking & Statistics Feature

## Overview
The authentication API now tracks all login attempts and provides comprehensive login statistics via a GET endpoint.

## Features Implemented

### 1. **POST `/api/v1/auth` - Login (Updated)**
- Still authenticates users with email/mobile and password
- **NEW:** Automatically records each successful login to `LoginHistory` table
- Captures: user details, role, IP address, user agent, and timestamp

**Test Login:**
```bash
POST http://localhost:3000/api/v1/auth
Content-Type: application/json

{
  "username": "admin@example.com",  // or "9000000000"
  "password": "password"
}
```

### 2. **GET `/api/v1/auth` - Login Statistics (NEW)**
- View comprehensive login analytics without authentication required
- Returns real-time statistics about user logins

**Request:**
```bash
GET http://localhost:3000/api/v1/auth
```

**Response:**
```json
{
  "message": "Login Statistics",
  "data": {
    "totalLogins": 2,
    "uniqueUsers": 1,
    "todayLogins": 2,
    "loginsByStatus": {
      "SUCCESS": 2
    },
    "loginsByRole": {
      "ADMIN": 2
    },
    "recentLogins": [
      {
        "name": "Admin User",
        "email": "admin@example.com",
        "mobile": "9000000000",
        "role": "ADMIN",
        "status": "SUCCESS",
        "loginTime": "2025-11-02T10:07:24.418Z",
        "ipAddress": "::1"
      }
    ]
  },
  "statusCode": 200
}
```

## Response Fields Explanation

| Field | Description |
|-------|-------------|
| `totalLogins` | Total number of login attempts recorded |
| `uniqueUsers` | Count of distinct users who have logged in |
| `todayLogins` | Number of logins that occurred today |
| `loginsByStatus` | Breakdown of logins by status (SUCCESS, FAILED, etc.) |
| `loginsByRole` | Distribution of logins by user role (ADMIN, USER, DRIVER, etc.) |
| `recentLogins` | Last 10 login records with full details |

### Recent Login Details:
- **name**: User's full name
- **email**: User's email address
- **mobile**: User's phone number
- **role**: User's role in the system
- **status**: Login status (SUCCESS/FAILED)
- **loginTime**: Exact timestamp of login attempt
- **ipAddress**: IP address from which login occurred

## Test Credentials

| Field | Value |
|-------|-------|
| **Email/Mobile** | `admin@example.com` or `9000000000` |
| **Password** | `password` |
| **Role** | ADMIN ✓ |

## Database Schema

### LoginHistory Table
```prisma
model LoginHistory {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  email     String?
  mobile    String?
  name      String?
  role      String?
  loginTime DateTime @default(now())
  ipAddress String?
  userAgent String?
  status    String   @default("SUCCESS")
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([loginTime])
}
```

## Key Implementation Details

### 1. Login Recording (POST Handler)
```javascript
// After successful authentication and token generation:
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
```

### 2. Statistics Queries (GET Handler)
- **Total Logins**: `prisma.loginHistory.count()`
- **Unique Users**: `prisma.loginHistory.groupBy({ by: ['userId'] })`
- **By Status**: `prisma.loginHistory.groupBy({ by: ['status'], _count: true })`
- **By Role**: `prisma.loginHistory.groupBy({ by: ['role'], _count: true })`
- **Recent Logins**: `prisma.loginHistory.findMany({ take: 10, orderBy: { loginTime: 'desc' } })`
- **Today's Logins**: Count where loginTime is between today's start and end

## Files Modified

1. **`src/app/api/v1/auth/route.js`**
   - Updated POST handler to log successful logins
   - Replaced GET handler with statistics endpoint

2. **`prisma/seed.js`**
   - Added import for bcryptjs
   - Created ADMIN user with bcrypt-hashed password
   - Test credentials: admin@example.com / 9000000000 / password

3. **`src/app/page.js`**
   - Updated login page hint text with test credentials

## Usage Examples

### Example 1: Track Admin Logins
```bash
# Login as admin multiple times
curl -X POST http://localhost:3000/api/v1/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@example.com","password":"password"}'

# Check statistics
curl http://localhost:3000/api/v1/auth
```

### Example 2: Monitor System Activity
Display login stats on a dashboard or admin panel:
```javascript
const response = await fetch('/api/v1/auth');
const stats = await response.json();
console.log(`Total Logins: ${stats.data.totalLogins}`);
console.log(`Unique Users: ${stats.data.uniqueUsers}`);
console.log(`Today's Logins: ${stats.data.todayLogins}`);
```

## Future Enhancements

1. Add query parameters to filter statistics:
   - `?startDate=2025-01-01&endDate=2025-01-31` - Date range
   - `?userId=xxx` - Specific user stats
   - `?role=ADMIN` - Filter by role

2. Failed login tracking:
   - Record failed login attempts with reason
   - Track suspicious activity

3. Session management:
   - Record login/logout times
   - Calculate session duration

4. Audit logs:
   - Log actions performed by users
   - Track changes in the system

## Security Considerations

- GET endpoint is public (no authentication required) - consider adding role-based access if needed
- IP addresses and user agents are captured for security auditing
- Consider implementing rate limiting on POST login endpoint
- Failed login attempts could be tracked separately

---

**Last Updated:** 2025-11-02