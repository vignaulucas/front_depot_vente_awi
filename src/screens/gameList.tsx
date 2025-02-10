import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, createTheme, ThemeProvider } from '@mui/material';
import Navbar from '../component/navbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';


interface Game {
    id: number;
    name: string;
    publisher: string;
    price: number;
    uniqueIdentifier: string;
    status: string;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function GameList() {
    const [games, setGames] = useState<Game[]>([]);
    const [searchByName, setSearchByName] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [gameIdToSell, setGameIdToSell] = useState<number | null>(null);
    const apiUrl = process.env.REACT_APP_API_URL || '';
    const navigate = useNavigate();

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
                    console.error('Erreur : Session active introuvable');
                    return;
                }

                const activeSessionId = sessionData.session.id;

                const gamesResponse = await fetch(`${apiUrl}/depot/depositGames/${activeSessionId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const gamesData = await gamesResponse.json();

                setGames(gamesData);
            } catch (error) {
                console.error('Erreur lors de la récupération de la session active et des jeux en dépôt:', error);
            }
        };

        fetchActiveSessionAndGames();
    }, [apiUrl]);

    const handleSellGame = (gameId: number) => {
        setOpenDialog(false);
        fetch(`${apiUrl}/depot/sellGame`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ gameId }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors de la mise en vente du jeu');
                }
                return response.json();
            })
            .then(() => {
                setGames(games.filter((game) => game.id !== gameId));

                setSnackbarOpen(true);
            })
            .catch(error => console.error(error));
    };


    const handleCloseSnackbar = () => setSnackbarOpen(false);

    const theme = createTheme({
        palette: {
            primary: {
                main: '#0f7d21',
            },
            secondary: {
                main: '#918f8d',
            },
        },
    });

    const filteredGames = Array.isArray(games) ? games.filter((game) =>
    (searchByName === '' || game.name.toLowerCase().includes(searchByName.toLowerCase()))
) : [];

    const handlePrintLabel = (game: Game) => {
        const newWindow = window.open('', '_blank');
        newWindow?.document.write(`
            <html>
                <head>
                    <style>
                        body {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            font-family: Arial, sans-serif;
                            padding: 20px;
                        }
                        .label-container {
                            border: 1px solid black;
                            padding: 20px;
                            text-align: center;
                            font-size: 16px;
                        }
                        .label-container h2 {
                            margin: 0;
                            font-size: 24px;
                        }
                        .label-container p {
                            margin: 5px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="label-container">
                        <h2>Étiquette de Jeu</h2>
                        <p><strong>Référence :</strong> ${game.uniqueIdentifier}</p>
                        <p><strong>Prix :</strong> ${game.price} €</p>
                    </div>
                    <script>
                        window.print();
                        setTimeout(() => window.close(), 0);
                    </script>
                </body>
            </html>
        `);
    };


    return (
        <ThemeProvider theme={theme}>
            <Navbar />

            <div style={{
                backgroundImage: 'url("/BlueWall (1).jpeg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '1200px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: '20px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    overflowY: 'auto',
                    boxSizing: 'border-box',
                    height: 'calc(100vh - 60px)',
                }}>
                    <h1 className="filters-container font-bold mb-5">Liste des jeux en dépôt</h1>
                    <div className="filters-container">
                        <input
                            type="text"
                            value={searchByName}
                            onChange={(e) => setSearchByName(e.target.value)}
                            placeholder="Rechercher un jeu"
                        />
                    </div>

                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>Mettre en vente</th>
                                <th>Étiquette</th>
                                <th>Nom du jeu</th>
                                <th>Éditeur</th>
                                <th>Prix</th>
                                <th>Référence</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGames.map((game) => (
                                <tr key={game.id}>
                                    <td>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => {
                                                setGameIdToSell(game.id);
                                                setOpenDialog(true);
                                            }}
                                            sx={{
                                                backgroundColor: '#2e7d32',
                                                color: '#ffffff',
                                                '&:hover': {
                                                    backgroundColor: '#66bb6a',
                                                },
                                            }}
                                        >
                                            Vendre
                                        </Button>
                                    </td>
                                    <td>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => handlePrintLabel(game)}
                                            sx={{
                                                borderColor: '#004080',
                                                color: '#004080',
                                                '&:hover': {
                                                    backgroundColor: '#cce6ff',
                                                    borderColor: '#004080',
                                                },
                                            }}
                                        >
                                            Imprimer étiquette
                                        </Button>
                                    </td>
                                    <td>{game.name}</td>
                                    <td>{game.publisher}</td>
                                    <td>{game.price} €</td>
                                    <td>{game.uniqueIdentifier}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                        <DialogTitle>Confirmer la mise en vente</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Êtes-vous sûr de vouloir mettre ce jeu en vente ?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => setOpenDialog(false)}
                                sx={{ color: '#B22222' }}  
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={() => gameIdToSell && handleSellGame(gameIdToSell)}
                                sx={{ color: '#1A2E4C' }}  
                            >
                                Confirmer
                            </Button>
                        </DialogActions>
                    </Dialog>


                    <Snackbar
                        open={snackbarOpen}
                        autoHideDuration={3000}
                        onClose={handleCloseSnackbar}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    >
                        <Alert onClose={handleCloseSnackbar} severity="success">
                            Jeu mis en vente avec succès !
                        </Alert>
                    </Snackbar>
                </div>
            </div>
        </ThemeProvider>
    );
}
