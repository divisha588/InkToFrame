import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Container } from '@mui/material';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import DocumentUpload from './components/DocumentUpload';
import ConversationList from './components/ConversationList';
import ConversationView from './components/ConversationView';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1', // Indigo
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#ec4899', // Pink
      light: '#f472b6',
      dark: '#db2777',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '12px 24px',
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        },
      },
    },
  },
});

type ViewType = 'landing' | 'login' | 'upload' | 'conversations' | 'conversation';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('landing');
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

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setCurrentView('upload');
    } else {
      setCurrentView('login');
    }
  };

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    setIsAuthenticated(true);
    setCurrentView('upload');
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    setToken('');
    setIsAuthenticated(false);
    setCurrentView('landing');
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

  if (currentView === 'landing') {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LandingPage onGetStarted={handleGetStarted} />
      </ThemeProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
          <Login onLogin={handleLogin} />
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {currentView === 'upload' && (
            <DocumentUpload
              token={token}
              onViewConversations={handleViewConversations}
              onLogout={handleLogout}
            />
          )}
          {currentView === 'conversations' && (
            <ConversationList
              token={token}
              onViewConversation={handleViewConversation}
              onBack={handleBackToUpload}
              onLogout={handleLogout}
            />
          )}
          {currentView === 'conversation' && selectedConversationId && (
            <ConversationView
              token={token}
              conversationId={selectedConversationId}
              onBack={handleViewConversations}
              onViewConversations={handleViewConversations}
              onUploadDocument={handleBackToUpload}
              onLogout={handleLogout}
            />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;