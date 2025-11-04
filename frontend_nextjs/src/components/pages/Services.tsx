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
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Grid,
  InputAdornment,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Spa,
  CheckCircle,
  Cancel,
  AttachMoney,
  AccessTime,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../lib/api';
import { Service, ServiceRequest, ServiceFilters } from '../../types';

const Services: React.FC = () => {
  const [filters, setFilters] = useState<ServiceFilters>({
    page: 1,
    limit: 20,
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceRequest>({
    name: '',
    categoryId: 0,
    currencyId: 0,
    description: '',
    price: undefined,
    duration: undefined,
    preDuration: 0,
    postDuration: 0,
    space: 1,
    therapistType: '1',
    active: true,
    roomType: '1',
    variableTime: false,
    variablePrice: false,
    minimalTime: 5,
    maximalTime: 0,
    timeUnit: 5,
  });

  const queryClient = useQueryClient();

  // Apply search query to filters
  const appliedFilters: ServiceFilters = {
    ...filters,
    search: searchQuery || undefined,
  };

  const {
    data: servicesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['services', appliedFilters],
    queryFn: () => apiService.getServices(appliedFilters),
  });

  const createMutation = useMutation({
    mutationFn: (service: ServiceRequest) => apiService.createService(service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ServiceRequest> }) =>
      apiService.updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setDialogOpen(false);
      setEditingService(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setSelectedService(null);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      categoryId: 0,
      currencyId: 0,
      description: '',
      price: undefined,
      duration: undefined,
      preDuration: 0,
      postDuration: 0,
      space: 1,
      therapistType: '1',
      active: true,
      roomType: '1',
      variableTime: false,
      variablePrice: false,
      minimalTime: 5,
      maximalTime: 0,
      timeUnit: 5,
    });
  };

  const handleCreateService = (): void => {
    setEditingService(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleEditService = (service: Service): void => {
    setEditingService(service);
    setFormData({
      name: service.name,
      categoryId: service.category.id,
      currencyId: service.currency.id,
      description: service.description || '',
      price: service.price,
      duration: service.duration,
      preDuration: 0,
      postDuration: 0,
      space: 1,
      therapistType: '1',
      active: service.active,
      roomType: '1',
      variableTime: false,
      variablePrice: false,
      minimalTime: 5,
      maximalTime: 0,
      timeUnit: 5,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (): void => {
    if (editingService) {
      updateMutation.mutate({
        id: editingService.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteService = (id: number): void => {
    if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
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

  const formatPrice = (price?: number, symbol?: string): string => {
    if (price === undefined || price === null) return '-';
    return `${symbol || ''}${price.toFixed(2)}`;
  };

  const formatDuration = (duration?: number): string => {
    if (duration === undefined || duration === null) return '-';
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
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
        Failed to load services
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Services</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateService}
        >
          New Service
        </Button>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search services..."
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
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.active !== undefined ? filters.active.toString() : 'all'}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilters(prev => ({
                      ...prev,
                      active: value === 'all' ? undefined : value === 'true',
                      page: 1,
                    }));
                  }}
                  label="Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Currency</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {servicesData?.data?.map((service) => (
                  <TableRow key={service.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Spa color="primary" />
                        <Typography variant="body1" fontWeight="medium">
                          {service.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={service.category.name}
                        size="small"
                        sx={{
                          backgroundColor: service.category.hexcode || '#e0e0e0',
                          color: service.category.textcolor || '#000',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AttachMoney fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatPrice(service.price, service.currency.symbol)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatDuration(service.duration)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={service.currency.code} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {service.active ? (
                        <Chip
                          icon={<CheckCircle />}
                          label="Active"
                          size="small"
                          color="success"
                        />
                      ) : (
                        <Chip
                          icon={<Cancel />}
                          label="Inactive"
                          size="small"
                          color="default"
                        />
                      )}
                    </TableCell>
                    <TableCell>{formatDate(service.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedService(service)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Service">
                          <IconButton
                            size="small"
                            onClick={() => handleEditService(service)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Service">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteService(service.id)}
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
                    <TableCell colSpan={8} align="center">
                      No services found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Service Details Dialog */}
      <Dialog
        open={!!selectedService}
        onClose={() => setSelectedService(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Spa color="primary" />
            Service Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedService && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{selectedService.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                {selectedService.active ? (
                  <Chip label="Active" size="small" color="success" />
                ) : (
                  <Chip label="Inactive" size="small" color="default" />
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Category
                </Typography>
                <Chip
                  label={selectedService.category.name}
                  size="small"
                  sx={{
                    backgroundColor: selectedService.category.hexcode || '#e0e0e0',
                    color: selectedService.category.textcolor || '#000',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Currency
                </Typography>
                <Typography variant="body1">
                  {selectedService.currency.code} ({selectedService.currency.symbol})
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Price
                </Typography>
                <Typography variant="body1">
                  {formatPrice(selectedService.price, selectedService.currency.symbol)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1">
                  {formatDuration(selectedService.duration)}
                </Typography>
              </Grid>
              {selectedService.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">{selectedService.description}</Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1">{formatDate(selectedService.createdAt)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Updated At
                </Typography>
                <Typography variant="body1">{formatDate(selectedService.updatedAt)}</Typography>
              </Grid>
              {selectedService.rooms && selectedService.rooms.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Available Rooms ({selectedService.rooms.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedService.rooms.map((roomItem, index) => (
                      <Chip
                        key={index}
                        label={roomItem.room.name}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedService(null)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedService) {
                handleEditService(selectedService);
                setSelectedService(null);
              }
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Service Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingService ? 'Edit Service' : 'Create New Service'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Service Name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value,
                }))}
                error={!formData.name.trim()}
                helperText={!formData.name.trim() ? 'Service name is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category ID"
                type="number"
                required
                value={formData.categoryId || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  categoryId: Number(e.target.value) || 0,
                }))}
                error={!formData.categoryId || formData.categoryId <= 0}
                helperText={(!formData.categoryId || formData.categoryId <= 0) ? 'Category ID is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Currency ID"
                type="number"
                required
                value={formData.currencyId || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  currencyId: Number(e.target.value) || 0,
                }))}
                error={!formData.currencyId || formData.currencyId <= 0}
                helperText={(!formData.currencyId || formData.currencyId <= 0) ? 'Currency ID is required' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: e.target.value,
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                inputProps={{ step: '0.01', min: 0 }}
                value={formData.price || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  price: e.target.value ? Number(e.target.value) : undefined,
                }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                inputProps={{ min: 0 }}
                value={formData.duration || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  duration: e.target.value ? Number(e.target.value) : undefined,
                }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><AccessTime fontSize="small" /></InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pre-Duration (minutes)"
                type="number"
                inputProps={{ min: 0 }}
                value={formData.preDuration || 0}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  preDuration: Number(e.target.value) || 0,
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Post-Duration (minutes)"
                type="number"
                inputProps={{ min: 0 }}
                value={formData.postDuration || 0}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  postDuration: Number(e.target.value) || 0,
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active !== false}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      active: e.target.checked,
                    }))}
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Space"
                type="number"
                inputProps={{ min: 1 }}
                value={formData.space || 1}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  space: Number(e.target.value) || 1,
                }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.name.trim() ||
              !formData.categoryId ||
              formData.categoryId <= 0 ||
              !formData.currencyId ||
              formData.currencyId <= 0 ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            {editingService ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Services;

