import React, { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, CardActions, Button, Snackbar, Alert, createTheme, ThemeProvider, Box } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Navbar from '../component/navbar';
import { useNavigate } from 'react-router-dom';

interface Game {
    id: number;
    name: string;
    publisher: string;
    price: number;
    uniqueIdentifier: string;
}

const theme = createTheme({
    palette: {
        primary: {
            main: '#0f7d21',
        },
        secondary: {
            main: '#1A2E4C', // Bleu nuit
        },
    },
});

// Fonction pour décoder le token et obtenir le userId
function parseJwt(token: string | null) {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window
                .atob(base64)
                .split('')
                .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Erreur lors du décodage du token:', error);
        return null;
    }
}

export default function Wishlist() {
    const [wishlistGames, setWishlistGames] = useState<Game[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const apiUrl = process.env.REACT_APP_API_URL || '';
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const decodedToken = parseJwt(token);
    const userId = decodedToken ? decodedToken.id : null;

    useEffect(() => {
        const fetchWishlistGames = async () => {
            if (!token || !userId) {
                navigate('/login');
                return;
            }

            try {
                // Récupérer la liste des `gameId` dans la wishlist
                const response = await fetch(`${apiUrl}/wishlist/${userId}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const wishlistData = await response.json();
                    console.log(wishlistData)
                    const gameIds = wishlistData.map((item: { gameId: number }) => item.gameId);

                    // Récupérer les informations complètes des jeux à partir des gameId
                    const gamesDetails = await Promise.all(
                        gameIds.map(async (gameId: number) => {
                            const gameResponse = await fetch(`${apiUrl}/depot/games/${gameId}`, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            });
                            return gameResponse.ok ? gameResponse.json() : null;
                        })
                    );

                    setWishlistGames(gamesDetails.filter((game) => game !== null) as Game[]);
                } else {
                    console.error('Erreur lors de la récupération des jeux de la wishlist');
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des jeux de la wishlist:', error);
            }
        };

        fetchWishlistGames();
    }, [apiUrl, navigate, token, userId]);

    const handleRemoveFromWishlist = async (gameId: number) => {
        if (!token || !userId) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/wishlist/${gameId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            if (response.ok) {
                setWishlistGames(wishlistGames.filter((game) => game.id !== gameId));
                setSnackbarMessage('Jeu retiré de la wishlist avec succès.');
                setSnackbarOpen(true);
            } else {
                console.error('Erreur lors de la suppression du jeu de la wishlist');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du jeu de la wishlist:', error);
        }
    };

    const handleCloseSnackbar = () => setSnackbarOpen(false);

    return (
        <ThemeProvider theme={theme}>
            <Navbar />
            <div style={{
                backgroundImage: 'url("/BlueWall (1).jpeg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                paddingTop: '80px'
            }}>
                <Container maxWidth="lg" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '10px', padding: '40px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                        Ma Wishlist
                    </Typography>

                    {wishlistGames.length > 0 ? (
                        <Grid container spacing={4} justifyContent="center">
                            {wishlistGames.map((game) => (
                                <Grid item xs={12} sm={6} md={4} key={game.id}>
                                    <Card sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 250 }}>
                                        <CardContent>
                                            <Typography variant="h5" component="div" gutterBottom>
                                                {game.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Éditeur : {game.publisher}
                                            </Typography>
                                            <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold', mt: 2 }}>
                                                Prix : {game.price} €
                                            </Typography>
                                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                                Référence : {game.uniqueIdentifier}
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: 'center' }}>
                                            <Button
                                                variant="outlined"
                                                color="secondary"
                                                startIcon={<FavoriteIcon />}
                                                onClick={() => handleRemoveFromWishlist(game.id)}
                                                sx={{
                                                    borderColor: theme.palette.secondary.main,
                                                    color: theme.palette.secondary.main,
                                                    '&:hover': {
                                                        backgroundColor: '#ffcccc',
                                                        borderColor: theme.palette.secondary.main,
                                                    },
                                                }}
                                            >
                                                Retirer de la wishlist
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Typography variant="h6" color="textSecondary" sx={{ mt: 4 }}>
                            Vous n'avez encore ajouté aucun jeu à votre wishlist.
                        </Typography>
                    )}

                    <Snackbar
                        open={snackbarOpen}
                        autoHideDuration={3000}
                        onClose={handleCloseSnackbar}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    >
                        <Alert onClose={handleCloseSnackbar} severity="success">
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>
                </Container>
            </div>
        </ThemeProvider>
    );
}
