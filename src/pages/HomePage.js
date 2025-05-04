import React, { useContext } from 'react';
import { AuthContext } from '../components/AuthProvider';
import { Container, Typography, Box, Grid, Card, CardContent, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function HomePage() {
  const { user } = useContext(AuthContext);

  const features = [
    {
      title: 'File Management',
      description: 'Upload, organize, and manage your files with ease. Access them from anywhere.'
    },
    {
      title: 'File Sharing',
      description: 'Share files with others via email with customizable permissions.'
    },
    {
      title: 'Communities',
      description: 'Join or create communities to collaborate with others in group discussions.'
    },
    {
      title: 'Messaging',
      description: 'Send private messages to other users with real-time updates.'
    }
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" gutterBottom>
          Welcome to Study Sphere
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {user ? `Hello, ${user.username}!` : 'A secure platform for file storage and collaboration'}
        </Typography>
      </Box>

      {!user && (
        <Box textAlign="center" mb={4}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            component={Link} 
            to="/login"
            sx={{ mr: 2 }}
          >
            Login
          </Button>
          <Typography variant="body2" display="inline" sx={{ verticalAlign: 'middle' }}>
            or
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            size="large" 
            component={Link} 
            to="/login"
            sx={{ ml: 2 }}
          >
            Register
          </Button>
        </Box>
      )}

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Features
      </Typography>
      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default HomePage;