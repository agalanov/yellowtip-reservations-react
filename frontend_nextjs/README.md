# YellowTip Reservations - Next.js Frontend

This is the Next.js version of the YellowTip Reservations frontend application.

## Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Material-UI (MUI)** for UI components
- **React Query** for data fetching
- **Client-side authentication** with JWT tokens

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend NestJS server running (see `../backend_nestjs`)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## Docker

### Development with Docker Compose

```bash
# From the frontend_nextjs directory
docker-compose up -d

# Or from the root directory
cd ..
docker-compose -f frontend_nextjs/docker-compose.yml up -d
```

This will start:
- PostgreSQL database on port 5437
- Redis on port 6380
- NestJS backend on port 3001
- Next.js frontend on port 3000

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Project Structure

```
frontend_nextjs/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── dashboard/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── components/       # React components
│   ├── contexts/         # React contexts (AuthContext)
│   ├── lib/              # Utilities and API service
│   ├── types/            # TypeScript type definitions
│   └── theme.ts          # MUI theme configuration
├── public/               # Static assets
├── package.json
└── next.config.js
```

## Pages

- `/login` - Login page
- `/dashboard` - Main dashboard
- `/bookings` - Bookings management
- `/reservations` - Reservations overview
- `/rooms` - Rooms management
- `/services` - Services management
- `/guests` - Guests management
- `/therapists` - Therapists management
- `/admin/*` - Admin pages

## API Integration

The frontend connects to the NestJS backend API at `http://localhost:3001/api`.

All API calls are handled through the `apiService` in `src/lib/api.ts`.

## Authentication

Authentication is handled client-side using:
- JWT tokens stored in `localStorage`
- `AuthContext` for global state management
- Protected routes via middleware

## Development Notes

- All pages are client components (use `'use client'` directive)
- Server components are not used to maintain compatibility with existing React components
- MUI components work with Next.js App Router via `AppRouterCacheProvider`




