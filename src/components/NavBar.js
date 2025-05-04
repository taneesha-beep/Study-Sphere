import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from './AuthProvider';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GroupIcon from '@mui/icons-material/Group';
import MessageIcon from '@mui/icons-material/Message';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';

function NavBar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Study Sphere
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="inherit" component={Link} to="/" startIcon={<HomeIcon />}>
            Home
          </Button>
          {user && (
            <>
              <Button color="inherit" component={Link} to="/uploads" startIcon={<CloudUploadIcon />}>
                Uploads
              </Button>
              <Button color="inherit" component={Link} to="/community" startIcon={<GroupIcon />}>
                Community
              </Button>
              <Button color="inherit" component={Link} to="/messages" startIcon={<MessageIcon />}>
                Messages
              </Button>
              <Button color="inherit" component={Link} to="/profile" startIcon={<AccountCircleIcon />}>
                Profile
              </Button>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </>
          )}
          {!user && (
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;