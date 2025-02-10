import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Typography, TextField, Snackbar, Autocomplete } from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import Navbar from '../component/navbar';
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, Tab } from "@mui/material";

const theme = createTheme({
    palette: {
        primary: { main: '#1e3a8a' },
        secondary: { main: '#e53935' },
    },
});

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface SessionType {
    id: number;
    name?: string;
}

interface UserType {
    idUser: number;
    firstName: string;
    lastName: string;
    email: string;
}

interface SellerFinancialSummary {
    totalEarnings: number;
    totalDueToSeller: number;
    depositedGames: number;
    soldGames: number;
}

interface GameType {
    id: number;
    name: string;
    publisher: string;
    price: number;
    uniqueIdentifier: string;
    status: string;
}


const ParticularFinancialSummary: React.FC = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [sessions, setSessions] = useState<SessionType[]>([]);
    const [selectedSession, setSelectedSession] = useState<SessionType | null>(null);
    const [sellers, setSellers] = useState<UserType[]>([]);
    const [selectedSeller, setSelectedSeller] = useState<UserType | null>(null);
    const [summary, setSummary] = useState<SellerFinancialSummary | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
    const [depositedGames, setDepositedGames] = useState<GameType[]>([]);
    const [retireGames, setRetireGames] = useState<GameType[]>([]);
    const [soldGames, setSoldGames] = useState<GameType[]>([]);
    const navigate = useNavigate();
    const location = useLocation();
    const [tabIndex, setTabIndex] = useState(location.pathname === "/bilanParticulierUser" ? 0 : 1);



    // Récupération des sessions
    useEffect(() => {
        fetch(`${apiUrl}/saleSession/sessions`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then(response => response.json())
            .then(data => {
                setSessions(data);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des sessions", error);
                setSnackbarSeverity("error");
                setSnackbarMessage("Erreur lors de la récupération des sessions.");
                setSnackbarOpen(true);
            });
    }, [apiUrl]);

    // Récupération des vendeurs (utilisateurs ayant déposé des jeux)
    useEffect(() => {
        fetch(`${apiUrl}/user/sellers`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then(response => response.json())
            .then(data => {
                setSellers(data);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des vendeurs", error);
                setSnackbarSeverity("error");
                setSnackbarMessage("Erreur lors de la récupération des vendeurs.");
                setSnackbarOpen(true);
            });
    }, [apiUrl]);

    // Récupération du bilan particulier d'un vendeur pour une session
    useEffect(() => {
        if (selectedSession && selectedSeller) {
            fetch(`${apiUrl}/transactions/summary/${selectedSession.id}/${selectedSeller.idUser}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Bilan particulier non trouvé");
                    }
                    return response.json();
                })
                .then(data => {
                    setSummary(data);
                })
                .catch(error => {
                    console.error("Erreur lors de la récupération du bilan particulier", error);
                    setSummary(null);
                    setSnackbarSeverity("error");
                    setSnackbarMessage("Aucun bilan trouvé pour ce vendeur sur cette session.");
                    setSnackbarOpen(true);
                });
        } else {
            setSummary(null);
        }
    }, [selectedSession, selectedSeller, apiUrl]);

    useEffect(() => {
        if (selectedSession && selectedSeller) {
            fetch(`${apiUrl}/depot/sellGames/${selectedSession.id}/${selectedSeller.idUser}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Erreur lors de la récupération des jeux déposés.");
                    }
                    return response.json();
                })
                .then((data: GameType[]) => {
                    const sold: GameType[] = data.filter((game: GameType) => game.status === "vendu");
                    const notSold: GameType[] = data.filter((game: GameType) => game.status !== "vendu");
                    const retire: GameType[] = data.filter((game: GameType) => game.status !== "retiré");
                    
                    setSoldGames(sold);
                    setDepositedGames(notSold);
                    setRetireGames(retire);
                })
                .catch(error => {
                    console.error("Erreur lors de la récupération des jeux du vendeur :", error);
                    setDepositedGames([]);
                    setSoldGames([]);
                    setRetireGames([]);
                });
        } else {
            setDepositedGames([]);
            setSoldGames([]);
            setRetireGames([]);
        }
    }, [selectedSession, selectedSeller, apiUrl]);
    
    

    const handleCloseSnackbar = () => setSnackbarOpen(false);

    return (
        <ThemeProvider theme={theme}>
            <Navbar />
    
            {/* Conteneur principal */}
            <div style={{
                backgroundImage: 'url("/BlueWall (1).jpeg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '100vh',
                paddingTop: '80px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px' 
            }}>
                
                <div style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '10px 0',
                    backgroundColor: 'transparent'
                }}>
                    <div style={{
                        display: 'flex',
                        gap: '30px',
                        padding: '10px 20px',
                        borderBottom: '2px solid #e0e0e0'
                    }}>
                        <button
                            onClick={() => navigate('/bilanParticulier')}
                            style={{
                                backgroundColor: location.pathname === '/bilanParticulier' ? 'red' : 'transparent',
                                color: 'white',
                                fontWeight: 'bold',
                                border: 'none',
                                padding: '10px 15px',
                                cursor: 'pointer',
                                borderRadius: '5px',
                                transition: 'background 0.3s, color 0.3s',
                                textTransform: 'none'
                            }}
                        >
                            Bilan Particulier Utilisateurs
                        </button>
                        <button
                            onClick={() => navigate('/bilanParticulierNonUser')}
                            style={{
                                backgroundColor: location.pathname === '/bilanParticulierNonUser' ? 'red' : 'transparent',
                                color: 'white',
                                fontWeight: 'bold',
                                border: 'none',
                                padding: '10px 15px',
                                cursor: 'pointer',
                                borderRadius: '5px',
                                transition: 'background 0.3s, color 0.3s',
                                textTransform: 'none'
                            }}
                        >
                            Bilan Utilisateurs (sans compte)
                        </button>
                    </div>
                </div>
    
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: '600px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        boxSizing: 'border-box',
                        overflowY: 'auto',
                        maxHeight: '90vh'
                    }}
                >
                    <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
                        Bilan Financier Particulier
                    </Typography>
    
                    {/* Sélection de session */}
                    <Autocomplete
                        options={sessions}
                        getOptionLabel={(option) => option.name ? option.name : `Session ${option.id}`}
                        onChange={(event, value) => setSelectedSession(value)}
                        renderInput={(params) => <TextField {...params} label="Sélectionnez une session" />}
                        sx={{ marginBottom: '20px' }}
                    />
    
                    {/* Sélection de vendeur */}
                    <Autocomplete
                        options={sellers}
                        getOptionLabel={(option) => `${option.lastName} ${option.firstName} - ${option.email}`}
                        onChange={(event, value) => setSelectedSeller(value)}
                        renderInput={(params) => <TextField {...params} label="Sélectionnez un vendeur" />}
                        sx={{ marginBottom: '20px' }}
                    />
    
                    {selectedSession && selectedSeller ? (
                        <>
                            <Typography variant="subtitle1" align="center" gutterBottom>
                                Vendeur sélectionné : {selectedSeller.firstName} {selectedSeller.lastName}
                            </Typography>
                            {summary ? (
                                <Box>
                                    <Typography variant="body1">
                                        <strong>Gains totaux :</strong> {Number(summary.totalDueToSeller || 0).toFixed(2)} €
                                    </Typography>
    
                                    <Typography variant="h6" mt={2} fontWeight="bold">
                                        Jeux déposés (non vendus)
                                    </Typography>
                                    {depositedGames.length > 0 ? (
                                        depositedGames.map((game, index) => (
                                            <Box key={index} display="flex" flexDirection="column" mt={1}>
                                                <Typography variant="body2"><strong>Nom :</strong> {game.name}</Typography>
                                                <Typography variant="body2"><strong>Éditeur :</strong> {game.publisher}</Typography>
                                                <Typography variant="body2"><strong>Prix :</strong> {Number(game.price).toFixed(2)} €</Typography>
                                                <Typography variant="body2"><strong>Référence :</strong> {game.uniqueIdentifier}</Typography>
                                                <Typography variant="body2"><strong>Statut :</strong> {game.status}</Typography>
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="textSecondary">Aucun jeu en dépôt.</Typography>
                                    )}
    
                                    <Typography variant="h6" mt={4} fontWeight="bold">
                                        Jeux vendus
                                    </Typography>
                                    {soldGames.length > 0 ? (
                                        soldGames.map((game, index) => (
                                            <Box key={index} display="flex" flexDirection="column" mt={1}>
                                                <Typography variant="body2"><strong>Nom :</strong> {game.name}</Typography>
                                                <Typography variant="body2"><strong>Éditeur :</strong> {game.publisher}</Typography>
                                                <Typography variant="body2"><strong>Prix vendu :</strong> {Number(game.price).toFixed(2)} €</Typography>
                                                <Typography variant="body2"><strong>Référence :</strong> {game.uniqueIdentifier}</Typography>
                                                <Typography variant="body2"><strong>Statut :</strong> {game.status}</Typography>
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="textSecondary">Aucun jeu vendu.</Typography>
                                    )}
                                    <Typography variant="h6" mt={4} fontWeight="bold">
                                        Jeux retirés
                                    </Typography>
                                    {soldGames.length > 0 ? (
                                        retireGames.map((game, index) => (
                                            <Box key={index} display="flex" flexDirection="column" mt={1}>
                                                <Typography variant="body2"><strong>Nom :</strong> {game.name}</Typography>
                                                <Typography variant="body2"><strong>Éditeur :</strong> {game.publisher}</Typography>
                                                <Typography variant="body2"><strong>Prix vendu :</strong> {Number(game.price).toFixed(2)} €</Typography>
                                                <Typography variant="body2"><strong>Référence :</strong> {game.uniqueIdentifier}</Typography>
                                                <Typography variant="body2"><strong>Statut :</strong> {game.status}</Typography>
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="textSecondary">Aucun jeu à retiré.</Typography>
                                    )}
                                </Box>
                            ) : (
                                <Typography variant="body2" align="center" color="error">
                                    Aucun bilan trouvé pour ce vendeur sur cette session.
                                </Typography>
                            )}
                        </>
                    ) : (
                        <Typography variant="body2" align="center">
                            Veuillez sélectionner une session et un vendeur.
                        </Typography>
                    )}
                </Box>
            </div>
    
            {/* Snackbar pour messages d'erreur */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
    
    
};

export default ParticularFinancialSummary;
