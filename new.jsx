import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  TextField, 
  Card, 
  CardContent, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Paper
} from '@mui/material';
import { useRouter } from 'next/router';

const VoiceAgentBuilder = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [agentData, setAgentData] = useState({
    name: '',
    description: '',
    voiceType: 'female_01',
    useCase: 'lead_qualification',
    greeting: '',
    fallbackResponse: 'I\'m sorry, I didn\'t understand that. Could you please rephrase?'
  });

  const steps = ['Basic Information', 'Voice Selection', 'Conversation Flow', 'Review'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAgentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleCreateAgent = async () => {
    // In a real implementation, this would call the Play.ai API
    // For now, we'll just simulate success and redirect
    alert('Voice agent created successfully!');
    router.push('/voice-agents/[agentId]/conversation', `/voice-agents/demo-agent/conversation`);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              fullWidth
              label="Agent Name"
              name="name"
              value={agentData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={agentData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Use Case</InputLabel>
              <Select
                name="useCase"
                value={agentData.useCase}
                onChange={handleChange}
              >
                <MenuItem value="lead_qualification">Lead Qualification</MenuItem>
                <MenuItem value="appointment_setting">Appointment Setting</MenuItem>
                <MenuItem value="customer_support">Customer Support</MenuItem>
                <MenuItem value="reservations">Reservations</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );
      case 1:
        return (
          <Box>
            <FormControl fullWidth margin="normal">
              <InputLabel>Voice Type</InputLabel>
              <Select
                name="voiceType"
                value={agentData.voiceType}
                onChange={handleChange}
              >
                <MenuItem value="female_01">Female Voice 1</MenuItem>
                <MenuItem value="female_02">Female Voice 2</MenuItem>
                <MenuItem value="male_01">Male Voice 1</MenuItem>
                <MenuItem value="male_02">Male Voice 2</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                color="secondary"
                onClick={() => alert('Playing sample voice...')}
              >
                Play Sample
              </Button>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box>
            <TextField
              fullWidth
              label="Greeting Message"
              name="greeting"
              value={agentData.greeting}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
              placeholder="Hello, this is [Agent Name] from [Company]. How can I help you today?"
            />
            <TextField
              fullWidth
              label="Fallback Response"
              name="fallbackResponse"
              value={agentData.fallbackResponse}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Voice Agent
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Name:</Typography>
                <Typography variant="body1" gutterBottom>{agentData.name || 'Not specified'}</Typography>
                
                <Typography variant="subtitle1">Description:</Typography>
                <Typography variant="body1" gutterBottom>{agentData.description || 'Not specified'}</Typography>
                
                <Typography variant="subtitle1">Use Case:</Typography>
                <Typography variant="body1" gutterBottom>
                  {agentData.useCase === 'lead_qualification' ? 'Lead Qualification' : 
                   agentData.useCase === 'appointment_setting' ? 'Appointment Setting' :
                   agentData.useCase === 'customer_support' ? 'Customer Support' : 'Reservations'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Voice Type:</Typography>
                <Typography variant="body1" gutterBottom>
                  {agentData.voiceType === 'female_01' ? 'Female Voice 1' : 
                   agentData.voiceType === 'female_02' ? 'Female Voice 2' :
                   agentData.voiceType === 'male_01' ? 'Male Voice 1' : 'Male Voice 2'}
                </Typography>
                
                <Typography variant="subtitle1">Greeting:</Typography>
                <Typography variant="body1" gutterBottom>{agentData.greeting || 'Not specified'}</Typography>
                
                <Typography variant="subtitle1">Fallback Response:</Typography>
                <Typography variant="body1" gutterBottom>{agentData.fallbackResponse}</Typography>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Create Your Voice Agent
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
          Build a custom AI voice agent to handle conversations for your business
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {getStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          {activeStep !== 0 && (
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
          )}
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateAgent}
            >
              Create Agent
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default VoiceAgentBuilder;
