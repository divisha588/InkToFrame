import React, { useState, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  CloudUpload,
  Description,
  CheckCircle,
  Logout,
  Person,
  Chat,
  ArrowBack
} from '@mui/icons-material';
import axios from 'axios';

interface DocumentUploadProps {
  token: string;
  onViewConversations: () => void;
  onLogout: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  token,
  onViewConversations,
  onLogout
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['text/plain', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a TXT or PDF file.');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        return;
      }

      setSelectedFile(file);
      setError('');
      setSuccess('');
      setUploadResult(null);
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post('http://localhost:8000/upload-document', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || selectedFile.size)
          );
          setUploadProgress(percentCompleted);
        },
      });

      setUploadResult(response.data);
      setSuccess('File uploaded successfully!');
      setShowProcessDialog(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleProcessDocument = async () => {
    if (!uploadResult) return;

    setProcessing(true);
    setError('');

    try {
      await axios.post(
        `http://localhost:8000/process-document/${uploadResult.document_id}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      setSuccess('Document processed successfully! View your conversations to see the result.');
      setShowProcessDialog(false);
      setSelectedFile(null);
      setUploadResult(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Processing failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Document Conversation Converter
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Chat />}
            onClick={onViewConversations}
            sx={{ mr: 2 }}
          >
            My Conversations
          </Button>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <Person />
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={onViewConversations}>
              <Chat sx={{ mr: 1 }} />
              My Conversations
            </MenuItem>
            <Divider />
            <MenuItem onClick={onLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
          Upload Your Document
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ textAlign: 'center', mb: 6, maxWidth: 600, mx: 'auto' }}
        >
          Transform any PDF or TXT file into an engaging conversation.
          Our AI will analyze your document and create a natural dialogue.
        </Typography>

        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mb: 4,
              border: '2px dashed',
              borderColor: selectedFile ? 'primary.main' : 'grey.300',
              bgcolor: selectedFile ? 'primary.50' : 'background.paper',
              transition: 'all 0.3s ease',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CloudUpload
                sx={{
                  fontSize: 64,
                  color: selectedFile ? 'primary.main' : 'grey.400',
                  mb: 2
                }}
              />
              <Typography variant="h5" gutterBottom>
                {selectedFile ? 'File Selected' : 'Choose Your Document'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {selectedFile
                  ? 'Ready to upload and process'
                  : 'Drag & drop a PDF or TXT file here, or click to browse'
                }
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <input
                accept=".txt,.pdf"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  sx={{
                    py: 2,
                    borderStyle: 'dashed',
                    '&:hover': {
                      borderStyle: 'dashed',
                    }
                  }}
                >
                  Browse Files
                </Button>
              </label>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
              <Chip
                icon={<Description />}
                label="PDF Files"
                variant="outlined"
                color="primary"
              />
              <Chip
                icon={<Description />}
                label="TXT Files"
                variant="outlined"
                color="primary"
              />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Maximum file size: 10MB
            </Typography>
          </Paper>

          {selectedFile && (
            <Card sx={{ mb: 4, border: '1px solid', borderColor: 'primary.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Description color="primary" sx={{ fontSize: 40 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{selectedFile.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                    </Typography>
                  </Box>
                  <CheckCircle color="success" sx={{ fontSize: 32 }} />
                </Box>
              </CardContent>
            </Card>
          )}

          {uploading && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Uploading... {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              size="large"
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                borderRadius: 3,
              }}
            >
              {uploading ? 'Uploading...' : 'Upload & Convert to Conversation'}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 4, maxWidth: 800, mx: 'auto' }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 4, maxWidth: 800, mx: 'auto' }}>
            {success}
          </Alert>
        )}
      </Box>

      {/* Process Document Dialog */}
      <Dialog
        open={showProcessDialog}
        onClose={() => setShowProcessDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          Process Document
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Document Uploaded Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your document "{uploadResult?.filename}" is ready for processing.
              Our AI will analyze it and create an engaging conversation.
            </Typography>
            {processing && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Processing document...
                </Typography>
                <LinearProgress />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShowProcessDialog(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handleProcessDocument}
            variant="contained"
            disabled={processing}
            startIcon={processing ? undefined : <CheckCircle />}
            sx={{ minWidth: 140 }}
          >
            {processing ? 'Processing...' : 'Process Document'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentUpload;