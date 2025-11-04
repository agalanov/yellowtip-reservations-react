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
  Room as RoomIcon,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../lib/api';
import { Room, RoomRequest, RoomFilters } from '../../types';

const Rooms: React.FC = () => {
  const [filters, setFilters] = useState<RoomFilters>({
    page: 1,
    limit: 20,
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<RoomRequest>({
    name: '',
    description: '',
    priority: 5,
    active: true,
  });

  const queryClient = useQueryClient();

  // Apply search query to filters
  const appliedFilters: RoomFilters = {
    ...filters,
    search: searchQuery || undefined,
  };

  const {
    data: roomsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['rooms', appliedFilters],
    queryFn: () => apiService.getRooms(appliedFilters),
  });

  const createMutation = useMutation({
    mutationFn: (room: RoomRequest) => apiService.createRoom(room),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RoomRequest> }) =>
      apiService.updateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setDialogOpen(false);
      setEditingRoom(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setSelectedRoom(null);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      priority: 5,
      active: true,
    });
  };

  const handleCreateRoom = (): void => {
    setEditingRoom(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleEditRoom = (room: Room): void => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      description: room.description || '',
      priority: room.priority,
      active: room.active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (): void => {
    if (editingRoom) {
      updateMutation.mutate({
        id: editingRoom.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteRoom = (id: number): void => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
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
        Failed to load rooms
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Rooms</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateRoom}
        >
          New Room
        </Button>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search rooms..."
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

      {/* Rooms Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roomsData?.data?.map((room) => (
                  <TableRow key={room.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <RoomIcon color="primary" />
                        <Typography variant="body1" fontWeight="medium">
                          {room.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        maxWidth: 300, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {room.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={room.priority} 
                        size="small" 
                        color={room.priority >= 7 ? 'error' : room.priority >= 4 ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {room.active ? (
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
                    <TableCell>{formatDate(room.createdAt)}</TableCell>
                    <TableCell>{formatDate(room.updatedAt)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedRoom(room)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Room">
                          <IconButton
                            size="small"
                            onClick={() => handleEditRoom(room)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Room">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRoom(room.id)}
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
                    <TableCell colSpan={7} align="center">
                      No rooms found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Room Details Dialog */}
      <Dialog
        open={!!selectedRoom}
        onClose={() => setSelectedRoom(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RoomIcon color="primary" />
            Room Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRoom && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{selectedRoom.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                {selectedRoom.active ? (
                  <Chip label="Active" size="small" color="success" />
                ) : (
                  <Chip label="Inactive" size="small" color="default" />
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Priority
                </Typography>
                <Typography variant="body1">{selectedRoom.priority}</Typography>
              </Grid>
              {selectedRoom.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">{selectedRoom.description}</Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1">{formatDate(selectedRoom.createdAt)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Updated At
                </Typography>
                <Typography variant="body1">{formatDate(selectedRoom.updatedAt)}</Typography>
              </Grid>
              {selectedRoom.services && selectedRoom.services.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Services ({selectedRoom.services.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedRoom.services.map((serviceItem, index) => (
                      <Chip
                        key={index}
                        label={serviceItem.service.name}
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
          <Button onClick={() => setSelectedRoom(null)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedRoom) {
                handleEditRoom(selectedRoom);
                setSelectedRoom(null);
              }
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Room Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingRoom ? 'Edit Room' : 'Create New Room'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Room Name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value,
                }))}
                error={!formData.name.trim()}
                helperText={!formData.name.trim() ? 'Room name is required' : ''}
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name.trim() || createMutation.isPending || updateMutation.isPending}
          >
            {editingRoom ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Rooms;




