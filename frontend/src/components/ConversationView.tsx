import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Container,
  Grid,
  Stack,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Description,
  LogoutRounded,
  History,
  CloudUpload,
  CheckCircle,
  GetApp,
  Info,
} from '@mui/icons-material';
import axios from 'axios';

interface ConversationViewProps {
  token: string;
  conversationId: number;
  onBack: () => void;
  onViewConversations: () => void;
  onUploadDocument: () => void;
  onLogout: () => void;
}

interface ConversationMessage {
  speaker: string;
  message: string;
}

interface ConversationData {
  id: number;
  title: string;
  summary: string;
  analysis: string;
  status: string;
  created_at: string;
  document_filename: string;
  messages: ConversationMessage[];
}

const ConversationView: React.FC<ConversationViewProps> = ({
  token,
  conversationId,
  onBack,
  onViewConversations,
  onUploadDocument,
  onLogout
}) => {
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    fetchConversation();
  }, [conversationId]);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8000/conversation/${conversationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      setConversation(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = () => {
    if (!conversation) return;

    const content = `
Document Conversation Report
=============================

Title: ${conversation.title}
Document: ${conversation.document_filename}
Generated: ${formatDate(conversation.created_at)}
Status: ${conversation.status}

SUMMARY
-------
${conversation.summary}

ANALYSIS
--------
${conversation.analysis}

CONVERSATION
------------
${conversation.messages?.map((msg) => `${msg.speaker}: ${msg.message}`).join('\n\n')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${conversationId}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Navigation Bar */}
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'white', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <Toolbar>
          <Description sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 700, color: 'primary.main' }}>
            Conversation Details
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<History />}
              onClick={onViewConversations}
              sx={{ color: 'text.primary', textTransform: 'none' }}
            >
              Back to History
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

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : conversation ? (
          <Grid container spacing={3}>
            {/* Back and Action Buttons */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={onViewConversations}
                >
                  Back to History
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CloudUpload />}
                  onClick={onUploadDocument}
                >
                  Upload New Document
                </Button>
                <Box sx={{ flex: 1 }} />
                <Button
                  variant="outlined"
                  startIcon={<GetApp />}
                  onClick={handleDownload}
                >
                  Download Report
                </Button>
              </Stack>
            </Grid>

            {/* Header Info */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Description sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {conversation.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        📄 {conversation.document_filename}
                      </Typography>
                    </Box>
                    <Chip
                      label={conversation.status}
                      color={conversation.status === 'completed' ? 'success' : 'info'}
                      icon={<CheckCircle />}
                    />
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="caption" color="textSecondary">
                    🕐 Generated on {formatDate(conversation.created_at)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Summary */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>
                      📝 Summary
                    </Typography>
                    <CheckCircle sx={{ color: 'success.main' }} />
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {conversation.summary}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Analysis */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>
                      🔍 Analysis
                    </Typography>
                    <CheckCircle sx={{ color: 'success.main' }} />
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {conversation.analysis}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Conversation */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>
                      💬 AI-Generated Conversation
                    </Typography>
                    <CheckCircle sx={{ color: 'success.main' }} />
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {conversation.messages && conversation.messages.length > 0 ? (
                      <Stack spacing={2}>
                        {conversation.messages.map((msg, index) => (
                          <Paper
                            key={index}
                            sx={{
                              p: 2,
                              bgcolor: msg.speaker === 'AI' ? 'primary.light' : 'grey.100',
                              color: msg.speaker === 'AI' ? 'white' : 'text.primary',
                              borderLeft: '4px solid',
                              borderLeftColor: msg.speaker === 'AI' ? 'primary.main' : 'grey.400',
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                              {msg.speaker}
                            </Typography>
                            <Typography variant="body2">
                              {msg.message}
                            </Typography>
                          </Paper>
                        ))}
                      </Stack>
                    ) : (
                      <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                        No conversation data available
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Info Card */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Info sx={{ color: 'info.main', flexShrink: 0 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      About This Report
                    </Typography>
                    <Typography variant="caption" component="div" color="textSecondary" sx={{ mb: 0.5 }}>
                      • This conversation was generated by advanced AI technology
                    </Typography>
                    <Typography variant="caption" component="div" color="textSecondary" sx={{ mb: 0.5 }}>
                      • All conversations are stored securely in your account
                    </Typography>
                    <Typography variant="caption" component="div" color="textSecondary">
                      • You can download, share, or delete this conversation anytime
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        ) : null}
      </Container>
    </Box>
  );
};

export default ConversationView;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'generating':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSpeakerAvatar = (speaker: string) => {
    const isAI = speaker.toLowerCase().includes('alex');
    return (
      <Avatar sx={{ bgcolor: isAI ? 'primary.main' : 'secondary.main' }}>
        {isAI ? <SmartToy /> : <Person />}
      </Avatar>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
          <Toolbar>
            <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mr: 2 }}>
              Back
            </Button>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Conversation Error
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Box>
    );
  }

  if (!conversation) {
    return (
      <Box>
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
          <Toolbar>
            <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mr: 2 }}>
              Back
            </Button>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Conversation Not Found
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 4 }}>
          <Alert severity="error">Conversation not found</Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Toolbar>
          <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mr: 2 }}>
            Back
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {conversation.title}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Chat />}
            onClick={onViewConversations}
            sx={{ mr: 2 }}
          >
            All Conversations
          </Button>
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={onUploadDocument}
            sx={{ mr: 2 }}
          >
            Upload Document
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
              All Conversations
            </MenuItem>
            <MenuItem onClick={onUploadDocument}>
              <CloudUpload sx={{ mr: 1 }} />
              Upload Document
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Description sx={{ fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="body1" color="text.secondary">
            From: {conversation.document_filename}
          </Typography>
          <Chip
            label={conversation.status}
            color={getStatusColor(conversation.status) as any}
            size="small"
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 4, display: 'block' }}>
          Created: {formatDate(conversation.created_at)}
        </Typography>

        {/* Summary Section */}
        <Card sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Analytics color="primary" sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h5">Document Summary</Typography>
            </Box>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
              {conversation.summary}
            </Typography>
          </CardContent>
        </Card>

        {/* Analysis Section */}
        <Card sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Analytics color="secondary" sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h5">Detailed Analysis</Typography>
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontSize: '1.1rem', lineHeight: 1.6 }}>
              {conversation.analysis}
            </Typography>
          </CardContent>
        </Card>

        {/* Conversation Section */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 4 }}>
              Generated Conversation
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {conversation.messages.map((message, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    {getSpeakerAvatar(message.speaker)}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
                        {message.speaker}
                      </Typography>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 3,
                          bgcolor: 'grey.50',
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: 'grey.200',
                        }}
                      >
                        <Typography variant="body1" sx={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
                          {message.message}
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                  {index < conversation.messages.length - 1 && (
                    <Divider sx={{ mt: 3, opacity: 0.3 }} />
                  )}
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ConversationView;