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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Language as LanguageIcon,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../services/api';
import { Language, LanguageRequest } from '../../types';

const Languages: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [formData, setFormData] = useState<LanguageRequest>({
    id: '',
    name: '',
    available: false,
    availableGuests: false,
    availableReservations: false,
    isDefault: false,
  });

  const queryClient = useQueryClient();

  const {
    data: languagesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-languages', { search: searchQuery }],
    queryFn: () => apiService.getLanguages({ search: searchQuery }),
  });

  const createMutation = useMutation({
    mutationFn: (language: LanguageRequest) => apiService.createLanguage(language),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-languages'] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LanguageRequest> }) =>
      apiService.updateLanguage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-languages'] });
      setDialogOpen(false);
      setEditingLanguage(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteLanguage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-languages'] });
      setSelectedLanguage(null);
    },
  });

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      available: false,
      availableGuests: false,
      availableReservations: false,
      isDefault: false,
    });
  };

  const handleCreateLanguage = (): void => {
    setEditingLanguage(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleEditLanguage = (language: Language): void => {
    setEditingLanguage(language);
    setFormData({
      id: language.id,
      name: language.name,
      available: language.available,
      availableGuests: language.availableGuests,
      availableReservations: language.availableReservations,
      isDefault: language.isDefault,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (): void => {
    if (editingLanguage) {
      updateMutation.mutate({
        id: editingLanguage.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteLanguage = (id: string): void => {
    if (window.confirm('Are you sure you want to delete this language? This action cannot be undone.')) {
      deleteMutation.mutate(id);
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
        Failed to load languages
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Languages</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateLanguage}
        >
          New Language
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search languages..."
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

      {/* Languages Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Available</TableCell>
                  <TableCell>Guests</TableCell>
                  <TableCell>Reservations</TableCell>
                  <TableCell>Default</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {languagesData?.data?.map((language: Language) => (
                  <TableRow key={language.id} hover>
                    <TableCell>
                      <Chip label={language.id} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LanguageIcon color="primary" />
                        <Typography variant="body1" fontWeight="medium">
                          {language.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {language.available ? (
                        <Chip
                          icon={<CheckCircle />}
                          label="Yes"
                          size="small"
                          color="success"
                        />
                      ) : (
                        <Chip
                          icon={<Cancel />}
                          label="No"
                          size="small"
                          color="default"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {language.availableGuests ? (
                        <Chip label="Yes" size="small" color="success" />
                      ) : (
                        <Chip label="No" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {language.availableReservations ? (
                        <Chip label="Yes" size="small" color="success" />
                      ) : (
                        <Chip label="No" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {language.isDefault ? (
                        <Chip
                          icon={<CheckCircle />}
                          label="Default"
                          size="small"
                          color="warning"
                        />
                      ) : (
                        <Chip label="-" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedLanguage(language)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Language">
                          <IconButton
                            size="small"
                            onClick={() => handleEditLanguage(language)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Language">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteLanguage(language.id)}
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
                      No languages found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Language Details Dialog */}
      <Dialog
        open={!!selectedLanguage}
        onClose={() => setSelectedLanguage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LanguageIcon color="primary" />
            Language Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedLanguage && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Language ID
                </Typography>
                <Typography variant="body1">{selectedLanguage.id}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{selectedLanguage.name}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Available
                </Typography>
                {selectedLanguage.available ? (
                  <Chip label="Yes" size="small" color="success" />
                ) : (
                  <Chip label="No" size="small" />
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Available for Guests
                </Typography>
                {selectedLanguage.availableGuests ? (
                  <Chip label="Yes" size="small" color="success" />
                ) : (
                  <Chip label="No" size="small" />
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Available for Reservations
                </Typography>
                {selectedLanguage.availableReservations ? (
                  <Chip label="Yes" size="small" color="success" />
                ) : (
                  <Chip label="No" size="small" />
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Default
                </Typography>
                {selectedLanguage.isDefault ? (
                  <Chip label="Default" size="small" color="warning" />
                ) : (
                  <Chip label="No" size="small" />
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLanguage(null)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedLanguage) {
                handleEditLanguage(selectedLanguage);
                setSelectedLanguage(null);
              }
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Language Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingLanguage ? 'Edit Language' : 'Create New Language'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Language ID"
                required={!editingLanguage}
                disabled={!!editingLanguage}
                value={formData.id}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  id: e.target.value.toLowerCase(),
                }))}
                error={!editingLanguage && !formData.id.trim()}
                helperText={!editingLanguage && !formData.id.trim() ? 'Language ID is required' : 'e.g., en, ru, de'}
                placeholder="en"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Language Name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value,
                }))}
                error={!formData.name.trim()}
                helperText={!formData.name.trim() ? 'Language name is required' : ''}
                placeholder="English"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.available}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      available: e.target.checked,
                    }))}
                  />
                }
                label="Available"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.availableGuests}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      availableGuests: e.target.checked,
                    }))}
                  />
                }
                label="Available for Guests"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.availableReservations}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      availableReservations: e.target.checked,
                    }))}
                  />
                }
                label="Available for Reservations"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isDefault}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      isDefault: e.target.checked,
                    }))}
                  />
                }
                label="Set as Default"
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
              (!editingLanguage && !formData.id.trim()) ||
              !formData.name.trim() ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            {editingLanguage ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Languages;


