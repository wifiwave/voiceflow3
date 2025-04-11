import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid,
  Paper
} from '@mui/material';
import VoiceAgentList from '../components/voice-agents/VoiceAgentList';

const Dashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Dashboard
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Welcome to VoiceFlow.AI
            </Typography>
            <Typography variant="body1" paragraph>
              Create and manage your AI voice agents to handle conversations for your business.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              href="/voice-agents/new"
            >
              Create New Voice Agent
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      <VoiceAgentList />
    </Container>
  );
};

export default Dashboard;
