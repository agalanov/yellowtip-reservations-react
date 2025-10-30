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
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit,
  Visibility,
  Person,
  AccessTime,
  Room as RoomIcon,
  Spa,
} from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { Booking, Room } from '../../types';

interface RoomOverviewProps {
  date: Dayjs;
  viewMode: 'day' | 'week' | 'month';
  bookings: Booking[];
  onEditBooking: (booking: Booking) => void;
  onViewBooking: (booking: Booking) => void;
}

interface RoomBooking {
  room: Pick<Room, 'id' | 'name'>;
  bookings: Booking[];
}

const RoomOverview: React.FC<RoomOverviewProps> = ({
  date,
  viewMode,
  bookings,
  onEditBooking,
  onViewBooking,
}) => {
  const [selectedRoom, setSelectedRoom] = useState<Pick<Room, 'id' | 'name'> | null>(null);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>([]);

  // Group bookings by room
  const roomBookings = useMemo(() => {
    const roomMap = new Map<number, RoomBooking>();
    
    bookings.forEach(booking => {
      const roomId = booking.room.id;
      if (!roomMap.has(roomId)) {
        roomMap.set(roomId, {
          room: booking.room,
          bookings: []
        });
      }
      roomMap.get(roomId)!.bookings.push(booking);
    });

    return Array.from(roomMap.values()).sort((a, b) => a.room.name.localeCompare(b.room.name));
  }, [bookings]);

  // Generate time slots for the day
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8; // 8 AM
    const endHour = 22; // 10 PM
    const slotDuration = 30; // 30 minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endMinute = minute + slotDuration;
        const endHourAdjusted = endMinute >= 60 ? hour + 1 : hour;
        const endMinuteAdjusted = endMinute >= 60 ? endMinute - 60 : endMinute;
        const endTime = `${endHourAdjusted.toString().padStart(2, '0')}:${endMinuteAdjusted.toString().padStart(2, '0')}`;
        
        slots.push({ start: startTime, end: endTime });
      }
    }
    return slots;
  };

  const getBookingForTimeSlot = (room: Room, timeSlot: { start: string; end: string }) => {
    const slotStart = dayjs(`${date.format('YYYY-MM-DD')} ${timeSlot.start}`);
    const slotEnd = dayjs(`${date.format('YYYY-MM-DD')} ${timeSlot.end}`);
    
    return roomBookings
      .find(rb => rb.room.id === room.id)
      ?.bookings.find(booking => {
        const bookingStart = dayjs(booking.date * 1000).add(booking.time, 'seconds');
        const bookingEnd = bookingStart.add(booking.service.duration, 'minutes');
        
        return bookingStart.isBefore(slotEnd) && bookingEnd.isAfter(slotStart);
      });
  };

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

  const handleRoomClick = (room: Pick<Room, 'id' | 'name'>) => {
    setSelectedRoom(room);
    setTimeSlots(generateTimeSlots());
    setRoomDialogOpen(true);
  };

  if (viewMode === 'day') {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Room Overview - {date.format('dddd, MMMM D, YYYY')}
        </Typography>
        
        <Grid container spacing={2}>
          {roomBookings.map(({ room, bookings: roomBookingsList }) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={room.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 3 }
                }}
                onClick={() => handleRoomClick(room)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <RoomIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">{room.name}</Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {roomBookingsList.length} booking{roomBookingsList.length !== 1 ? 's' : ''}
                  </Typography>

                  {roomBookingsList.length > 0 && (
                    <Box>
                      {roomBookingsList
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
                      
                      {roomBookingsList.length > 3 && (
                        <Typography variant="body2" color="text.secondary">
                          +{roomBookingsList.length - 3} more...
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Room Detail Dialog */}
        <Dialog
          open={roomDialogOpen}
          onClose={() => setRoomDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <RoomIcon sx={{ mr: 1 }} />
              {selectedRoom?.name} - {date.format('dddd, MMMM D, YYYY')}
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedRoom && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Guest</TableCell>
                      <TableCell>Therapist</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roomBookings
                      .find(rb => rb.room.id === selectedRoom.id)
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
                              <Person sx={{ fontSize: 16, mr: 1 }} />
                              {booking.guest.firstName} {booking.guest.lastName}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {booking.therapist ? (
                              `${booking.therapist.firstName} ${booking.therapist.lastName}`
                            ) : (
                              <Chip label="Not assigned" size="small" color="default" />
                            )}
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
                            No bookings for this room on this date
                          </TableCell>
                        </TableRow>
                      )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRoomDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Week/Month view - simplified table
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Room Overview - {date.format('MMMM YYYY')}
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Room</TableCell>
              <TableCell>Total Bookings</TableCell>
              <TableCell>Confirmed</TableCell>
              <TableCell>Pending</TableCell>
              <TableCell>Cancelled</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roomBookings.map(({ room, bookings: roomBookingsList }) => {
              const confirmed = roomBookingsList.filter(b => b.confirmed && !b.cancelled).length;
              const pending = roomBookingsList.filter(b => !b.confirmed && !b.cancelled).length;
              const cancelled = roomBookingsList.filter(b => b.cancelled).length;

              return (
                <TableRow key={room.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <RoomIcon sx={{ mr: 1, color: 'primary.main' }} />
                      {room.name}
                    </Box>
                  </TableCell>
                  <TableCell>{roomBookingsList.length}</TableCell>
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
                    <Button
                      size="small"
                      onClick={() => handleRoomClick(room)}
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

export default RoomOverview;
