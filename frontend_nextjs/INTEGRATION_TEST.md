# Integration Testing Guide

This document describes how to test the integration between the Next.js frontend and NestJS backend.

## Prerequisites

1. **Backend running**: The NestJS backend should be running on `http://localhost:3001`
2. **Database accessible**: PostgreSQL should be accessible and migrations applied
3. **Dependencies installed**: All npm packages should be installed

## Quick Test

Run the automated integration test script:

```bash
cd frontend_nextjs
npm run test:integration
```

Or directly:

```bash
node test-integration.js
```

## What the Test Checks

The integration test verifies:

1. ✅ **Backend Health Check** - Backend is running and responding
2. ✅ **Swagger Documentation** - API docs are accessible
3. ✅ **Auth Endpoint** - Login endpoint exists and validates input
4. ✅ **Admin Endpoint** - Admin routes are protected (require auth)
5. ✅ **Rooms Endpoint** - Rooms API is accessible and protected
6. ✅ **Services Endpoint** - Services API is accessible and protected
7. ✅ **CORS Configuration** - CORS headers are properly set

## Manual Testing Steps

### 1. Start the Backend

```bash
cd backend_nestjs
npm install
npm run start:dev
```

Expected output:
```
🚀 Server running on port 3001
📊 Health check: http://localhost:3001/api/health
📚 API Docs: http://localhost:3001/api/docs
🔗 API Base URL: http://localhost:3001/api
```

### 2. Test Health Check Endpoint

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.456
}
```

### 3. Start the Frontend

```bash
cd frontend_nextjs
npm install
npm run dev
```

Expected output:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 4. Test Frontend → Backend Connection

Open your browser's developer console and navigate to `http://localhost:3000`. Check for:

- No CORS errors
- API calls in Network tab
- Console errors

### 5. Test Authentication Flow

1. Navigate to `http://localhost:3000/login`
2. Try to login with test credentials
3. Verify token is stored in localStorage
4. Check that authenticated routes are accessible

## Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### Backend (.env)

```env
DATABASE_URL=postgresql://yellowtip_user:yellowtip_password@localhost:5432/yellowtip_reservations
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key
```

## Docker Compose Testing

If using Docker Compose:

```bash
cd frontend_nextjs
docker-compose up
```

This will start:
- PostgreSQL on port 5437
- Redis on port 6380
- Backend on port 3001
- Frontend on port 3000

Then run the integration test:

```bash
npm run test:integration
```

## Troubleshooting

### Backend Not Responding

1. Check if backend is running: `curl http://localhost:3001/api/health`
2. Check backend logs for errors
3. Verify port 3001 is not blocked by firewall
4. Check database connection in backend logs

### CORS Errors

1. Verify `FRONTEND_URL` in backend `.env` matches frontend URL
2. Check backend CORS configuration in `main.ts`
3. Ensure frontend is using correct `NEXT_PUBLIC_API_URL`

### Authentication Issues

1. Verify JWT_SECRET is set in backend
2. Check token is being sent in request headers
3. Verify token format in localStorage
4. Check backend auth guards are working

### API Endpoints Not Found (404)

1. Verify backend global prefix is `/api`
2. Check route definitions in controllers
3. Ensure modules are imported in `app.module.ts`

## Expected API Endpoints

After successful integration, these endpoints should be accessible:

### Public Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/login` - Login
- `GET /api/docs` - Swagger documentation

### Protected Endpoints (require JWT token)
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/rooms` - List rooms
- `GET /api/services` - List services
- `GET /api/guests` - List guests
- `GET /api/therapists` - List therapists
- `GET /api/bookings` - List bookings

## API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "statusCode": 400
  }
}
```

## Next Steps

After successful integration testing:

1. ✅ Verify all CRUD operations work correctly
2. ✅ Test authentication and authorization
3. ✅ Verify data persistence in database
4. ✅ Test error handling and validation
5. ✅ Verify CORS in production-like environment

