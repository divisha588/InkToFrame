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
  Stack,
  Container,
  Empty,
} from '@mui/material';
import {
  ArrowBack,
  History,
  Description,
  LogoutRounded,
  Person,
  CloudUpload,
  AccessTime,
  CheckCircle,
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

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('http://localhost:8000/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setConversations(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
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

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Navigation Bar */}
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'white', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <Toolbar>
          <History sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 700, color: 'primary.main' }}>
            Conversion History
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<CloudUpload />}
              onClick={onBack}
              sx={{ color: 'text.primary', textTransform: 'none' }}
            >
              Upload New
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
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={onBack}
            sx={{ mb: 2 }}
          >
            Back to Upload
          </Button>

          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Your Conversation History
          </Typography>
          <Typography variant="body1" color="textSecondary">
            View and manage all your document conversions
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : conversations.length === 0 ? (
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <History sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Conversations Yet
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                Start by uploading a document to create your first conversation
              </Typography>
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={onBack}
              >
                Upload Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {conversations.map((conversation) => (
              <Grid item xs={12} md={6} lg={4} key={conversation.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-4px)',
                    },
                  }}
                  onClick={() => onViewConversation(conversation.id)}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 2 }}>
                      <Description sx={{ color: 'primary.main', fontSize: 32 }} />
                      <Chip
                        label={conversation.status}
                        color={getStatusColor(conversation.status)}
                        size="small"
                        icon={conversation.status === 'completed' ? <CheckCircle /> : <AccessTime />}
                      />
                    </Box>

                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
                      {conversation.title}
                    </Typography>

                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      📄 {conversation.document_filename}
                    </Typography>

                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                      🕐 {formatDate(conversation.created_at)}
                    </Typography>
                  </CardContent>

                  <Divider />
                  <Box sx={{ p: 2, textAlign: 'right' }}>
                    <Button
                      size="small"
                      endIcon={<ArrowBack sx={{ transform: 'rotate(180deg)' }} />}
                    >
                      View Details
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default ConversationList;
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