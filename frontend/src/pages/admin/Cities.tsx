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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  LocationCity,
  CheckCircle,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../services/api';
import { City, CityRequest, Country } from '../../types';

const Cities: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [formData, setFormData] = useState<CityRequest>({
    name: '',
    country: 0,
    isDefault: 'N',
  });

  const queryClient = useQueryClient();

  const {
    data: citiesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-cities', { search: searchQuery }],
    queryFn: () => apiService.getCities({ search: searchQuery }),
  });

  const { data: countriesData } = useQuery({
    queryKey: ['admin-countries', { limit: 1000 }],
    queryFn: () => apiService.getCountries({ limit: 1000 }),
  });

  const createMutation = useMutation({
    mutationFn: (city: CityRequest) => apiService.createCity(city),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CityRequest> }) =>
      apiService.updateCity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
      setDialogOpen(false);
      setEditingCity(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteCity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
      setSelectedCity(null);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      country: 0,
      isDefault: 'N',
    });
  };

  const handleCreateCity = (): void => {
    setEditingCity(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleEditCity = (city: City): void => {
    setEditingCity(city);
    setFormData({
      name: city.name,
      country: city.country,
      isDefault: city.isDefault || 'N',
    });
    setDialogOpen(true);
  };

  const handleSubmit = (): void => {
    if (editingCity) {
      updateMutation.mutate({
        id: editingCity.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteCity = (id: number): void => {
    if (window.confirm('Are you sure you want to delete this city? This action cannot be undone.')) {
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
        Failed to load cities
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Cities</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateCity}
        >
          New City
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search cities..."
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

      {/* Cities Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Default</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {citiesData?.data?.map((city: City) => (
                  <TableRow key={city.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationCity color="primary" />
                        <Typography variant="body1" fontWeight="medium">
                          {city.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {city.countryRef ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={city.countryRef.code}
                            size="small"
                            variant="outlined"
                          />
                          <Typography variant="body2" color="text.secondary">
                            {city.countryRef.name}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Country ID: {city.country}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {city.isDefault === 'Y' ? (
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
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedCity(city)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit City">
                          <IconButton
                            size="small"
                            onClick={() => handleEditCity(city)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete City">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteCity(city.id)}
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
                    <TableCell colSpan={4} align="center">
                      No cities found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* City Details Dialog */}
      <Dialog
        open={!!selectedCity}
        onClose={() => setSelectedCity(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationCity color="primary" />
            City Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCity && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{selectedCity.name}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Country
                </Typography>
                {selectedCity.countryRef ? (
                  <Box>
                    <Typography variant="body1">{selectedCity.countryRef.name}</Typography>
                    <Chip
                      label={selectedCity.countryRef.code}
                      size="small"
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                ) : (
                  <Typography variant="body1">Country ID: {selectedCity.country}</Typography>
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Default
                </Typography>
                {selectedCity.isDefault === 'Y' ? (
                  <Chip label="Default" size="small" color="success" />
                ) : (
                  <Chip label="No" size="small" />
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedCity(null)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedCity) {
                handleEditCity(selectedCity);
                setSelectedCity(null);
              }
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit City Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCity ? 'Edit City' : 'Create New City'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="City Name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value,
                }))}
                error={!formData.name.trim()}
                helperText={!formData.name.trim() ? 'City name is required' : ''}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Country</InputLabel>
                <Select
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    country: Number(e.target.value),
                  }))}
                  label="Country"
                  error={formData.country === 0}
                >
                  <MenuItem value={0}>Select Country</MenuItem>
                  {countriesData?.data?.map((country: Country) => (
                    <MenuItem key={country.id} value={country.id}>
                      {country.name} ({country.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              formData.country === 0 ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            {editingCity ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Cities;


