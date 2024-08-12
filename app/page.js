'use client';
import { useState, useEffect, useRef } from 'react';
import { Box, Stack, TextField, Button, Paper, Avatar, Typography, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FlutterDashIcon from '@mui/icons-material/FlutterDash';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi, I'm the Headstarter Support Agent. How can I assist you today?`,
    },
  ]);
  const [message, setMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const colors = {
    background: darkMode ? '#1C1C1E' : '#F5F5F5',
    assistantBg: darkMode ? '#2C2C2E' : '#E5E5EA',
    userBg: darkMode ? '#0A84FF' : '#007AFF',
    assistantText: darkMode ? '#FFFFFF' : '#000000',
    userText: '#FFFFFF',
    paperBg: darkMode ? '#1E1E1E' : '#FFFFFF',
    textFieldBg: darkMode ? '#2C2C2E' : '#FFFFFF',
    textFieldBorder: darkMode ? '#555555' : '#CCCCCC',
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('File uploaded successfully!');
      } else {
        alert('File upload failed.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('File upload failed.');
    }
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
      bgcolor={colors.background}
    >
      <IconButton
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          color: darkMode ? '#FFFFFF' : '#000000',
          backgroundColor: darkMode ? '#333333' : '#E0E0E0',
          '&:hover': {
            backgroundColor: darkMode ? '#444444' : '#CCCCCC',
          },
        }}
        onClick={toggleDarkMode}
      >
        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>

      <Paper elevation={3} sx={{ width: '100%', maxWidth: '600px', height: '80%', borderRadius: 3, display: 'flex', flexDirection: 'column', bgcolor: colors.paperBg }}>
        <Stack direction="column" spacing={2} flexGrow={1} overflow="auto" p={2} ref={scrollRef}>
        {messages.map((message, index) => (
  <Box
    key={index}
    display="flex"
    justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
    alignItems="center"
    sx={{
      mb: 1, // Margin bottom for spacing between messages
    }}
  >
    {message.role === 'assistant' && (
      <Avatar sx={{ bgcolor: colors.userBg, marginRight: 1 }}>
        <FlutterDashIcon />
      </Avatar>
    )}
    <Box
      bgcolor={message.role === 'assistant' ? colors.assistantBg : colors.userBg}
      color={message.role === 'assistant' ? colors.assistantText : colors.userText}
      borderRadius={16} // Slightly less rounded corners
      p={2}
      maxWidth="70%" // Reduce maxWidth for better word wrapping
      boxShadow="0 1px 3px rgba(0, 0, 0, 0.2)" // Softer shadow
      sx={{
        wordWrap: 'break-word', // Ensure words break properly
      }}
    >
      <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
        {message.content}
      </Typography>
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
            sx={{
              bgcolor: colors.textFieldBg,
              borderColor: colors.textFieldBorder,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: colors.textFieldBorder,
                },
              },
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

        <Stack direction="row" spacing={2} p={2}>
          <Button
            variant="contained"
            color="secondary"
            component="label"
            sx={{ borderRadius: '10px', padding: '10px', minWidth: '50px' }}
          >
            <CloudUploadIcon />
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleFileUpload}
            sx={{ borderRadius: '10px', padding: '10px', minWidth: '50px' }}
            disabled={!selectedFile}
          >
            Upload Document
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
