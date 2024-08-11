'use client';
import { useState } from 'react';
import { Box, Stack, TextField, Button, Paper, Avatar, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FlutterDashIcon from '@mui/icons-material/FlutterDash';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi, I'm the Headstarter Support Agent. How can I assist you today?`,
    },
  ]);
  const [message, setMessage] = useState('');

  const formatResponse = (text) => {
    // Split the text into lines
    const lines = text.split('\n');

    // Check if the first line is a regular paragraph or part of a list
    const isNumberedList = lines.some(line => line.trim().match(/^\d+\./));

    if (isNumberedList) {
      return (
        <Box>
          {lines.map((line, index) => (
            <Typography key={index} component={line.match(/^\d+\./) ? "li" : "p"} sx={{ margin: line.match(/^\d+\./) ? "0 0 0 20px" : "0" }}>
              {line}
            </Typography>
          ))}
        </Box>
      );
    }

    // For normal text
    return <Typography>{text}</Typography>;
  };

  const calculateBorderRadius = (text) => {
    return text.length > 100 ? 10 : 20;
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);
    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Int8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);

          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#F5F5F5"
    >
      <Paper elevation={3} sx={{ width: '100%', maxWidth: '600px', height: '80%', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="column" spacing={2} flexGrow={1} overflow="auto" p={2}>
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
              alignItems="center"
            >
              {message.role === 'assistant' && (
                <Avatar sx={{ bgcolor: '#007AFF', marginRight: 1 }}>
                  <FlutterDashIcon />
                </Avatar>
              )}
              <Box
                bgcolor={message.role === 'assistant' ? '#E5E5EA' : '#007AFF'}
                color={message.role === 'assistant' ? '#000000' : '#FFFFFF'}
                borderRadius={calculateBorderRadius(message.content)}
                p={2}
                maxWidth="75%"
                boxShadow={message.role === 'assistant' ? '0 2px 4px rgba(0, 0, 0, 0.1)' : '0 2px 4px rgba(0, 0, 0, 0.15)'}
              >
                {formatResponse(message.content)}
              </Box>
            </Box>
          ))}
        </Stack>

        <Stack direction="row" spacing={2} p={2}>
          <TextField
            label="Type your message..."
            variant="outlined"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') sendMessage();
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            sx={{ borderRadius: '10px', padding: '10px', minWidth: '50px' }}
          >
            <SendIcon />
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
