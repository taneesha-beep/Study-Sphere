import React, { useContext } from 'react';
import { AuthContext } from '../components/AuthProvider';
import { Container, Typography, Box, Avatar, Paper, List, ListItem, ListItemText } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function ProfilePage() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6">Please login to view your profile</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ width: 80, height: 80, mr: 3 }}>
            <AccountCircleIcon sx={{ fontSize: 60 }} />
          </Avatar>
          <Box>
            <Typography variant="h4">{user.username}</Typography>
            <Typography variant="subtitle1" color="text.secondary">{user.email}</Typography>
          </Box>
        </Box>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="Member since" 
              secondary={new Date(user.created_at).toLocaleDateString()} 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="User ID" 
              secondary={user.user_id} 
            />
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
}

export default ProfilePage;