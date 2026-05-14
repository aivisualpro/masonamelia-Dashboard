'use client';

import * as React from 'react';
import {
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  CircularProgress,
  Button,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import axios from 'axios';
import { useTestimonials } from '@/api/hooks';

interface Testimonial {
  _id: string;
  name: string;
  review: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/testimonials`;
const initialFormState = { name: '', review: '', location: '' };

const fieldSx = (theme: any) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: theme.palette.divider },
    '&:hover fieldset': { borderColor: theme.palette.text.disabled },
  },
  '& .MuiInputBase-input::placeholder': { color: theme.palette.text.disabled, opacity: 1 },
});

export default function TestimonialsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { testimonials: rawTestimonials, isLoading: loading, mutate: mutateTestimonials } = useTestimonials();
  const testimonials = rawTestimonials as Testimonial[];
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [formData, setFormData] = React.useState(initialFormState);
  const [saving, setSaving] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<Testimonial | null>(null);

  // Inline edit
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState(initialFormState);

  // Expand description
  const [expandedReview, setExpandedReview] = React.useState<Record<string, boolean>>({});

  // Listen for header "Add Testimonial" button
  React.useEffect(() => {
    const handler = () => openAddDialog();
    window.addEventListener('open-add-testimonial', handler);
    return () => window.removeEventListener('open-add-testimonial', handler);
  }, []);

  // ── Add Dialog ────────────────────────────────────────────────
  const openAddDialog = React.useCallback(() => { setFormData(initialFormState); setDialogOpen(true); }, []);
  const closeAddDialog = React.useCallback(() => { setDialogOpen(false); setFormData(initialFormState); }, []);
  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.review || !formData.location) return;
    setSaving(true);
    try {
      await axios.post(`${API_BASE}`, formData);
      closeAddDialog();
      mutateTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
    } finally {
      setSaving(false);
    }
  };

  // ── Inline Edit ───────────────────────────────────────────────
  const startEdit = (t: Testimonial) => {
    setEditingId(t._id);
    setEditForm({ name: t.name, review: t.review, location: t.location });
  };
  const cancelEdit = React.useCallback(() => { setEditingId(null); }, []);
  const handleEditChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);
  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await axios.put(`${API_BASE}/${editingId}`, editForm);
      setEditingId(null);
      mutateTestimonials();
    } catch (error) {
      console.error('Error updating testimonial:', error);
    }
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await axios.delete(`${API_BASE}/${deleteConfirm._id}`);
      setDeleteConfirm(null);
      mutateTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    }
  };

  return (
    <>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress size={32} />
          </Box>
        ) : testimonials.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: theme.palette.text.secondary, fontSize: 15 }}>
            No testimonials found. Click &quot;Add Testimonial&quot; to create one.
          </Box>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 2,
          }}>
            {testimonials.map((t) => {
              const isEditing = editingId === t._id;

              return (
                <Box
                  key={t._id}
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      borderColor: isEditing ? theme.palette.primary.main : theme.palette.text.disabled,
                      boxShadow: isEditing ? 'none' : `0 2px 8px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)'}`,
                    },
                    ...(isEditing && { borderColor: theme.palette.primary.main }),
                  }}
                >
                  <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
                    {isEditing ? (
                      /* ── EDIT MODE ── */
                      <>
                        <TextField name="name" label="Name" size="small" value={editForm.name}
                          onChange={handleEditChange} fullWidth InputLabelProps={{ shrink: true }}
                          sx={fieldSx(theme)} />

                        <TextField name="review" label="Review" size="small" value={editForm.review}
                          onChange={handleEditChange} fullWidth multiline rows={4} InputLabelProps={{ shrink: true }}
                          sx={fieldSx(theme)} />

                        <TextField name="location" label="Location" size="small" value={editForm.location}
                          onChange={handleEditChange} fullWidth InputLabelProps={{ shrink: true }}
                          sx={fieldSx(theme)} />

                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                          <Button variant="contained" size="small" startIcon={<CheckIcon />} onClick={saveEdit}
                            disabled={!editForm.name || !editForm.review || !editForm.location}
                            sx={{ textTransform: 'none', fontSize: 12, flex: 1 }}>Save</Button>
                          <Button variant="outlined" size="small" startIcon={<CloseIcon />} onClick={cancelEdit}
                            sx={{ textTransform: 'none', fontSize: 12 }}>Cancel</Button>
                        </Stack>
                      </>
                    ) : (
                      /* ── VIEW MODE ── */
                      <>
                        {/* Row 1: Name */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{
                            width: 36, height: 36, borderRadius: '50%',
                            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <Typography sx={{ fontSize: 16, fontWeight: 700, color: theme.palette.text.primary }}>
                              {t.name?.charAt(0)?.toUpperCase()}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: 18, fontWeight: 700, color: theme.palette.text.primary, lineHeight: 1.3 }}>
                            {t.name}
                          </Typography>
                        </Box>

                        {/* Row 2: Review */}
                        <Box sx={{
                          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                          borderRadius: 1,
                          p: 1.5,
                          border: `1px solid ${theme.palette.divider}`,
                          position: 'relative',
                        }}>
                          <FormatQuoteIcon sx={{
                            position: 'absolute', top: 8, right: 8,
                            fontSize: 20, color: theme.palette.text.disabled, opacity: 0.4,
                          }} />
                          <Typography sx={{
                            fontSize: 13, color: theme.palette.text.secondary, lineHeight: 1.7,
                            ...(!expandedReview[t._id] && {
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }),
                          }}>
                            {t.review}
                          </Typography>
                          {t.review && t.review.length > 120 && (
                            <Typography
                              component="span"
                              onClick={() => setExpandedReview(prev => ({ ...prev, [t._id]: !prev[t._id] }))}
                              sx={{
                                fontSize: 12, color: theme.palette.primary.main, cursor: 'pointer',
                                fontWeight: 500, mt: 0.5, display: 'inline-block',
                                '&:hover': { textDecoration: 'underline' },
                              }}
                            >
                              {expandedReview[t._id] ? 'Show less' : 'Read more'}
                            </Typography>
                          )}
                        </Box>

                        {/* Row 3: Location */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOnIcon sx={{ fontSize: 16, color: theme.palette.text.disabled }} />
                          <Typography sx={{ fontSize: 13, color: theme.palette.text.secondary }}>
                            {t.location}
                          </Typography>
                        </Box>

                        {/* Row 4: Edit & Delete */}
                        <Box sx={{ display: 'flex', gap: 0.75, mt: 'auto', pt: 0.5 }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => startEdit(t)}
                              sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1, width: 30, height: 30 }}>
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => setDeleteConfirm(t)}
                              sx={{ border: `1px solid ${isDark ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 1, width: 30, height: 30 }}>
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* ── Add Testimonial Dialog ── */}
      <Dialog open={dialogOpen} onClose={closeAddDialog} maxWidth="sm" fullWidth
        PaperProps={{ sx: { backgroundColor: theme.palette.background.paper, backgroundImage: 'none', borderRadius: 3, border: `1px solid ${theme.palette.divider}` } }}>
        <DialogTitle sx={{ fontSize: 22, fontWeight: 700, color: theme.palette.text.primary, pb: 0.5 }}>
          Add Testimonial
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField name="name" label="Client Name *" value={formData.name} onChange={handleChange} fullWidth size="small"
              InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
              InputProps={{ sx: { color: theme.palette.text.primary } }} sx={fieldSx(theme)} />
            <TextField name="review" label="Review *" value={formData.review} onChange={handleChange} fullWidth multiline rows={4} size="small"
              InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
              InputProps={{ sx: { color: theme.palette.text.primary } }} sx={fieldSx(theme)} />
            <TextField name="location" label="Location *" value={formData.location} onChange={handleChange} fullWidth size="small"
              InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
              InputProps={{ sx: { color: theme.palette.text.primary } }} sx={fieldSx(theme)} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeAddDialog} disabled={saving} variant="outlined" sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: 14 }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !formData.name || !formData.review || !formData.location}
            sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600, fontSize: 14 }}>
            {saving ? 'Saving...' : 'Add Testimonial'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}
        PaperProps={{ sx: { backgroundColor: theme.palette.background.paper, backgroundImage: 'none', borderRadius: 3, border: `1px solid ${theme.palette.divider}` } }}>
        <DialogTitle sx={{ fontSize: 22, fontWeight: 700, color: theme.palette.text.primary }}>Delete Testimonial</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: 15 }}>
            Are you sure you want to delete the testimonial from &quot;{deleteConfirm?.name}&quot;? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteConfirm(null)} variant="outlined" sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: 14 }}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600, fontSize: 14 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
