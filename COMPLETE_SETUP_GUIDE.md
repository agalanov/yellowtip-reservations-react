# Complete Setup Guide - Myolika Reservations System

## Overview

This guide provides complete setup instructions for the Myolika Reservations system that has been converted from PHP to React MUI TypeScript with a Node.js/Express backend.

## System Architecture

- **Frontend**: React 18 + TypeScript + Material-UI v7
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT tokens

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Quick Start

### 1. Backend Setup

```bash
cd yellowtip-reservations-react/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your database credentials

# Run database migration
npx prisma migrate dev --name add_quick_booking_field

# Seed the database
npx prisma db seed

# Start backend server
npm run dev
```

### 2. Frontend Setup

```bash
cd yellowtip-reservations-react/frontend

# Install dependencies
npm install

# Start frontend development server
npm start
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

## Environment Configuration

### Backend (.env)

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

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:3001/api
```

## Database Schema

### New Features Added

1. **Quick Booking Field**: Added `quickbooking` boolean field to services table
2. **Reservation Endpoints**: New API endpoints for reservation management
3. **Enhanced Types**: Updated TypeScript interfaces for better type safety

### Migration Details

The system includes a migration that adds the `quickbooking` field to the `ytr_service` table:

```sql
ALTER TABLE "ytr_service" ADD COLUMN "quickbooking" BOOLEAN NOT NULL DEFAULT false;
```

## API Endpoints

### New Reservation Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reservations/overview` | Get comprehensive reservation data |
| GET | `/api/reservations/quick-booking` | Get quick booking options |
| GET | `/api/reservations/rooms` | Get room overview |
| GET | `/api/reservations/therapists` | Get therapist overview |
| GET | `/api/reservations/calendar` | Get calendar view |

### Existing Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User authentication |
| GET | `/api/bookings` | Get all bookings |
| POST | `/api/bookings` | Create new booking |
| PUT | `/api/bookings/:id` | Update booking |
| DELETE | `/api/bookings/:id` | Delete booking |
| GET | `/api/rooms` | Get all rooms |
| GET | `/api/services` | Get all services |
| GET | `/api/guests` | Get all guests |
| GET | `/api/therapists` | Get all therapists |

## Frontend Components

### New Components Created

1. **ReservationsOverview** - Main container component
2. **RoomOverview** - Room-specific booking display
3. **TherapistOverview** - Therapist-specific booking display
4. **BookingCalendar** - Calendar view with day/week/month modes
5. **QuickBookingButtons** - Quick booking functionality
6. **BookingDialog** - Create/edit booking dialog
7. **ReservationsDemo** - Demo component with mock data

### Component Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Material-UI v7**: Modern, accessible UI components
- **TypeScript**: Full type safety
- **Date/Time Handling**: Using dayjs for consistent date management
- **State Management**: React hooks for local state
- **API Integration**: Axios with React Query for data fetching

## Testing the System

### 1. Backend Testing

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"loginId": "admin", "password": "admin123"}'

# Test reservations overview (with token)
curl -H "Authorization: Bearer <your-token>" \
  "http://localhost:3001/api/reservations/overview?date=2024-01-15&viewMode=day"
```

### 2. Frontend Testing

1. Navigate to http://localhost:3000
2. Login with admin credentials (admin/admin123)
3. Navigate to "Reservations" in the sidebar
4. Test different view modes (Day, Week, Month)
5. Test quick booking functionality
6. Test create/edit booking dialogs

## Development Workflow

### Backend Development

```bash
# Watch mode for development
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

### Frontend Development

```bash
# Development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Database Management

### Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

### Seed Data

The system includes comprehensive seed data:

- Admin user (admin/admin123)
- Sample rooms, services, therapists, guests
- Quick booking services
- Payment types and cancellation reasons
- Access rights and roles

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL in .env file
   - Ensure PostgreSQL is running
   - Verify database exists

2. **Migration Errors**
   - Run `npx prisma migrate reset` to reset
   - Check for conflicting migrations

3. **Frontend Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify all dependencies are installed

4. **API Authentication Errors**
   - Check JWT_SECRET in .env
   - Verify token format in requests
   - Check token expiration

### Logs

- **Backend**: Check console output for errors
- **Frontend**: Check browser console and network tab
- **Database**: Check PostgreSQL logs

## Production Deployment

### Backend Deployment

1. Set NODE_ENV=production
2. Configure production database
3. Set secure JWT_SECRET
4. Build and deploy with PM2 or similar

### Frontend Deployment

1. Build production bundle: `npm run build`
2. Deploy to static hosting (Netlify, Vercel, etc.)
3. Configure environment variables

### Database Deployment

1. Run migrations on production database
2. Seed initial data if needed
3. Configure backup strategy

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review API documentation
3. Check component documentation
4. Review database schema

## File Structure

```
yellowtip-reservations-react/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── reservations.ts      # New reservation endpoints
│   │   ├── types/
│   │   │   └── index.ts             # Updated with reservation types
│   │   └── index.ts                 # Updated with new routes
│   ├── prisma/
│   │   ├── schema.prisma            # Updated with quickBooking field
│   │   ├── migrations/              # New migration files
│   │   └── seed.ts                  # Updated with quick booking data
│   └── RESERVATIONS_SETUP.md        # Backend setup guide
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── reservations/        # New reservation components
│   │   ├── pages/
│   │   │   └── ReservationsOverview.tsx
│   │   ├── types/
│   │   │   └── index.ts             # Updated types
│   │   └── services/
│   │       └── api.ts               # Updated with new endpoints
│   └── package.json
├── RESERVATIONS_API_DOCUMENTATION.md
└── COMPLETE_SETUP_GUIDE.md
```

This completes the full setup and migration of the Myolika Reservations system from PHP to React MUI TypeScript with a modern backend API.

