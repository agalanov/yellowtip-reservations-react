import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  Edit,
  Visibility,
  Person,
  AccessTime,
  Spa,
  Work,
} from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { Booking, Therapist } from '../../types';

interface TherapistOverviewProps {
  date: Dayjs;
  viewMode: 'day' | 'week' | 'month';
  bookings: Booking[];
  onEditBooking: (booking: Booking) => void;
  onViewBooking: (booking: Booking) => void;
}

interface TherapistBooking {
  therapist: Therapist;
  bookings: Booking[];
}

const TherapistOverview: React.FC<TherapistOverviewProps> = ({
  date,
  viewMode,
  bookings,
  onEditBooking,
  onViewBooking,
}) => {
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [therapistDialogOpen, setTherapistDialogOpen] = useState(false);

  // Group bookings by therapist
  const therapistBookings = useMemo(() => {
    const therapistMap = new Map<number, TherapistBooking>();
    
    bookings.forEach(booking => {
      if (booking.therapist) {
        const therapistId = booking.therapist.id;
        if (!therapistMap.has(therapistId)) {
          therapistMap.set(therapistId, {
            therapist: booking.therapist,
            bookings: []
          });
        }
        therapistMap.get(therapistId)!.bookings.push(booking);
      }
    });

    return Array.from(therapistMap.values()).sort((a, b) => 
      `${a.therapist.firstName} ${a.therapist.lastName}`.localeCompare(`${b.therapist.firstName} ${b.therapist.lastName}`)
    );
  }, [bookings]);

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBookingColor = (booking: Booking): string => {
    if (booking.cancelled) return '#f44336';
    if (booking.confirmed) return '#4caf50';
    return '#ff9800';
  };

  const calculateWorkload = (therapistBookings: Booking[]): number => {
    const totalMinutes = therapistBookings
      .filter(booking => !booking.cancelled)
      .reduce((total, booking) => total + booking.service.duration, 0);
    
    // Assuming 8-hour work day
    const maxMinutes = 8 * 60;
    return Math.min((totalMinutes / maxMinutes) * 100, 100);
  };

  const getWorkloadColor = (workload: number): 'success' | 'warning' | 'error' => {
    if (workload < 50) return 'success';
    if (workload < 80) return 'warning';
    return 'error';
  };

  const handleTherapistClick = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    setTherapistDialogOpen(true);
  };

  if (viewMode === 'day') {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Therapist Overview - {date.format('dddd, MMMM D, YYYY')}
        </Typography>
        
        <Grid container spacing={2}>
          {therapistBookings.map(({ therapist, bookings: therapistBookingsList }) => {
            const workload = calculateWorkload(therapistBookingsList);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={therapist.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 3 }
                  }}
                  onClick={() => handleTherapistClick(therapist)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {therapist.firstName} {therapist.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Priority: {therapist.priority}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Workload</Typography>
                        <Typography variant="body2">{workload.toFixed(0)}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={workload}
                        color={getWorkloadColor(workload)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {therapistBookingsList.length} booking{therapistBookingsList.length !== 1 ? 's' : ''}
                    </Typography>

                    {therapistBookingsList.length > 0 && (
                      <Box>
                        {therapistBookingsList
                          .sort((a, b) => a.time - b.time)
                          .slice(0, 3)
                          .map((booking) => (
                            <Box
                              key={booking.id}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 1,
                                p: 1,
                                backgroundColor: getBookingColor(booking),
                                color: 'white',
                                borderRadius: 1,
                              }}
                            >
                              <AccessTime sx={{ fontSize: 16, mr: 1 }} />
                              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                {formatTime(booking.time)}
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                {booking.service.name}
                              </Typography>
                            </Box>
                          ))}
                        
                        {therapistBookingsList.length > 3 && (
                          <Typography variant="body2" color="text.secondary">
                            +{therapistBookingsList.length - 3} more...
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Therapist Detail Dialog */}
        <Dialog
          open={therapistDialogOpen}
          onClose={() => setTherapistDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Person sx={{ mr: 1 }} />
              {selectedTherapist?.firstName} {selectedTherapist?.lastName} - {date.format('dddd, MMMM D, YYYY')}
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedTherapist && (
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Workload Summary</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Daily Workload</Typography>
                    <Typography variant="body2">
                      {calculateWorkload(
                        therapistBookings.find(tb => tb.therapist.id === selectedTherapist.id)?.bookings || []
                      ).toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={calculateWorkload(
                      therapistBookings.find(tb => tb.therapist.id === selectedTherapist.id)?.bookings || []
                    )}
                    color={getWorkloadColor(
                      calculateWorkload(
                        therapistBookings.find(tb => tb.therapist.id === selectedTherapist.id)?.bookings || []
                      )
                    )}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Service</TableCell>
                        <TableCell>Room</TableCell>
                        <TableCell>Guest</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {therapistBookings
                        .find(tb => tb.therapist.id === selectedTherapist.id)
                        ?.bookings.sort((a, b) => a.time - b.time)
                        .map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTime sx={{ fontSize: 16, mr: 1 }} />
                                {formatTime(booking.time)}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Spa sx={{ fontSize: 16, mr: 1 }} />
                                {booking.service.name}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Work sx={{ fontSize: 16, mr: 1 }} />
                                {booking.room.name}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Person sx={{ fontSize: 16, mr: 1 }} />
                                {booking.guest.firstName} {booking.guest.lastName}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={booking.cancelled ? 'Cancelled' : booking.confirmed ? 'Confirmed' : 'Pending'}
                                size="small"
                                color={booking.cancelled ? 'error' : booking.confirmed ? 'success' : 'warning'}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="View Details">
                                  <IconButton
                                    size="small"
                                    onClick={() => onViewBooking(booking)}
                                  >
                                    <Visibility />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit Booking">
                                  <IconButton
                                    size="small"
                                    onClick={() => onEditBooking(booking)}
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )) || (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              No bookings for this therapist on this date
                            </TableCell>
                          </TableRow>
                        )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTherapistDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Week/Month view - simplified table
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Therapist Overview - {date.format('MMMM YYYY')}
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Therapist</TableCell>
              <TableCell>Total Bookings</TableCell>
              <TableCell>Confirmed</TableCell>
              <TableCell>Pending</TableCell>
              <TableCell>Cancelled</TableCell>
              <TableCell>Workload</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {therapistBookings.map(({ therapist, bookings: therapistBookingsList }) => {
              const confirmed = therapistBookingsList.filter(b => b.confirmed && !b.cancelled).length;
              const pending = therapistBookingsList.filter(b => !b.confirmed && !b.cancelled).length;
              const cancelled = therapistBookingsList.filter(b => b.cancelled).length;
              const workload = calculateWorkload(therapistBookingsList);

              return (
                <TableRow key={therapist.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, width: 32, height: 32, bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                      {therapist.firstName} {therapist.lastName}
                    </Box>
                  </TableCell>
                  <TableCell>{therapistBookingsList.length}</TableCell>
                  <TableCell>
                    <Chip label={confirmed} size="small" color="success" />
                  </TableCell>
                  <TableCell>
                    <Chip label={pending} size="small" color="warning" />
                  </TableCell>
                  <TableCell>
                    <Chip label={cancelled} size="small" color="error" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 100 }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={workload}
                          color={getWorkloadColor(workload)}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ minWidth: 35 }}>
                        {workload.toFixed(0)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleTherapistClick(therapist)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TherapistOverview;
