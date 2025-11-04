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
  Public,
  CheckCircle,
  Star,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../services/api';
import { Country, CountryRequest } from '../../types';

const Countries: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [formData, setFormData] = useState<CountryRequest>({
    name: '',
    code: '',
    topPulldown: 'N',
    isDefault: 'N',
  });

  const queryClient = useQueryClient();

  const {
    data: countriesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-countries', { search: searchQuery }],
    queryFn: () => apiService.getCountries({ search: searchQuery }),
  });

  const createMutation = useMutation({
    mutationFn: (country: CountryRequest) => apiService.createCountry(country),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-countries'] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CountryRequest> }) =>
      apiService.updateCountry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-countries'] });
      setDialogOpen(false);
      setEditingCountry(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteCountry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-countries'] });
      setSelectedCountry(null);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      topPulldown: 'N',
      isDefault: 'N',
    });
  };

  const handleCreateCountry = (): void => {
    setEditingCountry(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleEditCountry = (country: Country): void => {
    setEditingCountry(country);
    setFormData({
      name: country.name,
      code: country.code,
      topPulldown: country.topPulldown || 'N',
      isDefault: country.isDefault || 'N',
    });
    setDialogOpen(true);
  };

  const handleSubmit = (): void => {
    if (editingCountry) {
      updateMutation.mutate({
        id: editingCountry.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteCountry = (id: number): void => {
    if (window.confirm('Are you sure you want to delete this country? This action cannot be undone.')) {
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
        Failed to load countries
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Countries</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateCountry}
        >
          New Country
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search countries..."
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

      {/* Countries Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Top Pulldown</TableCell>
                  <TableCell>Default</TableCell>
                  <TableCell>Cities</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {countriesData?.data?.map((country: Country) => (
                  <TableRow key={country.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Public color="primary" />
                        <Typography variant="body1" fontWeight="medium">
                          {country.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={country.code} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {country.topPulldown === 'Y' ? (
                        <Chip icon={<Star />} label="Yes" size="small" color="warning" />
                      ) : (
                        <Chip label="No" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {country.isDefault === 'Y' ? (
                        <Chip
                          icon={<CheckCircle />}
                          label="Default"
                          size="small"
                          color="success"
                        />
                      ) : (
                        <Chip label="-" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={country.cities?.length || 0}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedCountry(country)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Country">
                          <IconButton
                            size="small"
                            onClick={() => handleEditCountry(country)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Country">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteCountry(country.id)}
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
                      No countries found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Country Details Dialog */}
      <Dialog
        open={!!selectedCountry}
        onClose={() => setSelectedCountry(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Public color="primary" />
            Country Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCountry && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{selectedCountry.name}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Code
                </Typography>
                <Typography variant="body1">{selectedCountry.code}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Top Pulldown
                </Typography>
                {selectedCountry.topPulldown === 'Y' ? (
                  <Chip label="Yes" size="small" color="warning" />
                ) : (
                  <Chip label="No" size="small" />
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Default
                </Typography>
                {selectedCountry.isDefault === 'Y' ? (
                  <Chip label="Default" size="small" color="success" />
                ) : (
                  <Chip label="No" size="small" />
                )}
              </Grid>
              {selectedCountry.cities && selectedCountry.cities.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Cities ({selectedCountry.cities.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedCountry.cities.map((city) => (
                      <Chip
                        key={city.id}
                        label={city.name}
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
          <Button onClick={() => setSelectedCountry(null)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedCountry) {
                handleEditCountry(selectedCountry);
                setSelectedCountry(null);
              }
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Country Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCountry ? 'Edit Country' : 'Create New Country'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Country Name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value,
                }))}
                error={!formData.name.trim()}
                helperText={!formData.name.trim() ? 'Country name is required' : ''}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Country Code"
                required
                value={formData.code}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  code: e.target.value.toUpperCase(),
                }))}
                error={!formData.code.trim()}
                helperText={!formData.code.trim() ? 'Country code is required' : ''}
                inputProps={{ maxLength: 3 }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.topPulldown === 'Y'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      topPulldown: e.target.checked ? 'Y' : 'N',
                    }))}
                  />
                }
                label="Top Pulldown"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isDefault === 'Y'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      isDefault: e.target.checked ? 'Y' : 'N',
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
              !formData.name.trim() ||
              !formData.code.trim() ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            {editingCountry ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Countries;


