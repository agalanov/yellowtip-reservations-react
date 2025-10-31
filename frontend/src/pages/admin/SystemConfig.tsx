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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Settings,
  ExpandMore,
  Apps,
  Save,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../services/api';

interface ConfigItem {
  name: string;
  value: string | null;
  app: string | null;
}

interface GroupedConfig {
  [app: string]: ConfigItem[];
}

const SystemConfig: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<ConfigItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ConfigItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    app: '',
  });
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set(['general']));

  const queryClient = useQueryClient();

  const {
    data: configData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-config'],
    queryFn: () => apiService.getConfig(true) as Promise<GroupedConfig>,
  });

  const createMutation = useMutation({
    mutationFn: ({ name, value, app }: { name: string; value: string; app?: string }) =>
      apiService.createConfigItem(name, value, app),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-config'] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ name, value, app }: { name: string; value?: string; app?: string }) =>
      apiService.updateConfigItem(name, value, app),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-config'] });
      setDialogOpen(false);
      setEditingItem(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (name: string) => apiService.deleteConfigItem(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-config'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      value: '',
      app: '',
    });
  };

  const handleCreateItem = (): void => {
    setEditingItem(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleEditItem = (item: ConfigItem): void => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      value: item.value || '',
      app: item.app || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = (): void => {
    if (editingItem) {
      updateMutation.mutate({
        name: editingItem.name,
        value: formData.value,
        app: formData.app || undefined,
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        value: formData.value,
        app: formData.app || undefined,
      });
    }
  };

  const handleDeleteItem = (name: string): void => {
    if (window.confirm(`Are you sure you want to delete configuration "${name}"?`)) {
      deleteMutation.mutate(name);
    }
  };

  const handleAccordionChange = (app: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedApps((prev) => {
      const newSet = new Set(prev);
      if (isExpanded) {
        newSet.add(app);
      } else {
        newSet.delete(app);
      }
      return newSet;
    });
  };

  // Filter and group config
  const filteredConfig = React.useMemo(() => {
    if (!configData) return {};

    const filtered: GroupedConfig = {};
    
    Object.entries(configData).forEach(([app, items]) => {
      const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.value && item.value.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      if (filteredItems.length > 0) {
        filtered[app] = filteredItems;
      }
    });

    return filtered;
  }, [configData, searchQuery]);

  // Get all unique app names for the app selector
  const appNames = React.useMemo(() => {
    if (!configData) return [];
    const apps = new Set<string>();
    Object.keys(configData).forEach(app => {
      if (app && app !== 'general') {
        apps.add(app);
      }
    });
    return Array.from(apps).sort();
  }, [configData]);

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
        Failed to load configuration
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">System Configuration</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateItem}
        >
          New Config
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search configuration..."
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

      {/* Configuration by App */}
      <Card>
        <CardContent>
          {Object.keys(filteredConfig).length > 0 ? (
            Object.entries(filteredConfig).map(([app, items]) => (
              <Accordion
                key={app}
                expanded={expandedApps.has(app)}
                onChange={handleAccordionChange(app)}
                sx={{ mb: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Apps color="primary" />
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {app || 'General'} ({items.length})
                    </Typography>
                    <Chip label={items.length} size="small" color="primary" variant="outlined" />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Value</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.name} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {item.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  maxWidth: 400,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                title={item.value || ''}
                              >
                                {item.value || <em style={{ color: '#999' }}>empty</em>}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <Tooltip title="View Details">
                                  <IconButton
                                    size="small"
                                    onClick={() => setSelectedItem(item)}
                                  >
                                    <Visibility />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditItem(item)}
                                    color="primary"
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteItem(item.name)}
                                    color="error"
                                  >
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
              {searchQuery ? 'No configuration items found' : 'No configuration items'}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Config Item Details Dialog */}
      <Dialog
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings color="primary" />
            Configuration Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{selectedItem.name}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Application
                </Typography>
                <Typography variant="body1">{selectedItem.app || 'General'}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Value
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    wordBreak: 'break-word',
                    p: 1,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                  }}
                >
                  {selectedItem.value || <em style={{ color: '#999' }}>empty</em>}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedItem(null)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedItem) {
                handleEditItem(selectedItem);
                setSelectedItem(null);
              }
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Config Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingItem ? 'Edit Configuration' : 'Create New Configuration'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Configuration Name"
                required={!editingItem}
                disabled={!!editingItem}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value,
                }))}
                error={!editingItem && !formData.name.trim()}
                helperText={!editingItem && !formData.name.trim() ? 'Name is required' : 'Unique configuration key'}
                placeholder="e.g., webres_name, system_timezone"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Application</InputLabel>
                <Select
                  value={formData.app}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    app: e.target.value,
                  }))}
                  label="Application"
                >
                  <MenuItem value="">General</MenuItem>
                  {appNames.map((app) => (
                    <MenuItem key={app} value={app}>
                      {app}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Value"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  value: e.target.value,
                }))}
                multiline
                rows={4}
                placeholder="Configuration value"
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
              (!editingItem && !formData.name.trim()) ||
              createMutation.isPending ||
              updateMutation.isPending
            }
            startIcon={<Save />}
          >
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemConfig;

