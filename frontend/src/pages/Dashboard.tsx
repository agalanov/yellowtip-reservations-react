import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CalendarToday,
  Person,
  Spa,
  Room,
  TrendingUp,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import apiService from '../services/api';
import { DashboardStats } from '../types';

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 1,
            backgroundColor: color,
            color: 'white',
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiService.getDashboardStats(),
    retry: 1,
    onError: (error) => {
      console.error('Dashboard data fetch error:', error);
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    // Extract error message from axios error or standard error
    let errorMessage = 'Failed to load dashboard data';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      // Handle axios errors
      const axiosError = error as any;
      if (axiosError.response) {
        errorMessage = `Server error: ${axiosError.response.status} - ${axiosError.response.data?.message || axiosError.response.statusText}`;
      } else if (axiosError.request) {
        errorMessage = 'Network error: Unable to reach the server. Please check if the backend is running.';
      } else {
        errorMessage = axiosError.message || 'Unknown error occurred';
      }
    }
    
    console.error('Dashboard error details:', error);
    
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        <Typography variant="body1" component="div" sx={{ fontWeight: 'bold' }}>
          Failed to load dashboard data
        </Typography>
        <Typography variant="body2" component="div" sx={{ mt: 1 }}>
          {errorMessage}
        </Typography>
        <Typography variant="caption" component="div" sx={{ mt: 1, fontStyle: 'italic' }}>
          Please check:
          <ul style={{ marginTop: '8px', marginBottom: '0', paddingLeft: '20px' }}>
            <li>Backend server is running on port 3001</li>
            <li>You are authenticated (check login status)</li>
            <li>API endpoint /api/admin/dashboard is accessible</li>
            <li>Check browser console for more details</li>
          </ul>
        </Typography>
      </Alert>
    );
  }

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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Today's Bookings"
            value={stats?.todayBookings || 0}
            icon={<CalendarToday />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Active Bookings"
            value={stats?.totalActiveBookings || 0}
            icon={<TrendingUp />}
            color="#388e3c"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Total Guests"
            value={stats?.totalGuests || 0}
            icon={<Person />}
            color="#f57c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Therapists"
            value={stats?.totalTherapists || 0}
            icon={<Spa />}
            color="#7b1fa2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Rooms"
            value={stats?.totalRooms || 0}
            icon={<Room />}
            color="#d32f2f"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Services"
            value={stats?.totalServices || 0}
            icon={<Spa />}
            color="#455a64"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Bookings
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Room</TableCell>
                      <TableCell>Guest</TableCell>
                      <TableCell>Therapist</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats?.recentBookings?.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{formatDate(booking.date)}</TableCell>
                        <TableCell>{formatTime(booking.time)}</TableCell>
                        <TableCell>{booking.service.name}</TableCell>
                        <TableCell>{booking.room.name}</TableCell>
                        <TableCell>
                          {booking.guest.firstName} {booking.guest.lastName}
                        </TableCell>
                        <TableCell>
                          {booking.therapist ? (
                            `${booking.therapist.firstName} ${booking.therapist.lastName}`
                          ) : (
                            <Chip label="Not assigned" size="small" color="default" />
                          )}
                        </TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No recent bookings
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
