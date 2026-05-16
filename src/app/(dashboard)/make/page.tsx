'use client';

import * as React from 'react';
import {
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Tooltip,
  CircularProgress,
  Button,
  Chip,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import FlightIcon from '@mui/icons-material/Flight';
import axios from 'axios';
import { useAircraftCategories, useAircraftCounts } from '@/api/hooks';

interface Category {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryCount {
  [categoryId: string]: number;
}

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/aircraftCategories`;

export default function JetsCategoriesPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { categories: rawCategories, isLoading: loading, mutate: mutateCategories } = useAircraftCategories();
  const categories = rawCategories as Category[];
  const { categoryCounts: rawCounts, mutate: mutateCounts } = useAircraftCounts();
  const categoryCounts = rawCounts as CategoryCount;
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: '', slug: '' });
  const [saving, setSaving] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<Category | null>(null);

  // Inline editing state
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState({ name: '', slug: '' });

  // Listen for "Add Category" button in the main header
  React.useEffect(() => {
    const handler = () => openAddDialog();
    window.addEventListener('open-add-category', handler);
    return () => window.removeEventListener('open-add-category', handler);
  }, []);

  const openAddDialog = React.useCallback(() => {
    setFormData({ name: '', slug: '' });
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = React.useCallback(() => {
    setDialogOpen(false);
    setFormData({ name: '', slug: '' });
  }, []);

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({ name, slug: generateSlug(name) });
  }, []);

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      await axios.post(`${API_BASE}`, formData);
      handleCloseDialog();
      mutateCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setSaving(false);
    }
  };

  // Inline edit
  const startEdit = (cat: Category) => {
    setEditingId(cat._id);
    setEditForm({ name: cat.name, slug: cat.slug });
  };

  const cancelEdit = React.useCallback(() => {
    setEditingId(null);
    setEditForm({ name: '', slug: '' });
  }, []);

  const saveEdit = async () => {
    if (!editingId || !editForm.name.trim()) return;
    try {
      await axios.put(`${API_BASE}/${editingId}`, editForm);
      setEditingId(null);
      mutateCategories();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleEditNameChange = (val: string) => {
    setEditForm({ name: val, slug: generateSlug(val) });
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await axios.delete(`${API_BASE}/${deleteConfirm._id}`);
      setDeleteConfirm(null);
      mutateCategories();
      mutateCounts();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress size={32} />
          </Box>
        ) : categories.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: theme.palette.text.secondary, fontSize: 15 }}>
            No categories found. Click &quot;Add Category&quot; to create one.
          </Box>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}>
            {categories.map((cat) => {
              const count = categoryCounts[cat._id] || 0;
              const isEditing = editingId === cat._id;

              return (
                <Box
                  key={cat._id}
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    p: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      borderColor: isEditing ? theme.palette.primary.main : theme.palette.text.disabled,
                      boxShadow: isEditing ? 'none' : `0 2px 8px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)'}`,
                    },
                    ...(isEditing && {
                      borderColor: theme.palette.primary.main,
                    }),
                  }}
                >
                  {/* Top row: Jet count chip */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Chip
                      icon={<FlightIcon sx={{ fontSize: 14 }} />}
                      label={`${count} jet${count !== 1 ? 's' : ''}`}
                      size="small"
                      sx={{
                        height: 26,
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor: count > 0
                          ? (isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)')
                          : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                        color: count > 0 ? '#22c55e' : theme.palette.text.disabled,
                        border: `1px solid ${count > 0 ? 'rgba(34,197,94,0.3)' : theme.palette.divider}`,
                        '& .MuiChip-icon': {
                          color: 'inherit',
                        },
                      }}
                    />
                  </Box>

                  {/* Content */}
                  {isEditing ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <TextField
                        value={editForm.name}
                        onChange={(e) => handleEditNameChange(e.target.value)}
                        size="small"
                        fullWidth
                        autoFocus
                        label="Name"
                        InputLabelProps={{ shrink: true }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                      />
                      <TextField
                        value={editForm.slug}
                        onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                        size="small"
                        fullWidth
                        label="Slug"
                        InputLabelProps={{ shrink: true }}
                      />
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<CheckIcon />}
                          onClick={saveEdit}
                          sx={{ textTransform: 'none', fontSize: 12, flex: 1 }}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<CloseIcon />}
                          onClick={cancelEdit}
                          sx={{ textTransform: 'none', fontSize: 12 }}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Box>
                  ) : (
                    <>
                      <Box>
                        <Typography sx={{ fontSize: 22, fontWeight: 700, color: theme.palette.text.primary, lineHeight: 1.3 }}>
                          {cat.name}
                        </Typography>
                        <Typography sx={{ fontSize: 14, color: theme.palette.text.secondary, mt: 0.5 }}>
                          {cat.slug}
                        </Typography>
                      </Box>

                      {/* Actions */}
                      <Box sx={{ display: 'flex', gap: 0.75, mt: 'auto', pt: 1 }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => startEdit(cat)}
                            sx={{
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 1,
                              width: 30,
                              height: 30,
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        {count === 0 && (
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteConfirm(cat)}
                              sx={{
                                border: `1px solid ${isDark ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)'}`,
                                borderRadius: 1,
                                width: 30,
                                height: 30,
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Add Category Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            backgroundImage: 'none',
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
          }
        }}
      >
        <DialogTitle sx={{ fontSize: 22, fontWeight: 700, color: theme.palette.text.primary, pb: 0.5 }}>
          Add Category
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 2 }}>
            <TextField
              label="Category Name"
              value={formData.name}
              onChange={handleNameChange}
              fullWidth
              autoFocus
              placeholder="e.g. Light Jets"
              InputLabelProps={{ shrink: true, sx: { fontSize: 16, color: theme.palette.text.secondary } }}
              InputProps={{ sx: { fontSize: 15, color: theme.palette.text.primary } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: theme.palette.divider },
                  '&:hover fieldset': { borderColor: theme.palette.text.disabled },
                },
                '& .MuiInputBase-input::placeholder': { color: theme.palette.text.disabled, opacity: 1 },
              }}
            />
            <TextField
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              fullWidth
              placeholder="e.g. light-jets"
              InputLabelProps={{ shrink: true, sx: { fontSize: 16, color: theme.palette.text.secondary } }}
              InputProps={{ sx: { fontSize: 15, color: theme.palette.text.primary } }}
              helperText="Auto-generated from name. Used in URLs."
              FormHelperTextProps={{ sx: { color: theme.palette.text.disabled } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: theme.palette.divider },
                  '&:hover fieldset': { borderColor: theme.palette.text.disabled },
                },
                '& .MuiInputBase-input::placeholder': { color: theme.palette.text.disabled, opacity: 1 },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleCloseDialog} disabled={saving} variant="outlined" sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: 14 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !formData.name.trim()}
            sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600, fontSize: 14 }}
          >
            {saving ? 'Saving...' : 'Create Category'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            backgroundImage: 'none',
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
          }
        }}
      >
        <DialogTitle sx={{ fontSize: 22, fontWeight: 700, color: theme.palette.text.primary }}>
          Delete Category
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: 15 }}>
            Are you sure you want to delete &quot;{deleteConfirm?.name}&quot;? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteConfirm(null)} variant="outlined" sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: 14 }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600, fontSize: 14 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
