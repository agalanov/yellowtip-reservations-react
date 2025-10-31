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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Person,
  CheckCircle,
  Lock,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../services/api';

interface User {
  id: number;
  loginId: string;
  firstName?: string;
  lastName?: string;
  status: string;
  lastLogin?: number;
  lastLoginFrom?: string;
  createdAt: string;
  updatedAt: string;
  roles?: Array<{
    role: {
      id: number;
      name: string;
    };
  }>;
}

const Users: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    firstName: '',
    lastName: '',
    status: 'ACTIVE' as 'ACTIVE' | 'LOCKED',
    roleIds: [] as number[],
  });

  const queryClient = useQueryClient();

  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-users', { search: searchQuery }],
    queryFn: () => apiService.getUsers({ search: searchQuery }),
  });

  // Get all roles for selection
  const { data: rolesData } = useQuery({
    queryKey: ['roles', { limit: 1000 }],
    queryFn: () => apiService.getRoles({ limit: 1000 }),
  });

  const createMutation = useMutation({
    mutationFn: (user: any) => apiService.createUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDialogOpen(false);
      setEditingUser(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUser(null);
    },
  });

  const resetForm = () => {
    setFormData({
      loginId: '',
      password: '',
      firstName: '',
      lastName: '',
      status: 'ACTIVE',
      roleIds: [],
    });
  };

  const handleCreateUser = (): void => {
    setEditingUser(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleEditUser = (user: User): void => {
    setEditingUser(user);
    setFormData({
      loginId: user.loginId,
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      status: user.status as 'ACTIVE' | 'LOCKED',
      roleIds: user.roles?.map(r => r.role.id) || [],
    });
    setDialogOpen(true);
  };

  const handleSubmit = (): void => {
    const submitData: any = {
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      status: formData.status,
      roleIds: formData.roleIds,
    };

    if (!editingUser) {
      submitData.loginId = formData.loginId;
      submitData.password = formData.password;
    } else if (formData.password) {
      submitData.password = formData.password;
    }

    if (editingUser) {
      updateMutation.mutate({
        id: editingUser.id,
        data: submitData,
      });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const toggleRole = (roleId: number): void => {
    setFormData(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId],
    }));
  };

  const handleDeleteUser = (id: number): void => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
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

  const formatTimestamp = (timestamp?: number): string => {
    if (!timestamp) return '-';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFullName = (user: User): string => {
    const parts = [];
    if (user.firstName) parts.push(user.firstName);
    if (user.lastName) parts.push(user.lastName);
    return parts.join(' ') || user.loginId;
  };

  const getInitials = (user: User): string => {
    const parts = [];
    if (user.firstName) parts.push(user.firstName[0].toUpperCase());
    if (user.lastName) parts.push(user.lastName[0].toUpperCase());
    return parts.join('') || user.loginId[0].toUpperCase();
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
        Failed to load users
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">User Accounts</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateUser}
        >
          New User
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search users..."
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
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Login ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Roles</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usersData?.data?.map((user: User) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getInitials(user)}
                        </Avatar>
                        <Typography variant="body1" fontWeight="medium">
                          {getFullName(user)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.loginId}</TableCell>
                    <TableCell>
                      {user.status === 'ACTIVE' ? (
                        <Chip
                          icon={<CheckCircle />}
                          label="Active"
                          size="small"
                          color="success"
                        />
                      ) : (
                        <Chip
                          icon={<Lock />}
                          label="Locked"
                          size="small"
                          color="error"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {user.roles && user.roles.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {user.roles.map((roleItem, index) => (
                            <Chip
                              key={index}
                              label={roleItem.role.name}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No roles
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatTimestamp(user.lastLogin)}
                      </Typography>
                      {user.lastLoginFrom && (
                        <Typography variant="caption" color="text.secondary">
                          {user.lastLoginFrom}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(user.id)}
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
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person color="primary" />
            User Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                    {getInitials(selectedUser)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{getFullName(selectedUser)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {selectedUser.id}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Login ID
                </Typography>
                <Typography variant="body1">{selectedUser.loginId}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                {selectedUser.status === 'ACTIVE' ? (
                  <Chip label="Active" size="small" color="success" />
                ) : (
                  <Chip label="Locked" size="small" color="error" />
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  First Name
                </Typography>
                <Typography variant="body1">{selectedUser.firstName || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Name
                </Typography>
                <Typography variant="body1">{selectedUser.lastName || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Login
                </Typography>
                <Typography variant="body1">
                  {formatTimestamp(selectedUser.lastLogin)}
                </Typography>
                {selectedUser.lastLoginFrom && (
                  <Typography variant="caption" color="text.secondary">
                    From: {selectedUser.lastLoginFrom}
                  </Typography>
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1">{formatDate(selectedUser.createdAt)}</Typography>
              </Grid>
              {selectedUser.roles && selectedUser.roles.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Roles ({selectedUser.roles.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedUser.roles.map((roleItem, index) => (
                      <Chip
                        key={index}
                        label={roleItem.role.name}
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
          <Button onClick={() => setSelectedUser(null)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedUser) {
                handleEditUser(selectedUser);
                setSelectedUser(null);
              }
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit User Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Login ID"
                required={!editingUser}
                disabled={!!editingUser}
                value={formData.loginId}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  loginId: e.target.value,
                }))}
                error={!editingUser && !formData.loginId.trim()}
                helperText={!editingUser && !formData.loginId.trim() ? 'Login ID is required' : ''}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                required={!editingUser}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  password: e.target.value,
                }))}
                error={!editingUser && !formData.password.trim()}
                helperText={
                  editingUser
                    ? 'Leave empty to keep current password'
                    : !formData.password.trim()
                    ? 'Password is required (min 6 characters)'
                    : 'Minimum 6 characters'
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  firstName: e.target.value,
                }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  lastName: e.target.value,
                }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    status: e.target.value as 'ACTIVE' | 'LOCKED',
                  }))}
                  label="Status"
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="LOCKED">Locked</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom>
                Roles
              </Typography>
              <Box sx={{ maxHeight: 200, overflowY: 'auto', mt: 1, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                {rolesData?.data && rolesData.data.length > 0 ? (
                  <FormGroup>
                    {rolesData.data.map((role) => (
                      <FormControlLabel
                        key={role.id}
                        control={
                          <Checkbox
                            checked={formData.roleIds.includes(role.id)}
                            onChange={() => toggleRole(role.id)}
                            size="small"
                          />
                        }
                        label={role.name}
                      />
                    ))}
                  </FormGroup>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No roles available
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              (!editingUser && (!formData.loginId.trim() || !formData.password.trim())) ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;

