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
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import UploadIcon from '@mui/icons-material/Upload';
import AddIcon from '@mui/icons-material/Add';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import axios from 'axios';
import Image from 'next/image';
import { useTeams, useContact } from '@/api/hooks';
import { optimizeCloudinaryUrl } from '@/utils/cloudinary';
import { compressImage } from '@/utils/compressImage';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface TeamMember {
  _id: string;
  name: string;
  profile_picture: string;
  team_member_picture?: string;
  description: string;
  designation: string;
  phone: string;
  email: string;
  address: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
}

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/teams`;

const initialFormState = {
  name: '', profile_picture: '', team_member_picture: '', description: '',
  designation: '', phone: '', email: '', address: '',
  facebook: '', instagram: '', linkedin: '', youtube: '',
};

// ── TextField helper ────────────────────────────────────────────
const fieldSx = (theme: any) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: theme.palette.divider },
    '&:hover fieldset': { borderColor: theme.palette.text.disabled },
  },
  '& .MuiInputBase-input::placeholder': { color: theme.palette.text.disabled, opacity: 1 },
});

export default function MeetTheTeamContent() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { members: rawMembers, isLoading: loading, mutate: mutateMembers } = useTeams();
  const members = rawMembers as TeamMember[];

  // ── Hero Section (from Contact singleton) ──
  const { contact, mutate: mutateContact } = useContact();
  const HERO_DEFAULTS = {
    title: 'Meet the Team',
    desc: 'Meet the aviation experts and passionate professionals behind Mason Amelia. Our mission is to elevate your flight experience through transparency, expertise, and personalized service.',
  };
  const [heroTitle, setHeroTitle] = React.useState(HERO_DEFAULTS.title);
  const [heroDesc, setHeroDesc] = React.useState(HERO_DEFAULTS.desc);
  const [heroBgImage, setHeroBgImage] = React.useState('');
  const [heroSaving, setHeroSaving] = React.useState(false);
  const [notification, setNotification] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Sync hero from API
  React.useEffect(() => {
    if (contact) {
      setHeroTitle(contact.team_hero_title || HERO_DEFAULTS.title);
      setHeroDesc(contact.team_hero_description || HERO_DEFAULTS.desc);
      setHeroBgImage(contact.team_hero_bg_image || '');
    }
  }, [contact]);

  const saveHero = React.useCallback(async () => {
    setHeroSaving(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/contact`, {
        ...contact,
        team_hero_title: heroTitle,
        team_hero_description: heroDesc,
        team_hero_bg_image: heroBgImage,
      });
      mutateContact();
      setNotification({ message: 'Hero section saved', type: 'success' });
    } catch {
      setNotification({ message: 'Failed to save', type: 'error' });
    } finally {
      setHeroSaving(false);
    }
  }, [contact, heroTitle, heroDesc, heroBgImage, mutateContact]);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [formData, setFormData] = React.useState(initialFormState);
  const [saving, setSaving] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<TeamMember | null>(null);

  // Inline edit
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState(initialFormState);
  const editPicRef = React.useRef<HTMLInputElement>(null);
  const [editPicFile, setEditPicFile] = React.useState<File | null>(null);
  const editDetailPicRef = React.useRef<HTMLInputElement>(null);
  const [editDetailPicFile, setEditDetailPicFile] = React.useState<File | null>(null);
  const [expandedDesc, setExpandedDesc] = React.useState<Record<string, boolean>>({});

  // Add dialog upload
  const addPicRef = React.useRef<HTMLInputElement>(null);
  const [addPicFile, setAddPicFile] = React.useState<File | null>(null);
  const addDetailPicRef = React.useRef<HTMLInputElement>(null);
  const [addDetailPicFile, setAddDetailPicFile] = React.useState<File | null>(null);

  // Listen for header "Add Member" button
  React.useEffect(() => {
    const handler = () => openAddDialog();
    window.addEventListener('open-add-member', handler);
    return () => window.removeEventListener('open-add-member', handler);
  }, []);

  // Listen for header "Save Changes" button
  React.useEffect(() => {
    const handler = () => saveHero();
    window.addEventListener('save-contact', handler);
    return () => window.removeEventListener('save-contact', handler);
  }, [saveHero]);

  // ── Add Dialog ────────────────────────────────────────────────
  const openAddDialog = React.useCallback(() => { setFormData(initialFormState); setAddPicFile(null); setAddDetailPicFile(null); setDialogOpen(true); }, []);
  const closeAddDialog = React.useCallback(() => { setDialogOpen(false); setFormData(initialFormState); setAddPicFile(null); setAddDetailPicFile(null); }, []);
  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('logo', file); // reuse brands upload or a generic endpoint
    // Upload via cloudinary directly using our brands API pattern
    const arrayBuf = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuf)));
    const dataUrl = `data:${file.type};base64,${base64}`;
    return dataUrl; // Fallback: store as URL; ideally use Cloudinary
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.designation) return;
    setSaving(true);
    try {
      let profilePic = formData.profile_picture;
      if (addPicFile) {
        const compressed = await compressImage(addPicFile);
        const fd = new FormData();
        fd.append('file', compressed);
        const uploadRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/upload`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (uploadRes.data?.url) profilePic = uploadRes.data.url;
      }
      let detailPic = formData.team_member_picture;
      if (addDetailPicFile) {
        const compressed = await compressImage(addDetailPicFile);
        const fd = new FormData();
        fd.append('file', compressed);
        const uploadRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/upload`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (uploadRes.data?.url) detailPic = uploadRes.data.url;
      }
      await axios.post(`${API_BASE}`, { ...formData, profile_picture: profilePic, team_member_picture: detailPic });
      closeAddDialog();
      mutateMembers();
    } catch (error) {
      console.error('Error saving team member:', error);
    } finally {
      setSaving(false);
    }
  };

  // ── Inline Edit ───────────────────────────────────────────────
  const startEdit = (m: TeamMember) => {
    setEditingId(m._id);
    setEditPicFile(null);
    setEditDetailPicFile(null);
    setEditForm({
      name: m.name, profile_picture: m.profile_picture, team_member_picture: m.team_member_picture || '',
      description: m.description, designation: m.designation, phone: m.phone, email: m.email,
      address: m.address, facebook: m.facebook || '', instagram: m.instagram || '',
      linkedin: m.linkedin || '', youtube: m.youtube || '',
    });
  };
  const cancelEdit = React.useCallback(() => { setEditingId(null); setEditPicFile(null); setEditDetailPicFile(null); }, []);
  const handleEditChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);
  const saveEdit = async () => {
    if (!editingId) return;
    try {
      let profilePic = editForm.profile_picture;
      if (editPicFile) {
        const compressed = await compressImage(editPicFile);
        const fd = new FormData();
        fd.append('file', compressed);
        const uploadRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/upload`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (uploadRes.data?.url) profilePic = uploadRes.data.url;
      }
      let detailPic = editForm.team_member_picture;
      if (editDetailPicFile) {
        const compressed = await compressImage(editDetailPicFile);
        const fd = new FormData();
        fd.append('file', compressed);
        const uploadRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/upload`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (uploadRes.data?.url) detailPic = uploadRes.data.url;
      }
      await axios.put(`${API_BASE}/${editingId}`, { ...editForm, profile_picture: profilePic, team_member_picture: detailPic });
      setEditingId(null);
      setEditPicFile(null);
      setEditDetailPicFile(null);
      mutateMembers();
    } catch (error) {
      console.error('Error updating team member:', error);
    }
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await axios.delete(`${API_BASE}/${deleteConfirm._id}`);
      setDeleteConfirm(null);
      mutateMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  // Social icon helper
  const SocialIcon = ({ url, Icon, color, label }: { url?: string; Icon: any; color: string; label: string }) => {
    if (!url) return null;
    return (
      <Tooltip title={url}>
        <IconButton
          size="small"
          href={url}
          target="_blank"
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            width: 30,
            height: 30,
          }}
        >
          <Icon sx={{ fontSize: 16, color }} />
        </IconButton>
      </Tooltip>
    );
  };

  return (
    <>
      {/* ── Hero Section Editor ── */}
      <Paper elevation={0} sx={{
        p: 0,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        mb: 2,
        overflow: 'hidden',
      }}>
        {/* Toolbar */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: theme.palette.text.secondary }}>
              Hero Section · Team Page
            </Typography>
            <Typography sx={{ fontSize: 11, color: theme.palette.text.disabled, fontStyle: 'italic' }}>
              Click text to edit · Background image controllable
            </Typography>
          </Box>
          <label htmlFor="hero-bg-upload">
              <input
                id="hero-bg-upload"
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;
                  try {
                    // Compress before uploading — hero images can be larger
                    const compressed = await compressImage(file, { maxWidth: 1920, maxHeight: 1080 });
                    const fd = new FormData();
                    fd.append('file', compressed);
                    const res = await axios.post('/api/upload', fd);
                    if (res.data?.url) {
                      setHeroBgImage(res.data.url);
                      setNotification({ message: 'Background image updated', type: 'success' });
                    }
                  } catch {
                    setNotification({ message: 'Upload failed', type: 'error' });
                  }
                }}
              />
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  color: theme.palette.text.secondary,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.15s',
                  '&:hover': {
                    color: theme.palette.primary.main,
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 14 }} /> Change Background
              </Box>
            </label>
        </Box>

        {/* Hero Preview — EXACT replica of website TeamPage hero */}
        {/* Website: <section class="relative w-full min-h-[70vh] flex flex-col items-center justify-center overflow-hidden"> */}
        <Box sx={{
          position: 'relative',
          width: '100%',
          minHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {/* Website: <div class="absolute inset-0" style="backgroundImage: url(bgPlane)"> */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            ...(heroBgImage ? {
              backgroundImage: `url(${heroBgImage})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
            } : {
              backgroundColor: '#0c0d12',
            }),
          }} />

          {/* Website: <div class="absolute inset-0 bg-[#111218] opacity-60 md:opacity-95 z-[1]"> */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#111218',
            opacity: 0.95,
            zIndex: 1,
          }} />

          {/* Website: <div class="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#0c0d12] to-transparent z-[2]"> */}
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '192px', // h-48 = 12rem = 192px
            background: 'linear-gradient(to top, #0c0d12, transparent)',
            zIndex: 2,
          }} />

          {/* Website: <div class="container relative z-[10] px-5 text-center pt-[132px] pb-[32px] md:mt-20"> */}
          <Box sx={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: '1280px',
            mx: 'auto',
            px: '20px', // px-5
            textAlign: 'center',
            pt: '80px', // scaled from 132px since no navbar
            pb: '32px',
          }}>
            {/* Website: <h1 class="text-[3rem] xl:text-[3.5rem] 2xl:text-7xl font-bold tracking-tight mb-6 md:mt-20" style="fontFamily: Inter Tight"> */}
            {/*   <span class="text-[#268AE0]">Meet the Team</span> */}
            <Box
              component="h1"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => { const t = (e.target as HTMLElement)?.innerText ?? ''; setHeroTitle(t); }}
              sx={{
                fontSize: '3rem', // text-[3rem]
                fontWeight: 700, // font-bold
                color: '#268AE0',
                letterSpacing: '-0.025em', // tracking-tight
                mb: '24px', // mb-6
                mt: '40px', // md:mt-20 (scaled)
                lineHeight: 1.2,
                fontFamily: "'Inter Tight', sans-serif",
                outline: 'none',
                cursor: 'text',
                px: 1,
                py: 0.3,
                borderRadius: 0.5,
                transition: 'background-color 0.15s', whiteSpace: 'pre-line',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
                '&:focus': {
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  boxShadow: '0 0 0 1px rgba(38,138,224,0.4)',
                },
              }}
            >
              {heroTitle}
            </Box>

            {/* Website: <div class="max-w-3xl mx-auto mt-4 px-4 md:px-0"> */}
            {/*   <ShinyText text="..." class="text-lg md:text-xl font-light leading-relaxed" color="text-white/70" /> */}
            <Box sx={{ maxWidth: '48rem', mx: 'auto', mt: '16px' }}> {/* max-w-3xl = 48rem, mt-4 = 16px */}
              <Box
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => { const t = (e.target as HTMLElement)?.innerText ?? ''; setHeroDesc(t); }}
                sx={{
                  fontSize: '1.25rem', // text-xl
                  fontWeight: 300, // font-light
                  lineHeight: 1.625, // leading-relaxed
                  color: 'rgba(255,255,255,0.7)', // text-white/70
                  outline: 'none',
                  cursor: 'text',
                  px: 1,
                  py: 0.3,
                  borderRadius: 0.5,
                  transition: 'background-color 0.15s', whiteSpace: 'pre-line',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
                  '&:focus': {
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    boxShadow: '0 0 0 1px rgba(38,138,224,0.4)',
                  },
                }}
              >
                {heroDesc}
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Header with Add button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: theme.palette.text.primary }}>
          Meet the Team
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={openAddDialog}
          sx={{ textTransform: 'none', fontSize: 13, fontWeight: 500, borderRadius: 1.5 }}
        >
          Add Member
        </Button>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress size={32} />
          </Box>
        ) : members.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: theme.palette.text.secondary, fontSize: 15 }}>
            No team members found. Click &quot;Add Member&quot; to create one.
          </Box>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}>
            {members.map((m) => {
              const isEditing = editingId === m._id;

              return (
                <Box
                  key={m._id}
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
                  {/* Profile Picture */}
                  <Box sx={{ p: 2, pb: 0 }}>
                    {/* Outer wrapper with position:relative so the absolute button renders correctly */}
                    <Box sx={{ position: 'relative' }}>
                      <Box sx={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        borderRadius: 1,
                        border: `1px solid ${theme.palette.divider}`,
                        overflow: 'hidden',
                      }}>
                        {isEditing && editPicFile ? (
                          <img
                            src={URL.createObjectURL(editPicFile)}
                            alt={m.name}
                            style={{ width: '100%', display: 'block', objectFit: 'contain', maxHeight: 260, borderRadius: 8 }}
                          />
                        ) : (
                          <Image
                            src={optimizeCloudinaryUrl(m.profile_picture || 'https://placehold.co/400x300?text=No+Image')}
                            alt={m.name}
                            width={400}
                            height={300}
                            sizes="(max-width: 768px) 100vw, 50vw"
                            style={{ width: '100%', display: 'block', objectFit: 'contain', maxHeight: 260, borderRadius: 8 }}
                            onError={(e: any) => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                          />
                        )}
                      </Box>
                      {/* Change Photo button sits OUTSIDE overflow:hidden so it is never clipped */}
                      {isEditing && (
                        <Button
                          component="label"
                          variant="contained"
                          size="small"
                          startIcon={<UploadIcon />}
                          sx={{
                            position: 'absolute', bottom: 8, right: 8,
                            textTransform: 'none', fontSize: 12, borderRadius: 1,
                            backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark },
                            zIndex: 1,
                          }}
                        >
                          Change Photo
                          <input ref={editPicRef} hidden accept="image/*" type="file"
                            onChange={(e) => setEditPicFile(e.target.files?.[0] || null)} />
                        </Button>
                      )}
                    </Box>
                  </Box>

                  {/* Content */}
                  <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
                    {isEditing ? (
                      /* ── EDIT MODE ── */
                      <>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                          <TextField name="name" label="Name" size="small" value={editForm.name}
                            onChange={handleEditChange} fullWidth InputLabelProps={{ shrink: true }}
                            sx={fieldSx(theme)} />
                          <TextField name="designation" label="Designation" size="small" value={editForm.designation}
                            onChange={handleEditChange} fullWidth InputLabelProps={{ shrink: true }}
                            sx={fieldSx(theme)} />
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                          <TextField name="phone" label="Phone" size="small" value={editForm.phone}
                            onChange={handleEditChange} fullWidth InputLabelProps={{ shrink: true }}
                            sx={fieldSx(theme)} />
                          <TextField name="email" label="Email" size="small" value={editForm.email}
                            onChange={handleEditChange} fullWidth InputLabelProps={{ shrink: true }}
                            sx={fieldSx(theme)} />
                        </Box>
                        <TextField name="address" label="Address" size="small" value={editForm.address}
                          onChange={handleEditChange} fullWidth InputLabelProps={{ shrink: true }}
                          sx={fieldSx(theme)} />

                        {/* Detail Page Photo */}
                        <Box>
                          <Typography sx={{ fontSize: 11, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                            Detail Page Photo
                          </Typography>
                          <Box sx={{
                            border: `1px dashed ${editDetailPicFile ? theme.palette.primary.main : theme.palette.divider}`,
                            borderRadius: 1, p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5,
                            cursor: 'pointer', transition: 'border-color 0.2s',
                            '&:hover': { borderColor: theme.palette.primary.main },
                          }}
                            onClick={() => editDetailPicRef.current?.click()}
                          >
                            {editDetailPicFile ? (
                              <img src={URL.createObjectURL(editDetailPicFile)} alt="Detail preview" style={{ height: 60, width: 60, objectFit: 'cover', borderRadius: 4 }} />
                            ) : editForm.team_member_picture ? (
                              <img src={editForm.team_member_picture} alt="Detail current" style={{ height: 60, width: 60, objectFit: 'cover', borderRadius: 4 }} />
                            ) : (
                              <Box sx={{ height: 60, width: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', borderRadius: 1 }}>
                                <UploadIcon sx={{ fontSize: 20, color: theme.palette.text.disabled }} />
                              </Box>
                            )}
                            <Box>
                              <Typography sx={{ fontSize: 12, fontWeight: 500, color: theme.palette.text.primary }}>
                                {editDetailPicFile ? editDetailPicFile.name : editForm.team_member_picture ? 'Click to change' : 'Upload detail photo'}
                              </Typography>
                              <Typography sx={{ fontSize: 11, color: theme.palette.text.disabled }}>
                                Used on the team member detail page. Falls back to main photo if not set.
                              </Typography>
                            </Box>
                            <input ref={editDetailPicRef} hidden accept="image/*" type="file"
                              onChange={(e) => setEditDetailPicFile(e.target.files?.[0] || null)} />
                          </Box>
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                          <TextField name="facebook" label="Facebook" size="small" value={editForm.facebook}
                            onChange={handleEditChange} fullWidth InputLabelProps={{ shrink: true }}
                            sx={fieldSx(theme)} />
                          <TextField name="instagram" label="Instagram" size="small" value={editForm.instagram}
                            onChange={handleEditChange} fullWidth InputLabelProps={{ shrink: true }}
                            sx={fieldSx(theme)} />
                          <TextField name="linkedin" label="LinkedIn" size="small" value={editForm.linkedin}
                            onChange={handleEditChange} fullWidth InputLabelProps={{ shrink: true }}
                            sx={fieldSx(theme)} />
                          <TextField name="youtube" label="YouTube" size="small" value={editForm.youtube}
                            onChange={handleEditChange} fullWidth InputLabelProps={{ shrink: true }}
                            sx={fieldSx(theme)} />
                        </Box>
                        <TextField name="description" label="Description" size="small" value={editForm.description}
                          onChange={handleEditChange} fullWidth multiline rows={3} InputLabelProps={{ shrink: true }}
                          sx={fieldSx(theme)} />

                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                          <Button variant="contained" size="small" startIcon={<CheckIcon />} onClick={saveEdit}
                            sx={{ textTransform: 'none', fontSize: 12, flex: 1 }}>Save</Button>
                          <Button variant="outlined" size="small" startIcon={<CloseIcon />} onClick={cancelEdit}
                            sx={{ textTransform: 'none', fontSize: 12 }}>Cancel</Button>
                        </Stack>
                      </>
                    ) : (
                      /* ── VIEW MODE ── */
                      <>
                        {/* Row 1: Name & Designation */}
                        <Box>
                          <Typography sx={{ fontSize: 20, fontWeight: 700, color: theme.palette.text.primary, lineHeight: 1.3 }}>
                            {m.name}
                          </Typography>
                          <Typography sx={{ fontSize: 13, color: theme.palette.primary.main, fontWeight: 500, mt: 0.25 }}>
                            {m.designation}
                          </Typography>
                        </Box>

                        {/* Row 2: Phone & Email */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                          <Box>
                            <Typography sx={{ fontSize: 11, color: theme.palette.text.disabled, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</Typography>
                            <Typography sx={{ fontSize: 13, color: theme.palette.text.primary }}>{m.phone || '—'}</Typography>
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: 11, color: theme.palette.text.disabled, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</Typography>
                            <Typography sx={{ fontSize: 13, color: theme.palette.text.primary, wordBreak: 'break-all' }}>{m.email || '—'}</Typography>
                          </Box>
                        </Box>

                        {/* Row 3: Address */}
                        <Box>
                          <Typography sx={{ fontSize: 11, color: theme.palette.text.disabled, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Address</Typography>
                          <Typography sx={{ fontSize: 13, color: theme.palette.text.primary }}>{m.address || '—'}</Typography>
                        </Box>

                        {/* Row 4: Social Icons */}
                        <Box sx={{ display: 'flex', gap: 0.75 }}>
                          <SocialIcon url={m.facebook} Icon={FacebookIcon} color="#1877F2" label="Facebook" />
                          <SocialIcon url={m.instagram} Icon={InstagramIcon} color="#E1306C" label="Instagram" />
                          <SocialIcon url={m.linkedin} Icon={LinkedInIcon} color="#0A66C2" label="LinkedIn" />
                          <SocialIcon url={m.youtube} Icon={YouTubeIcon} color="#FF0000" label="YouTube" />
                          {!m.facebook && !m.instagram && !m.linkedin && !m.youtube && (
                            <Typography sx={{ fontSize: 12, color: theme.palette.text.disabled }}>No social links</Typography>
                          )}
                        </Box>

                        {/* Row 5: Description */}
                        <Box sx={{
                          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                          borderRadius: 1,
                          p: 1.5,
                          border: `1px solid ${theme.palette.divider}`,
                        }}>
                          <Typography sx={{
                            fontSize: 12, color: theme.palette.text.secondary, lineHeight: 1.6,
                            ...(!expandedDesc[m._id] && {
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }),
                          }}>
                            {m.description || 'No description'}
                          </Typography>
                          {m.description && m.description.length > 100 && (
                            <Typography
                              component="span"
                              onClick={() => setExpandedDesc(prev => ({ ...prev, [m._id]: !prev[m._id] }))}
                              sx={{
                                fontSize: 12, color: theme.palette.primary.main, cursor: 'pointer',
                                fontWeight: 500, mt: 0.5, display: 'inline-block',
                                '&:hover': { textDecoration: 'underline' },
                              }}
                            >
                              {expandedDesc[m._id] ? 'Show less' : 'Show more'}
                            </Typography>
                          )}
                        </Box>

                        {/* Actions */}
                        <Box sx={{ display: 'flex', gap: 0.75, mt: 'auto', pt: 0.5 }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => startEdit(m)}
                              sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1, width: 30, height: 30 }}>
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => setDeleteConfirm(m)}
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

      {/* ── Add Member Dialog ── */}
      <Dialog open={dialogOpen} onClose={closeAddDialog} maxWidth="sm" fullWidth
        PaperProps={{ sx: { backgroundColor: theme.palette.background.paper, backgroundImage: 'none', borderRadius: 3, border: `1px solid ${theme.palette.divider}` } }}>
        <DialogTitle sx={{ fontSize: 22, fontWeight: 700, color: theme.palette.text.primary, pb: 0.5 }}>
          Add Team Member
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {/* Photo upload */}
            <Box
              sx={{
                border: `2px dashed ${addPicFile ? theme.palette.primary.main : theme.palette.divider}`,
                borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', minHeight: 120, cursor: 'pointer',
                transition: 'border-color 0.2s', '&:hover': { borderColor: theme.palette.primary.main },
              }}
              onClick={() => addPicRef.current?.click()}
            >
              {addPicFile ? (
                <img src={URL.createObjectURL(addPicFile)} alt="Preview" style={{ maxHeight: 100, maxWidth: '100%', objectFit: 'contain', borderRadius: 4 }} />
              ) : (
                <>
                  <UploadIcon sx={{ fontSize: 32, color: theme.palette.text.disabled, mb: 0.5 }} />
                  <Typography sx={{ fontSize: 13, color: theme.palette.text.secondary }}>Click to upload profile photo</Typography>
                </>
              )}
              <input ref={addPicRef} hidden accept="image/*" type="file" onChange={(e) => setAddPicFile(e.target.files?.[0] || null)} />
            </Box>

            {/* Detail photo upload */}
            <Box
              sx={{
                border: `2px dashed ${addDetailPicFile ? theme.palette.primary.main : theme.palette.divider}`,
                borderRadius: 2, p: 1.5, display: 'flex', alignItems: 'center', gap: 2,
                cursor: 'pointer', transition: 'border-color 0.2s',
                '&:hover': { borderColor: theme.palette.primary.main },
              }}
              onClick={() => addDetailPicRef.current?.click()}
            >
              {addDetailPicFile ? (
                <img src={URL.createObjectURL(addDetailPicFile)} alt="Detail preview" style={{ height: 60, width: 60, objectFit: 'cover', borderRadius: 4 }} />
              ) : (
                <Box sx={{ height: 60, width: 60, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', borderRadius: 1 }}>
                  <UploadIcon sx={{ fontSize: 24, color: theme.palette.text.disabled }} />
                </Box>
              )}
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: theme.palette.text.primary }}>
                  {addDetailPicFile ? addDetailPicFile.name : 'Upload detail page photo (optional)'}
                </Typography>
                <Typography sx={{ fontSize: 11, color: theme.palette.text.disabled }}>
                  Separate image for the member detail page. Falls back to main photo if not uploaded.
                </Typography>
              </Box>
              <input ref={addDetailPicRef} hidden accept="image/*" type="file" onChange={(e) => setAddDetailPicFile(e.target.files?.[0] || null)} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField name="name" label="Name *" value={formData.name} onChange={handleChange} fullWidth size="small"
                InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
                InputProps={{ sx: { color: theme.palette.text.primary } }} sx={fieldSx(theme)} />
              <TextField name="designation" label="Designation *" value={formData.designation} onChange={handleChange} fullWidth size="small"
                InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
                InputProps={{ sx: { color: theme.palette.text.primary } }} sx={fieldSx(theme)} />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField name="phone" label="Phone" value={formData.phone} onChange={handleChange} fullWidth size="small"
                InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
                InputProps={{ sx: { color: theme.palette.text.primary } }} sx={fieldSx(theme)} />
              <TextField name="email" label="Email *" value={formData.email} onChange={handleChange} fullWidth size="small"
                InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
                InputProps={{ sx: { color: theme.palette.text.primary } }} sx={fieldSx(theme)} />
            </Box>
            <TextField name="address" label="Address" value={formData.address} onChange={handleChange} fullWidth size="small"
              InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
              InputProps={{ sx: { color: theme.palette.text.primary } }} sx={fieldSx(theme)} />
            <TextField name="profile_picture" label="Profile Picture URL (or upload above)" value={formData.profile_picture} onChange={handleChange} fullWidth size="small"
              InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
              InputProps={{ sx: { color: theme.palette.text.primary } }} sx={fieldSx(theme)} />

            <Typography sx={{ fontSize: 14, fontWeight: 600, color: theme.palette.text.primary, mt: 1 }}>Social Links</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField name="facebook" label="Facebook" value={formData.facebook} onChange={handleChange} fullWidth size="small"
                InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
                InputProps={{ sx: { color: theme.palette.text.primary } }} sx={fieldSx(theme)} />
              <TextField name="instagram" label="Instagram" value={formData.instagram} onChange={handleChange} fullWidth size="small"
                InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
                InputProps={{ sx: { color: theme.palette.text.primary } }} sx={fieldSx(theme)} />
              <TextField name="linkedin" label="LinkedIn" value={formData.linkedin} onChange={handleChange} fullWidth size="small"
                InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
                InputProps={{ sx: { color: theme.palette.text.primary } }} sx={fieldSx(theme)} />
              <TextField name="youtube" label="YouTube" value={formData.youtube} onChange={handleChange} fullWidth size="small"
                InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
                InputProps={{ sx: { color: theme.palette.text.primary } }} sx={fieldSx(theme)} />
            </Box>
            <TextField name="description" label="Description" value={formData.description} onChange={handleChange} fullWidth multiline rows={3} size="small"
              InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
              InputProps={{ sx: { color: theme.palette.text.primary } }} sx={fieldSx(theme)} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeAddDialog} disabled={saving} variant="outlined" sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: 14 }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !formData.name || !formData.email || !formData.designation}
            sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600, fontSize: 14 }}>
            {saving ? 'Saving...' : 'Add Member'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}
        PaperProps={{ sx: { backgroundColor: theme.palette.background.paper, backgroundImage: 'none', borderRadius: 3, border: `1px solid ${theme.palette.divider}` } }}>
        <DialogTitle sx={{ fontSize: 22, fontWeight: 700, color: theme.palette.text.primary }}>Delete Team Member</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: 15 }}>
            Are you sure you want to delete {deleteConfirm?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteConfirm(null)} variant="outlined" sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: 14 }}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600, fontSize: 14 }}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* ── Notification ── */}
      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={notification?.type || 'success'} variant="filled" onClose={() => setNotification(null)}>
          {notification?.message}
        </Alert>
      </Snackbar>
    </>
  );
}
