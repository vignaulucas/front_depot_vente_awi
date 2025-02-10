import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Typography, TextField, Snackbar, Autocomplete } from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import Navbar from '../component/navbar';

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
    name?: string; // si disponible
    // Vous pouvez ajouter d'autres champs (par ex. startDate, endDate, etc.)
}

interface FinancialSummary {
    saleSessionId: number;
    totalTreasury: number;
    totalCommission: number;
    totalDepositFees: number;
    totalDueToSellers: number;
    // Ajoutez d'autres informations utiles si besoin
}

const GlobalFinancialSummary: React.FC = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [sessions, setSessions] = useState<SessionType[]>([]);
    const [selectedSession, setSelectedSession] = useState<SessionType | null>(null);
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [totalDepositFees, setTotalDepositFees] = useState<number>(0);
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

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


    useEffect(() => {
        if (selectedSession) {
            fetch(`${apiUrl}/transactions/summary/${selectedSession.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Résumé financier non trouvé");
                    }
                    return response.json();
                })
                .then(data => {
                    setSummary(data);
                })
                .catch(error => {
                    console.error("Erreur lors de la récupération du bilan financier", error);
                    setSummary(null);
                    setSnackbarSeverity("error");
                    setSnackbarMessage("Aucun bilan financier trouvé pour cette session.");
                    setSnackbarOpen(true);
                });
        } else {
            setSummary(null);
        }
    }, [selectedSession, apiUrl]);

    useEffect(() => {
        if (selectedSession) {
            fetch(`${apiUrl}/depot/totalDepositFees/${selectedSession.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Erreur lors de la récupération des frais de dépôt");
                    }
                    return response.json();
                })
                .then(data => {
                    // On s'attend à recevoir un objet contenant la propriété totalDepositFees
                    setTotalDepositFees(Number(data.totalDepositFees) || 0);
                })
                .catch(error => {
                    console.error("Erreur lors de la récupération des frais de dépôt", error);
                    setTotalDepositFees(0);
                    setSnackbarSeverity("error");
                    setSnackbarMessage("Erreur lors de la récupération des frais de dépôt.");
                    setSnackbarOpen(true);
                });
        } else {
            setTotalDepositFees(0);
        }
    }, [selectedSession, apiUrl]);

    const treasuryWithDeposit = summary 
        ? Number(summary.totalTreasury || 0) + totalDepositFees 
        : 0;

    const handleCloseSnackbar = () => setSnackbarOpen(false);

    

    return (
        <ThemeProvider theme={theme}>
            <Navbar />
            <div style={{
                backgroundImage: 'url("/BlueWall (1).jpeg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '100vh',
                paddingTop: '80px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start'
            }}>
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
                        Bilan Financier Global
                    </Typography>

                    {/* Sélection de session */}
                    <Autocomplete
                        options={sessions}
                        getOptionLabel={(option) => option.name ? option.name : `Session ${option.id}`}
                        onChange={(event, value) => setSelectedSession(value)}
                        renderInput={(params) => <TextField {...params} label="Sélectionnez une session" />}
                        sx={{ marginBottom: '20px' }}
                    />

                    {selectedSession ? (
                        <>
                            <Typography variant="subtitle1" align="center" gutterBottom>
                                Session sélectionnée : {selectedSession.name ? selectedSession.name : `Session ${selectedSession.id}`}
                            </Typography>
                            {summary ? (
                                <Box>
                                    <Typography variant="body1">
                                        <strong>Trésorerie totale :</strong> {Number(treasuryWithDeposit || 0).toFixed(2)} €
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Frais de dépôt encaissés :</strong> {Number(totalDepositFees || 0).toFixed(2)} €
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Commissions prélevées :</strong> {Number(summary.totalCommission || 0).toFixed(2)} €
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Sommes dues aux vendeurs :</strong> {Number(summary.totalDueToSellers || 0).toFixed(2)} €
                                    </Typography>
                                </Box>
                            ) : (
                                <Typography variant="body2" align="center" color="error">
                                    Aucun résumé financier trouvé pour cette session.
                                </Typography>
                            )}

                        </>
                    ) : (
                        <Typography variant="body2" align="center">
                            Veuillez sélectionner une session.
                        </Typography>
                    )}

                </Box>
            </div>
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

export default GlobalFinancialSummary;
