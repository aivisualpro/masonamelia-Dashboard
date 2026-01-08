'use client';

import * as React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Tooltip,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

interface Category {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/aircraftCategories`;

export default function JetsCategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [formData, setFormData] = React.useState({ name: '', slug: '' });
  const [saving, setSaving] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<Category | null>(null);

  const fetchCategories = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/lists`);
      if (res.data?.success) {
        setCategories(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, slug: category.slug });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', slug: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', slug: '' });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      name,
      slug: generateSlug(name)
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    
    setSaving(true);
    try {
      if (editingCategory) {
        await axios.put(`${API_BASE}/${editingCategory._id}`, formData);
      } else {
        await axios.post(`${API_BASE}`, formData);
      }
      handleCloseDialog();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await axios.delete(`${API_BASE}/${deleteConfirm._id}`);
      setDeleteConfirm(null);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>
            Aircraft Categories
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Category
          </Button>
        </Stack>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Slug</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((cat, index) => (
                  <TableRow key={cat._id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{cat.name}</TableCell>
                    <TableCell>{cat.slug}</TableCell>
                    <TableCell>{new Date(cat.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenDialog(cat)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => setDeleteConfirm(cat)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Category Name"
              value={formData.name}
              onChange={handleNameChange}
              fullWidth
              autoFocus
            />
            <TextField
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              fullWidth
              helperText="Auto-generated from name"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !formData.name.trim()}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          Are you sure you want to delete &quot;{deleteConfirm?.name}&quot;? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
