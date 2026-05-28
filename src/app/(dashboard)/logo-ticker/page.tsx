'use client';

import * as React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Tooltip,
  CircularProgress,
  useTheme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import { useBrands } from '@/api/hooks';

interface Brand {
  _id: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/brands`;

export default function BrandsPage() {
  const { brands: rawBrands, isLoading: loading, mutate: mutateBrands } = useBrands();
  const brands = rawBrands as Brand[];
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<Brand | null>(null);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  // File upload state for Add dialog
  const [addFile, setAddFile] = React.useState<File | null>(null);
  const [addPreview, setAddPreview] = React.useState<string | null>(null);
  const addInputRef = React.useRef<HTMLInputElement>(null);

  // Hidden file input refs for per-card edit
  const editInputRef = React.useRef<HTMLInputElement>(null);
  const editTargetId = React.useRef<string | null>(null);

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Listen for header "Add Brand" button
  React.useEffect(() => {
    const handler = () => {
      setAddFile(null);
      setAddPreview(null);
      setDialogOpen(true);
    };
    window.addEventListener('open-add-brand', handler);
    return () => window.removeEventListener('open-add-brand', handler);
  }, []);

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setAddFile(null);
    setAddPreview(null);
  };

  const handleAddFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAddFile(file);
      setAddPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!addFile) return;

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('logo', addFile, addFile.name);
      await axios.post(API_BASE, fd);
      handleCloseDialog();
      mutateBrands();
    } catch (error) {
      console.error('Error saving brand:', error);
    } finally {
      setSaving(false);
    }
  };

  // Edit: trigger hidden file input for a specific brand
  const handleEditClick = (brandId: string) => {
    editTargetId.current = brandId;
    editInputRef.current?.click();
  };

  const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const brandId = editTargetId.current;
    if (!file || !brandId) return;

    // Reset input so re-selecting the same file triggers onChange
    e.target.value = '';

    setUpdatingId(brandId);
    try {
      const fd = new FormData();
      fd.append('logo', file, file.name);
      await axios.put(`${API_BASE}/${brandId}`, fd);
      mutateBrands();
    } catch (error) {
      console.error('Error updating brand:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await axios.delete(`${API_BASE}/${deleteConfirm._id}`);
      setDeleteConfirm(null);
      mutateBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
    }
  };

  return (
    <Box>
      {/* Hidden file input for editing cards */}
      <input
        ref={editInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleEditFileChange}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : brands.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>No brands yet</Typography>
          <Typography variant="body2">Click &quot;Add Brand&quot; to get started.</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
              lg: 'repeat(5, 1fr)',
              xl: 'repeat(6, 1fr)',
            },
            gap: 2,
          }}
        >
          {brands.map((brand) => {
            const isUpdating = updatingId === brand._id;
            return (
              <Box
                key={brand._id}
                sx={{
                  position: 'relative',
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  opacity: isUpdating ? 0.5 : 1,
                  '&:hover': {
                    borderColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.16)',
                    boxShadow: isDark
                      ? '0 4px 24px rgba(0,0,0,0.3)'
                      : '0 4px 24px rgba(0,0,0,0.08)',
                    transform: 'translateY(-2px)',
                    '& .brand-actions': {
                      opacity: 1,
                    },
                  },
                }}
              >
                {/* Updating spinner overlay */}
                {isUpdating && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)',
                      backdropFilter: 'blur(2px)',
                    }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                )}

                {/* Action buttons — visible on hover */}
                <Stack
                  className="brand-actions"
                  direction="row"
                  spacing={0.5}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 2,
                    opacity: 0,
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  <Tooltip title="Replace Image">
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(brand._id)}
                      sx={{
                        bgcolor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(4px)',
                        '&:hover': {
                          bgcolor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,1)',
                        },
                      }}
                    >
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteConfirm(brand)}
                      sx={{
                        bgcolor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(4px)',
                        '&:hover': {
                          bgcolor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,1)',
                        },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {/* Logo image area */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    minHeight: 120,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleEditClick(brand._id)}
                >
                  <Box
                    component="img"
                    src={brand.logo}
                    alt="brand"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 60,
                      objectFit: 'contain',
                      filter: isDark ? 'brightness(0.9)' : 'none',
                    }}
                    onError={(e: any) => {
                      e.target.src = 'https://placehold.co/160x60?text=No+Image';
                    }}
                  />
                </Box>


              </Box>
            );
          })}
        </Box>
      )}

      {/* Add Dialog — now uses file upload */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Brand</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <input
              ref={addInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAddFileChange}
            />
            <Box
              onClick={() => addInputRef.current?.click()}
              sx={{
                border: '2px dashed',
                borderColor: addPreview
                  ? 'primary.main'
                  : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                },
              }}
            >
              {addPreview ? (
                <Box>
                  <Box
                    component="img"
                    src={addPreview}
                    sx={{ maxHeight: 80, maxWidth: '100%', objectFit: 'contain', mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    {addFile?.name} — Click to change
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <CloudUploadIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Click to upload brand logo
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    PNG, JPG, SVG, or WEBP
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !addFile}>
            {saving ? 'Uploading...' : 'Save'}
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
