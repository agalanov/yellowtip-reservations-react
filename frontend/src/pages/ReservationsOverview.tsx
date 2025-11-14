import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Fab,
} from '@mui/material';
import {
  CalendarToday,
  Room,
  Person,
  Add,
  Refresh,
  Print,
  ViewWeek,
  ViewDay,
  CalendarMonth,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';
import RoomOverview from '../components/reservations/RoomOverview';
import TherapistOverview from '../components/reservations/TherapistOverview';
import BookingCalendar from '../components/reservations/BookingCalendar';
import QuickBookingButtons from '../components/reservations/QuickBookingButtons';
import BookingDialog from '../components/reservations/BookingDialog';
import { Booking, BookingRequest } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reservations-tabpanel-${index}`}
      aria-labelledby={`reservations-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ReservationsOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const queryClient = useQueryClient();

  // Fetch bookings data for Room and Therapist overviews
  const {
    data: bookingsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['reservations', selectedDate.format('YYYY-MM-DD'), viewMode],
    queryFn: () => apiService.getReservations({
      date: selectedDate.format('YYYY-MM-DD'),
      viewMode,
    }),
  });

  // Fetch calendar data separately for Calendar view
  const {
    data: calendarData,
    isLoading: isCalendarLoading,
    error: calendarError,
    refetch: refetchCalendar,
  } = useQuery({
    queryKey: ['calendar', selectedDate.format('YYYY-MM-DD'), viewMode],
    queryFn: () => apiService.getCalendarView({
      date: selectedDate.format('YYYY-MM-DD'),
      viewMode,
    }),
    enabled: activeTab === 2, // Only fetch when calendar tab is active
  });

  // Fetch quick booking data
  const { data: quickBookingData } = useQuery({
    queryKey: ['quick-booking'],
    queryFn: () => apiService.getQuickBookingOptions(),
  });

  const createBookingMutation = useMutation({
    mutationFn: (booking: BookingRequest) => apiService.createBooking(booking),
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      // Explicitly refetch the current reservations query
      refetch();
      if (activeTab === 2) {
        refetchCalendar();
      }
      setBookingDialogOpen(false);
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BookingRequest> }) =>
      apiService.updateBooking(id, data),
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      // Explicitly refetch the current reservations query
      refetch();
      if (activeTab === 2) {
        refetchCalendar();
      }
      setBookingDialogOpen(false);
      setEditingBooking(null);
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDateChange = (newDate: Dayjs | null) => {
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  const handleCreateBooking = () => {
    setEditingBooking(null);
    setSelectedBooking(null);
    setBookingDialogOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setSelectedBooking(null);
    setBookingDialogOpen(true);
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditingBooking(null);
    setBookingDialogOpen(true);
  };

  const handleBookingSubmit = (bookingData: BookingRequest) => {
    if (editingBooking) {
      updateBookingMutation.mutate({
        id: editingBooking.id,
        data: bookingData,
      });
    } else {
      createBookingMutation.mutate(bookingData);
    }
  };

  const handleQuickBooking = (serviceId: number) => {
    setEditingBooking(null);
    setSelectedBooking(null);
    setBookingDialogOpen(true);
    // Pre-fill service in dialog
  };

  if (isLoading || (activeTab === 2 && isCalendarLoading)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || (activeTab === 2 && calendarError)) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load reservations data
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Reservations</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={handleDateChange}
              slotProps={{ textField: { size: 'small' } }}
            />
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                refetch();
                if (activeTab === 2) {
                  refetchCalendar();
                }
              }}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<Print />}
            >
              Print
            </Button>
          </Box>
        </Box>

        {/* Quick Booking Buttons */}
        {quickBookingData && (
          <Box sx={{ mb: 3 }}>
            <QuickBookingButtons
              quickBookings={quickBookingData}
              onQuickBooking={handleQuickBooking}
            />
          </Box>
        )}

        {/* View Mode Toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Paper sx={{ display: 'flex', p: 0.5 }}>
            <Tooltip title="Day View">
              <IconButton
                onClick={() => setViewMode('day')}
                color={viewMode === 'day' ? 'primary' : 'default'}
              >
                <ViewDay />
              </IconButton>
            </Tooltip>
            <Tooltip title="Week View">
              <IconButton
                onClick={() => setViewMode('week')}
                color={viewMode === 'week' ? 'primary' : 'default'}
              >
                <ViewWeek />
              </IconButton>
            </Tooltip>
            <Tooltip title="Month View">
              <IconButton
                onClick={() => setViewMode('month')}
                color={viewMode === 'month' ? 'primary' : 'default'}
              >
                <CalendarMonth />
              </IconButton>
            </Tooltip>
          </Paper>
        </Box>

        {/* Tabs */}
        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="reservations tabs">
              <Tab
                icon={<Room />}
                label="Room Overview"
                iconPosition="start"
              />
              <Tab
                icon={<Person />}
                label="Therapist Overview"
                iconPosition="start"
              />
              <Tab
                icon={<CalendarToday />}
                label="Calendar View"
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <RoomOverview
              date={selectedDate}
              viewMode={viewMode}
              bookings={bookingsData?.bookings || []}
              onEditBooking={handleEditBooking}
              onViewBooking={handleViewBooking}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <TherapistOverview
              date={selectedDate}
              viewMode={viewMode}
              bookings={bookingsData?.bookings || []}
              onEditBooking={handleEditBooking}
              onViewBooking={handleViewBooking}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <BookingCalendar
              date={selectedDate}
              viewMode={viewMode}
              bookings={calendarData?.bookings || []}
              onEditBooking={handleEditBooking}
              onViewBooking={handleViewBooking}
            />
          </TabPanel>
        </Paper>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add booking"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={handleCreateBooking}
        >
          <Add />
        </Fab>

        {/* Booking Dialog */}
        <BookingDialog
          open={bookingDialogOpen}
          onClose={() => setBookingDialogOpen(false)}
          booking={selectedBooking}
          editingBooking={editingBooking}
          onSubmit={handleBookingSubmit}
          isLoading={createBookingMutation.isPending || updateBookingMutation.isPending}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default ReservationsOverview;
