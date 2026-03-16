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
} from '@mui/material';
import {
  ArrowBack,
  Person,
  SmartToy,
  Description,
  Analytics,
  Logout,
  Chat,
  CloudUpload
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