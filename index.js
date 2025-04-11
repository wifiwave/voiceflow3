import React from 'react';

export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#121212',
      color: 'white'
    }}>
      <h1 style={{ 
        fontSize: '2.5rem', 
        marginBottom: '20px',
        background: 'linear-gradient(90deg, #9c27b0, #651fff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        VoiceFlow.AI
      </h1>
      <p style={{ fontSize: '1.2rem', maxWidth: '600px', marginBottom: '30px' }}>
        Create custom AI voice agents to handle lead qualification, appointment setting, customer support, and more - all powered by Play.ai's advanced API.
      </p>
      <div>
        <button style={{
          backgroundColor: '#9c27b0',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginRight: '10px'
        }}>
          Create Voice Agent
        </button>
        <button style={{
          backgroundColor: 'transparent',
          color: '#651fff',
          border: '1px solid #651fff',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          Try Demo
        </button>
      </div>
    </div>
  );
}
