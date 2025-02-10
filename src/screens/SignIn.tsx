import React, { useState, useEffect, FormEvent } from "react";
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useNavigate } from 'react-router-dom';
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { SnackbarCloseReason } from "@mui/material/Snackbar";


const Alert = React.forwardRef<HTMLDivElement, AlertProps & { children?: React.ReactNode }>(
  function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  }
);

interface SignInProps { }

function SignIn(props: SignInProps) {
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const [err, setErr] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<"info" | "success" | "warning" | "error">("info");
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleClickOpen = () => {
    setOpenForgotPassword(true);
  };

  const handleClose = () => {
    setOpenForgotPassword(false);
  };

  const handleSnackbarClose = (event: Event | React.SyntheticEvent<any, Event>, reason: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleAlertClose = (event: React.SyntheticEvent) => {
    setSnackbarOpen(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIdentifierError('');
    setPasswordError('');
    try {
      const response = await fetch(`${apiUrl}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.accessToken);
        navigate('/home');
      } else {
        setPasswordError('Identifiant ou Mot de passe invalide');
        setIdentifierError('.');
        setSnackbarSeverity('error');
        setSnackbarMessage('Identifiant ou mot de passe invalide.');
        setSnackbarOpen(true);
        throw new Error(data.errors || 'Erreur identification');
      }
    } catch (error: any) {
      console.error(error);
      setErr(error.message);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  const handleForgotPasswordSubmit = async () => {
    try {
      const response = await fetch(`${apiUrl}/user/forgotPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });
      if (response.ok) {
        setSnackbarSeverity('success');
        setSnackbarMessage('Veuillez vérifier votre e-mail pour les instructions de réinitialisation du mot de passe.');
        setSnackbarOpen(true);
        handleClose();
      } else {
        setSnackbarSeverity('error');
        setSnackbarMessage('Impossible de trouver un compte avec cette adresse e-mail.');
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
      setSnackbarOpen(true);
      console.error('Erreur de réinitialisation du mot de passe:', error);
    }
  };

  useEffect(() => {
    const nav = document.querySelector('nav');
    if (nav) nav.style.display = 'none';

    return () => {
      if (nav) nav.style.display = 'block';
    };
  }, [navigate]);

  return (
    <div style={{
      backgroundImage: 'url("/BlueWall (1).jpeg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleAlertClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <Box sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: 3,
          borderRadius: 2,
          boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <img src="/logoAWI.png" alt="Logo" style={{ width: '100px', height: 'auto' }} />
          <Typography component="h1" variant="h5" sx={{ color: '#1e3a8a', margin: '20px 0' }}>
            Se connecter
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                name="identifier"
                required
                fullWidth
                id="identifier"
                label="Identifiant"
                autoFocus
                onChange={(e) => setIdentifier(e.target.value)}
                error={!!identifierError}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
              />
              <TextField
                name="password"
                required
                fullWidth
                id="password"
                label="Mot de Passe"
                error={!!passwordError}
                type={showPassword ? 'text' : 'password'}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 4, mb: 2, bgcolor: '#1e3a8a', '&:hover': { bgcolor: '#1e40af' } }}
                >
                Se connecter
              </Button>
            </Stack>
            <Stack direction="row" justifyContent="center" mt={2}>
              <Link href="#" variant="body2" onClick={handleClickOpen}>
                Mot de passe oublié ?
              </Link>
              <Dialog open={openForgotPassword} onClose={handleClose}>
                <DialogTitle>Mot de passe oublié</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Pour réinitialiser votre mot de passe, veuillez entrer votre adresse email ici. Nous vous enverrons des instructions.
                  </DialogContentText>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="email"
                    label="Adresse Email"
                    type="email"
                    fullWidth
                    variant="standard"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose}>Annuler</Button>
                  <Button onClick={handleForgotPasswordSubmit}>Envoyer</Button>
                </DialogActions>
              </Dialog>
            </Stack>
            <Stack direction="row" justifyContent="center" mt={1}>
              <Link href="/register" variant="body2">
                {"Pas encore de compte ? Inscris-toi !"}
              </Link>
            </Stack>
          </form>
        </Box>
      </Container>
    </div>
  );
}

export default SignIn;
