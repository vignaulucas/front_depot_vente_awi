import React, { useState, useEffect } from 'react';
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useNavigate } from 'react-router-dom';
import Checkbox from "@mui/material/Checkbox";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Stack } from '@mui/material';


const postalCodeRegex = /^\d{5}$/;
const telephoneRegex = /^\d{10}$/;
const firstNameRegex = /^[a-zA-Z]+([ -][a-zA-Z]+)*$/;
const lastNameRegex = /^[a-zA-Z\s]+$/;

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [login, setLogin] = useState(false);
  const [err, setError] = useState('');
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [postalCodeError, setPostalCodeError] = useState('');
  const [telephoneError, setTelephoneError] = useState('');
  const [adresseError, setAdresseError] = useState('');
  const [villeError, setVilleError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [aspiringManager, setAspiringManager] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;


  useEffect(() => {
    const nav = document.querySelector('nav');
    if (nav) {
      nav.style.display = 'none';
    }
    return () => {
      if (nav) {
        nav.style.display = 'block';
      }
    };
  }, []);


  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownConfirmPassword = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let hasError = false;
    if (!firstName) {
      setFirstNameError('Veuillez entrer votre prénom.');
      hasError = true;
    } else if (!firstNameRegex.test(firstName)) {
      setFirstNameError('Le prénom doit contenir uniquement des lettres, un seul tiret et des espace.');
      hasError = true;
    } else {
      setFirstNameError('');
    }

    if (!lastNameRegex.test(lastName)) {
      setLastNameError('Veuillez entrer un nom valide.');
      hasError = true;
    } else {
      setLastNameError('');
    }
    // Validation de l'adresse e-mail
    let validatedEmail = email;
    if (!email) {
      setEmailError('Veuillez entrez un email valide.');
    } else if (!/\S+@\S+\.\S{2,3}/.test(email)) {
      setEmailError("L'adresse e-mail est invalide.");
      hasError = true;
    } else {
      setEmailError('');
    }
    // Validation du mot de passe
    if (!password) {
      setPasswordError('Veuillez entrer un mot de passe.');
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères.');
      hasError = true;
      // Validation du mot de passe avec au moins un chiffre, une lettre en majuscule, une lettre en minuscule et un caractère spécial
    } else if (!/^(?=.*\d)(?=.*[A-Z])(?=.*\W).{8,}$/.test(password)) {
      setPasswordError('Le mot de passe doit contenir au moins un chiffre, une lettre en majuscule, une lettre en minuscule et un caractère spécial.');
      hasError = true;
    } else {
      setPasswordError('');
    }

    // Validation de la confirmation du mot de passe
    if (!confirmPassword) {
      setConfirmPasswordError('Veuillez confirmer votre mot de passe.');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Les mots de passe ne correspondent pas.');
      hasError = true;
    } else {
      setConfirmPasswordError('');
    }

    // Validation du Code Postale (5)
    if (!postalCode) {
      setPostalCodeError('');
    } else if (!postalCodeRegex.test(postalCode)) {
      setPostalCodeError('Le code postal doit être une suite de 5 chiffres.');
      hasError = true;
    } else {
      setPostalCodeError('');
    }

    // Validation du téléphone
    if (!telephone) {
      setTelephoneError('Veuillez entrer votre numéro de téléphone.');
      hasError = true;
    } else if (!telephoneRegex.test(telephone)) {
      setTelephoneError('Le numéro de téléphone doit être une suite de 10 chiffres.');
      hasError = true;
    } else {
      setTelephoneError('');
    }
    if (hasError) {
      return; // Arrêter ici si une erreur a été trouvée
    }

    try {
      const response = await fetch(`${apiUrl}/user/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: validatedEmail,
          password,
          firstName,
          lastName,
          telephone,
          ville: ville || null,
          postalCode: postalCode || null,
          adresse: adresse || null,
          aspiringManager,
        })
      })
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.errors || 'Erreur identification');
      }
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('role', data.role);
      navigate("/home");
      setLogin(true);
      setError('');
    } catch (error: any) {
      setError(error.message);
    }

  }


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
      <Container component="main" maxWidth="md" sx={{ overflowY: 'auto', height: '100vh' }}>
        <CssBaseline />
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: 1, // Réduit pour diminuer l'espace interne
            borderRadius: 2,
            boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: '800px', // Réduit pour une largeur plus petite
            maxHeight: '700px', // Réduit pour une hauteur plus petite
            width: '100%',
            height: 'auto',
            overflow: 'auto',
          }}
        >
          <img src="/logoAWI.png" alt="Logo" style={{ width: '100px', height: 'auto' }} />
          <Typography component="h1" variant="h5" sx={{ color: '#1e3a8a', margin: '20px 0' }}>
            Inscription
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 1, width: '100%' }}
          >
            <Grid container spacing={2}> {/* Spacing ici contrôle l'espacement entre les lignes/colonnes */}
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="Prénom"
                  autoFocus
                  onChange={(e) => setFirstName(e.target.value)}
                  error={!!firstNameError}
                  helperText={firstNameError}
                  sx={{ bgcolor: 'white', borderRadius: 1, borderColor: 'green' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Nom"
                  name="lastName"
                  autoComplete="family-name"
                  onChange={(e) => setLastName(e.target.value)}
                  error={!!lastNameError}
                  helperText={lastNameError}
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                />
              </Grid>


              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="E-Mail"
                  fullWidth
                  id="E-Mail"
                  label="Email"
                  required
                  autoFocus
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!emailError}
                  helperText={emailError}
                  sx={{ bgcolor: 'white', borderRadius: 1, borderColor: 'green' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="telephone"
                  label="Téléphone"
                  name="telephone"
                  autoComplete="family-name"
                  onChange={(e) => setTelephone(e.target.value)}
                  error={!!telephoneError}
                  helperText={telephoneError}
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="password"
                  required
                  fullWidth
                  id="password"
                  label="Mot de Passe"
                  type={showPassword ? 'text' : 'password'}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!passwordError}
                  helperText={passwordError}
                  sx={{ bgcolor: 'white', borderRadius: 1, borderColor: 'green' }}
                  InputProps={{ // Ajoutez cette prop pour le TextField du mot de passe
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
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="confirmPassword"
                  required
                  fullWidth
                  id="confirmPassword"
                  label="Confirmer Mot de Passe"
                  type={showConfirmPassword ? 'text' : 'password'}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={!!confirmPasswordError}
                  helperText={confirmPasswordError}
                  sx={{ bgcolor: 'white', borderRadius: 1, borderColor: 'green' }}
                  InputProps={{ // Ajoutez cette prop pour le TextField du mot de passe
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirmPassword visibility"
                          onClick={handleClickShowConfirmPassword}
                          onMouseDown={handleMouseDownConfirmPassword}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="postalCode"
                  fullWidth
                  id="postalCode"
                  label="Code Postal"
                  autoFocus
                  onChange={(e) => setPostalCode(e.target.value)}
                  error={!!postalCodeError}
                  helperText={postalCodeError}
                  sx={{ bgcolor: 'white', borderRadius: 1, borderColor: 'green' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="ville"
                  label="Ville"
                  name="ville"
                  autoComplete="family-name"
                  onChange={(e) => setVille(e.target.value)}
                  error={!!villeError}
                  helperText={villeError}
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="adresse"
                  fullWidth
                  id="adresse"
                  label="Adresse"
                  autoFocus
                  onChange={(e) => setAdresse(e.target.value)}
                  error={!!adresseError}
                  helperText={adresseError}
                  sx={{ bgcolor: 'white', borderRadius: 1, borderColor: 'green' }}
                />
              </Grid>


              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox
                    checked={aspiringManager}
                    onChange={(e) => setAspiringManager(e.target.checked)}
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                  />
                  <Typography variant="subtitle2" sx={{ ml: 1 }}>
                    Demander à être gestionnaire
                  </Typography>
                </Box>
              </Grid>

            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 4, mb: 2, bgcolor: '#1e3a8a', '&:hover': { bgcolor: '#1e40af' } }}
              >
              Inscription
            </Button>

          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href="/login" variant="body2">
                Déjà inscrit ? Connectes-toi !
              </Link>
            </Grid>
          </Grid>
          <Typography
            variant="body2"
            sx={{
              color: '#333',
              marginTop: '20px',
              textAlign: 'center',
              fontSize: '1.2rem', // Augmente la taille de la police du Typography
              fontWeight: 'bold', // Rend le texte gras

            }}
          >
          </Typography>
        </Box>


      </Container>
    </div>
  );

}
