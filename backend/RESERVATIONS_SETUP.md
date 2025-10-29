# Reservations System Backend Setup

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/yellowtip_reservations?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# Frontend
FRONTEND_URL="http://localhost:3000"
```

## Database Migration

After setting up the environment variables, run the migration to add the quick booking field:

```bash
npx prisma migrate dev --name add_quick_booking_field
```

## New API Endpoints

The following new endpoints have been added for the reservations system:

### 1. Get Reservations Overview
- **GET** `/api/reservations/overview`
- **Query Parameters:**
  - `date` (optional): ISO date string
  - `viewMode` (optional): 'day' | 'week' | 'month'
  - `roomId` (optional): number
  - `therapistId` (optional): number
  - `serviceId` (optional): number

### 2. Get Quick Booking Options
- **GET** `/api/reservations/quick-booking`

### 3. Get Room Overview
- **GET** `/api/reservations/rooms`
- **Query Parameters:**
  - `date` (optional): ISO date string
  - `viewMode` (optional): 'day' | 'week' | 'month'
  - `roomId` (optional): number

### 4. Get Therapist Overview
- **GET** `/api/reservations/therapists`
- **Query Parameters:**
  - `date` (optional): ISO date string
  - `viewMode` (optional): 'day' | 'week' | 'month'
  - `therapistId` (optional): number

### 5. Get Calendar View
- **GET** `/api/reservations/calendar`
- **Query Parameters:**
  - `date` (optional): ISO date string
  - `viewMode` (optional): 'day' | 'week' | 'month'
  - `roomId` (optional): number
  - `therapistId` (optional): number
  - `serviceId` (optional): number

## Database Changes

### New Field Added to Service Table
- `quickbooking` (Boolean, default: false) - Marks services as available for quick booking

### Migration SQL
```sql
-- AddColumn
ALTER TABLE "ytr_service" ADD COLUMN "quickbooking" BOOLEAN NOT NULL DEFAULT false;
```

## Response Format

All endpoints return data in the following format:

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

## Error Format

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": [] // Validation errors if applicable
  }
}
```

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```
