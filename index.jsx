import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  AppBar, 
  Toolbar, 
  Card, 
  CardContent, 
  Grid,
  IconButton
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import SettingsVoiceIcon from '@mui/icons-material/SettingsVoice';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            VoiceFlow<span style={{ color: '#651fff' }}>.AI</span>
          </Typography>
          <Button color="inherit" href="#features">Features</Button>
          <Button color="inherit" href="#use-cases">Use Cases</Button>
          <Button color="inherit" href="/voice-agents/new">Create Agent</Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ 
        bgcolor: 'background.default', 
        pt: 8, 
        pb: 6 
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                component="h1"
                variant="h2"
                color="text.primary"
                gutterBottom
              >
                Transform Your Business with Conversational AI
              </Typography>
              <Typography variant="h5" color="text.secondary" paragraph>
                Create custom AI voice agents to handle lead qualification, appointment setting, 
                customer support, and more - all powered by Play.ai's advanced API.
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  href="/voice-agents/new"
                  sx={{ mr: 2 }}
                >
                  Create Voice Agent
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  size="large"
                  href="/voice-agents/demo"
                >
                  Try Demo
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 3
              }}>
                <SettingsVoiceIcon sx={{ fontSize: 180, opacity: 0.7, color: 'primary.main' }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container sx={{ py: 8 }} maxWidth="lg" id="features">
        <Typography
          component="h2"
          variant="h3"
          align="center"
          color="text.primary"
          gutterBottom
        >
          Powerful Features
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          Everything you need to create and manage conversational AI agents
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} className="card-hover">
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <MicIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                </Box>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  Custom Voice Agents
                </Typography>
                <Typography align="center">
                  Create AI agents with unique personalities, knowledge bases, and conversation flows tailored to your business needs.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} className="card-hover">
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <IconButton sx={{ fontSize: 60, color: 'primary.main' }}>
                    <i className="fas fa-comment-dots"></i>
                  </IconButton>
                </Box>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  Natural Conversations
                </Typography>
                <Typography align="center">
                  Engage customers with natural-sounding voice interactions powered by Play.ai's advanced conversational AI.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} className="card-hover">
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <IconButton sx={{ fontSize: 60, color: 'primary.main' }}>
                    <i className="fas fa-plug"></i>
                  </IconButton>
                </Box>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  Easy Integration
                </Typography>
                <Typography align="center">
                  Connect with your existing tools and platforms including CRM, calendar, and communication systems.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Box sx={{ bgcolor: 'background.paper', py: 8 }} id="use-cases">
        <Container maxWidth="lg">
          <Typography
            component="h2"
            variant="h3"
            align="center"
            color="text.primary"
            gutterBottom
          >
            Use Cases
          </Typography>
          <Typography variant="h5" align="center" color="text.secondary" paragraph>
            How businesses are transforming with VoiceFlow.AI
          </Typography>
          
          <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              href="/voice-agents/new"
              sx={{ px: 4, py: 2 }}
            >
              Create Your Voice Agent Now
            </Button>
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: 8 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          {'Copyright © '}
          <Link color="inherit" href="/">
            VoiceFlow.AI
          </Link>{' '}
          {new Date().getFullYear()}
          {'.'}
        </Typography>
      </Container>
    </div>
  );
}
