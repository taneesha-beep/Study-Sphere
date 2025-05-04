import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../components/AuthProvider';
import axios from 'axios';
import { 
  Container, Typography, Box, Paper, List, ListItem, ListItemText, 
  TextField, Button, Divider, Avatar, CircularProgress, Snackbar, Alert
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function MessagesPage() {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/messages/user/${user.user_id}`);
      setConversations(response.data);
      setLoading(false);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch conversations', severity: 'error' });
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/messages/conversation/${user.user_id}/${otherUserId}`);
      setMessages(response.data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch messages', severity: 'error' });
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.other_user_id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      await axios.post('http://localhost:5000/api/messages/send', {
        sender_id: user.user_id,
        recipient_id: selectedConversation.other_user_id,
        message_text: newMessage
      });
      setNewMessage('');
      fetchMessages(selectedConversation.other_user_id);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to send message', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6">Please login to access messages</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Messages
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Left sidebar - Conversations list */}
          <Paper sx={{ width: '30%', p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Conversations
            </Typography>
            <List>
              {conversations.map((conversation) => (
                <ListItem 
                  key={conversation.other_user_id}
                  button
                  selected={selectedConversation?.other_user_id === conversation.other_user_id}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <Avatar sx={{ mr: 2 }}>
                    <AccountCircleIcon />
                  </Avatar>
                  <ListItemText 
                    primary={conversation.other_username}
                    secondary={new Date(conversation.last_message_time).toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
          
          {/* Right side - Messages */}
          <Box sx={{ flex: 1 }}>
            {selectedConversation ? (
              <Paper sx={{ p: 2, height: '70vh', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2 }}>
                    <AccountCircleIcon />
                  </Avatar>
                  <Typography variant="h6">{selectedConversation.other_username}</Typography>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
                  {messages.map((message) => (
                    <Box 
                      key={message.message_id}
                      sx={{ 
                        mb: 2,
                        display: 'flex',
                        justifyContent: message.sender_id === user.user_id ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <Box 
                        sx={{ 
                          p: 2,
                          borderRadius: 2,
                          bgcolor: message.sender_id === user.user_id ? 'primary.main' : 'background.paper',
                          color: message.sender_id === user.user_id ? 'primary.contrastText' : 'text.primary',
                          maxWidth: '70%'
                        }}
                      >
                        <Typography variant="body1">{message.message_text}</Typography>
                        <Typography variant="caption" display="block" textAlign="right">
                          {new Date(message.sent_at).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </Button>
                </Box>
              </Paper>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <AccountCircleIcon sx={{ fontSize: 60, mb: 2, color: 'text.secondary' }} />
                <Typography variant="h6">Select a conversation to view messages</Typography>
              </Paper>
            )}
          </Box>
        </Box>
      )}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default MessagesPage;