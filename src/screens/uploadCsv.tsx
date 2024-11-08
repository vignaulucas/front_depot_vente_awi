import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../component/navbar';
import { Box, Button, Typography, Paper, ThemeProvider, createTheme } from '@mui/material';
import Spinner from '../component/spinner';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1b1f3a', // Bleu nuit
    },
    secondary: {
      main: '#0d1b2a', // Bleu foncé
    },
    text: {
      primary: '#1b1f3a', // Texte en bleu nuit
      secondary: '#0d1b2a', // Texte secondaire en bleu foncé
    },
    background: {
      default: '#e3eaf4', // Bleu très clair pour le fond général
      paper: '#f0f4fc',   // Bleu très clair pour les surfaces en papier
    },
  },
  typography: {
    h4: {
      color: '#1b1f3a', // Titre en bleu nuit
    },
    body1: {
      color: '#0d1b2a', // Texte principal en bleu foncé
    },
  },
});

function UploadCsv() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
      setUploadStatus('');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Veuillez sélectionner un fichier.');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/csv/post`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setUploadStatus('Le fichier a été téléversé et traité avec succès.');
      } else {
        setUploadStatus('Erreur lors du téléversement du fichier.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du fichier:', error);
      setUploadStatus('Erreur lors du téléversement du fichier.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setSelectedFile(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div>
        <Navbar />
        {isLoading && <Spinner />}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 2,
            backgroundColor: 'background.default',
            filter: isLoading ? 'blur(3px)' : 'none',
            marginTop: '20px',
          }}
        >
          <Typography variant="h4" gutterBottom>
            Téléversement de fichier CSV
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              width: '100%',
              maxWidth: 500,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: 'background.paper',
              borderStyle: 'dashed',
              borderColor: 'primary.main',
              borderWidth: '2px',
              '&:hover': {
                backgroundColor: '#d8e2f1',
              },
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <>
                <img src="/CSV_Logo.png" alt="CSV Logo" style={{ width: 50, height: 50 }} />
                <Typography>
                  Fichier sélectionné : {selectedFile.name}
                </Typography>
              </>
            ) : (
              <Typography>
                Glissez et déposez votre fichier ici ou cliquez pour sélectionner un fichier
              </Typography>
            )}
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              ref={fileInputRef}
              id="contained-button-file"
            />
            <label htmlFor="contained-button-file">
              <Button
                variant="contained"
                component="span"
                sx={{ mt: 2, backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'secondary.main' } }}
              >
                Choisissez un fichier
              </Button>
            </label>
          </Paper>
          <Button
            variant="contained"
            disabled={isLoading}
            onClick={handleFileUpload}
            sx={{
              mt: 2,
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'secondary.main',
              },
            }}
          >
            Envoyer le fichier
          </Button>
          {uploadStatus && (
            <Typography sx={{ mt: 2, color: 'primary.main' }}>
              {uploadStatus}
            </Typography>
          )}
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default UploadCsv;
