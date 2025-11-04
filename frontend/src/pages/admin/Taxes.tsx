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
  Receipt,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../services/api';
import { Tax, TaxRequest } from '../../types';

const Taxes: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [formData, setFormData] = useState<TaxRequest>({
    code: '',
    description: '',
    tax1: undefined,
    tax1Text: '',
    tax2: undefined,
    tax2Text: '',
    tax2On1: false,
    real: false,
  });

  const queryClient = useQueryClient();

  const {
    data: taxesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-taxes', { search: searchQuery }],
    queryFn: () => apiService.getTaxes({ search: searchQuery }),
  });

  const createMutation = useMutation({
    mutationFn: (tax: TaxRequest) => apiService.createTax(tax),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-taxes'] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TaxRequest> }) =>
      apiService.updateTax(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-taxes'] });
      setDialogOpen(false);
      setEditingTax(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteTax(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-taxes'] });
      setSelectedTax(null);
    },
  });

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      tax1: undefined,
      tax1Text: '',
      tax2: undefined,
      tax2Text: '',
      tax2On1: false,
      real: false,
    });
  };

  const handleCreateTax = (): void => {
    setEditingTax(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleEditTax = (tax: Tax): void => {
    setEditingTax(tax);
    setFormData({
      code: tax.code,
      description: tax.description || '',
      tax1: tax.tax1,
      tax1Text: tax.tax1Text || '',
      tax2: tax.tax2,
      tax2Text: tax.tax2Text || '',
      tax2On1: tax.tax2On1 || false,
      real: tax.real || false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (): void => {
    if (editingTax) {
      updateMutation.mutate({
        id: editingTax.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteTax = (id: number): void => {
    if (window.confirm('Are you sure you want to delete this tax? This action cannot be undone.')) {
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
        Failed to load taxes
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Taxes</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateTax}
        >
          New Tax
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search taxes..."
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

      {/* Taxes Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Tax 1</TableCell>
                  <TableCell>Tax 2</TableCell>
                  <TableCell>2 on 1</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {taxesData?.data?.map((tax: Tax) => (
                  <TableRow key={tax.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Receipt color="primary" />
                        <Chip label={tax.code} size="small" variant="outlined" />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {tax.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {tax.tax1 !== null && tax.tax1 !== undefined ? (
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {tax.tax1}%
                          </Typography>
                          {tax.tax1Text && (
                            <Typography variant="caption" color="text.secondary">
                              {tax.tax1Text}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {tax.tax2 !== null && tax.tax2 !== undefined ? (
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {tax.tax2}%
                          </Typography>
                          {tax.tax2Text && (
                            <Typography variant="caption" color="text.secondary">
                              {tax.tax2Text}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {tax.tax2On1 ? (
                        <Chip label="Yes" size="small" color="warning" />
                      ) : (
                        <Chip label="No" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedTax(tax)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Tax">
                          <IconButton
                            size="small"
                            onClick={() => handleEditTax(tax)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Tax">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTax(tax.id)}
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
                      No taxes found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Tax Details Dialog */}
      <Dialog
        open={!!selectedTax}
        onClose={() => setSelectedTax(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Receipt color="primary" />
            Tax Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTax && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Code
                </Typography>
                <Typography variant="body1">{selectedTax.code}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1">{selectedTax.description || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Tax 1
                </Typography>
                <Typography variant="body1">
                  {selectedTax.tax1 !== null && selectedTax.tax1 !== undefined
                    ? `${selectedTax.tax1}%${selectedTax.tax1Text ? ` (${selectedTax.tax1Text})` : ''}`
                    : '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Tax 2
                </Typography>
                <Typography variant="body1">
                  {selectedTax.tax2 !== null && selectedTax.tax2 !== undefined
                    ? `${selectedTax.tax2}%${selectedTax.tax2Text ? ` (${selectedTax.tax2Text})` : ''}`
                    : '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Tax 2 on Tax 1
                </Typography>
                {selectedTax.tax2On1 ? (
                  <Chip label="Yes" size="small" color="warning" />
                ) : (
                  <Chip label="No" size="small" />
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Real Tax
                </Typography>
                {selectedTax.real ? (
                  <Chip label="Yes" size="small" color="success" />
                ) : (
                  <Chip label="No" size="small" />
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTax(null)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedTax) {
                handleEditTax(selectedTax);
                setSelectedTax(null);
              }
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Tax Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTax ? 'Edit Tax' : 'Create New Tax'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Tax Code"
                required
                value={formData.code}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  code: e.target.value,
                }))}
                error={!formData.code.trim()}
                helperText={!formData.code.trim() ? 'Tax code is required' : ''}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: e.target.value,
                }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Tax 1 (%)"
                type="number"
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                value={formData.tax1 || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  tax1: e.target.value ? Number(e.target.value) : undefined,
                }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Tax 1 Text"
                value={formData.tax1Text}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  tax1Text: e.target.value,
                }))}
                placeholder="e.g., VAT"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Tax 2 (%)"
                type="number"
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                value={formData.tax2 || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  tax2: e.target.value ? Number(e.target.value) : undefined,
                }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Tax 2 Text"
                value={formData.tax2Text}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  tax2Text: e.target.value,
                }))}
                placeholder="e.g., Service Charge"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.tax2On1}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      tax2On1: e.target.checked,
                    }))}
                  />
                }
                label="Tax 2 on Tax 1"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.real}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      real: e.target.checked,
                    }))}
                  />
                }
                label="Real Tax"
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
              !formData.code.trim() ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            {editingTax ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Taxes;


