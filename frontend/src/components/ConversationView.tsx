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
} from '@mui/material';
import { ArrowBack, Person, SmartToy, Description, Analytics } from '@mui/icons-material';
import axios from 'axios';

interface ConversationViewProps {
  token: string;
  conversationId: number;
  onBack: () => void;
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
  onBack
}) => {
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mb: 2 }}>
          Back to Conversations
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!conversation) {
    return (
      <Box>
        <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mb: 2 }}>
          Back to Conversations
        </Button>
        <Alert severity="error">Conversation not found</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mr: 2 }}>
          Back to Conversations
        </Button>
        <Box>
          <Typography variant="h4" component="h1">
            {conversation.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Description sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              From: {conversation.document_filename}
            </Typography>
            <Chip
              label={conversation.status}
              color={getStatusColor(conversation.status) as any}
              size="small"
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            Created: {formatDate(conversation.created_at)}
          </Typography>
        </Box>
      </Box>

      {/* Summary Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Analytics color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Document Summary</Typography>
          </Box>
          <Typography variant="body1">{conversation.summary}</Typography>
        </CardContent>
      </Card>

      {/* Analysis Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Analytics color="secondary" sx={{ mr: 1 }} />
            <Typography variant="h6">Detailed Analysis</Typography>
          </Box>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {conversation.analysis}
          </Typography>
        </CardContent>
      </Card>

      {/* Conversation Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Generated Conversation
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {conversation.messages.map((message, index) => (
              <Box key={index}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  {getSpeakerAvatar(message.speaker)}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {message.speaker}
                    </Typography>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body1">
                        {message.message}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
                {index < conversation.messages.length - 1 && (
                  <Divider sx={{ mt: 2 }} />
                )}
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ConversationView;