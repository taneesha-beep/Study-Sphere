import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthProvider';
import axios from 'axios';
import { 
  Container, Typography, Box, Button, Paper, List, ListItem, ListItemText, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider,
  CircularProgress, Snackbar, Alert, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';

function CommunityPage() {
  const { user } = useContext(AuthContext);
  const [communities, setCommunities] = useState([]);
  const [publicCommunities, setPublicCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserCommunities();
      fetchPublicCommunities();
    }
  }, [user]);

  const fetchUserCommunities = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/communities/user/${user.user_id}`);
      setCommunities(response.data);
      setLoading(false);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch communities', severity: 'error' });
      setLoading(false);
    }
  };

  const fetchPublicCommunities = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/communities/list');
      setPublicCommunities(response.data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch public communities', severity: 'error' });
    }
  };

  const fetchCommunityMessages = async (communityId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/communities/${communityId}/messages`);
      setMessages(response.data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch messages', severity: 'error' });
    }
  };

  const handleCreateCommunity = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/communities/create', {
        name: communityName,
        description: communityDescription,
        created_by: user.user_id,
        is_public: isPublic
      });
      setCreateDialogOpen(false);
      setCommunityName('');
      setCommunityDescription('');
      fetchUserCommunities();
      setSnackbar({ open: true, message: 'Community created successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to create community', severity: 'error' });
    }
  };

  const handleJoinCommunity = async (communityId) => {
    try {
      await axios.post('http://localhost:5000/api/communities/join', {
        community_id: communityId,
        user_id: user.user_id
      });
      setJoinDialogOpen(false);
      fetchUserCommunities();
      setSnackbar({ open: true, message: 'Joined community successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.error || 'Failed to join community', severity: 'error' });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCommunity) return;
    
    try {
      await axios.post('http://localhost:5000/api/communities/send_message', {
        community_id: selectedCommunity.community_id,
        user_id: user.user_id,
        message_text: newMessage
      });
      setNewMessage('');
      fetchCommunityMessages(selectedCommunity.community_id);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to send message', severity: 'error' });
    }
  };

  const handleSelectCommunity = (community) => {
    setSelectedCommunity(community);
    fetchCommunityMessages(community.community_id);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6">Please login to access communities</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Communities</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Community
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Left sidebar - Communities list */}
          <Paper sx={{ width: '30%', p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Communities
            </Typography>
            <List>
              {communities.map((community) => (
                <ListItem 
                  key={community.community_id}
                  button
                  selected={selectedCommunity?.community_id === community.community_id}
                  onClick={() => handleSelectCommunity(community)}
                >
                  <ListItemText 
                    primary={community.name}
                    secondary={`Created by ${community.creator_name}`}
                  />
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Public Communities
            </Typography>
            <List>
              {publicCommunities
                .filter(c => !communities.some(uc => uc.community_id === c.community_id))
                .map((community) => (
                  <ListItem 
                    key={community.community_id}
                    button
                    onClick={() => handleJoinCommunity(community.community_id)}
                  >
                    <ListItemText 
                      primary={community.name}
                      secondary={`Created by ${community.creator_name}`}
                    />
                  </ListItem>
              ))}
            </List>
          </Paper>
          
          {/* Right side - Messages */}
          <Box sx={{ flex: 1 }}>
            {selectedCommunity ? (
              <Paper sx={{ p: 2, height: '70vh', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" gutterBottom>
                  {selectedCommunity.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedCommunity.description}
                </Typography>
                
                <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
                  {messages.map((message) => (
                    <Box key={message.message_id} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">
                        {message.username} - {new Date(message.sent_at).toLocaleString()}
                      </Typography>
                      <Typography variant="body1">{message.message_text}</Typography>
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
                <GroupIcon sx={{ fontSize: 60, mb: 2, color: 'text.secondary' }} />
                <Typography variant="h6">Select a community to view messages</Typography>
              </Paper>
            )}
          </Box>
        </Box>
      )}
      
      {/* Create Community Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Community</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Community Name"
            fullWidth
            value={communityName}
            onChange={(e) => setCommunityName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={communityDescription}
            onChange={(e) => setCommunityDescription(e.target.value)}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Typography variant="body1" sx={{ mr: 2 }}>Visibility:</Typography>
            <Button
              variant={isPublic ? 'contained' : 'outlined'}
              onClick={() => setIsPublic(true)}
              sx={{ mr: 1 }}
            >
              Public
            </Button>
            <Button
              variant={!isPublic ? 'contained' : 'outlined'}
              onClick={() => setIsPublic(false)}
            >
              Private
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateCommunity}
            disabled={!communityName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
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

export default CommunityPage;