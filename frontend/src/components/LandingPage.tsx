import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Paper,
  Tooltip,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import {
  CloudUpload,
  Chat,
  Analytics,
  Security,
  Speed,
  AutoAwesome,
  Description,
  ArrowForward,
  CheckCircle,
  Login,
  Info,
  SmartToy,
  Chip,
} from '@mui/icons-material';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: <CloudUpload sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Document Upload',
      description: 'Upload PDF or TXT files with drag-and-drop simplicity.',
    },
    {
      icon: <Analytics sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'AI-Powered Analysis',
      description: 'Advanced AI extracts key insights and themes automatically.',
    },
    {
      icon: <Chat sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Natural Conversations',
      description: 'Transform documents into engaging, natural dialogues.',
    },
    {
      icon: <Security sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Secure & Private',
      description: 'Enterprise-grade privacy protection for your documents.',
    },
    {
      icon: <Speed sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Lightning Fast',
      description: 'Get results in seconds with optimized processing.',
    },
    {
      icon: <AutoAwesome sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Smart Summaries',
      description: 'Comprehensive summaries and detailed analysis included.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload Document',
      description: 'Select any PDF or TXT file from your device',
    },
    {
      number: '02',
      title: 'AI Processing',
      description: 'Our AI analyzes and understands your content',
    },
    {
      number: '03',
      title: 'View Conversation',
      description: 'Explore generated conversations and insights',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Navigation Bar */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToy sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
              InkToFrame
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <Tooltip title="View documentation">
            <IconButton sx={{ color: 'text.primary' }}>
              <Info />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  mb: 2,
                  background: 'linear-gradient(45deg, #fff 30%, #f0f9ff 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Transform Documents into Conversations
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                Upload any PDF or TXT file and watch as our AI transforms it into engaging, natural conversations. Get summaries, analysis, and interactive dialogues instantly.
              </Typography>
              
              {/* Main Action Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 4 }}>
                <Tooltip title="Click to upload a document">
                  <Box>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={onGetStarted}
                      startIcon={<CloudUpload sx={{ fontSize: 24 }} />}
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        fontSize: '1.1rem',
                        py: 1.5,
                        px: 4,
                        fontWeight: 700,
                        width: '100%',
                        '&:hover': {
                          bgcolor: 'grey.100',
                        },
                      }}
                    >
                      Upload Document
                    </Button>
                  </Box>
                </Tooltip>
                <Tooltip title="Sign up or log in">
                  <Box>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={onGetStarted}
                      startIcon={<Login sx={{ fontSize: 24 }} />}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        fontSize: '1.1rem',
                        py: 1.5,
                        px: 4,
                        fontWeight: 700,
                        width: '100%',
                        '&:hover': {
                          borderColor: 'grey.200',
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      Login / Sign Up
                    </Button>
                  </Box>
                </Tooltip>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: { xs: 300, md: 400 },
                }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    maxWidth: 400,
                    width: '100%',
                  }}
                >
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: 'primary.main',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <CloudUpload sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Upload Your Document
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Drag & drop or click to browse
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
                    <Chip label="PDF" color="primary" variant="outlined" />
                    <Chip label="TXT" color="primary" variant="outlined" />
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={onGetStarted}
                    startIcon={<AutoAwesome />}
                  >
                    Start Converting
                  </Button>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" gutterBottom>
            How It Works
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Three simple steps to transform your documents into engaging conversations
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {steps.map((step, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    mx: 'auto',
                    mb: 3,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {step.number}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {step.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {step.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" gutterBottom>
              Powerful Features
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Everything you need to convert documents into conversations
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                    <Box sx={{ mb: 3 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: { xs: 8, md: 10 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" gutterBottom>
            Ready to Transform Your Documents?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of users who are already converting their documents into
            engaging conversations. Start free today!
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={onGetStarted}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              fontSize: '1.2rem',
              py: 2,
              px: 6,
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
          >
            Get Started Now
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Document Conversation Converter
            </Typography>
            <Typography variant="body2" color="grey.400">
              Powered by advanced AI technology • Built for the future
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;