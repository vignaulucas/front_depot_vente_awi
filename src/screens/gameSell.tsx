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

export default function SellGameList() {
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

                const gamesResponse = await fetch(`${apiUrl}/depot/saleGames/${activeSessionId}`, {
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
                    <h1 className="filters-container font-bold mb-5">Liste des jeux vendus</h1>
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
                                <th>Nom du jeu</th>
                                <th>Éditeur</th>
                                <th>Prix</th>
                                <th>Référence</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGames.map((game) => (
                                <tr key={game.id}>
                                    <td>{game.name}</td>
                                    <td>{game.publisher}</td>
                                    <td>{game.price} €</td>
                                    <td>{game.uniqueIdentifier}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            </div>
        </ThemeProvider>
    );
}
