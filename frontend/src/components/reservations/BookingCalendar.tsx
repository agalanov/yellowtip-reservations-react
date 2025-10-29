import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import {
  Edit,
  Visibility,
  Person,
  AccessTime,
  Room,
  Spa,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { Booking } from '../../types';

interface BookingCalendarProps {
  date: Dayjs;
  viewMode: 'day' | 'week' | 'month';
  bookings: Booking[];
  onEditBooking: (booking: Booking) => void;
  onViewBooking: (booking: Booking) => void;
}

interface CalendarEvent {
  booking: Booking;
  start: Dayjs;
  end: Dayjs;
  duration: number;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  date,
  viewMode,
  bookings,
  onEditBooking,
  onViewBooking,
}) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(date);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  // Generate calendar events
  const calendarEvents = useMemo(() => {
    return bookings.map(booking => {
      const start = dayjs(booking.date * 1000).add(booking.time, 'seconds');
      const end = start.add(booking.service.duration, 'minutes');
      
      return {
        booking,
        start,
        end,
        duration: booking.service.duration,
      };
    });
  }, [bookings]);

  // Generate calendar days for the current view
  const calendarDays = useMemo(() => {
    const days = [];
    
    if (viewMode === 'day') {
      days.push(selectedDate);
    } else if (viewMode === 'week') {
      const startOfWeek = selectedDate.startOf('week');
      for (let i = 0; i < 7; i++) {
        days.push(startOfWeek.add(i, 'day'));
      }
    } else if (viewMode === 'month') {
      const startOfMonth = selectedDate.startOf('month');
      const startOfWeek = startOfMonth.startOf('week');
      const endOfMonth = selectedDate.endOf('month');
      const endOfWeek = endOfMonth.endOf('week');
      
      let current = startOfWeek;
      while (current.isBefore(endOfWeek) || current.isSame(endOfWeek, 'day')) {
        days.push(current);
        current = current.add(1, 'day');
      }
    }
    
    return days;
  }, [selectedDate, viewMode]);

  // Get events for a specific day
  const getEventsForDay = (day: Dayjs): CalendarEvent[] => {
    return calendarEvents.filter(event => 
      event.start.isSame(day, 'day')
    ).sort((a, b) => a.start.diff(b.start));
  };

  // Get events for a specific time slot
  const getEventsForTimeSlot = (day: Dayjs, hour: number): CalendarEvent[] => {
    const dayStart = day.hour(hour).minute(0);
    const dayEnd = day.hour(hour + 1).minute(0);
    
    return calendarEvents.filter(event => 
      event.start.isSame(day, 'day') &&
      event.start.isBefore(dayEnd) &&
      event.end.isAfter(dayStart)
    );
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

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  const handlePreviousPeriod = () => {
    if (viewMode === 'day') {
      setSelectedDate(selectedDate.subtract(1, 'day'));
    } else if (viewMode === 'week') {
      setSelectedDate(selectedDate.subtract(1, 'week'));
    } else if (viewMode === 'month') {
      setSelectedDate(selectedDate.subtract(1, 'month'));
    }
  };

  const handleNextPeriod = () => {
    if (viewMode === 'day') {
      setSelectedDate(selectedDate.add(1, 'day'));
    } else if (viewMode === 'week') {
      setSelectedDate(selectedDate.add(1, 'week'));
    } else if (viewMode === 'month') {
      setSelectedDate(selectedDate.add(1, 'month'));
    }
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {selectedDate.format('dddd, MMMM D, YYYY')}
          </Typography>
          <Box>
            <IconButton onClick={handlePreviousPeriod}>
              <ChevronLeft />
            </IconButton>
            <IconButton onClick={handleNextPeriod}>
              <ChevronRight />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={1}>
          {hours.map(hour => {
            const hourEvents = getEventsForTimeSlot(selectedDate, hour);
            
            return (
              <Grid size={12} key={hour}>
                <Box sx={{ display: 'flex', minHeight: 60 }}>
                  <Box sx={{ width: 80, display: 'flex', alignItems: 'center', pr: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {hour.toString().padStart(2, '0')}:00
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1, position: 'relative' }}>
                    {hourEvents.map((event, index) => (
                      <Card
                        key={event.booking.id}
                        sx={{
                          position: 'absolute',
                          top: `${index * 60}px`,
                          left: 0,
                          right: 0,
                          height: `${Math.max(30, event.duration * 0.5)}px`,
                          backgroundColor: getBookingColor(event.booking),
                          color: 'white',
                          cursor: 'pointer',
                          '&:hover': { boxShadow: 3 },
                          zIndex: 1,
                        }}
                        onClick={() => handleEventClick(event)}
                      >
                        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                            {formatTime(event.booking.time)}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                            {event.booking.service.name}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                            {event.booking.guest.firstName} {event.booking.guest.lastName}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  const renderWeekView = () => {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Week of {selectedDate.startOf('week').format('MMM D, YYYY')}
          </Typography>
          <Box>
            <IconButton onClick={handlePreviousPeriod}>
              <ChevronLeft />
            </IconButton>
            <IconButton onClick={handleNextPeriod}>
              <ChevronRight />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={1}>
          {calendarDays.map((day, index) => {
            const events = getEventsForDay(day);
            const isToday = day.isSame(dayjs(), 'day');
            
            return (
              <Grid size={{ xs: 12, sm: 6, md: 12/7 }} key={day.format('YYYY-MM-DD')}>
                <Paper 
                  sx={{ 
                    p: 1, 
                    minHeight: 200,
                    backgroundColor: isToday ? 'primary.50' : 'background.paper',
                    border: isToday ? 2 : 1,
                    borderColor: isToday ? 'primary.main' : 'divider',
                  }}
                >
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: isToday ? 'bold' : 'normal',
                      color: isToday ? 'primary.main' : 'text.primary',
                      mb: 1 
                    }}
                  >
                    {day.format('ddd, MMM D')}
                  </Typography>
                  
                  {events.map((event) => (
                    <Card
                      key={event.booking.id}
                      sx={{
                        mb: 0.5,
                        backgroundColor: getBookingColor(event.booking),
                        color: 'white',
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 2 },
                      }}
                      onClick={() => handleEventClick(event)}
                    >
                      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                        <Typography variant="body2" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                          {formatTime(event.booking.time)}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.65rem' }}>
                          {event.booking.service.name}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.65rem' }}>
                          {event.booking.guest.firstName} {event.booking.guest.lastName}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  const renderMonthView = () => {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {selectedDate.format('MMMM YYYY')}
          </Typography>
          <Box>
            <IconButton onClick={handlePreviousPeriod}>
              <ChevronLeft />
            </IconButton>
            <IconButton onClick={handleNextPeriod}>
              <ChevronRight />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={1}>
          {calendarDays.map((day, index) => {
            const events = getEventsForDay(day);
            const isToday = day.isSame(dayjs(), 'day');
            const isCurrentMonth = day.isSame(selectedDate, 'month');
            
            return (
              <Grid size={{ xs: 12, sm: 6, md: 12/7 }} key={day.format('YYYY-MM-DD')}>
                <Paper 
                  sx={{ 
                    p: 1, 
                    minHeight: 120,
                    backgroundColor: isToday ? 'primary.50' : isCurrentMonth ? 'background.paper' : 'grey.100',
                    border: isToday ? 2 : 1,
                    borderColor: isToday ? 'primary.main' : 'divider',
                    opacity: isCurrentMonth ? 1 : 0.6,
                  }}
                >
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: isToday ? 'bold' : 'normal',
                      color: isToday ? 'primary.main' : 'text.primary',
                      mb: 1 
                    }}
                  >
                    {day.format('D')}
                  </Typography>
                  
                  {events.slice(0, 3).map((event) => (
                    <Chip
                      key={event.booking.id}
                      label={`${formatTime(event.booking.time)} ${event.booking.service.name}`}
                      size="small"
                      sx={{
                        mb: 0.5,
                        backgroundColor: getBookingColor(event.booking),
                        color: 'white',
                        fontSize: '0.65rem',
                        height: 20,
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 2 },
                      }}
                      onClick={() => handleEventClick(event)}
                    />
                  ))}
                  
                  {events.length > 3 && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      +{events.length - 3} more
                    </Typography>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      {viewMode === 'day' && renderDayView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'month' && renderMonthView()}

      {/* Event Detail Dialog */}
      <Dialog
        open={eventDialogOpen}
        onClose={() => setEventDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTime sx={{ mr: 1 }} />
            Booking Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell>{selectedEvent.start.format('dddd, MMMM D, YYYY')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Time</strong></TableCell>
                    <TableCell>{formatTime(selectedEvent.booking.time)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Service</strong></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Spa sx={{ fontSize: 16, mr: 1 }} />
                        {selectedEvent.booking.service.name}
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Room</strong></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Room sx={{ fontSize: 16, mr: 1 }} />
                        {selectedEvent.booking.room.name}
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Guest</strong></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ fontSize: 16, mr: 1 }} />
                        {selectedEvent.booking.guest.firstName} {selectedEvent.booking.guest.lastName}
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Therapist</strong></TableCell>
                    <TableCell>
                      {selectedEvent.booking.therapist ? (
                        `${selectedEvent.booking.therapist.firstName} ${selectedEvent.booking.therapist.lastName}`
                      ) : (
                        'Not assigned'
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell>
                      <Chip
                        label={selectedEvent.booking.cancelled ? 'Cancelled' : selectedEvent.booking.confirmed ? 'Confirmed' : 'Pending'}
                        size="small"
                        color={selectedEvent.booking.cancelled ? 'error' : selectedEvent.booking.confirmed ? 'success' : 'warning'}
                      />
                    </TableCell>
                  </TableRow>
                  {selectedEvent.booking.comment && (
                    <TableRow>
                      <TableCell><strong>Comment</strong></TableCell>
                      <TableCell>{selectedEvent.booking.comment}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>Close</Button>
          <Button
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => {
              if (selectedEvent) {
                onViewBooking(selectedEvent.booking);
                setEventDialogOpen(false);
              }
            }}
          >
            View Full Details
          </Button>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => {
              if (selectedEvent) {
                onEditBooking(selectedEvent.booking);
                setEventDialogOpen(false);
              }
            }}
          >
            Edit Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingCalendar;