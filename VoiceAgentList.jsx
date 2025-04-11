import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/router';

const VoiceAgentList = () => {
  const router = useRouter();
  
  // Sample voice agents for demonstration
  const voiceAgents = [
    {
      id: 'demo-agent-1',
      name: 'Lead Qualifier',
      description: 'Qualifies leads and schedules appointments with sales team',
      useCase: 'lead_qualification',
      voiceType: 'female_01',
      createdAt: '2025-04-10'
    },
    {
      id: 'demo-agent-2',
      name: 'Appointment Scheduler',
      description: 'Books and manages appointments for your business',
      useCase: 'appointment_setting',
      voiceType: 'male_01',
      createdAt: '2025-04-09'
    },
    {
      id: 'demo-agent-3',
      name: 'Customer Support',
      description: 'Handles common customer support inquiries',
      useCase: 'customer_support',
      voiceType: 'female_02',
      createdAt: '2025-04-08'
    }
  ];

  const handleCreateNew = () => {
    router.push('/voice-agents/new');
  };

  const handleOpenConversation = (agentId) => {
    router.push(`/voice-agents/${agentId}/conversation`);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Your Voice Agents
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleCreateNew}
        >
          Create New Agent
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {voiceAgents.map((agent) => (
          <Grid item xs={12} key={agent.id}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <Typography variant="h5" gutterBottom>
                    {agent.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {agent.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Use Case:</strong> {agent.useCase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Voice:</strong> {agent.voiceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Created:</strong> {agent.createdAt}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => handleOpenConversation(agent.id)}
                    sx={{ mb: 1, width: { xs: '100%', sm: 'auto' } }}
                  >
                    Start Conversation
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="secondary"
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    Edit Agent
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      {voiceAgents.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            You don't have any voice agents yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Create your first voice agent to start handling conversations
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleCreateNew}
          >
            Create Your First Agent
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default VoiceAgentList;
