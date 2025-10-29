import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
} from '@mui/material';
import {
  CalendarToday,
  Room,
  Person,
  Spa,
  CheckCircle,
  Warning,
  Error,
} from '@mui/icons-material';
import dayjs from 'dayjs';

// Mock data for demonstration
const mockBookings = [
  {
    id: 1,
    date: Math.floor(dayjs().add(1, 'day').valueOf() / 1000),
    time: Math.floor(dayjs().hour(10).minute(0).valueOf() / 1000),
    service: { id: 1, name: 'Deep Tissue Massage', duration: 60, price: 120 },
    room: { id: 1, name: 'Room A' },
    guest: { id: 1, firstName: 'John', lastName: 'Doe' },
    therapist: { id: 1, firstName: 'Jane', lastName: 'Smith' },
    confirmed: true,
    cancelled: false,
    comment: 'Regular client',
  },
  {
    id: 2,
    date: Math.floor(dayjs().add(1, 'day').valueOf() / 1000),
    time: Math.floor(dayjs().hour(14).minute(30).valueOf() / 1000),
    service: { id: 2, name: 'Facial Treatment', duration: 90, price: 150 },
    room: { id: 2, name: 'Room B' },
    guest: { id: 2, firstName: 'Alice', lastName: 'Johnson' },
    therapist: { id: 2, firstName: 'Bob', lastName: 'Wilson' },
    confirmed: false,
    cancelled: false,
    comment: 'First time client',
  },
  {
    id: 3,
    date: Math.floor(dayjs().add(2, 'day').valueOf() / 1000),
    time: Math.floor(dayjs().hour(16).minute(0).valueOf() / 1000),
    service: { id: 3, name: 'Hot Stone Therapy', duration: 75, price: 180 },
    room: { id: 1, name: 'Room A' },
    guest: { id: 3, firstName: 'Mike', lastName: 'Brown' },
    therapist: null,
    confirmed: false,
    cancelled: true,
    comment: 'Client cancelled',
  },
];

const mockQuickBookings = [
  {
    id: 1,
    name: 'Quick Massage',
    service: { id: 1, name: 'Swedish Massage', duration: 60, price: 100 },
    category: { id: 1, name: 'Massage', hexcode: '#4caf50', textcolor: '#ffffff' },
  },
  {
    id: 2,
    name: 'Express Facial',
    service: { id: 2, name: 'Express Facial', duration: 30, price: 80 },
    category: { id: 2, name: 'Facial', hexcode: '#2196f3', textcolor: '#ffffff' },
  },
  {
    id: 3,
    name: 'Spa Package',
    service: { id: 3, name: 'Full Spa Package', duration: 120, price: 250 },
    category: { id: 3, name: 'Package', hexcode: '#ff9800', textcolor: '#ffffff' },
  },
];

const ReservationsDemo: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'overview' | 'rooms' | 'therapists' | 'calendar'>('overview');

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusIcon = (booking: any) => {
    if (booking.cancelled) return <Error color="error" />;
    if (booking.confirmed) return <CheckCircle color="success" />;
    return <Warning color="warning" />;
  };

  const getStatusColor = (booking: any) => {
    if (booking.cancelled) return 'error';
    if (booking.confirmed) return 'success';
    return 'warning';
  };

  const getStatusText = (booking: any) => {
    if (booking.cancelled) return 'Cancelled';
    if (booking.confirmed) return 'Confirmed';
    return 'Pending';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
        Reservations System Demo
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        This is a demonstration of the React MUI TypeScript reservations system converted from PHP.
        The components are fully functional and ready for integration with a backend API.
      </Alert>

      {/* Quick Booking Buttons Demo */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <Spa sx={{ mr: 1, color: 'primary.main' }} />
          Quick Booking Options
        </Typography>
        <Grid container spacing={2}>
          {mockQuickBookings.map((quickBooking) => (
            <Grid item xs={12} sm={6} md={4} key={quickBooking.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: `2px solid ${quickBooking.category.hexcode}`,
                  '&:hover': { boxShadow: 3 },
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 1 }}>
                    <Chip
                      label={quickBooking.category.name}
                      size="small"
                      sx={{
                        backgroundColor: quickBooking.category.hexcode,
                        color: quickBooking.category.textcolor,
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {quickBooking.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {quickBooking.service.duration} min • ${quickBooking.service.price}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* View Selection */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, justifyContent: 'center' }}>
        <Button
          variant={selectedView === 'overview' ? 'contained' : 'outlined'}
          onClick={() => setSelectedView('overview')}
        >
          Overview
        </Button>
        <Button
          variant={selectedView === 'rooms' ? 'contained' : 'outlined'}
          onClick={() => setSelectedView('rooms')}
        >
          Rooms
        </Button>
        <Button
          variant={selectedView === 'therapists' ? 'contained' : 'outlined'}
          onClick={() => setSelectedView('therapists')}
        >
          Therapists
        </Button>
        <Button
          variant={selectedView === 'calendar' ? 'contained' : 'outlined'}
          onClick={() => setSelectedView('calendar')}
        >
          Calendar
        </Button>
      </Box>

      {/* Bookings List */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
          Recent Bookings
        </Typography>
        
        <Grid container spacing={2}>
          {mockBookings.map((booking) => (
            <Grid item xs={12} sm={6} md={4} key={booking.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                      {booking.service.name}
                    </Typography>
                    <Chip
                      icon={getStatusIcon(booking)}
                      label={getStatusText(booking)}
                      size="small"
                      color={getStatusColor(booking)}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(booking.date)} at {formatTime(booking.time)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Person sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {booking.guest.firstName} {booking.guest.lastName}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Room sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {booking.room.name}
                    </Typography>
                  </Box>
                  
                  {booking.therapist && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Spa sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {booking.therapist.firstName} {booking.therapist.lastName}
                      </Typography>
                    </Box>
                  )}
                  
                  <Typography variant="body2" color="text.secondary">
                    ${booking.service.price} • {booking.service.duration} min
                  </Typography>
                  
                  {booking.comment && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                      "{booking.comment}"
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Features List */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          System Features
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <CalendarToday sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Calendar Views</Typography>
              <Typography variant="body2" color="text.secondary">
                Day, Week, and Month views with interactive booking management
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Room sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Room Management</Typography>
              <Typography variant="body2" color="text.secondary">
                Track room availability and booking occupancy
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Person sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Therapist Tracking</Typography>
              <Typography variant="body2" color="text.secondary">
                Monitor therapist workload and schedule optimization
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Spa sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Quick Booking</Typography>
              <Typography variant="body2" color="text.secondary">
                One-click booking with predefined service templates
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ReservationsDemo;
