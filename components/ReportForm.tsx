import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItemType, Category, Location, Item } from '../types';
import { saveItem } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  Box, 
  Stack, 
  Grid,
  SelectChangeEvent,
  Alert,
  CircularProgress
} from '@mui/material';
import { Upload } from 'lucide-react';

const ReportForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<Partial<Item>>({
    type: 'LOST',
    category: Category.OTHER,
    location: Location.RECEPTION,
    status: 'OPEN'
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactName: user.name,
        contactInfo: `Room ${user.roomNumber}`
      }));
    }
  }, [user]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (newType: ItemType) => {
    setFormData(prev => ({ ...prev, type: newType }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { 
        setError("Image too large (Max 1MB)");
        return;
      }
      
      setImageLoading(true);
      setError('');
      
      // Simulate processing delay for better UX (showing off the loader)
      setTimeout(() => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setImagePreview(base64);
          setFormData(prev => ({ ...prev, imageBase64: base64 }));
          setImageLoading(false);
        };
        reader.readAsDataURL(file);
      }, 1500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.title || !formData.description || !formData.contactInfo) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const newItem: Item = {
      id: uuidv4(),
      userId: user?.id,
      dateReported: new Date().toISOString(),
      type: formData.type as ItemType,
      title: formData.title || '',
      category: formData.category as Category,
      location: formData.location as Location,
      description: formData.description || '',
      status: 'OPEN',
      contactName: formData.contactName || 'Anonymous',
      contactInfo: formData.contactInfo || '',
      imageBase64: formData.imageBase64
    };

    setTimeout(() => {
      saveItem(newItem);
      setLoading(false);
      navigate('/');
    }, 1000);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 4 }}>
          Report an Item
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            
            {/* Type Selection */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                type="button"
                fullWidth 
                variant={formData.type === 'LOST' ? 'contained' : 'outlined'} 
                color="error"
                size="large"
                onClick={() => handleTypeChange('LOST')}
                sx={{ py: 1.5, fontWeight: 'bold' }}
              >
                I Lost Something
              </Button>
              <Button 
                type="button"
                fullWidth 
                variant={formData.type === 'FOUND' ? 'contained' : 'outlined'} 
                color="success"
                size="large"
                onClick={() => handleTypeChange('FOUND')}
                sx={{ py: 1.5, fontWeight: 'bold' }}
              >
                I Found Something
              </Button>
            </Box>

            {/* Title & Category */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Item Title"
                  name="title"
                  variant="outlined"
                  value={formData.title || ''}
                  onChange={handleTextChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    label="Category"
                    onChange={handleSelectChange}
                  >
                    {Object.values(Category).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Description */}
            <TextField
              fullWidth
              label="Description"
              name="description"
              variant="outlined"
              multiline
              rows={4}
              value={formData.description || ''}
              onChange={handleTextChange}
              required
              helperText="Provide distinguishing features like brand, color, scratches, etc."
            />

            {/* Location */}
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                name="location"
                value={formData.location}
                label="Location"
                onChange={handleSelectChange}
              >
                {Object.values(Location).map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
              </Select>
            </FormControl>

            {/* Image Upload */}
            <Box sx={{ border: '1px dashed #ccc', p: 3, borderRadius: 1, textAlign: 'center', bgcolor: imageLoading ? '#f5f5f5' : 'transparent' }}>
               <input
                accept="image/*"
                style={{ display: 'none' }}
                id="raised-button-file"
                type="file"
                onChange={handleImageChange}
                disabled={imageLoading}
              />
              <label htmlFor="raised-button-file">
                <Button 
                  variant="outlined" 
                  component="span" 
                  disabled={imageLoading}
                  startIcon={<Upload size={18} />}
                  sx={{ mb: 2 }}
                >
                  {imageLoading ? 'Processing...' : 'Upload Photo (Optional)'}
                </Button>
              </label>
              
              {imageLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 1 }}>
                  <CircularProgress size={24} />
                  <Typography variant="caption">Optimizing image...</Typography>
                </Box>
              ) : imagePreview ? (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <img src={imagePreview} alt="Preview" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Max size: 1MB. Helps identifying the item faster.
                </Typography>
              )}
            </Box>

            {/* Contact Info Section */}
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Contact Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contact Name"
                    name="contactName"
                    size="small"
                    value={formData.contactName || ''}
                    onChange={handleTextChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Room Number or Email"
                    name="contactInfo"
                    size="small"
                    required
                    value={formData.contactInfo || ''}
                    onChange={handleTextChange}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || imageLoading}
              sx={{ py: 1.5, fontSize: '1.1rem', bgcolor: formData.type === 'LOST' ? '#d32f2f' : '#2e7d32' }}
            >
              {loading ? (
                <CircularProgress size={26} color="inherit" />
              ) : (
                'Submit Report'
              )}
            </Button>

          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default ReportForm;