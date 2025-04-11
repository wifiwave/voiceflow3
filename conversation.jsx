import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  TextField, 
  Card, 
  CardContent, 
  Grid,
  Paper,
  IconButton,
  Divider,
  Avatar,
  CircularProgress
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import SendIcon from '@mui/icons-material/Send';
import { useRouter } from 'next/router';
import usePlayAiWebSocket from '../../hooks/usePlayAiWebSocket';

const RealTimeConversation = () => {
  const router = useRouter();
  const { agentId } = router.query;
  const [messages, setMessages] = useState([
    { role: 'agent', content: 'Hello! I\'m your AI assistant. How can I help you today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  
  // In a real implementation, this would use the actual WebSocket hook
  // For demo purposes, we'll simulate the conversation
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: inputText }]);
    setIsProcessing(true);
    
    // Simulate AI response after a delay
    setTimeout(() => {
      const responses = [
        "I understand what you're looking for. Could you provide more details?",
        "That's a great question. Based on what you've told me, I'd recommend...",
        "I'd be happy to help with that. Let me check some information for you.",
        "Thanks for sharing that information. Is there anything else you'd like to add?",
        "I've processed your request. Here's what I can offer..."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { role: 'agent', content: randomResponse }]);
      setIsProcessing(false);
    }, 1500);
    
    setInputText('');
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Start recording simulation
      setTimeout(() => {
        setIsRecording(false);
        setMessages(prev => [...prev, { role: 'user', content: "This is a simulated voice message from the user." }]);
        setIsProcessing(true);
        
        // Simulate AI response after a delay
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'agent', 
            content: "I've received your voice message. In a real implementation, this would be processed through Play.ai's speech-to-text API." 
          }]);
          setIsProcessing(false);
        }, 1500);
      }, 3000);
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8, height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5">
          {agentId === 'demo-agent' ? 'Demo Voice Agent' : `Voice Agent: ${agentId}`}
        </Typography>
      </Paper>
      
      <Paper sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', mb: 2, maxHeight: 'calc(80vh - 180px)' }}>
        <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
          {messages.map((message, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 2 
              }}
            >
              {message.role === 'agent' && (
                <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>AI</Avatar>
              )}
              
              <Paper 
                sx={{ 
                  p: 2, 
                  maxWidth: '70%',
                  bgcolor: message.role === 'user' ? 'secondary.main' : 'background.paper',
                  borderRadius: 2
                }}
              >
                <Typography variant="body1">
                  {message.content}
                </Typography>
              </Paper>
              
              {message.role === 'user' && (
                <Avatar sx={{ bgcolor: 'secondary.main', ml: 1 }}>U</Avatar>
              )}
            </Box>
          ))}
          
          {isProcessing && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>AI</Avatar>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Processing...
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>
      </Paper>
      
      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton 
          color={isRecording ? "secondary" : "primary"} 
          onClick={toggleRecording}
          sx={{ mr: 1 }}
        >
          {isRecording ? <StopIcon /> : <MicIcon />}
        </IconButton>
        
        <TextField
          fullWidth
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isRecording}
          multiline
          maxRows={3}
          sx={{ mr: 1 }}
        />
        
        <IconButton 
          color="primary" 
          onClick={handleSendMessage}
          disabled={!inputText.trim() || isRecording}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </Container>
  );
};

export default RealTimeConversation;
