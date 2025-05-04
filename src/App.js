import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import darkTheme from './theme';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import UploadsPage from './pages/UploadsPage';
import CommunityPage from './pages/CommunityPage';
import MessagesPage from './pages/MessagesPage';
import NavBar from './components/NavBar';
import { AuthProvider } from './components/AuthProvider';

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/uploads" element={<UploadsPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/messages" element={<MessagesPage />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;