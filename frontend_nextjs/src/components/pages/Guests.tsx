'use client';

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
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Grid,
  InputAdornment,
  Tooltip,
  Avatar,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Person,
  CalendarToday,
  Spa,
  Room as RoomIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../lib/api';
import { Guest, GuestRequest, GuestFilters } from '../../types';
import dayjs from 'dayjs';

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
      id={`guest-tabpanel-${index}`}
      aria-labelledby={`guest-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const Guests: React.FC = () => {
  const [filters, setFilters] = useState<GuestFilters>({
    page: 1,
    limit: 20,
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [detailTab, setDetailTab] = useState(0);
  const [formData, setFormData] = useState<GuestRequest>({
    firstName: '',
    lastName: '',
  });

  const queryClient = useQueryClient();

  // Apply search query to filters
  const appliedFilters: GuestFilters = {
    ...filters,
    search: searchQuery || undefined,
  };

  const {
    data: guestsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['guests', appliedFilters],
    queryFn: () => apiService.getGuests(appliedFilters),
  });

  const createMutation = useMutation({
    mutationFn: (guest: GuestRequest) => apiService.createGuest(guest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GuestRequest> }) =>
      apiService.updateGuest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      setDialogOpen(false);
      setEditingGuest(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteGuest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      setSelectedGuest(null);
    },
  });

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
    });
  };

  const handleCreateGuest = (): void => {
    setEditingGuest(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleEditGuest = (guest: Guest): void => {
    setEditingGuest(guest);
    setFormData({
      firstName: guest.firstName || '',
      lastName: guest.lastName || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = (): void => {
    if (editingGuest) {
      updateMutation.mutate({
        id: editingGuest.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteGuest = (id: number): void => {
    if (window.confirm('Are you sure you want to delete this guest? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatBookingDate = (timestamp: number): string => {
    const date = dayjs(timestamp * 1000);
    return date.format('MMM D, YYYY');
  };

  const formatBookingTime = (timestamp: number): string => {
    const date = dayjs(timestamp * 1000);
    return date.format('HH:mm');
  };

  const getFullName = (guest: Guest): string => {
    const parts = [];
    if (guest.firstName) parts.push(guest.firstName);
    if (guest.lastName) parts.push(guest.lastName);
    return parts.join(' ') || 'Unnamed Guest';
  };

  const getInitials = (guest: Guest): string => {
    const parts = [];
    if (guest.firstName) parts.push(guest.firstName[0].toUpperCase());
    if (guest.lastName) parts.push(guest.lastName[0].toUpperCase());
    return parts.join('') || '?';
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
        Failed to load guests
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Guests</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateGuest}
        >
          New Guest
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search guests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Guests Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Attributes</TableCell>
                  <TableCell>Bookings</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {guestsData?.data?.map((guest) => (
                  <TableRow key={guest.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getInitials(guest)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {getFullName(guest)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {guest.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {guest.attributes && guest.attributes.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {guest.attributes.slice(0, 2).map((attr, index) => (
                            <Chip
                              key={index}
                              label={`${attr.name}: ${attr.value}`}
                              size="small"
                            />
                          ))}
                          {guest.attributes.length > 2 && (
                            <Chip
                              label={`+${guest.attributes.length - 2}`}
                              size="small"
                            />
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No attributes
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {guest.bookings && guest.bookings.length > 0 ? (
                        <Chip
                          label={`${guest.bookings.length} booking${guest.bookings.length !== 1 ? 's' : ''}`}
                          size="small"
                          color="primary"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No bookings
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(guest.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedGuest(guest);
                              setDetailTab(0);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Guest">
                          <IconButton
                            size="small"
                            onClick={() => handleEditGuest(guest)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Guest">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteGuest(guest.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No guests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Guest Details Dialog */}
      <Dialog
        open={!!selectedGuest}
        onClose={() => setSelectedGuest(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="primary" />
            Guest Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedGuest && (
            <Box>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={detailTab} onChange={(e, newValue) => setDetailTab(newValue)}>
                  <Tab label="Information" />
                  <Tab label="Bookings" icon={<CalendarToday />} iconPosition="start" />
                  <Tab label="Attributes" />
                </Tabs>
              </Box>

              <TabPanel value={detailTab} index={0}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                        {getInitials(selectedGuest)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{getFullName(selectedGuest)}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {selectedGuest.id}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      First Name
                    </Typography>
                    <Typography variant="body1">{selectedGuest.firstName || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Name
                    </Typography>
                    <Typography variant="body1">{selectedGuest.lastName || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body1">{formatDate(selectedGuest.createdAt)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Updated At
                    </Typography>
                    <Typography variant="body1">{formatDate(selectedGuest.updatedAt)}</Typography>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={detailTab} index={1}>
                {selectedGuest.bookings && selectedGuest.bookings.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Time</TableCell>
                          <TableCell>Service</TableCell>
                          <TableCell>Room</TableCell>
                          <TableCell>Therapist</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedGuest.bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CalendarToday fontSize="small" />
                                {formatBookingDate(booking.date)}
                              </Box>
                            </TableCell>
                            <TableCell>{formatBookingTime(booking.time)}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Spa fontSize="small" />
                                {booking.service.name}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <RoomIcon fontSize="small" />
                                {booking.room.name}
                              </Box>
                            </TableCell>
                            <TableCell>
                              {booking.therapist ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <PersonIcon fontSize="small" />
                                  {booking.therapist.firstName} {booking.therapist.lastName}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  Not assigned
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No bookings found
                    </Typography>
                  </Box>
                )}
              </TabPanel>

              <TabPanel value={detailTab} index={2}>
                {selectedGuest.attributes && selectedGuest.attributes.length > 0 ? (
                  <Grid container spacing={2}>
                    {selectedGuest.attributes.map((attr, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" color="text.secondary">
                              {attr.name}
                            </Typography>
                            <Typography variant="body1">{attr.value}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No attributes found
                    </Typography>
                  </Box>
                )}
              </TabPanel>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedGuest(null)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedGuest) {
                handleEditGuest(selectedGuest);
                setSelectedGuest(null);
              }
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Guest Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingGuest ? 'Edit Guest' : 'Create New Guest'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  firstName: e.target.value,
                }))}
                placeholder="Enter first name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  lastName: e.target.value,
                }))}
                placeholder="Enter last name"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {(!formData.firstName && !formData.lastName) && 'At least one name field should be filled'}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              (!formData.firstName && !formData.lastName) ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            {editingGuest ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Guests;

