import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Paper,
  Grid,
  Stack,
  Chip,
} from '@mui/material';
import {
  CloudUpload,
  LogoutRounded,
  Person,
  History,
  GetApp,
  Close,
  Check,
  Info,
} from '@mui/icons-material';
import axios from 'axios';

interface DocumentUploadProps {
  token: string;
  onViewConversations: () => void;
  onLogout: () => void;
}

interface ConversationResult {
  summary: string;
  analysis: string;
  conversation: Array<{
    speaker: string;
    message: string;
  }>;
  document_info: {
    filename: string;
    file_type: string;
    file_size: number;
  };
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  token,
  onViewConversations,
  onLogout,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ConversationResult | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
      const allowedTypes = ['text/plain', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a TXT or PDF file.');
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB.');
        return;
      }

      setSelectedFile(file);
      setError('');
      setSuccess('');
      setResult(null);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const input = document.createElement('input');
      input.type = 'file';
      Object.defineProperty(input, 'files', {
        value: e.dataTransfer.files,
      });
      handleFileSelect({ target: input } as any);
    }
  }, [handleFileSelect]);

  const handleConvertDocument = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      // Step 1: Upload document
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadResponse = await axios.post(
        'http://localhost:8000/upload-document',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSuccess(`Document uploaded successfully! Processing...`);

      // Step 2: Convert document to conversation
      setProcessing(true);
      setUploading(false);

      const filePath = `uploads/${uploadResponse.data.filename}`;

      const conversionResponse = await axios.post(
        'http://localhost:8000/convert-document',
        { file_path: filePath },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      setResult(conversionResponse.data);
      setSuccess('Document converted successfully! 🎉');
      setSelectedFile(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'An error occurred during processing';
      setError(errorMessage);
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError('');
    setSuccess('');
  };

  const getFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Navigation Bar */}
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'white', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <Toolbar>
          <CloudUpload sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 700, color: 'primary.main' }}>
            InkToFrame
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<History />}
              onClick={() => {
                handleCloseMenu();
                onViewConversations();
              }}
              sx={{ color: 'text.primary', textTransform: 'none' }}
            >
              History
            </Button>

            <IconButton onClick={handleMenu} size="small">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                <Person sx={{ fontSize: 16 }} />
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem>
                <Person sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  handleCloseMenu();
                  onLogout();
                }}
              >
                <LogoutRounded sx={{ mr: 1, color: 'error.main' }} />
                <span style={{ color: '#d32f2f' }}>Logout</span>
              </MenuItem>
            </Menu>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ py: 4 }}>
        {result ? (
          // Show Result View
          <Grid container spacing={3} sx={{ px: { xs: 2, md: 4 } }}>
            <Grid item xs={12}>
              <Button
                startIcon={<Close />}
                onClick={handleReset}
                sx={{ mb: 2 }}
              >
                Upload Another Document
              </Button>
            </Grid>

            {/* Document Info */}
            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    📄 Document Information
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Filename
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {result.document_info.filename}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        File Type
                      </Typography>
                      <Chip
                        label={result.document_info.file_type}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        File Size
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getFileSize(result.document_info.file_size)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Summary and Analysis */}
            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                {/* Summary */}
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ flex: 1 }}>
                        📝 Summary
                      </Typography>
                      <Check sx={{ color: 'success.main' }} />
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {result.summary}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Analysis */}
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ flex: 1 }}>
                        🔍 Detailed Analysis
                      </Typography>
                      <Check sx={{ color: 'success.main' }} />
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {result.analysis}
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            {/* Conversation */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      💬 AI-Generated Conversation
                    </Typography>
                    <Check sx={{ color: 'success.main' }} />
                  </Box>

                  <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2, maxHeight: '500px', overflowY: 'auto' }}>
                    {result.conversation && result.conversation.length > 0 ? (
                      <Stack spacing={2}>
                        {result.conversation.map((msg, index) => (
                          <Box
                            key={index}
                            sx={{
                              p: 2,
                              bgcolor: msg.speaker === 'AI' ? 'primary.light' : 'grey.200',
                              borderRadius: 2,
                              color: msg.speaker === 'AI' ? 'white' : 'text.primary',
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                              {msg.speaker}:
                            </Typography>
                            <Typography variant="body2">
                              {msg.message}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography color="textSecondary">
                        No conversation data available
                      </Typography>
                    )}
                  </Box>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GetApp />}
                    sx={{ mt: 2 }}
                  >
                    Download Conversation
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          // Show Upload View
          <Grid container spacing={3} sx={{ px: { xs: 2, md: 4 } }}>
            <Grid item xs={12}>
              {error && (
                <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && !processing && (
                <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                    📄 Upload Your Document
                  </Typography>

                  {/* Drag and Drop Area */}
                  <Paper
                    variant="outlined"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: '2px dashed',
                      borderColor: selectedFile ? 'success.main' : 'primary.main',
                      bgcolor: selectedFile ? 'success.lighter' : 'transparent',
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                      },
                      mb: 2,
                    }}
                  >
                    <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      {selectedFile ? '✓ File Selected' : 'Drag and Drop Your File'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      or
                    </Typography>

                    <Button
                      variant="contained"
                      component="label"
                      disabled={uploading || processing}
                    >
                      Choose File
                      <input
                        type="file"
                        hidden
                        onChange={handleFileSelect}
                        accept=".txt,.pdf"
                        disabled={uploading || processing}
                      />
                    </Button>

                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
                      Supported formats: PDF, TXT (Max 50MB)
                    </Typography>
                  </Paper>

                  {/* Selected File Info */}
                  {selectedFile && (
                    <Box sx={{ bgcolor: 'success.lighter', p: 2, borderRadius: 2, mb: 2 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Check sx={{ color: 'success.main' }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {selectedFile.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {getFileSize(selectedFile.size)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  )}

                  {/* Progress and Buttons */}
                  {(uploading || processing) && (
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress />
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        {uploading ? 'Uploading...' : 'Processing with AI...'}
                      </Typography>
                    </Box>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleConvertDocument}
                    disabled={!selectedFile || uploading || processing}
                    startIcon={uploading || processing ? <CircularProgress size={20} /> : <CloudUpload />}
                    sx={{ mt: 2 }}
                  >
                    {uploading ? 'Uploading...' : processing ? 'Processing...' : 'Convert to Conversation'}
                  </Button>

                  {selectedFile && !uploading && !processing && (
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => setSelectedFile(null)}
                      sx={{ mt: 1 }}
                    >
                      Clear Selection
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Info Panel */}
            <Grid item xs={12} md={6}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                    ℹ️ How It Works
                  </Typography>

                  <Stack spacing={3}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', mr: 2 }}>
                          1
                        </Avatar>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Upload Document
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="textSecondary" sx={{ ml: 6 }}>
                        Select a PDF or TXT file from your device.
                      </Typography>
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', mr: 2 }}>
                          2
                        </Avatar>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          AI Processing
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="textSecondary" sx={{ ml: 6 }}>
                        Our AI analyzes the document and generates summaries.
                      </Typography>
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', mr: 2 }}>
                          3
                        </Avatar>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          View Results
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="textSecondary" sx={{ ml: 6 }}>
                        Get conversation, summary, and detailed analysis instantly.
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  <Box sx={{ bgcolor: 'info.lighter', p: 2, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Info sx={{ color: 'info.main', flexShrink: 0 }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                          Pro Tips:
                        </Typography>
                        <Typography variant="caption" component="div" color="textSecondary" sx={{ mb: 0.5 }}>
                          • Use clear, well-structured documents for best results
                        </Typography>
                        <Typography variant="caption" component="div" color="textSecondary" sx={{ mb: 0.5 }}>
                          • PDF and TXT formats are fully supported
                        </Typography>
                        <Typography variant="caption" component="div" color="textSecondary">
                          • Your documents are processed securely
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default DocumentUpload;