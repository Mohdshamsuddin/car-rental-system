# Repository quick reference

**Framework**: Next.js 14 (app directory)
**Runtime**: Node.js 18+
**Package manager**: npm (lockfile present)

## Key directories
1. `src/app` – Next.js routes, API handlers, and UI components
2. `src/services` – business logic services
3. `src/dal` – data access layer built on Prisma
4. `prisma/schema.prisma` – MongoDB schema definitions

## Data layer
- Uses Prisma Client targeting MongoDB (`provider = "mongodb"`).
- Generated client is under `generated/prisma-client`.
- `.env` must supply `DB_URL` for database connection.

## Provider registration flow
1. API route: `src/app/api/v1/providers/register/route.js`
2. Service: `src/services/providerService.js`
3. DAL: `src/dal/providerDAL.js`

## Notable considerations
- OTP values are generated but email/SMS sending is not implemented.
- Provider create selects limited fields; password handling occurs in auth service.
- S3 upload helpers live at `src/app/api/v1/uploads/get-signed-url/route.js`.

Keep this file updated when repo structure or conventions change.




