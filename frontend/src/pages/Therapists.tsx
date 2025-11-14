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
  InputAdornment,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Person,
  Star,
  PhotoCamera,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';
import { Therapist, TherapistRequest, TherapistFilters } from '../types';

const Therapists: React.FC = () => {
  const [filters, setFilters] = useState<TherapistFilters>({
    page: 1,
    limit: 20,
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTherapist, setEditingTherapist] = useState<Therapist | null>(null);
  const [formData, setFormData] = useState<TherapistRequest>({
    firstName: '',
    lastName: '',
    priority: 5,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const queryClient = useQueryClient();

  // Apply search query to filters
  const appliedFilters: TherapistFilters = {
    ...filters,
    search: searchQuery || undefined,
  };

  const {
    data: therapistsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['therapists', appliedFilters],
    queryFn: () => apiService.getTherapists(appliedFilters),
  });

  const createMutation = useMutation({
    mutationFn: (therapist: TherapistRequest) => apiService.createTherapist(therapist),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TherapistRequest> }) =>
      apiService.updateTherapist(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
      setDialogOpen(false);
      setEditingTherapist(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteTherapist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
      setSelectedTherapist(null);
    },
  });

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      priority: 5,
    });
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleCreateTherapist = (): void => {
    setEditingTherapist(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleEditTherapist = (therapist: Therapist): void => {
    setEditingTherapist(therapist);
    setFormData({
      firstName: therapist.firstName || '',
      lastName: therapist.lastName || '',
      priority: therapist.priority,
    });
    // Set avatar preview if therapist has avatar
    if ((therapist as any).avatarUrl) {
      setAvatarPreview((therapist as any).avatarUrl);
    } else {
      setAvatarPreview(null);
    }
    setAvatarFile(null);
    setDialogOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleSubmit = (): void => {
    if (editingTherapist) {
      // First update therapist data
      updateMutation.mutate(
        {
          id: editingTherapist.id,
          data: formData,
        },
        {
          onSuccess: async () => {
            // Then upload avatar if file is selected
            if (avatarFile) {
              setUploadingAvatar(true);
              try {
                await apiService.uploadTherapistAvatar(editingTherapist.id, avatarFile);
                queryClient.invalidateQueries({ queryKey: ['therapists'] });
              } catch (error) {
                console.error('Failed to upload avatar:', error);
                alert('Failed to upload avatar. Please try again.');
              } finally {
                setUploadingAvatar(false);
              }
            }
          },
        }
      );
    } else {
      // For new therapist, create first, then upload avatar
      createMutation.mutate(formData, {
        onSuccess: async (newTherapist) => {
          if (avatarFile && newTherapist) {
            setUploadingAvatar(true);
            try {
              await apiService.uploadTherapistAvatar(newTherapist.id, avatarFile);
              queryClient.invalidateQueries({ queryKey: ['therapists'] });
            } catch (error) {
              console.error('Failed to upload avatar:', error);
              alert('Therapist created but failed to upload avatar. Please try uploading it again.');
            } finally {
              setUploadingAvatar(false);
            }
          }
        },
      });
    }
  };

  const handleDeleteTherapist = (id: number): void => {
    if (window.confirm('Are you sure you want to delete this therapist? This action cannot be undone.')) {
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

  const getFullName = (therapist: Therapist): string => {
    const parts = [];
    if (therapist.firstName) parts.push(therapist.firstName);
    if (therapist.lastName) parts.push(therapist.lastName);
    return parts.join(' ') || 'Unnamed Therapist';
  };

  const getInitials = (therapist: Therapist): string => {
    const parts = [];
    if (therapist.firstName) parts.push(therapist.firstName[0].toUpperCase());
    if (therapist.lastName) parts.push(therapist.lastName[0].toUpperCase());
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
        Failed to load therapists
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Therapists</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateTherapist}
        >
          New Therapist
        </Button>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 10px)' }, minWidth: 0 }}>
              <TextField
                fullWidth
                placeholder="Search therapists..."
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
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 10px)' }, minWidth: 0 }}>
              <FormControl fullWidth>
                <InputLabel>Service</InputLabel>
                <Select
                  value={filters.serviceId || ''}
                  onChange={(e) => {
                    setFilters(prev => ({
                      ...prev,
                      serviceId: e.target.value ? Number(e.target.value) : undefined,
                      page: 1,
                    }));
                  }}
                  label="Service"
                >
                  <MenuItem value="">All Services</MenuItem>
                  {/* TODO: Load services for filter */}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Therapists Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Services</TableCell>
                  <TableCell>Attributes</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {therapistsData?.data?.map((therapist) => (
                  <TableRow key={therapist.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          sx={{ bgcolor: 'primary.main' }}
                          src={(therapist as any).avatarUrl || undefined}
                        >
                          {!((therapist as any).avatarUrl) && getInitials(therapist)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {getFullName(therapist)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {therapist.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Star fontSize="small" color={therapist.priority >= 7 ? 'error' : therapist.priority >= 4 ? 'warning' : 'action'} />
                        <Chip
                          label={therapist.priority}
                          size="small"
                          color={therapist.priority >= 7 ? 'error' : therapist.priority >= 4 ? 'warning' : 'default'}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {therapist.services && therapist.services.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {therapist.services.slice(0, 2).map((service, index) => (
                            <Chip
                              key={index}
                              label={service.name}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {therapist.services.length > 2 && (
                            <Chip
                              label={`+${therapist.services.length - 2}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No services
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {therapist.attributes && therapist.attributes.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {therapist.attributes.slice(0, 2).map((attr, index) => (
                            <Chip
                              key={index}
                              label={`${attr.name}: ${attr.value}`}
                              size="small"
                            />
                          ))}
                          {therapist.attributes.length > 2 && (
                            <Chip
                              label={`+${therapist.attributes.length - 2}`}
                              size="small"
                            />
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(therapist.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedTherapist(therapist)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Therapist">
                          <IconButton
                            size="small"
                            onClick={() => handleEditTherapist(therapist)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Therapist">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTherapist(therapist.id)}
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
                    <TableCell colSpan={6} align="center">
                      No therapists found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Therapist Details Dialog */}
      <Dialog
        open={!!selectedTherapist}
        onClose={() => setSelectedTherapist(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person color="primary" />
            Therapist Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTherapist && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
              <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar 
                    sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem' }}
                    src={(selectedTherapist as any).avatarUrl || undefined}
                  >
                    {!((selectedTherapist as any).avatarUrl) && getInitials(selectedTherapist)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{getFullName(selectedTherapist)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {selectedTherapist.id}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  First Name
                </Typography>
                <Typography variant="body1">{selectedTherapist.firstName || '-'}</Typography>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Name
                </Typography>
                <Typography variant="body1">{selectedTherapist.lastName || '-'}</Typography>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Priority
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Star fontSize="small" color={selectedTherapist.priority >= 7 ? 'error' : selectedTherapist.priority >= 4 ? 'warning' : 'action'} />
                  <Typography variant="body1">{selectedTherapist.priority}</Typography>
                </Box>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1">{formatDate(selectedTherapist.createdAt)}</Typography>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Updated At
                </Typography>
                <Typography variant="body1">{formatDate(selectedTherapist.updatedAt)}</Typography>
              </Box>
              {selectedTherapist.services && selectedTherapist.services.length > 0 && (
                <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Services ({selectedTherapist.services.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedTherapist.services.map((service, index) => (
                      <Chip
                        key={index}
                        label={service.name}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
              {selectedTherapist.attributes && selectedTherapist.attributes.length > 0 && (
                <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Attributes ({selectedTherapist.attributes.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedTherapist.attributes.map((attr, index) => (
                      <Chip
                        key={index}
                        label={`${attr.name}: ${attr.value}`}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTherapist(null)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedTherapist) {
                handleEditTherapist(selectedTherapist);
                setSelectedTherapist(null);
              }
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Therapist Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTherapist ? 'Edit Therapist' : 'Create New Therapist'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            {/* Avatar Upload Section */}
            <Box sx={{ flex: '1 1 100%', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                }}
                src={avatarPreview || undefined}
              >
                {!avatarPreview && getInitials(editingTherapist || { id: 0, firstName: formData.firstName, lastName: formData.lastName, priority: formData.priority || 5, createdAt: '', updatedAt: '' })}
              </Avatar>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="avatar-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    size="small"
                  >
                    {avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
                  </Button>
                </label>
                {avatarPreview && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    size="small"
                    onClick={handleRemoveAvatar}
                  >
                    Remove
                  </Button>
                )}
              </Box>
              {uploadingAvatar && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">
                    Uploading avatar...
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
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
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
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
            </Box>
            <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority || 5}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    priority: Number(e.target.value),
                  }))}
                  label="Priority"
                >
                  <MenuItem value={1}>1 - Lowest</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                  <MenuItem value={5}>5 - Default</MenuItem>
                  <MenuItem value={6}>6</MenuItem>
                  <MenuItem value={7}>7</MenuItem>
                  <MenuItem value={8}>8</MenuItem>
                  <MenuItem value={9}>9</MenuItem>
                  <MenuItem value={10}>10 - Highest</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {(!formData.firstName && !formData.lastName) && 'At least one name field should be filled'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              (!formData.firstName && !formData.lastName) ||
              createMutation.isPending ||
              updateMutation.isPending ||
              uploadingAvatar
            }
          >
            {uploadingAvatar ? 'Uploading...' : editingTherapist ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Therapists;

