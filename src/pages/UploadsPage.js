import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../components/AuthProvider';
import axios from 'axios';
import { 
  Container, Typography, Box, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Snackbar, Alert, LinearProgress,
  Divider, CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

function UploadsPage() {
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [sharedFiles, setSharedFiles] = useState({ sharedByUser: [], sharedWithUser: [] });
  const [selectedFile, setSelectedFile] = useState(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user) {
      fetchFiles();
      fetchSharedFiles();
    }
  }, [user]);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/files/user/${user.user_id}`);
      setFiles(response.data || []); // Ensure we always have an array
      setLoading(false);
    } catch (error) {
      console.error('Error fetching files:', error);
      setSnackbar({ open: true, message: 'Failed to fetch files', severity: 'error' });
      setLoading(false);
    }
  };

  const fetchSharedFiles = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/files/shared/${user.user_id}`);
      setSharedFiles({
        sharedByUser: response.data?.sharedByUser || [],
        sharedWithUser: response.data?.sharedWithUser || []
      });
    } catch (error) {
      console.error('Error fetching shared files:', error);
      setSnackbar({ open: true, message: 'Failed to fetch shared files', severity: 'error' });
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]; // Get the file from the file input

    if (!file) return;

    // Create a FormData to send the file in a POST request
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', user.user_id); // Sending the user ID with the file

    try {
      // Send the file to the server
      const response = await axios.post('http://localhost:5000/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setUploadProgress(progress);
        },
      });

      // After the upload, fetch the files again
      fetchFiles();
      setSnackbar({ open: true, message: 'File uploaded successfully', severity: 'success' });
      setUploadProgress(0);
    } catch (error) {
      console.error('Error uploading file:', error);
      setSnackbar({ open: true, message: 'Failed to upload file', severity: 'error' });
    }
  };

  // Handle file download
  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/files/download/${fileId}`, {
        responseType: 'blob', // Set responseType to 'blob' for downloading files
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      setSnackbar({ open: true, message: 'Failed to download file', severity: 'error' });
    }
  };

  // Handle file sharing
  const handleShare = (file) => {
    setSelectedFile(file);
    setShareDialogOpen(true);
    setEmail(''); // Reset email input
    setCanEdit(false); // Default to 'view only' permission
  };

  // Function to handle file sharing
  const handleShareSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/files/share', {
        file_id: selectedFile.file_id,
        recipient_email: email,
        can_edit: canEdit,
      });

      setSnackbar({ open: true, message: 'File shared successfully', severity: 'success' });
      setShareDialogOpen(false);
      fetchSharedFiles(); // Refresh shared files
    } catch (error) {
      console.error('Error sharing file:', error);
      setSnackbar({ open: true, message: 'Failed to share file', severity: 'error' });
    }
  };

  // Handle file deletion
  const handleDelete = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await axios.delete(`http://localhost:5000/api/files/delete/${fileId}`);
        setSnackbar({ open: true, message: 'File deleted successfully', severity: 'success' });
        fetchFiles(); // Refresh files list
      } catch (error) {
        console.error('Error deleting file:', error);
        setSnackbar({ open: true, message: 'Failed to delete file', severity: 'error' });
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Files
      </Typography>
      
      {uploadProgress > 0 && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="body2" textAlign="center">{uploadProgress}%</Typography>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadIcon />}
        >
          Upload File
          <input
            type="file"
            hidden
            onChange={handleFileUpload}
          />
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>File Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Uploaded</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.file_id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <InsertDriveFileIcon sx={{ mr: 1 }} />
                        {file.file_name}
                      </Box>
                    </TableCell>
                    <TableCell>{file.file_type}</TableCell>
                    <TableCell>{file.file_size_mb} MB</TableCell>
                    <TableCell>{new Date(file.upload_date).toLocaleString()}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleDownload(file.file_id, file.file_name)}>
                        <DownloadIcon />
                      </IconButton>
                      <IconButton onClick={() => handleShare(file)}>
                        <ShareIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(file.file_id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Dialog and other UI elements for shared files */}
        </>
      )}
      
      {/* Dialogs and Snackbar remain the same */}
    </Container>
  );
}

export default UploadsPage;
