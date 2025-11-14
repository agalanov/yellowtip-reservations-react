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
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  AttachMoney,
  CheckCircle,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../services/api';

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  isBase: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    services: number;
  };
}

const Currencies: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    symbol: '',
    isBase: false,
  });

  const queryClient = useQueryClient();

  const {
    data: currenciesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-currencies', { search: searchQuery }],
    queryFn: () => apiService.getCurrencies({ search: searchQuery }),
  });

  const createMutation = useMutation({
    mutationFn: (currency: any) => apiService.createCurrency(currency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-currencies'] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiService.updateCurrency(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-currencies'] });
      setDialogOpen(false);
      setEditingCurrency(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteCurrency(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-currencies'] });
      setSelectedCurrency(null);
    },
  });

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      symbol: '',
      isBase: false,
    });
  };

  const handleCreateCurrency = (): void => {
    setEditingCurrency(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleEditCurrency = (currency: Currency): void => {
    setEditingCurrency(currency);
    setFormData({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      isBase: currency.isBase,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (): void => {
    if (editingCurrency) {
      updateMutation.mutate({
        id: editingCurrency.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteCurrency = (id: number): void => {
    if (window.confirm('Are you sure you want to delete this currency? This action cannot be undone.')) {
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
        Failed to load currencies
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Currencies</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateCurrency}
        >
          New Currency
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search currencies..."
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

      {/* Currencies Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Base Currency</TableCell>
                  <TableCell>Services</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currenciesData?.data?.map((currency: Currency) => (
                  <TableRow key={currency.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney color="primary" />
                        <Typography variant="body1" fontWeight="medium">
                          {currency.code}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{currency.name}</TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {currency.symbol}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {currency.isBase ? (
                        <Chip
                          icon={<CheckCircle />}
                          label="Base"
                          size="small"
                          color="success"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={currency._count?.services || 0}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{formatDate(currency.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedCurrency(currency)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Currency">
                          <IconButton
                            size="small"
                            onClick={() => handleEditCurrency(currency)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Currency">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteCurrency(currency.id)}
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
                      No currencies found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Currency Details Dialog */}
      <Dialog
        open={!!selectedCurrency}
        onClose={() => setSelectedCurrency(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoney color="primary" />
            Currency Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCurrency && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Code
                </Typography>
                <Typography variant="body1">{selectedCurrency.code}</Typography>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{selectedCurrency.name}</Typography>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Symbol
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {selectedCurrency.symbol}
                </Typography>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Base Currency
                </Typography>
                {selectedCurrency.isBase ? (
                  <Chip label="Yes" size="small" color="success" />
                ) : (
                  <Chip label="No" size="small" color="default" />
                )}
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Services Count
                </Typography>
                <Typography variant="body1">{selectedCurrency._count?.services || 0}</Typography>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1">{formatDate(selectedCurrency.createdAt)}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedCurrency(null)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedCurrency) {
                handleEditCurrency(selectedCurrency);
                setSelectedCurrency(null);
              }
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Currency Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCurrency ? 'Edit Currency' : 'Create New Currency'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
              <TextField
                fullWidth
                label="Currency Code"
                required
                value={formData.code}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  code: e.target.value.toUpperCase(),
                }))}
                error={!formData.code.trim()}
                helperText={!formData.code.trim() ? 'Currency code is required (e.g., USD, EUR)' : 'e.g., USD, EUR'}
                placeholder="USD"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
              <TextField
                fullWidth
                label="Currency Symbol"
                required
                value={formData.symbol}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  symbol: e.target.value,
                }))}
                error={!formData.symbol.trim()}
                helperText={!formData.symbol.trim() ? 'Symbol is required' : 'e.g., $, €, £'}
                placeholder="$"
              />
            </Box>
            <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
              <TextField
                fullWidth
                label="Currency Name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value,
                }))}
                error={!formData.name.trim()}
                helperText={!formData.name.trim() ? 'Currency name is required' : ''}
                placeholder="US Dollar"
              />
            </Box>
            <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isBase}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      isBase: e.target.checked,
                    }))}
                  />
                }
                label="Set as base currency"
              />
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                Base currency is used as the default currency for the system
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
              !formData.code.trim() ||
              !formData.name.trim() ||
              !formData.symbol.trim() ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            {editingCurrency ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Currencies;

