import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Grid, Card, CardContent, Typography,
    CardActions, Button, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, Snackbar, TextField, InputAdornment,
    createTheme, ThemeProvider, Box, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import Navbar from '../component/navbar';


interface Game {
    id: number;
    name: string;
    publisher: string;
    price: number;
    uniqueIdentifier: string;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Home() {
    const [games, setGames] = useState<Game[]>([]);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [searchByName, setSearchByName] = useState('');
    const [searchByPublisher, setSearchByPublisher] = useState('');
    const [searchByPrice, setSearchByPrice] = useState('');
    const [wishlist, setWishlist] = useState<number[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [wishlistDialogOpen, setWishlistDialogOpen] = useState(false);
    const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
    const apiUrl = process.env.REACT_APP_API_URL || '';
    const token = localStorage.getItem('token');
    const decodedToken = token ? parseJwt(token) : null;
    const userId = decodedToken ? decodedToken.id : null;
    const navigate = useNavigate();

    function parseJwt(token: string) {
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
            console.error("Error decoding JWT:", error);
            return null;
        }
    }



    useEffect(() => {
        const fetchActiveSessionAndGames = async () => {
            try {
                const sessionResponse = await fetch(`${apiUrl}/saleSession/activeSession`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const sessionData = await sessionResponse.json();

                if (!sessionResponse.ok || !sessionData || !sessionData.session || !sessionData.session.id) {
                    setIsSessionActive(false);
                    console.error('Erreur : Session active introuvable');
                    return;
                }

                const activeSessionId = sessionData.session.id;
                setIsSessionActive(true);

                const gamesResponse = await fetch(`${apiUrl}/depot/forSaleGames/${activeSessionId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const gamesData = await gamesResponse.json();
                setGames(gamesData);

            } catch (error) {
                setIsSessionActive(false);
                console.error('Erreur lors de la récupération des jeux en vente:', error);
            }
        };

        fetchActiveSessionAndGames();
    }, [apiUrl]);

    const handleViewDetails = (gameId: number) => {
        navigate(`/game/details/${gameId}`);
    };

    const handleToggleWishlist = (gameId: number) => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
            return;
        }
        setSelectedGameId(gameId);
        setWishlistDialogOpen(true);
    };

    const confirmAddToWishlist = () => {

        if (selectedGameId !== null && userId) {
            fetch(`${apiUrl}/wishlist/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ gameId: selectedGameId, userId: userId }),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erreur lors de l\'ajout à la wishlist');
                    }
                    return response.json();
                })
                .then(() => {
                    setWishlist([...wishlist, selectedGameId]);
                    setSnackbarOpen(true);
                })
                .catch(error => console.error(error));
        }
        setWishlistDialogOpen(false);
    };


    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const handleCloseDialog = () => {
        setWishlistDialogOpen(false);
        setSelectedGameId(null);
    };

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

    const filteredGames = Array.isArray(games) ? games.filter((game) =>
    (searchByName === '' || game.name.toLowerCase().includes(searchByName.toLowerCase())) &&
    (searchByPublisher === '' || game.publisher.toLowerCase().includes(searchByPublisher.toLowerCase())) &&
    (searchByPrice === '' || game.price.toString().includes(searchByPrice))
) : [];


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
                <Container maxWidth="lg" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '10px', padding: '40px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
                    <Typography variant="h4" component="h1" gutterBottom textAlign="center" fontWeight="bold">
                        Catalogue des jeux en vente
                    </Typography>



                    {/* Barre de recherche */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, mb: 5 }}>
                        <TextField
                            variant="outlined"
                            label="Nom du jeu"
                            value={searchByName}
                            onChange={(e) => setSearchByName(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                width: { xs: '100%', sm: '30%' },
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#1A2E4C',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#1A2E4C',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#1A2E4C',
                                    },
                                },
                            }}
                        />
                        <TextField
                            variant="outlined"
                            label="Éditeur"
                            value={searchByPublisher}
                            onChange={(e) => setSearchByPublisher(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                width: { xs: '100%', sm: '30%' },
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#1A2E4C',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#1A2E4C',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#1A2E4C',
                                    },
                                },
                            }}
                        />
                        <TextField
                            variant="outlined"
                            label="Prix"
                            value={searchByPrice}
                            onChange={(e) => setSearchByPrice(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                width: { xs: '100%', sm: '30%' },
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#1A2E4C',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#1A2E4C',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#1A2E4C',
                                    },
                                },
                            }}
                        />
                        {/* Wishlist Icon Button */}
                        <IconButton
                            color="secondary"
                            onClick={() => navigate('/wishlist')}
                            aria-label="wishlist"
                            sx={{
                                color: theme.palette.secondary.main,
                                '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                },
                            }}
                        >
                            <FavoriteIcon />
                            <Typography variant="body1" sx={{ marginLeft: '8px', fontWeight: 'bold' }}>
                                Wishlist
                            </Typography>
                        </IconButton>
                    </Box>
                    {isSessionActive ? (
                        <Grid container spacing={4} justifyContent="center">
                            {filteredGames.map((game) => (
                                <Grid item xs={12} sm={6} md={4} key={game.id}>
                                    <Card sx={{ minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                                        <IconButton
                                            onClick={() => handleToggleWishlist(game.id)}
                                            sx={{
                                                position: 'absolute',
                                                top: 10,
                                                right: 10,
                                                color: wishlist.includes(game.id) ? 'red' : 'gray',
                                            }}
                                        >
                                            {wishlist.includes(game.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                        </IconButton>
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
                                                onClick={() => handleViewDetails(game.id)}
                                                sx={{
                                                    borderColor: theme.palette.secondary.main,
                                                    color: theme.palette.secondary.main,
                                                    '&:hover': {
                                                        backgroundColor: '#e0f0ff',
                                                        borderColor: theme.palette.secondary.main,
                                                    },
                                                }}
                                            >
                                                Voir les détails
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Alert severity="info" sx={{ mt: 4, textAlign: 'center', fontSize: '1.2rem' }}>
                            Il n'y a actuellement aucune session active. Revenez plus tard pour voir les jeux disponibles.
                        </Alert>
                    )}

                    {/* Snackbar */}
                    <Snackbar
                        open={snackbarOpen}
                        autoHideDuration={3000}
                        onClose={handleCloseSnackbar}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    >
                        <Alert onClose={handleCloseSnackbar} severity="success">
                            Jeu ajouté à votre wishlist !
                        </Alert>
                    </Snackbar>

                    {/* Dialog de confirmation wishlist */}
                    <Dialog open={wishlistDialogOpen} onClose={handleCloseDialog}>
                        <DialogTitle>Ajouter à la wishlist</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Voulez-vous ajouter ce jeu à votre wishlist ?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDialog} sx={{ color: 'red' }}>
                                Annuler
                            </Button>
                            <Button onClick={confirmAddToWishlist} sx={{ color: '#1A2E4C' }}>
                                Oui, ajouter
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Container>
            </div>
        </ThemeProvider>
    );
}
