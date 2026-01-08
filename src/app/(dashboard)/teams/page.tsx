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
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import axios from 'axios';

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
  name: '',
  profile_picture: '',
  team_member_picture: '',
  description: '',
  designation: '',
  phone: '',
  email: '',
  address: '',
  facebook: '',
  instagram: '',
  linkedin: '',
  youtube: ''
};

export default function TeamsPage() {
  const [members, setMembers] = React.useState<TeamMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [formData, setFormData] = React.useState(initialFormState);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<TeamMember | null>(null);

  const fetchMembers = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}`);
      if (res.data?.success) {
        setMembers(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleOpenDialog = (member?: TeamMember) => {
    if (member) {
      setEditingId(member._id);
      setFormData({
        name: member.name,
        profile_picture: member.profile_picture,
        team_member_picture: member.team_member_picture || '',
        description: member.description,
        designation: member.designation,
        phone: member.phone,
        email: member.email,
        address: member.address,
        facebook: member.facebook || '',
        instagram: member.instagram || '',
        linkedin: member.linkedin || '',
        youtube: member.youtube || ''
      });
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData(initialFormState);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.designation) return;
    
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/${editingId}`, formData);
      } else {
        await axios.post(`${API_BASE}`, formData);
      }
      handleCloseDialog();
      fetchMembers();
    } catch (error) {
      console.error('Error saving team member:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await axios.delete(`${API_BASE}/${deleteConfirm._id}`);
      setDeleteConfirm(null);
      fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600}>
          Team Members
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Member
        </Button>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {members.map((member) => (
            <Grid item xs={12} sm={6} md={4} key={member._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="260"
                  image={member.profile_picture || 'https://placehold.co/400x300?text=No+Image'}
                  alt={member.name}
                  sx={{ objectFit: 'cover', objectPosition: 'top' }}
                />
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom component="div" fontWeight="bold">
                    {member.name}
                  </Typography>
                  <Chip 
                    label={member.designation} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                    sx={{ mb: 2 }}
                  />
                  
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {member.email}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {member.phone}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="start">
                      <BusinessIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
                      <Typography variant="body2" color="text.secondary">
                        {member.address}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {member.description}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    {member.facebook && (
                      <IconButton size="small" href={member.facebook} target="_blank">
                        <FacebookIcon fontSize="small" color="primary" />
                      </IconButton>
                    )}
                    {member.instagram && (
                      <IconButton size="small" href={member.instagram} target="_blank">
                        <InstagramIcon fontSize="small" sx={{ color: '#E1306C' }} />
                      </IconButton>
                    )}
                    {member.linkedin && (
                      <IconButton size="small" href={member.linkedin} target="_blank">
                        <LinkedInIcon fontSize="small" color="primary" />
                      </IconButton>
                    )}
                    {member.youtube && (
                      <IconButton size="small" href={member.youtube} target="_blank">
                        <YouTubeIcon fontSize="small" color="error" />
                      </IconButton>
                    )}
                  </Stack>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />} 
                    onClick={() => handleOpenDialog(member)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    color="error" 
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteConfirm(member)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
          {members.length === 0 && (
            <Grid item xs={12}>
              <Box textAlign="center" py={6} bgcolor="#f5f5f5" borderRadius={2}>
                <Typography color="text.secondary">No team members found</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="designation"
                label="Designation"
                value={formData.designation}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="profile_picture"
                label="Profile Picture URL"
                value={formData.profile_picture}
                onChange={handleChange}
                fullWidth
                required
                helperText="URL to the main profile image"
              />
            </Grid>
            {formData.profile_picture && (
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center">
                  <Box 
                    component="img" 
                    src={formData.profile_picture} 
                    sx={{ maxHeight: 150, borderRadius: 1 }}
                    onError={(e: any) => { e.target.style.display = 'none'; }}
                  />
                </Box>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                name="team_member_picture"
                label="Detail Image URL (Optional)"
                value={formData.team_member_picture}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>Social Links</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="facebook"
                label="Facebook URL"
                value={formData.facebook}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="instagram"
                label="Instagram URL"
                value={formData.instagram}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="linkedin"
                label="LinkedIn URL"
                value={formData.linkedin}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="youtube"
                label="YouTube URL"
                value={formData.youtube}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Team Member</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {deleteConfirm?.name}? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
