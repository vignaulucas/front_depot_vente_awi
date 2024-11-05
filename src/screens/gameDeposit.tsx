import React, { useState, useEffect, SyntheticEvent } from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, Autocomplete, IconButton, AutocompleteChangeReason, Snackbar } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Close';
import MuiAlert, { AlertProps } from '@mui/material/Alert';


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

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface UserType {
    idUser: number
    lastName: string;
    firstName: string;
    email: string;
    telephone: string;
    postalCode: string;
    ville: string;
    adresse: string;
}

interface SessionType {
    id: number
    startDate: string;
    endDate: string;
    depositFee: string;
    depositFeeType: string;
    commissionRate: string;
}

interface GameType {
    name: string;
    publisher: string;
    price: string;
    quantity: string;
    totalCost: number;
}

const GameDeposit: React.FC = () => {
    const [gameDetails, setGameDetails] = useState<Partial<GameType>>({
        name: '',
        publisher: '',
        price: '',
        quantity: '1',
        totalCost: 0,
    });

    const [temporarySeller, setTemporarySeller] = useState({
        lastName: '',
        firstName: '',
        email: '',
        telephone: '',
        postalCode: '',
        ville: '',
        adresse: '',
    });

    const [existingUsers, setExistingUsers] = useState<UserType[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [depositFee, setDepositFee] = useState<number | ''>('');
    const [commissionRate, setCommissionRate] = useState<number | ''>('');
    const [openDepositDialog, setOpenDepositDialog] = useState(false);
    const [games, setGames] = useState<GameType[]>([]);
    const [totalDepositFee, setTotalDepositFee] = useState<number>(0);
    const [sessionActive, setSessionActive] = useState(false);
    const [activeSession, setActiveSession] = useState<SessionType | null>(null);
    const [openSellerDialog, setOpenSellerDialog] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [gameToRemoveIndex, setGameToRemoveIndex] = useState<number | null>(null);
    const openSellerFormDialog = () => setOpenSellerDialog(true);
    const closeSellerFormDialog = () => setOpenSellerDialog(false);
    const [openFinalizeDialog, setOpenFinalizeDialog] = useState(false);
    const [isNameError, setIsNameError] = useState(false);
    const [isPublisherError, setIsPublisherError] = useState(false);
    const [isPriceError, setIsPriceError] = useState(false);
    const [isQuantityError, setIsQuantityError] = useState(false);
    const [isFirstNameError, setIsFirstNameError] = useState(false);
    const [isLastNameError, setIsLastNameError] = useState(false);
    const [isEmailError, setIsEmailError] = useState(false);
    const [isTelephoneError, setIsTelephoneError] = useState(false);
    const [showPromotionDialog, setShowPromotionDialog] = useState(false);
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed');
    const [discountAmount, setDiscountAmount] = useState<number | ''>('');
    const [finalDiscount, setFinalDiscount] = useState<number>(0);
    const [openSnackbarGame, setOpenSnackbarGame] = useState(false);
    const [openSnackbarFinalizeDeposit, setOpenSnackbarFinalizeDeposit] = useState(false);


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,3}$/;
    const telephoneRegex = /^\d{10}$/;


    const apiUrl = process.env.REACT_APP_API_URL;

    // Charger les utilisateurs existants pour auto-complétion
    useEffect(() => {
        fetch(`${apiUrl}/user/users`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then((response) => response.json())
            .then((data) => setExistingUsers(data))
            .catch((error) => console.error('Erreur lors de la récupération des utilisateurs', error));
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


    const calculateGameCost = () => {
        if (!sessionActive || !activeSession) return;

        const quantity = parseInt(gameDetails.quantity || '1', 10);
        const pricePerGame = parseFloat(gameDetails.price || '0');
        const totalGamePrice = pricePerGame * quantity;

        const depositFee = activeSession.depositFeeType === 'percentage'
            ? (totalGamePrice * parseFloat(activeSession.depositFee)) / 100
            : parseFloat(activeSession.depositFee) * quantity;

        setGameDetails((prevDetails) => ({
            ...prevDetails,
            totalCost: parseFloat(depositFee.toFixed(2)),
        }));
    };

    const calculateTotalCost = () => {
        let totalGameCost = games.reduce((sum, game) => sum + game.totalCost, 0);

        // Calcul de la réduction basée sur le type
        let discountValue = 0;
        if (discountAmount) {
            discountValue = discountType === 'percentage'
                ? (totalGameCost * (discountAmount / 100))
                : discountAmount;
            discountValue = Math.min(discountValue, totalGameCost); // Évite de dépasser le total
        }

        setFinalDiscount(discountValue);
        setTotalDepositFee(totalGameCost - discountValue); // Met à jour le total avec réduction
    };


    const validateSellerDetails = () => {
        const firstNameError = !temporarySeller.firstName;
        const lastNameError = !temporarySeller.lastName;
        const emailError = !temporarySeller.email || !emailRegex.test(temporarySeller.email);
        const telephoneError = !temporarySeller.telephone || !telephoneRegex.test(temporarySeller.telephone);

        setIsFirstNameError(firstNameError);
        setIsLastNameError(lastNameError);
        setIsEmailError(emailError);
        setIsTelephoneError(telephoneError);

        return !firstNameError && !lastNameError && !emailError && !telephoneError;
    };

    const validateGameDetails = () => {
        const nameError = !gameDetails.name;
        const publisherError = !gameDetails.publisher;
        const priceError = !gameDetails.price || isNaN(parseFloat(gameDetails.price)) || parseFloat(gameDetails.price) <= 0;
        const quantityError = !gameDetails.quantity || isNaN(parseInt(gameDetails.quantity)) || parseInt(gameDetails.quantity) <= 0;

        setIsNameError(nameError);
        setIsPublisherError(publisherError);
        setIsPriceError(priceError);
        setIsQuantityError(quantityError);

        return !nameError && !publisherError && !priceError && !quantityError;
    };


    // Ajouter un jeu dans la liste des jeux à déposer
    const addGameToDeposit = () => {
        if (!activeSession) {
            console.error("Aucune session active, impossible de calculer les frais de dépôt.");
            return;
        }

        if (!validateGameDetails()) {
            console.log("Champs requis manquants ou incorrects.");
            return;
        }

        const quantity = parseInt(gameDetails.quantity || '1', 10);

        const fee = activeSession.depositFeeType === 'percentage'
            ? (parseFloat(activeSession.depositFee) * quantity) / 100
            : parseFloat(activeSession.depositFee) * quantity;

        const newGame = { ...gameDetails, totalCost: fee, quantity: quantity.toString() } as GameType;

        setGames([...games, newGame]);
        setTotalDepositFee(totalDepositFee + fee);
        setGameDetails({ name: '', publisher: '', price: '', quantity: '1', totalCost: 0 });
        setOpenSnackbarGame(true);
    };

    // Fonction pour supprimer un jeu après confirmation
    const handleRemoveGame = (index: number) => {
        setGameToRemoveIndex(index);
        setOpenConfirmDialog(true);
    };

    const confirmRemoveGame = () => {
        if (gameToRemoveIndex !== null) {
            const updatedGames = [...games];
            const removedGame = updatedGames.splice(gameToRemoveIndex, 1)[0];
            setGames(updatedGames);
            setTotalDepositFee(totalDepositFee - removedGame.totalCost);
        }
        setOpenConfirmDialog(false);
        setGameToRemoveIndex(null);
    };

    // Fonction pour créer le vendeur temporaire dans la base de données
    const createTemporarySeller = async () => {
        try {
            const response = await fetch(`${apiUrl}/temporarySeller/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(temporarySeller),
            });

            if (response.status === 200 || response.status === 201) {
                const sellerData = await response.json();
                return sellerData.temporarySeller.id;
            } else {
                throw new Error("Erreur lors de la création du vendeur temporaire.");
            }
        } catch (error) {
            console.error(error);
            alert("Impossible de créer le vendeur temporaire.");
            return null;
        }
    };



    const handleFinalizeDeposit = async () => {
        if (!sessionActive) {
            alert("Aucune session active. Impossible de déposer un jeu.");
            return;
        }
        let sellerId = selectedUser?.idUser || null;

        if (!sellerId && temporarySeller.lastName && temporarySeller.firstName && temporarySeller.email) {
            const tempSellerId = await createTemporarySeller();
            if (!tempSellerId) {
                return;
            }
            sellerId = tempSellerId;
        }

        if (!sellerId) {
            alert("Veuillez saisir les informations du vendeur.");
            return;
        }

        if (!activeSession) {
            console.error("Aucune session active trouvée");
            return;
        }

        for (const game of games) {
            const quantity = parseInt(game.quantity, 10) || 1;

            for (let i = 0; i < quantity; i++) {
                const response = await fetch(`${apiUrl}/depot/games`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        name: game.name,
                        publisher: game.publisher,
                        price: game.price,
                        uniqueIdentifier: `JEU-${Date.now()}-${i + 1}`,
                        status: 'depot',
                        sellerId: !selectedUser ? sellerId : null,
                        userId: selectedUser ? sellerId : null,
                        saleSessionId: activeSession.id,
                    })
                });

                if (!response.ok) {
                    console.error("Erreur lors du dépôt de l'exemplaire de", game.name);
                }
            }
        }

        setGames([]);
        setTotalDepositFee(0);
        setSelectedUser(null);
        setTemporarySeller({ lastName: '', firstName: '', email: '', telephone: '', postalCode: '', ville: '', adresse: '' });
        setDiscountAmount('');
        setFinalDiscount(0);
        setOpenSnackbarFinalizeDeposit(true);
    };

    const handleGameDetailsChange = (field: keyof GameType, value: string) => {
        setGameDetails((prevDetails) => ({
            ...prevDetails,
            [field]: value,
        }));
        if (field === 'price' || field === 'quantity') {
            calculateGameCost();
        }
    };

    const handleUserSelection = (
        event: SyntheticEvent,
        value: UserType | null,
        reason: AutocompleteChangeReason
    ) => {
        setSelectedUser(value);

        if (value) {
            // If an existing user is selected, clear the temporary seller fields
            setTemporarySeller({
                lastName: '',
                firstName: '',
                email: '',
                telephone: '',
                postalCode: '',
                ville: '',
                adresse: ''
            });
        }
    };

    const confirmSeller = () => {
        // Si un utilisateur existant est sélectionné, on ferme la boîte de dialogue sans valider
        if (selectedUser) {
            setOpenSellerDialog(false);
            return;
        }

        // Sinon, effectue la validation pour le vendeur temporaire
        const isValid = validateSellerDetails();

        if (!isValid) {
            console.log("Champs requis manquants ou incorrects.");
            return;
        }

        // Si tout est valide, on ferme la boîte de dialogue
        setOpenSellerDialog(false);
    };


    const handleOpenFinalizeDialog = () => setOpenFinalizeDialog(true);

    // Fonction pour fermer la fenêtre de confirmation du dépôt
    const handleCloseFinalizeDialog = () => setOpenFinalizeDialog(false);

    // Fonction pour confirmer le dépôt après validation
    const confirmFinalizeDeposit = async () => {
        await handleFinalizeDeposit();
        setOpenFinalizeDialog(false);
    };

    // Fonction pour fermer le Snackbar
    const handleCloseSnackbarGame = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbarGame(false);
    };

    const handleCloseSnackbarFinalizeDeposit = () => setOpenSnackbarFinalizeDeposit(false);




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
                overflow: 'auto', // Permet le défilement si le contenu dépasse la page
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
                    maxHeight: '90vh' // Limite la hauteur pour permettre le défilement à l'intérieur du conteneur
                }}>
                    <Typography variant="h4" style={{ marginBottom: '20px', fontWeight: 'bold' }}>
                        Déposer des jeux
                    </Typography>

                    {/* Bouton pour sélectionner ou ajouter un vendeur */}
                    {!selectedUser && !temporarySeller.lastName && (
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => setOpenSellerDialog(true)}
                            style={{ marginBottom: '15px' }}
                        >
                            Sélectionner ou Ajouter un Vendeur
                        </Button>
                    )}

                    {/* Dialog pour sélectionner un vendeur ou entrer un vendeur temporaire */}
                    <Dialog
                        open={openSellerDialog}
                        onClose={() => setOpenSellerDialog(false)}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle>Informations du Vendeur</DialogTitle>
                        <DialogContent>
                            <Autocomplete
                                options={existingUsers}
                                getOptionLabel={(option) => `${option.lastName} ${option.firstName} - ${option.email} - ${option.telephone || ''}`}
                                onChange={handleUserSelection}
                                renderInput={(params) => <TextField {...params} label="Rechercher un utilisateur ayant un compte" />}
                                style={{ marginBottom: '15px', marginTop: "10px", width: '100%' }}
                            />

                            {!selectedUser && (
                                <>
                                    <TextField
                                        label="Nom"
                                        fullWidth
                                        value={temporarySeller.lastName}
                                        onChange={(e) => setTemporarySeller({ ...temporarySeller, lastName: e.target.value })}
                                        error={isLastNameError}
                                        helperText={isLastNameError ? "Nom requis" : ""}
                                        style={{ marginBottom: '15px' }}
                                    />
                                    <TextField
                                        label="Prénom"
                                        fullWidth
                                        value={temporarySeller.firstName}
                                        onChange={(e) => setTemporarySeller({ ...temporarySeller, firstName: e.target.value })}
                                        error={isFirstNameError}
                                        helperText={isFirstNameError ? "Prénom requis" : ""}
                                        style={{ marginBottom: '15px' }}
                                    />
                                    <TextField
                                        label="Email"
                                        type="email"
                                        fullWidth
                                        value={temporarySeller.email}
                                        onChange={(e) => setTemporarySeller({ ...temporarySeller, email: e.target.value })}
                                        error={isEmailError}
                                        helperText={isEmailError ? "Email non renseignée ou invalide" : ""}
                                        style={{ marginBottom: '15px' }}
                                    />
                                    <TextField
                                        label="Téléphone"
                                        type="tel"
                                        fullWidth
                                        value={temporarySeller.telephone}
                                        onChange={(e) => setTemporarySeller({ ...temporarySeller, telephone: e.target.value })}
                                        error={isTelephoneError}
                                        helperText={isTelephoneError ? "Téléphone non renseignée ou invalide" : ""}
                                        style={{ marginBottom: '15px' }}
                                    />
                                    <TextField
                                        label="Code postal"
                                        fullWidth
                                        value={temporarySeller.postalCode || ''}
                                        onChange={(e) => setTemporarySeller({ ...temporarySeller, postalCode: e.target.value })}
                                        style={{ marginBottom: '15px' }}
                                    />
                                    <TextField
                                        label="Ville"
                                        fullWidth
                                        value={temporarySeller.ville || ''}
                                        onChange={(e) => setTemporarySeller({ ...temporarySeller, ville: e.target.value })}
                                        style={{ marginBottom: '15px' }}
                                    />
                                    <TextField
                                        label="Adresse"
                                        fullWidth
                                        value={temporarySeller.adresse || ''}
                                        onChange={(e) => setTemporarySeller({ ...temporarySeller, adresse: e.target.value })}
                                        style={{ marginBottom: '15px' }}
                                    />
                                </>
                            )}

                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenSellerDialog(false)} color="primary">Annuler</Button>
                            <Button onClick={confirmSeller} color="primary">Valider</Button>
                        </DialogActions>
                    </Dialog>

                    {/* Affichage des informations du vendeur */}
                    {(selectedUser || temporarySeller.lastName) && (
                        <Box style={{ marginBottom: '15px' }}>
                            <Typography variant="h6" style={{ fontWeight: 'bold' }}>Informations du Vendeur</Typography>
                            {selectedUser ? (
                                <>
                                    <Typography variant="body2">Nom : {selectedUser.lastName} {selectedUser.firstName}</Typography>
                                    <Typography variant="body2">Email : {selectedUser.email}</Typography>
                                    {selectedUser.telephone && <Typography variant="body2">Téléphone : {selectedUser.telephone}</Typography>}
                                    {selectedUser.postalCode && <Typography variant="body2">Code Postal : {selectedUser.postalCode}</Typography>}
                                    {selectedUser.ville && <Typography variant="body2">Ville : {selectedUser.ville}</Typography>}
                                    {selectedUser.adresse && <Typography variant="body2">Adresse : {selectedUser.adresse}</Typography>}
                                </>
                            ) : (
                                <>
                                    <Typography variant="body2">Nom : {temporarySeller.lastName}</Typography>
                                    <Typography variant="body2">Prénom : {temporarySeller.firstName}</Typography>
                                    {temporarySeller.email && <Typography variant="body2">Email : {temporarySeller.email}</Typography>}
                                    {temporarySeller.telephone && <Typography variant="body2">Téléphone : {temporarySeller.telephone}</Typography>}
                                    {temporarySeller.postalCode && <Typography variant="body2">Code Postal : {temporarySeller.postalCode}</Typography>}
                                    {temporarySeller.ville && <Typography variant="body2">Ville : {temporarySeller.ville}</Typography>}
                                    {temporarySeller.adresse && <Typography variant="body2">Adresse : {temporarySeller.adresse}</Typography>}
                                </>
                            )}
                            <Button
                                onClick={() => {
                                    setOpenSellerDialog(true);
                                    setSelectedUser(null);
                                }}
                                style={{
                                    color: '#1e3a8a',
                                    textTransform: 'none',
                                    fontSize: '0.875rem',
                                    padding: '4px 8px',
                                    marginTop: '10px',
                                    border: '1px solid #1e3a8a',
                                    backgroundColor: 'transparent',
                                }}
                            >
                                Modifier
                            </Button>
                        </Box>
                    )}

                    {/* Bouton pour ajouter un jeu */}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpenDepositDialog(true)}
                        style={{ marginBottom: '20px' }}
                    >
                        Ajouter un jeu au dépôt
                    </Button>

                    {/* Dialog pour le dépôt d'un nouveau jeu */}
                    <Dialog open={openDepositDialog} onClose={() => setOpenDepositDialog(false)}>
                        <DialogTitle>Ajouter un jeu au dépôt</DialogTitle>
                        <DialogContent>
                            <TextField
                                label="Nom du jeu"
                                fullWidth
                                value={gameDetails.name}
                                onChange={(e) => setGameDetails({ ...gameDetails, name: e.target.value })}
                                error={isNameError}
                                helperText={isNameError ? "Nom du jeu requis" : ""}
                                style={{ marginBottom: '15px', marginTop: '10px' }}
                            />
                            <TextField
                                label="Éditeur"
                                fullWidth
                                value={gameDetails.publisher}
                                onChange={(e) => setGameDetails({ ...gameDetails, publisher: e.target.value })}
                                error={isPublisherError}
                                helperText={isPublisherError ? "Éditeur requis" : ""}
                                style={{ marginBottom: '15px' }}
                            />
                            <TextField
                                label="Prix (€)"
                                type="number"
                                fullWidth
                                value={gameDetails.price}
                                onChange={(e) => {
                                    setGameDetails({ ...gameDetails, price: e.target.value });
                                    calculateGameCost();
                                }}
                                error={isPriceError}
                                helperText={isPriceError ? "Prix requis et doit être un nombre positif" : ""}
                                style={{ marginBottom: '15px' }}
                            />
                            <TextField
                                label="Quantité"
                                type="number"
                                fullWidth
                                value={gameDetails.quantity}
                                onChange={(e) => handleGameDetailsChange('quantity', e.target.value)}
                                error={isQuantityError}
                                helperText={isQuantityError ? "Quantité requise et doit être un nombre positif" : ""}
                                style={{ marginBottom: '15px' }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={addGameToDeposit}
                                style={{ marginTop: '15px' }}
                            >
                                Ajouter au dépôt
                            </Button>
                            {/* Snackbar pour confirmer l'ajout */}
                            <Snackbar
                                open={openSnackbarGame}
                                autoHideDuration={3000}
                                onClose={handleCloseSnackbarGame}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                            >
                                <Alert onClose={handleCloseSnackbarGame} severity="success">
                                    Jeu ajouté avec succès au dépôt !
                                </Alert>
                            </Snackbar>
                        </DialogContent>
                    </Dialog>

                    {/* Récapitulatif du dépôt */}
                    <Box style={{ marginTop: '20px' }}>
                        <Typography variant="h6" style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                            Récapitulatif du dépôt
                        </Typography>
                        {games.map((game, index) => (
                            <Box key={index} display="flex" alignItems="center" justifyContent="space-between">
                                <Typography variant="body2">
                                    {game.quantity}x {game.name} - Prix unitaire : {parseFloat(game.price).toFixed(2)} € - Total : {game.totalCost.toFixed(2)} €
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => handleRemoveGame(index)}
                                    style={{ marginLeft: '10px' }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                        {/* Ligne de promotion si une promotion est appliquée */}
                        {finalDiscount > 0 && (
                            <Box display="flex" justifyContent="space-between" style={{ marginTop: '10px' }}>
                                <Typography variant="body2" color="textSecondary">
                                    Promotion appliquée : - {finalDiscount.toFixed(2)} €
                                </Typography>

                            </Box>
                        )}
                        <Typography
                            style={{ color: '#1e3a8a', cursor: 'pointer', fontSize: '0.875rem', marginTop: '10px' }}
                            onClick={() => setShowPromotionDialog(true)}
                        >
                            Promotion ?
                        </Typography>
                        <Dialog open={showPromotionDialog} onClose={() => setShowPromotionDialog(false)}>
                            <DialogTitle>Ajouter une promotion</DialogTitle>
                            <DialogContent>
                                <TextField
                                    label="Montant de la promotion"
                                    type="number"
                                    fullWidth
                                    value={discountAmount}
                                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                                    style={{ marginBottom: '15px', marginTop: '10px' }}
                                />
                                <Box display="flex" alignItems="center">
                                    <Button
                                        variant={discountType === 'percentage' ? 'contained' : 'outlined'}
                                        color="primary"
                                        onClick={() => setDiscountType('percentage')}
                                        style={{ marginRight: '10px' }}
                                    >
                                        %
                                    </Button>
                                    <Button
                                        variant={discountType === 'fixed' ? 'contained' : 'outlined'}
                                        color="primary"
                                        onClick={() => setDiscountType('fixed')}
                                    >
                                        €
                                    </Button>
                                </Box>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setShowPromotionDialog(false)} color="primary">Annuler</Button>
                                <Button onClick={() => {
                                    calculateTotalCost();
                                    setShowPromotionDialog(false);
                                }} color="primary">
                                    Appliquer
                                </Button>
                            </DialogActions>
                        </Dialog>

                        <Typography variant="h6" style={{ fontWeight: 'bold', marginTop: '10px' }}>
                            Frais de dépôt total : {totalDepositFee.toFixed(2)} €
                        </Typography>
                    </Box>

                    {/* Dialog pour confirmation de suppression */}
                    <Dialog
                        open={openConfirmDialog}
                        onClose={() => setOpenConfirmDialog(false)}
                    >
                        <DialogTitle>Confirmation</DialogTitle>
                        <DialogContent>
                            <Typography>Êtes-vous sûr de vouloir supprimer ce jeu du dépôt ?</Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
                                Annuler
                            </Button>
                            <Button onClick={confirmRemoveGame} color="secondary">
                                Supprimer
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenFinalizeDialog}
                        disabled={!sessionActive}
                        style={{ marginTop: '20px' }}
                    >
                        Finaliser le dépôt
                    </Button>
                    {/* Fenêtre de confirmation pour finaliser le dépôt */}
                    <Dialog
                        open={openFinalizeDialog}
                        onClose={handleCloseFinalizeDialog}
                    >
                        <DialogTitle>Confirmation du dépôt</DialogTitle>
                        <DialogContent>
                            <Typography>
                                Êtes-vous sûr de vouloir finaliser le dépôt ? Cette action est définitive.
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseFinalizeDialog} color="primary">
                                Annuler
                            </Button>
                            <Button onClick={confirmFinalizeDeposit} color="secondary">
                                Confirmer
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Snackbar
                        open={openSnackbarFinalizeDeposit}
                        autoHideDuration={3000}
                        onClose={handleCloseSnackbarFinalizeDeposit}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    >
                        <Alert onClose={handleCloseSnackbarFinalizeDeposit} severity="success">
                            Dépôt finalisé avec succès !
                        </Alert>
                    </Snackbar>

                </div>
            </div>
        </ThemeProvider>
    );

};

export default GameDeposit;
