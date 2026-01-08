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
  Stack,
  Tooltip,
  CircularProgress,
  TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

interface Brand {
  _id: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/brands`;

export default function BrandsPage() {
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({ logo: '' });
  const [saving, setSaving] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<Brand | null>(null);

  const fetchBrands = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}`);
      if (res.data?.success) {
        setBrands(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleOpenDialog = () => {
    setFormData({ logo: '' });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({ logo: '' });
  };

  const handleSave = async () => {
    if (!formData.logo.trim()) return;
    
    setSaving(true);
    try {
      await axios.post(`${API_BASE}`, formData);
      handleCloseDialog();
      fetchBrands();
    } catch (error) {
      console.error('Error saving brand:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await axios.delete(`${API_BASE}/${deleteConfirm._id}`);
      setDeleteConfirm(null);
      fetchBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
    }
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>
            Brands
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Brand
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
                  <TableCell sx={{ fontWeight: 700 }}>Logo URL</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Preview</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {brands.map((brand, index) => (
                  <TableRow key={brand._id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {brand.logo}
                    </TableCell>
                    <TableCell>
                      <Box 
                        component="img" 
                        src={brand.logo} 
                        alt="brand" 
                        sx={{ height: 40, objectFit: 'contain', maxWidth: 100 }}
                        onError={(e: any) => { e.target.src = 'https://placehold.co/100x40?text=No+Image'; }}
                      />
                    </TableCell>
                    <TableCell>{new Date(brand.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => setDeleteConfirm(brand)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {brands.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No brands found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Brand</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Logo URL"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              fullWidth
              autoFocus
              helperText="Enter the full URL of the brand logo image"
            />
            {formData.logo && (
              <Box sx={{ mt: 2, p: 2, border: '1px dashed #ccc', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="caption" display="block" sx={{ mb: 1 }}>Preview:</Typography>
                <Box 
                  component="img" 
                  src={formData.logo} 
                  sx={{ maxHeight: 60, objectFit: 'contain' }}
                  onError={(e: any) => { e.target.style.display = 'none'; }}
                />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !formData.logo.trim()}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Brand</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this brand? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
