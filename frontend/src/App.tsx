import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import Login from './components/Login';
import DocumentUpload from './components/DocumentUpload';
import ConversationList from './components/ConversationList';
import ConversationView from './components/ConversationView';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

type ViewType = 'login' | 'upload' | 'conversations' | 'conversation';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('login');
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      setCurrentView('upload');
    }
  }, []);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    setIsAuthenticated(true);
    setCurrentView('upload');
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    setToken('');
    setIsAuthenticated(false);
    setCurrentView('login');
    localStorage.removeItem('token');
  };

  const handleViewConversations = () => {
    setCurrentView('conversations');
    setSelectedConversationId(null);
  };

  const handleViewConversation = (conversationId: number) => {
    setSelectedConversationId(conversationId);
    setCurrentView('conversation');
  };

  const handleBackToUpload = () => {
    setCurrentView('upload');
    setSelectedConversationId(null);
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Document Conversation Converter
          </Typography>
          <Button color="inherit" onClick={handleBackToUpload}>
            Upload Document
          </Button>
          <Button color="inherit" onClick={handleViewConversations}>
            My Conversations
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {currentView === 'upload' && (
          <DocumentUpload
            token={token}
            onViewConversations={handleViewConversations}
          />
        )}
        {currentView === 'conversations' && (
          <ConversationList
            token={token}
            onViewConversation={handleViewConversation}
            onBack={handleBackToUpload}
          />
        )}
        {currentView === 'conversation' && selectedConversationId && (
          <ConversationView
            token={token}
            conversationId={selectedConversationId}
            onBack={handleViewConversations}
          />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;