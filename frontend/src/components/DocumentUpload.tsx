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
} from '@mui/material';
import { CloudUpload, Description, CheckCircle } from '@mui/icons-material';
import axios from 'axios';

interface DocumentUploadProps {
  token: string;
  onViewConversations: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ token, onViewConversations }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showProcessDialog, setShowProcessDialog] = useState(false);

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
      <Typography variant="h4" component="h1" gutterBottom>
        Upload Document for Conversation
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select a Document
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload a TXT or PDF file to convert it into a natural conversation format.
          The system will analyze the document and generate an engaging dialogue.
        </Typography>

        <Box sx={{ mb: 2 }}>
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
              startIcon={<CloudUpload />}
              fullWidth
              sx={{ py: 2 }}
            >
              Choose File
            </Button>
          </label>
        </Box>

        {selectedFile && (
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Description color="primary" />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1">{selectedFile.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                  </Typography>
                </Box>
                <Chip
                  label="Ready to upload"
                  color="primary"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        )}

        {uploading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Uploading... {uploadProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          fullWidth
          size="large"
        >
          {uploading ? 'Uploading...' : 'Upload & Process Document'}
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ textAlign: 'center' }}>
        <Button variant="outlined" onClick={onViewConversations}>
          View My Conversations
        </Button>
      </Box>

      {/* Process Document Dialog */}
      <Dialog open={showProcessDialog} onClose={() => setShowProcessDialog(false)}>
        <DialogTitle>Process Document</DialogTitle>
        <DialogContent>
          <Typography>
            Your document "{uploadResult?.filename}" has been uploaded successfully.
            Would you like to process it now to generate a conversation?
          </Typography>
          {processing && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Processing document...
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProcessDialog(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handleProcessDocument}
            variant="contained"
            disabled={processing}
            startIcon={processing ? undefined : <CheckCircle />}
          >
            {processing ? 'Processing...' : 'Process Document'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentUpload;