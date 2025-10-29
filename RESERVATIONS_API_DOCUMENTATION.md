# Reservations System API Documentation

## Overview

This document describes the backend API endpoints for the YellowTip Reservations system, which has been converted from PHP to React MUI TypeScript with a Node.js/Express backend.

## Base URL

```
http://localhost:3001/api
```

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## New Reservation Endpoints

### 1. Get Reservations Overview

**GET** `/reservations/overview`

Returns comprehensive reservation data including bookings, rooms, therapists, services, and quick booking options.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | No | ISO date string (e.g., "2024-01-15") |
| `viewMode` | string | No | View mode: "day", "week", or "month" |
| `roomId` | number | No | Filter by specific room ID |
| `therapistId` | number | No | Filter by specific therapist ID |
| `serviceId` | number | No | Filter by specific service ID |

#### Example Request

```bash
GET /api/reservations/overview?date=2024-01-15&viewMode=day
```

#### Response

```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": 1,
        "date": 1705276800,
        "time": 1705280400,
        "service": {
          "id": 1,
          "name": "Deep Tissue Massage",
          "duration": 60,
          "price": 120,
          "category": {
            "hexcode": "#4caf50",
            "textcolor": "#ffffff"
          }
        },
        "room": {
          "id": 1,
          "name": "Room A"
        },
        "guest": {
          "id": 1,
          "firstName": "John",
          "lastName": "Doe"
        },
        "therapist": {
          "id": 1,
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "confirmed": true,
        "cancelled": false,
        "comment": "Regular client",
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "rooms": [
      {
        "id": 1,
        "name": "Room A",
        "description": "Spa room with massage table",
        "priority": 5,
        "active": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "therapists": [
      {
        "id": 1,
        "firstName": "Jane",
        "lastName": "Smith",
        "priority": 5,
        "attributes": [],
        "services": [
          {
            "id": 1,
            "name": "Deep Tissue Massage"
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "services": [
      {
        "id": 1,
        "category": {
          "id": 1,
          "name": "Massage",
          "hexcode": "#4caf50",
          "textcolor": "#ffffff"
        },
        "currency": {
          "id": 1,
          "code": "USD",
          "symbol": "$"
        },
        "name": "Deep Tissue Massage",
        "description": "Intensive massage therapy",
        "price": 120,
        "duration": 60,
        "active": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "quickBookings": [
      {
        "id": 2,
        "name": "Quick Massage",
        "service": {
          "id": 2,
          "name": "Quick Massage",
          "duration": 30,
          "price": 40
        },
        "category": {
          "id": 1,
          "name": "Massage",
          "hexcode": "#4caf50",
          "textcolor": "#ffffff"
        }
      }
    ]
  }
}
```

### 2. Get Quick Booking Options

**GET** `/reservations/quick-booking`

Returns services marked for quick booking.

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "name": "Quick Massage",
      "service": {
        "id": 2,
        "name": "Quick Massage",
        "duration": 30,
        "price": 40
      },
      "category": {
        "id": 1,
        "name": "Massage",
        "hexcode": "#4caf50",
        "textcolor": "#ffffff"
      }
    }
  ]
}
```

### 3. Get Room Overview

**GET** `/reservations/rooms`

Returns room-specific booking data.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | No | ISO date string |
| `viewMode` | string | No | View mode: "day", "week", or "month" |
| `roomId` | number | No | Filter by specific room ID |

#### Response

```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": 1,
        "name": "Room A",
        "description": "Spa room with massage table",
        "priority": 5,
        "active": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "bookings": [
      // Array of bookings for the specified rooms
    ]
  }
}
```

### 4. Get Therapist Overview

**GET** `/reservations/therapists`

Returns therapist-specific booking data.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | No | ISO date string |
| `viewMode` | string | No | View mode: "day", "week", or "month" |
| `therapistId` | number | No | Filter by specific therapist ID |

#### Response

```json
{
  "success": true,
  "data": {
    "therapists": [
      {
        "id": 1,
        "firstName": "Jane",
        "lastName": "Smith",
        "priority": 5,
        "attributes": [],
        "services": [
          {
            "id": 1,
            "name": "Deep Tissue Massage"
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "bookings": [
      // Array of bookings for the specified therapists
    ]
  }
}
```

### 5. Get Calendar View

**GET** `/reservations/calendar`

Returns booking data optimized for calendar display.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | No | ISO date string |
| `viewMode` | string | No | View mode: "day", "week", or "month" |
| `roomId` | number | No | Filter by specific room ID |
| `therapistId` | number | No | Filter by specific therapist ID |
| `serviceId` | number | No | Filter by specific service ID |

#### Response

```json
{
  "success": true,
  "data": {
    "bookings": [
      // Array of bookings for calendar display
    ]
  }
}
```

## Database Schema Changes

### New Field Added to Service Table

The `ytr_service` table now includes a `quickbooking` field:

```sql
ALTER TABLE "ytr_service" ADD COLUMN "quickbooking" BOOLEAN NOT NULL DEFAULT false;
```

This field marks services as available for quick booking functionality.

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": [
      {
        "field": "date",
        "message": "Date must be a valid ISO date"
      }
    ]
  }
}
```

## Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid or missing token)
- `404` - Not Found
- `500` - Internal Server Error

## Frontend Integration

The frontend React components are designed to work seamlessly with these API endpoints:

- `ReservationsOverview` - Main container component
- `RoomOverview` - Room-specific booking display
- `TherapistOverview` - Therapist-specific booking display
- `BookingCalendar` - Calendar view component
- `QuickBookingButtons` - Quick booking functionality
- `BookingDialog` - Create/edit booking dialog

## Setup Instructions

1. **Environment Setup**: Create a `.env` file with database connection details
2. **Database Migration**: Run `npx prisma migrate dev --name add_quick_booking_field`
3. **Seed Data**: Run `npx prisma db seed` to populate initial data
4. **Start Server**: Run `npm run dev` to start the backend server

## Testing

You can test the API endpoints using tools like Postman or curl:

```bash
# Get reservations overview
curl -H "Authorization: Bearer <your-token>" \
  "http://localhost:3001/api/reservations/overview?date=2024-01-15&viewMode=day"

# Get quick booking options
curl -H "Authorization: Bearer <your-token>" \
  "http://localhost:3001/api/reservations/quick-booking"
```

