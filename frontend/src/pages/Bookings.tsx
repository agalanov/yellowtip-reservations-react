import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';
import { Booking, BookingRequest, BookingFilters } from '../types';

const Bookings: React.FC = () => {
  const [filters, setFilters] = useState<BookingFilters>({
    page: 1,
    limit: 20,
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState<BookingRequest>({
    date: Math.floor(Date.now() / 1000),
    serviceId: 0,
    time: Math.floor(Date.now() / 1000),
    roomId: 0,
    guestId: 0,
  });

  const queryClient = useQueryClient();

  const {
    data: bookingsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => apiService.getBookings(filters),
  });

  const createMutation = useMutation({
    mutationFn: (booking: BookingRequest) => apiService.createBooking(booking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setDialogOpen(false);
      setFormData({
        date: Math.floor(Date.now() / 1000),
        serviceId: 0,
        time: Math.floor(Date.now() / 1000),
        roomId: 0,
        guestId: 0,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BookingRequest> }) =>
      apiService.updateBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setDialogOpen(false);
      setEditingBooking(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const handleCreateBooking = (): void => {
    setEditingBooking(null);
    setFormData({
      date: Math.floor(Date.now() / 1000),
      serviceId: 0,
      time: Math.floor(Date.now() / 1000),
      roomId: 0,
      guestId: 0,
    });
    setDialogOpen(true);
  };

  const handleEditBooking = (booking: Booking): void => {
    setEditingBooking(booking);
    setFormData({
      date: booking.date,
      serviceId: booking.service.id,
      time: booking.time,
      roomId: booking.room.id,
      guestId: booking.guest.id,
      therapistId: booking.therapist?.id,
      comment: booking.comment,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (): void => {
    if (editingBooking) {
      updateMutation.mutate({
        id: editingBooking.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteBooking = (id: number): void => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      deleteMutation.mutate(id);
    }
  };

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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load bookings
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Bookings</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateBooking}
        >
          New Booking
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Guest</TableCell>
                  <TableCell>Therapist</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookingsData?.data?.map((booking) => (
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
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {booking.confirmed ? (
                          <Chip
                            icon={<CheckCircle />}
                            label="Confirmed"
                            size="small"
                            color="success"
                          />
                        ) : (
                          <Chip
                            icon={<Cancel />}
                            label="Pending"
                            size="small"
                            color="warning"
                          />
                        )}
                        {booking.cancelled && (
                          <Chip
                            label="Cancelled"
                            size="small"
                            color="error"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEditBooking(booking)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteBooking(booking.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No bookings found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedBooking.date)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Time
                </Typography>
                <Typography variant="body1">
                  {formatTime(selectedBooking.time)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Service
                </Typography>
                <Typography variant="body1">
                  {selectedBooking.service.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Room
                </Typography>
                <Typography variant="body1">
                  {selectedBooking.room.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Guest
                </Typography>
                <Typography variant="body1">
                  {selectedBooking.guest.firstName} {selectedBooking.guest.lastName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Therapist
                </Typography>
                <Typography variant="body1">
                  {selectedBooking.therapist ? (
                    `${selectedBooking.therapist.firstName} ${selectedBooking.therapist.lastName}`
                  ) : (
                    'Not assigned'
                  )}
                </Typography>
              </Grid>
              {selectedBooking.comment && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Comment
                  </Typography>
                  <Typography variant="body1">
                    {selectedBooking.comment}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedBooking(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Booking Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingBooking ? 'Edit Booking' : 'Create New Booking'}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date"
                  value={dayjs(formData.date * 1000)}
                  onChange={(date) => {
                    if (date) {
                      setFormData(prev => ({
                        ...prev,
                        date: Math.floor(date.valueOf() / 1000),
                      }));
                    }
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="Time"
                  value={dayjs(formData.time * 1000)}
                  onChange={(time) => {
                    if (time) {
                      setFormData(prev => ({
                        ...prev,
                        time: Math.floor(time.valueOf() / 1000),
                      }));
                    }
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Service</InputLabel>
                  <Select
                    value={formData.serviceId}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      serviceId: Number(e.target.value),
                    }))}
                  >
                    <MenuItem value={0}>Select Service</MenuItem>
                    {/* TODO: Load services from API */}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Room</InputLabel>
                  <Select
                    value={formData.roomId}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      roomId: Number(e.target.value),
                    }))}
                  >
                    <MenuItem value={0}>Select Room</MenuItem>
                    {/* TODO: Load rooms from API */}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Guest</InputLabel>
                  <Select
                    value={formData.guestId}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      guestId: Number(e.target.value),
                    }))}
                  >
                    <MenuItem value={0}>Select Guest</MenuItem>
                    {/* TODO: Load guests from API */}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Therapist (Optional)</InputLabel>
                  <Select
                    value={formData.therapistId || 0}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      therapistId: Number(e.target.value) || undefined,
                    }))}
                  >
                    <MenuItem value={0}>No Therapist</MenuItem>
                    {/* TODO: Load therapists from API */}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
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
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editingBooking ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bookings;
