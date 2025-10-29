import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Close,
  Person,
  Room as RoomIcon,
  Spa,
  AccessTime,
  AttachMoney,
  Comment,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import apiService from '../../services/api';
import { Booking, BookingRequest, Service, Room, Guest, Therapist } from '../../types';

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  booking?: Booking | null;
  editingBooking?: Booking | null;
  onSubmit: (bookingData: BookingRequest) => void;
  isLoading?: boolean;
}

const BookingDialog: React.FC<BookingDialogProps> = ({
  open,
  onClose,
  booking,
  editingBooking,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<BookingRequest>({
    date: Math.floor(Date.now() / 1000),
    serviceId: 0,
    time: Math.floor(Date.now() / 1000),
    roomId: 0,
    guestId: 0,
    therapistId: undefined,
    comment: '',
    duration: 60,
    price: 0,
  });

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedTime, setSelectedTime] = useState<Dayjs>(dayjs());

  // Fetch data for dropdowns
  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: () => apiService.getServices(),
  });

  const { data: rooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => apiService.getRooms(),
  });

  const { data: guests } = useQuery({
    queryKey: ['guests'],
    queryFn: () => apiService.getGuests(),
  });

  const { data: therapists } = useQuery({
    queryKey: ['therapists'],
    queryFn: () => apiService.getTherapists(),
  });

  // Initialize form data
  useEffect(() => {
    if (editingBooking) {
      setFormData({
        date: editingBooking.date,
        serviceId: editingBooking.service.id,
        time: editingBooking.time,
        roomId: editingBooking.room.id,
        guestId: editingBooking.guest.id,
        therapistId: editingBooking.therapist?.id,
        comment: editingBooking.comment || '',
        duration: editingBooking.service.duration,
        price: editingBooking.service.price,
      });
      setSelectedDate(dayjs(editingBooking.date * 1000));
      setSelectedTime(dayjs(editingBooking.time * 1000));
    } else if (booking) {
      // View mode - read only
      setFormData({
        date: booking.date,
        serviceId: booking.service.id,
        time: booking.time,
        roomId: booking.room.id,
        guestId: booking.guest.id,
        therapistId: booking.therapist?.id,
        comment: booking.comment || '',
        duration: booking.service.duration,
        price: booking.service.price,
      });
      setSelectedDate(dayjs(booking.date * 1000));
      setSelectedTime(dayjs(booking.time * 1000));
    } else {
      // Create mode
      const now = dayjs();
      setFormData({
        date: Math.floor(now.valueOf() / 1000),
        serviceId: 0,
        time: Math.floor(now.valueOf() / 1000),
        roomId: 0,
        guestId: 0,
        therapistId: undefined,
        comment: '',
        duration: 60,
        price: 0,
      });
      setSelectedDate(now);
      setSelectedTime(now);
    }
  }, [booking, editingBooking, open]);

  // Update form data when service changes
  useEffect(() => {
    if (formData.serviceId && services?.data) {
      const selectedService = services.data.find(s => s.id === formData.serviceId);
      if (selectedService) {
        setFormData(prev => ({
          ...prev,
          duration: selectedService.duration || 60,
          price: selectedService.price || 0,
        }));
      }
    }
  }, [formData.serviceId, services]);

  const handleDateChange = (newDate: Dayjs | null) => {
    if (newDate) {
      setSelectedDate(newDate);
      setFormData(prev => ({
        ...prev,
        date: Math.floor(newDate.valueOf() / 1000),
      }));
    }
  };

  const handleTimeChange = (newTime: Dayjs | null) => {
    if (newTime) {
      setSelectedTime(newTime);
      setFormData(prev => ({
        ...prev,
        time: Math.floor(newTime.valueOf() / 1000),
      }));
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      date: Math.floor(Date.now() / 1000),
      serviceId: 0,
      time: Math.floor(Date.now() / 1000),
      roomId: 0,
      guestId: 0,
      therapistId: undefined,
      comment: '',
      duration: 60,
      price: 0,
    });
    onClose();
  };

  const isViewMode = !!booking && !editingBooking;
  const isEditMode = !!editingBooking;
  const isCreateMode = !booking && !editingBooking;

  const selectedService = services?.data?.find(s => s.id === formData.serviceId);
  const selectedRoom = rooms?.data?.find(r => r.id === formData.roomId);
  const selectedGuest = guests?.data?.find(g => g.id === formData.guestId);
  const selectedTherapist = therapists?.data?.find(t => t.id === formData.therapistId);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '70vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {isViewMode ? 'View Booking' : isEditMode ? 'Edit Booking' : 'Create New Booking'}
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Date and Time */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="Date"
                value={selectedDate}
                onChange={handleDateChange}
                disabled={isViewMode}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TimePicker
                label="Time"
                value={selectedTime}
                onChange={handleTimeChange}
                disabled={isViewMode}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            {/* Service Selection */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Service *</InputLabel>
                <Select
                  value={formData.serviceId}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    serviceId: Number(e.target.value),
                  }))}
                  disabled={isViewMode}
                >
                  <MenuItem value={0}>Select Service</MenuItem>
                  {services?.data?.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Spa sx={{ mr: 1, color: 'primary.main' }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1">{service.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {service.duration} min • ${service.price}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Room Selection */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Room *</InputLabel>
                <Select
                  value={formData.roomId}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    roomId: Number(e.target.value),
                  }))}
                  disabled={isViewMode}
                >
                  <MenuItem value={0}>Select Room</MenuItem>
                  {rooms?.data?.map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <RoomIcon sx={{ mr: 1, color: 'primary.main' }} />
                        {room.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Guest Selection */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Guest *</InputLabel>
                <Select
                  value={formData.guestId}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    guestId: Number(e.target.value),
                  }))}
                  disabled={isViewMode}
                >
                  <MenuItem value={0}>Select Guest</MenuItem>
                  {guests?.data?.map((guest) => (
                    <MenuItem key={guest.id} value={guest.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ mr: 1, color: 'primary.main' }} />
                        {guest.firstName} {guest.lastName}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Therapist Selection */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Therapist (Optional)</InputLabel>
                <Select
                  value={formData.therapistId || 0}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    therapistId: Number(e.target.value) || undefined,
                  }))}
                  disabled={isViewMode}
                >
                  <MenuItem value={0}>No Therapist</MenuItem>
                  {therapists?.data?.map((therapist) => (
                    <MenuItem key={therapist.id} value={therapist.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ mr: 1, color: 'primary.main' }} />
                        {therapist.firstName} {therapist.lastName}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Service Details */}
            {selectedService && (
              <>
                <Grid size={{ xs: 12}}>
                  <Divider />
                </Grid>
                <Grid size={{ xs: 12}}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Service Details</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Duration</Typography>
                      <Typography variant="h6">{selectedService.duration} min</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <AttachMoney sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Price</Typography>
                      <Typography variant="h6">${selectedService.price}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Spa sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Category</Typography>
                      <Typography variant="h6">{selectedService.category.name}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </>
            )}

            {/* Comment */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Comment"
                multiline
                rows={3}
                value={formData.comment || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  comment: e.target.value,
                }))}
                disabled={isViewMode}
                InputProps={{
                  startAdornment: <Comment sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>

            {/* Booking Summary */}
            {(isViewMode || isEditMode) && (
              <>
                <Grid size={{ xs: 12}}>
                  <Divider />
                </Grid>
                <Grid size={{ xs: 12}}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Booking Summary</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={booking?.confirmed ? 'Confirmed' : 'Pending'}
                      color={booking?.confirmed ? 'success' : 'warning'}
                      size="small"
                    />
                    {booking?.cancelled && (
                      <Chip
                        label="Cancelled"
                        color="error"
                        size="small"
                      />
                    )}
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose}>
            {isViewMode ? 'Close' : 'Cancel'}
          </Button>
          {!isViewMode && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={isLoading || !formData.serviceId || !formData.roomId || !formData.guestId}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Saving...' : isEditMode ? 'Update Booking' : 'Create Booking'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default BookingDialog;
