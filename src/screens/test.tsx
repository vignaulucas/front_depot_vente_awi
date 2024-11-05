import React, { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, Autocomplete } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Alert } from '@mui/material';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1e3a8a',
        },
        secondary: {
            main: '#e53935',
        },
    },
});

interface UserType {
    lastName: string;
    firstName: string;
    email: string;
}

interface SessionType {
    startDate: string;
    endDate: string;
    depositFee: string;
    depositFeeType: string;
    commissionRate: string;
}

const GameDeposit: React.FC = () => {
    const [gameDetails, setGameDetails] = useState({
        name: '',
        publisher: '',
        price: '',
    });
    const [temporarySeller, setTemporarySeller] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });
    const [existingUsers, setExistingUsers] = useState<UserType[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [depositFee, setDepositFee] = useState<number | ''>('');
    const [commissionRate, setCommissionRate] = useState<number | ''>('');
    const [openDepositDialog, setOpenDepositDialog] = useState(false);
    const [commission, setCommission] = useState<number>(0);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [sessionActive, setSessionActive] = useState(false);
    const [activeSession, setActiveSession] = useState<SessionType | null>(null);
    const apiUrl = process.env.REACT_APP_API_URL;

    // Charger les utilisateurs existants pour auto-complétion
    useEffect(() => {
        fetch(`${apiUrl}/user/users`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then((response) => response.json())
            .then((data) => setExistingUsers(data))
            .catch((error) => console.error('Erreur lors de la récupération des utilisateurs', error));
        console.log(existingUsers)
    }, []);

    // Vérifie s'il y a une session active et récupère les frais de commission
    useEffect(() => {
        fetch(`${apiUrl}/saleSession/activeSession`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Aucune session active");
                }
                return response.json();
            })
            .then((data) => {
                if (data.status === "active") {
                    setSessionActive(true);
                    setCommissionRate(data.session.commissionRate);
                    setActiveSession(data.session);
                } else {
                    setSessionActive(false);
                }
            })
            .catch((error) => {
                console.error('Erreur lors de la récupération de la session active', error);
                setSessionActive(false);
            });
    }, []);


    // Calcul des frais de dépôt (simulation pour l'instant)
    const calculateDepositFee = () => {
        const fee = parseFloat(gameDetails.price) * 0.1; // exemple : 10% du prix
        setDepositFee(parseFloat(fee.toFixed(2)));
    };

    // Créer un dépôt de jeu
    const handleDeposit = async () => {
        if (!sessionActive) {
            alert("Aucune session active. Impossible de déposer un jeu.");
            return;
        }

        const response = await fetch(`${apiUrl}/depot/games`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                gameDetails,
                temporarySeller: selectedUser || temporarySeller,
                depositFee,
                commissionRate,
            })
        });

        if (response.ok) {
            console.log("Dépôt réussi");
            setOpenDepositDialog(false);
            setGameDetails({ name: '', publisher: '', price: '' });
            setTemporarySeller({ name: '', email: '', phone: '', address: '' });
            setDepositFee('');
        } else {
            console.error("Erreur lors du dépôt du jeu");
        }
    };

    const calculateCosts = () => {
        const price = parseFloat(gameDetails.price);
        let fee = 0;
        if (activeSession) {
            fee = activeSession.depositFeeType === 'percentage'
                ? (price * parseFloat(activeSession.depositFee)) / 100
                : parseFloat(activeSession.depositFee);
        }
        const commissionAmount = price * (parseFloat(activeSession?.commissionRate || '0') / 100);
        const total = price + fee + commissionAmount;

        setDepositFee(fee);
        setCommission(commissionAmount);
        setTotalPrice(total);
    };

    return (
        <ThemeProvider theme={theme}>
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
                    maxWidth: '600px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: '20px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    boxSizing: 'border-box',
                    overflowY: 'auto',
                }}>
                    <Typography variant="h4" style={{ marginBottom: '20px', fontWeight: 'bold' }}>
                        Déposer un nouveau jeu
                    </Typography>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpenDepositDialog(true)}
                        style={{ marginBottom: '20px' }}
                    >
                        Déposer un jeu
                    </Button>

                    {sessionActive && activeSession ? (
                        <Box style={{ marginBottom: '20px' }}>
                            <Typography variant="h6" style={{ fontWeight: 'bold' }}>Session Active</Typography>
                            <Typography variant="body1">Dates : {new Date(activeSession.startDate).toLocaleDateString()} - {new Date(activeSession.endDate).toLocaleDateString()}</Typography>
                            <Typography variant="body1">Frais de dépôt : {activeSession.depositFee} {activeSession.depositFeeType === 'percentage' ? '%' : '€'}</Typography>
                            <Typography variant="body1">Commission : {activeSession.commissionRate}%</Typography>
                        </Box>
                    ) : (
                        <Alert severity="error" style={{ marginBottom: '15px' }}>
                            Aucune session active. Le dépôt de jeu est impossible.
                        </Alert>
                    )}

                    {/* Dialog pour le dépôt d'un nouveau jeu */}
                    <Dialog open={openDepositDialog} onClose={() => setOpenDepositDialog(false)}>
                        <DialogTitle>Dépôt de Jeu</DialogTitle>
                        <DialogContent>
                            <Typography variant="h6" style={{ fontWeight: 'bold', marginBottom: '15px' }}>
                                Informations du jeu
                            </Typography>
                            <TextField
                                label="Nom du jeu"
                                fullWidth
                                value={gameDetails.name}
                                onChange={(e) => setGameDetails({ ...gameDetails, name: e.target.value })}
                                style={{ marginBottom: '15px' }}
                            />
                            <TextField
                                label="Éditeur"
                                fullWidth
                                value={gameDetails.publisher}
                                onChange={(e) => setGameDetails({ ...gameDetails, publisher: e.target.value })}
                                style={{ marginBottom: '15px' }}
                            />
                            <TextField
                                label="Prix (€)"
                                type="number"
                                fullWidth
                                value={gameDetails.price}
                                onChange={(e) => {
                                    setGameDetails({ ...gameDetails, price: e.target.value });
                                    calculateCosts();  // Recalculer les coûts au changement de prix
                                }}
                                style={{ marginBottom: '15px' }}
                            />

                            <Typography variant="h6" style={{ fontWeight: 'bold', marginTop: '20px', marginBottom: '15px' }}>
                                Sélectionner un client existant
                            </Typography>
                            <Autocomplete
                                options={existingUsers}
                                getOptionLabel={(option) => `${option.lastName} ${option.firstName} - ${option.email}`}
                                onChange={(event, value) => setSelectedUser(value)}
                                renderInput={(params) => <TextField {...params} label="Rechercher un utilisateur" />}
                                style={{ marginBottom: '15px' }}
                            />

                            <Typography variant="h6" style={{ fontWeight: 'bold', marginTop: '20px', marginBottom: '15px' }}>
                                Informations du vendeur temporaire
                            </Typography>
                            <TextField
                                label="Nom"
                                fullWidth
                                value={temporarySeller.name}
                                onChange={(e) => setTemporarySeller({ ...temporarySeller, name: e.target.value })}
                                style={{ marginBottom: '15px' }}
                            />
                            <TextField
                                label="Email"
                                type="email"
                                fullWidth
                                value={temporarySeller.email}
                                onChange={(e) => setTemporarySeller({ ...temporarySeller, email: e.target.value })}
                                style={{ marginBottom: '15px' }}
                            />
                            <TextField
                                label="Téléphone"
                                type="tel"
                                fullWidth
                                value={temporarySeller.phone}
                                onChange={(e) => setTemporarySeller({ ...temporarySeller, phone: e.target.value })}
                                style={{ marginBottom: '15px' }}
                            />
                            <TextField
                                label="Adresse"
                                fullWidth
                                value={temporarySeller.address}
                                onChange={(e) => setTemporarySeller({ ...temporarySeller, address: e.target.value })}
                                style={{ marginBottom: '15px' }}
                            />

                            {/* Récapitulatif de la "facture" */}
                            <Typography variant="h6" style={{ fontWeight: 'bold', marginTop: '20px' }}>
                                Récapitulatif
                            </Typography>
                            <Typography variant="body2">
                                Prix du jeu : {parseFloat(gameDetails.price || '0').toFixed(2)} €
                            </Typography>
                            <Typography variant="body2">
                                Frais de dépôt : {typeof depositFee === 'number' ? depositFee.toFixed(2) : "0.00"} €
                            </Typography>
                            <Typography variant="body2">
                                Commission : {typeof commission === 'number' ? commission.toFixed(2) : "0.00"} €
                            </Typography>
                            <Typography variant="h6" style={{ fontWeight: 'bold', marginTop: '10px' }}>
                                Total : {typeof totalPrice === 'number' ? totalPrice.toFixed(2) : "0.00"} €
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDepositDialog(false)} color="secondary">Annuler</Button>
                            <Button onClick={handleDeposit} color="primary" disabled={!sessionActive}>Confirmer le dépôt</Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default GameDeposit;
