import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Chat,
  Description,
  Logout,
  Person,
  CloudUpload
} from '@mui/icons-material';
import axios from 'axios';

interface ConversationListProps {
  token: string;
  onViewConversation: (conversationId: number) => void;
  onBack: () => void;
  onLogout: () => void;
}

interface Conversation {
  id: number;
  title: string;
  status: string;
  created_at: string;
  document_filename: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  token,
  onViewConversation,
  onBack,
  onLogout
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
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
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setConversations(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load conversations');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Toolbar>
          <Button
            startIcon={<ArrowBack />}
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            My Conversations
          </Typography>
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={onBack}
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
            <MenuItem onClick={onBack}>
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
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {conversations.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
            <Chat sx={{ fontSize: 64, color: 'text.secondary', mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              No conversations yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Upload a document to create your first conversation. Our AI will analyze it and transform it into an engaging dialogue.
            </Typography>
            <Button variant="contained" size="large" onClick={onBack} startIcon={<CloudUpload />}>
              Upload Your First Document
            </Button>
          </Card>
        ) : (
          <>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Your Conversations ({conversations.length})
            </Typography>
            <Grid container spacing={3}>
              {conversations.map((conversation) => (
                <Grid item xs={12} md={6} lg={4} key={conversation.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-2px)',
                      },
                    }}
                    onClick={() => onViewConversation(conversation.id)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Chat color="primary" sx={{ mr: 1, mt: 0.5 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                            {conversation.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Description sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {conversation.document_filename}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={conversation.status}
                          color={getStatusColor(conversation.status) as any}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(conversation.created_at)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ConversationList;