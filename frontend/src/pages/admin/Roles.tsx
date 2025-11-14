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
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  Divider,
  Badge,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Security,
  Lock,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../services/api';
import { Role, RoleRequest, AccessRight, AccessRightRequest } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Roles: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [filters] = useState({ page: 1, limit: 50 });
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedRight, setSelectedRight] = useState<AccessRight | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [rightDialogOpen, setRightDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingRight, setEditingRight] = useState<AccessRight | null>(null);
  const [roleFormData, setRoleFormData] = useState<RoleRequest>({
    name: '',
    rightIds: [],
  });
  const [rightFormData, setRightFormData] = useState<AccessRightRequest>({
    name: '',
    appName: '',
  });

  const queryClient = useQueryClient();

  // Roles queries
  const {
    data: rolesData,
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery({
    queryKey: ['roles', filters],
    queryFn: () => apiService.getRoles(filters),
  });

  // Access Rights queries
  const {
    data: rightsData,
    isLoading: rightsLoading,
  } = useQuery({
    queryKey: ['accessRights', filters],
    queryFn: () => apiService.getAccessRights(filters),
  });

  // All rights for role assignment
  const { data: allRightsData } = useQuery({
    queryKey: ['allAccessRights'],
    queryFn: () => apiService.getAccessRights({ limit: 1000 }),
  });

  // Mutations
  const createRoleMutation = useMutation({
    mutationFn: (role: RoleRequest) => apiService.createRole(role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setRoleDialogOpen(false);
      setRoleFormData({ name: '', rightIds: [] });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RoleRequest> }) =>
      apiService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setRoleDialogOpen(false);
      setEditingRole(null);
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const createRightMutation = useMutation({
    mutationFn: (right: AccessRightRequest) => apiService.createAccessRight(right),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessRights'] });
      queryClient.invalidateQueries({ queryKey: ['allAccessRights'] });
      setRightDialogOpen(false);
      setRightFormData({ name: '', appName: '' });
    },
  });

  const updateRightMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AccessRightRequest> }) =>
      apiService.updateAccessRight(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessRights'] });
      queryClient.invalidateQueries({ queryKey: ['allAccessRights'] });
      setRightDialogOpen(false);
      setEditingRight(null);
    },
  });

  const deleteRightMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteAccessRight(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessRights'] });
      queryClient.invalidateQueries({ queryKey: ['allAccessRights'] });
    },
  });

  const handleCreateRole = (): void => {
    setEditingRole(null);
    setRoleFormData({ name: '', rightIds: [] });
    setRoleDialogOpen(true);
  };

  const handleEditRole = (role: Role): void => {
    setEditingRole(role);
    setRoleFormData({
      name: role.name,
      rightIds: role.rights?.map(r => r.right.id) || [],
    });
    setRoleDialogOpen(true);
  };

  const handleSubmitRole = (): void => {
    if (editingRole) {
      updateRoleMutation.mutate({
        id: editingRole.id,
        data: roleFormData,
      });
    } else {
      createRoleMutation.mutate(roleFormData);
    }
  };

  const handleDeleteRole = (id: number): void => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      deleteRoleMutation.mutate(id);
    }
  };

  const handleCreateRight = (): void => {
    setEditingRight(null);
    setRightFormData({ name: '', appName: '' });
    setRightDialogOpen(true);
  };

  const handleEditRight = (right: AccessRight): void => {
    setEditingRight(right);
    setRightFormData({
      name: right.name,
      appName: right.appName,
    });
    setRightDialogOpen(true);
  };

  const handleSubmitRight = (): void => {
    if (editingRight) {
      updateRightMutation.mutate({
        id: editingRight.id,
        data: rightFormData,
      });
    } else {
      createRightMutation.mutate(rightFormData);
    }
  };

  const handleDeleteRight = (id: number): void => {
    if (window.confirm('Are you sure you want to delete this access right?')) {
      deleteRightMutation.mutate(id);
    }
  };

  const toggleRight = (rightId: number): void => {
    setRoleFormData(prev => ({
      ...prev,
      rightIds: prev.rightIds?.includes(rightId)
        ? prev.rightIds.filter(id => id !== rightId)
        : [...(prev.rightIds || []), rightId],
    }));
  };

  // Group rights by appName
  const groupedRights = allRightsData?.data.reduce((acc: Record<string, AccessRight[]>, right) => {
    if (!acc[right.appName]) {
      acc[right.appName] = [];
    }
    acc[right.appName].push(right);
    return acc;
  }, {}) || {};

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Roles & Permissions</Typography>
      </Box>

      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Roles" icon={<Security />} iconPosition="start" />
          <Tab label="Access Rights" icon={<Lock />} iconPosition="start" />
        </Tabs>

        {/* Roles Tab */}
        <TabPanel value={tabValue} index={0}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateRole}
              >
                New Role
              </Button>
            </Box>

            {rolesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : rolesError ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                Failed to load roles
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Accounts</TableCell>
                      <TableCell>Permissions</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rolesData?.data?.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>
                          <Typography variant="body1" fontWeight="medium">
                            {role.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Badge badgeContent={role._count?.accounts || 0} color="primary">
                            <Chip label={`${role._count?.accounts || 0} account(s)`} size="small" />
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge badgeContent={role._count?.rights || 0} color="secondary">
                            <Chip label={`${role._count?.rights || 0} permission(s)`} size="small" />
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(role.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <IconButton
                              size="small"
                              onClick={() => setSelectedRole(role)}
                            >
                              <Visibility />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleEditRole(role)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteRole(role.id)}
                              color="error"
                              disabled={!!role._count && role._count.accounts > 0}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No roles found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </TabPanel>

        {/* Access Rights Tab */}
        <TabPanel value={tabValue} index={1}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateRight}
              >
                New Access Right
              </Button>
            </Box>

            {rightsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Application</TableCell>
                      <TableCell>Roles</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rightsData?.data?.map((right) => (
                      <TableRow key={right.id}>
                        <TableCell>
                          <Typography variant="body1" fontWeight="medium">
                            {right.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={right.appName} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Badge badgeContent={right._count?.roles || 0} color="secondary">
                            <Chip label={`${right._count?.roles || 0} role(s)`} size="small" />
                          </Badge>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <IconButton
                              size="small"
                              onClick={() => setSelectedRight(right)}
                            >
                              <Visibility />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleEditRight(right)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteRight(right.id)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No access rights found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </TabPanel>
      </Card>

      {/* Role Dialog */}
      <Dialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingRole ? 'Edit Role' : 'Create New Role'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
              <TextField
                fullWidth
                label="Role Name"
                value={roleFormData.name}
                onChange={(e) => setRoleFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Box>
            <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Permissions
              </Typography>
              <Box sx={{ maxHeight: 400, overflowY: 'auto', mt: 2 }}>
                {Object.entries(groupedRights).map(([appName, rights]) => (
                  <Box key={appName} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                      {appName}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {rights.map((right) => (
                        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 4px)', md: '1 1 calc(33.333% - 6px)' }, minWidth: 0 }} key={right.id}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={roleFormData.rightIds?.includes(right.id) || false}
                                onChange={() => toggleRight(right.id)}
                              />
                            }
                            label={right.name}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
                {allRightsData?.data.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No access rights available. Create access rights first.
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitRole}
            variant="contained"
            disabled={!roleFormData.name || createRoleMutation.isPending || updateRoleMutation.isPending}
          >
            {editingRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Access Right Dialog */}
      <Dialog
        open={rightDialogOpen}
        onClose={() => setRightDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingRight ? 'Edit Access Right' : 'Create New Access Right'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
              <TextField
                fullWidth
                label="Right Name"
                value={rightFormData.name}
                onChange={(e) => setRightFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="e.g., read_bookings, edit_users"
              />
            </Box>
            <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
              <TextField
                fullWidth
                label="Application Name"
                value={rightFormData.appName}
                onChange={(e) => setRightFormData(prev => ({ ...prev, appName: e.target.value }))}
                required
                placeholder="e.g., admin, reservations"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRightDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitRight}
            variant="contained"
            disabled={!rightFormData.name || !rightFormData.appName || createRightMutation.isPending || updateRightMutation.isPending}
          >
            {editingRight ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Details Dialog */}
      <Dialog
        open={!!selectedRole}
        onClose={() => setSelectedRole(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Role Details</DialogTitle>
        <DialogContent>
          {selectedRole && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
              <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{selectedRole.name}</Typography>
              </Box>
              <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Accounts
                </Typography>
                <Typography variant="body1">{selectedRole._count?.accounts || 0}</Typography>
              </Box>
              <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Permissions
                </Typography>
                {selectedRole.rights && selectedRole.rights.length > 0 ? (
                  <Box>
                    {Object.entries(
                      selectedRole.rights.reduce((acc: Record<string, typeof selectedRole.rights>, item) => {
                        const appName = item.right.appName;
                        if (!acc[appName]) acc[appName] = [];
                        acc[appName].push(item);
                        return acc;
                      }, {})
                    ).map(([appName, rights]) => (
                      <Box key={appName} sx={{ mb: 2 }}>
                        <Typography variant="caption" fontWeight="bold">
                          {appName}:
                        </Typography>
                        <Box sx={{ pl: 2, mt: 0.5 }}>
                          {rights.map((item) => (
                            <Chip
                              key={item.right.id}
                              label={item.right.name}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No permissions assigned
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRole(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Access Right Details Dialog */}
      <Dialog
        open={!!selectedRight}
        onClose={() => setSelectedRight(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Access Right Details</DialogTitle>
        <DialogContent>
          {selectedRight && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
              <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{selectedRight.name}</Typography>
              </Box>
              <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Application
                </Typography>
                <Typography variant="body1">{selectedRight.appName}</Typography>
              </Box>
              <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Assigned to Roles
                </Typography>
                <Typography variant="body1">{selectedRight._count?.roles || 0}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRight(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Roles;

