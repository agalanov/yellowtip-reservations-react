# Reservations System Components

This directory contains React MUI TypeScript components for the reservations system, converted from the original PHP application.

## Components Overview

### Main Components

1. **ReservationsOverview** (`../pages/ReservationsOverview.tsx`)
   - Main page component that orchestrates the entire reservations system
   - Features tabbed interface with Room Overview, Therapist Overview, and Calendar View
   - Includes quick booking buttons and floating action button for new bookings
   - Handles date selection and view mode switching (day/week/month)

2. **RoomOverview** (`RoomOverview.tsx`)
   - Displays bookings organized by room
   - Shows room availability and booking details
   - Supports both card view (day) and table view (week/month)
   - Includes room detail dialog with time slot visualization

3. **TherapistOverview** (`TherapistOverview.tsx`)
   - Displays bookings organized by therapist
   - Shows therapist workload with progress indicators
   - Calculates and displays work efficiency metrics
   - Supports both card view (day) and table view (week/month)

4. **BookingCalendar** (`BookingCalendar.tsx`)
   - Calendar component with day, week, and month views
   - Interactive time slot booking visualization
   - Event click handlers for viewing/editing bookings
   - Responsive design for different screen sizes

5. **QuickBookingButtons** (`QuickBookingButtons.tsx`)
   - Displays quick booking options with service categories
   - Color-coded buttons based on service categories
   - Shows service duration and pricing information
   - One-click booking initiation

6. **BookingDialog** (`BookingDialog.tsx`)
   - Modal dialog for creating, editing, and viewing bookings
   - Form validation and data binding
   - Support for all booking fields (date, time, service, room, guest, therapist)
   - Read-only mode for viewing existing bookings

## Features

### Calendar Views
- **Day View**: Detailed hourly time slots with booking visualization
- **Week View**: 7-day grid with compact booking cards
- **Month View**: Monthly calendar with booking chips

### Booking Management
- Create new bookings with full form validation
- Edit existing bookings with pre-populated data
- View booking details in read-only mode
- Quick booking from predefined service templates

### Data Visualization
- Room occupancy tracking
- Therapist workload monitoring
- Service category color coding
- Status indicators (confirmed, pending, cancelled)

### Responsive Design
- Mobile-friendly interface
- Adaptive layouts for different screen sizes
- Touch-friendly controls
- Optimized for tablet and desktop use

## Usage

### Basic Implementation

```tsx
import ReservationsOverview from '../pages/ReservationsOverview';

function App() {
  return (
    <ReservationsOverview />
  );
}
```

### With Custom Props

```tsx
<ReservationsOverview
  initialDate={dayjs('2024-01-15')}
  defaultViewMode="week"
  onBookingCreate={handleBookingCreate}
  onBookingUpdate={handleBookingUpdate}
/>
```

## API Integration

The components expect the following API endpoints:

- `GET /api/reservations` - Get reservations data
- `GET /api/reservations/quick-booking` - Get quick booking options
- `GET /api/rooms` - Get rooms list
- `GET /api/services` - Get services list
- `GET /api/guests` - Get guests list
- `GET /api/therapists` - Get therapists list
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

## Styling

Components use Material-UI theming and can be customized through:

- Theme provider configuration
- Custom CSS classes
- Component-specific styling props
- Responsive breakpoints

## Dependencies

- React 19.2.0+
- Material-UI 7.3.4+
- Material-UI X Date Pickers 8.15.0+
- Day.js 1.11.18+
- React Query 5.90.5+
- TypeScript 4.9.5+

## Migration from PHP

This React implementation provides feature parity with the original PHP system:

- ✅ Calendar overview with multiple view modes
- ✅ Room-based booking management
- ✅ Therapist workload tracking
- ✅ Quick booking functionality
- ✅ Booking creation/editing/viewing
- ✅ Responsive design
- ✅ Real-time data updates
- ✅ Form validation
- ✅ Status management

## Future Enhancements

- Drag-and-drop booking rescheduling
- Recurring booking templates
- Advanced filtering and search
- Export functionality
- Print-friendly views
- Mobile app integration
- Real-time notifications
