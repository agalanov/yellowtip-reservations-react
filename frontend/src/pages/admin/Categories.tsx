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
  Category,
  CheckCircle,
  Cancel,
  Palette,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../services/api';

interface Category {
  id: number;
  name: string;
  parentId: number;
  status: boolean;
  colorId: number;
  createdAt: string;
  updatedAt: string;
  color?: {
    id: number;
    name: string;
    hexCode: string;
    textColor: string;
  };
  _count?: {
    services: number;
  };
}

const Categories: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    parentId: 0,
    status: false,
    colorId: 1,
  });

  const queryClient = useQueryClient();

  const {
    data: categoriesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-categories', { search: searchQuery }],
    queryFn: () => apiService.getCategories({ search: searchQuery }),
  });

  const { data: colorsData } = useQuery({
    queryKey: ['admin-colors'],
    queryFn: () => apiService.getColors(),
  });

  const createMutation = useMutation({
    mutationFn: (category: any) => apiService.createCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setDialogOpen(false);
      setEditingCategory(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setSelectedCategory(null);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      parentId: 0,
      status: false,
      colorId: 1,
    });
  };

  const handleCreateCategory = (): void => {
    setEditingCategory(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleEditCategory = (category: Category): void => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      parentId: category.parentId,
      status: category.status,
      colorId: category.colorId,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (): void => {
    if (editingCategory) {
      updateMutation.mutate({
        id: editingCategory.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteCategory = (id: number): void => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
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
        Failed to load categories
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Categories</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateCategory}
        >
          New Category
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search categories..."
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

      {/* Categories Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell>Parent</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Services</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categoriesData?.data?.map((category: Category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Category color="primary" />
                        <Typography variant="body1" fontWeight="medium">
                          {category.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {category.color && (
                        <Chip
                          label={category.color.name}
                          size="small"
                          sx={{
                            backgroundColor: `#${category.color.hexCode}`,
                            color: category.color.textColor || '#000',
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {category.parentId > 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          Parent ID: {category.parentId}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Root
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {category.status ? (
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
                    <TableCell>
                      <Chip
                        label={category._count?.services || 0}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{formatDate(category.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedCategory(category)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Category">
                          <IconButton
                            size="small"
                            onClick={() => handleEditCategory(category)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Category">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteCategory(category.id)}
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
                      No categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Category Details Dialog */}
      <Dialog
        open={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Category color="primary" />
            Category Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCategory && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{selectedCategory.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                {selectedCategory.status ? (
                  <Chip label="Active" size="small" color="success" />
                ) : (
                  <Chip label="Inactive" size="small" color="default" />
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Parent ID
                </Typography>
                <Typography variant="body1">{selectedCategory.parentId || 'Root'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Services Count
                </Typography>
                <Typography variant="body1">{selectedCategory._count?.services || 0}</Typography>
              </Grid>
              {selectedCategory.color && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Color
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={selectedCategory.color.name}
                      size="medium"
                      sx={{
                        backgroundColor: `#${selectedCategory.color.hexCode}`,
                        color: selectedCategory.color.textColor || '#000',
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      #{selectedCategory.color.hexCode}
                    </Typography>
                  </Box>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1">{formatDate(selectedCategory.createdAt)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Updated At
                </Typography>
                <Typography variant="body1">{formatDate(selectedCategory.updatedAt)}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedCategory(null)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedCategory) {
                handleEditCategory(selectedCategory);
                setSelectedCategory(null);
              }
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Category Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Create New Category'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value,
                }))}
                error={!formData.name.trim()}
                helperText={!formData.name.trim() ? 'Category name is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Parent ID"
                type="number"
                inputProps={{ min: 0 }}
                value={formData.parentId}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  parentId: Number(e.target.value) || 0,
                }))}
                helperText="0 for root category"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Color</InputLabel>
                <Select
                  value={formData.colorId}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    colorId: Number(e.target.value),
                  }))}
                  label="Color"
                >
                  {colorsData?.map((color: any) => (
                    <MenuItem key={color.id} value={color.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            backgroundColor: `#${color.hexCode}`,
                            borderRadius: 0.5,
                            border: '1px solid #ccc',
                          }}
                        />
                        {color.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.status}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      status: e.target.checked,
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
            disabled={
              !formData.name.trim() ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories;

