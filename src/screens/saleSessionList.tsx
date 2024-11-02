import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Typography, TextField, Box, MenuItem, Snackbar, Alert } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';

interface SaleSessionType {
    id: number;
    startDate: string;
    endDate: string;
    depositFee: number;
    depositFeeType: 'fixed' | 'percentage';
    commissionRate: number;
}

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

const SaleSessionList: React.FC = () => {
    const [sessions, setSessions] = useState<SaleSessionType[]>([]);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openCloseDialog, setOpenCloseDialog] = useState(false);
    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
    const [newSession, setNewSession] = useState({
        startDate: new Date().toISOString().split("T")[0],
        endDate: '',
        depositFee: '',
        depositFeeType: 'fixed',
        commissionRate: '',
    });
    const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
    const apiUrl = process.env.REACT_APP_API_URL;

    // Charger les sessions de vente
    useEffect(() => {
        fetch(`${apiUrl}/saleSession/sessions`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des sessions');
                }
                return response.json();
            })
            .then((data: SaleSessionType[]) => {
                if (Array.isArray(data)) {
                    setSessions(data);
                } else {
                    console.error('Données inattendues pour les sessions', data);
                }
            })
            .catch((error) => {
                console.error(error.message);
                // Ici, vous pouvez également définir un message d'erreur pour l'afficher dans l'interface
                setSessions([]);
            });
    }, []);

    // Créer une nouvelle session
    const handleCreateSession = async () => {

        const formattedStartDate = new Date(newSession.startDate).toISOString();
        const formattedEndDate = new Date(newSession.endDate).toISOString();

        const response = await fetch(`${apiUrl}/saleSession`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                depositFee: newSession.depositFee,
                depositFeeType: newSession.depositFeeType,
                commissionRate: newSession.commissionRate,
            })
        });

        if (response.ok) {
            const createdSession = await response.json();
            console.log(createdSession)
            const formattedCreatedSession = {
                ...createdSession,
                startDate: new Date(createdSession.session.startDate).toISOString().split("T")[0],
                endDate: new Date(createdSession.session.endDate).toISOString().split("T")[0],
                depositFee: createdSession.session.depositFee,
                commissionRate: createdSession.session.commissionRate,
            };
            setSessions([formattedCreatedSession, ...sessions]);
            setOpenCreateDialog(false);
            setNewSession({
                startDate: new Date().toISOString().split("T")[0],
                endDate: '',
                depositFee: '',
                depositFeeType: 'fixed',
                commissionRate: '',
            });
        } else {
            console.error('Erreur lors de la création de la session');
            setErrorSnackbarOpen(true);
        }
    };

    const handleDeleteUpcomingSession = async (id: number) => {
        const response = await fetch(`${apiUrl}/saleSession/upcoming/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (response.ok) {
            setSessions(sessions.filter((session) => session.id !== id));
        } else {
            console.error('Erreur lors de la suppression de la session prévue');
        }
    };

    // Clôturer une session active
    const handleCloseSession = (id: number) => {
        setActiveSessionId(id);
        setOpenCloseDialog(true);
    };

    const handleCloseSnackbar = () => {
        setErrorSnackbarOpen(false);
    };

    const confirmCloseSession = () => {
        if (activeSessionId === null) return;
        fetch(`${apiUrl}/saleSession/${activeSessionId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then(() => {
                setSessions(sessions.map((session) => {
                    if (session.id === activeSessionId) {
                        return { ...session, endDate: new Date().toISOString() };
                    }
                    return session;
                }));
                setOpenCloseDialog(false);
            })
            .catch((error) => console.error('Erreur lors de la fermeture de la session', error));
    };

    // Trier les sessions (récentes en haut)
    const sortedSessions = [...sessions].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

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
                    maxWidth: '1200px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: '20px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    overflowY: 'auto',
                    boxSizing: 'border-box',
                    height: 'calc(100vh - 60px)',
                }}>
                    <Typography variant="h4" style={{ marginBottom: '20px', fontWeight: 'bold' }}>
                        Sessions de Dépôt-Vente
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenCreateDialog(true)}
                        style={{ marginBottom: '20px' }}
                    >
                        Créer Session
                    </Button>

                    {sessions.length === 0 ? (
                        <Typography variant="body1" color="textSecondary" align="center" style={{ marginTop: '20px' }}>
                            Aucune session de dépôt-vente n'a été créée pour le moment.
                        </Typography>
                    ) : (
                        sortedSessions.map((session) => {
                            const isActive = new Date() >= new Date(session.startDate) && new Date() <= new Date(session.endDate);
                            const isUpcoming = new Date() < new Date(session.startDate);

                            return (
                                <Box key={session.id} sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: 'white',
                                    padding: '15px',
                                    marginBottom: '10px',
                                    borderRadius: '10px',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                    position: 'relative',
                                    width: '100%',
                                }}>
                                    <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                                        Session de Vente du {new Date(session.startDate).toLocaleDateString()} au {new Date(session.endDate).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body2">
                                        Frais de dépôt: {session.depositFee} {session.depositFeeType === 'percentage' ? '%' : '€'}
                                    </Typography>
                                    <Typography variant="body2">
                                        Commission: {session.commissionRate}%
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                                        {isActive ? (
                                            <>
                                                <CheckIcon sx={{ color: 'green', marginRight: '5px' }} />
                                                <Typography variant="body2" sx={{ color: 'green' }}>Actif</Typography>

                                                <Button
                                                    variant="outlined"
                                                    color="secondary"
                                                    onClick={() => handleCloseSession(session.id)}
                                                    style={{ marginLeft: 'auto', textTransform: 'none' }}
                                                >
                                                    Clôturer
                                                </Button>
                                            </>
                                        ) : isUpcoming ? (
                                            <>
                                                <InfoIcon color="info" sx={{ marginRight: '5px' }} />
                                                <Typography variant="body2" color="info">À venir</Typography>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => {
                                                        console.log("Session ID:", session.id); // Vérifiez l'ID ici
                                                        handleDeleteUpcomingSession(session.id);
                                                    }} style={{ marginLeft: 'auto', textTransform: 'none' }}
                                                >
                                                    Supprimer
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <CloseIcon color="secondary" sx={{ marginRight: '5px' }} />
                                                <Typography variant="body2" color="error">Expirée</Typography>
                                            </>
                                        )}
                                    </Box>
                                </Box>
                            );
                        })
                    )}


                    {/* Dialog pour créer une nouvelle session */}
                    <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
                        <DialogTitle>Créer une nouvelle session de vente</DialogTitle>
                        <DialogContent>
                            <TextField
                                label="Date de début"
                                type="date"
                                value={newSession.startDate}
                                fullWidth
                                onChange={(e) => setNewSession({ ...newSession, startDate: e.target.value })}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    min: new Date().toISOString().split("T")[0], // Date actuelle
                                }}
                                style={{ marginBottom: '15px', marginTop: '10px' }}
                            />
                            <TextField
                                label="Date de fin"
                                type="date"
                                value={newSession.endDate}
                                fullWidth
                                onChange={(e) => setNewSession({ ...newSession, endDate: e.target.value })}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    min: newSession.startDate, // Date de début sélectionnée
                                }}
                                style={{ marginBottom: '15px' }}
                            />
                            <TextField
                                label="Frais de dépôt"
                                type="number"
                                fullWidth
                                value={newSession.depositFee}
                                onChange={(e) => setNewSession({ ...newSession, depositFee: e.target.value })}
                                style={{ marginBottom: '15px' }}
                            />
                            <TextField
                                label="Type de frais"
                                select
                                fullWidth
                                value={newSession.depositFeeType}
                                onChange={(e) => setNewSession({ ...newSession, depositFeeType: e.target.value })}
                                style={{ marginBottom: '15px' }}
                            >
                                <MenuItem value="fixed">Fixe</MenuItem>
                                <MenuItem value="percentage">Pourcentage</MenuItem>
                            </TextField>
                            <TextField
                                label="Commission (%)"
                                type="number"
                                fullWidth
                                value={newSession.commissionRate}
                                onChange={(e) => setNewSession({ ...newSession, commissionRate: e.target.value })}
                                style={{ marginBottom: '15px' }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenCreateDialog(false)} color="secondary">Annuler</Button>
                            <Button onClick={handleCreateSession} color="primary">Créer</Button>
                        </DialogActions>
                    </Dialog>
                    <Snackbar
                        open={errorSnackbarOpen}
                        autoHideDuration={6000}
                        onClose={handleCloseSnackbar}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    >
                        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                            Impossible de créer la session : dates conflictuelles avec une session existante.
                        </Alert>
                    </Snackbar>
                    {/* Dialog pour confirmer la clôture d'une session */}
                    <Dialog open={openCloseDialog} onClose={() => setOpenCloseDialog(false)}>
                        <DialogTitle>Clôturer la session</DialogTitle>
                        <DialogContent>
                            <DialogContentText>Êtes-vous sûr de vouloir clôturer cette session ?</DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenCloseDialog(false)} color="secondary">Annuler</Button>
                            <Button onClick={confirmCloseSession} color="primary">Clôturer</Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>
        </ThemeProvider>
    );

};

export default SaleSessionList;
