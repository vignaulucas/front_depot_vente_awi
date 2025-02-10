import React, { useState, useEffect, SyntheticEvent } from 'react';
import {
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    Autocomplete,
    Snackbar,
    IconButton,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import DeleteIcon from '@mui/icons-material/Close';
import Navbar from '../component/navbar';

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

interface GameType {
    id: number;
    name: string;
    publisher: string;
    price: number;
    uniqueIdentifier: string;
    userId: number,
    sellerId: number,
    quantity: number;
    totalCost: number;
}

interface BuyerType {
    idUser?: number;
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    postalCode?: string;
    ville?: string;
    adresse?: string;
}

interface SaleSessionType {
    id: number;
    commissionRate: number;
    // d'autres champs éventuels
}

const GamePurchase: React.FC = () => {
    // États pour les jeux disponibles et le panier
    const [availableGames, setAvailableGames] = useState<GameType[]>([]);
    const [cart, setCart] = useState<GameType[]>([]);

    // États pour la gestion de l'acheteur
    const [existingBuyers, setExistingBuyers] = useState<BuyerType[]>([]);
    const [selectedBuyer, setSelectedBuyer] = useState<BuyerType | null>(null);
    const [buyerDetails, setBuyerDetails] = useState<BuyerType>({
        firstName: '',
        lastName: '',
        email: '',
        telephone: '',
        postalCode: '',
        ville: '',
        adresse: '',
    });
    const [generateInvoice, setGenerateInvoice] = useState<boolean>(false);

    // États pour la session active
    const [sessionActive, setSessionActive] = useState<boolean>(false);
    const [activeSession, setActiveSession] = useState<SaleSessionType | null>(null);

    // États des Dialogs
    const [openAddGameDialog, setOpenAddGameDialog] = useState<boolean>(false);
    const [openBuyerDialog, setOpenBuyerDialog] = useState<boolean>(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
    const [showPromotionDialog, setShowPromotionDialog] = useState<boolean>(false);

    // États pour la promotion
    const [discountAmount, setDiscountAmount] = useState<number | ''>('');
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed');
    const [finalDiscount, setFinalDiscount] = useState<number>(0);
    const [finalTotal, setFinalTotal] = useState<number>(0);

    // Snackbar
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const apiUrl = process.env.REACT_APP_API_URL;

    // Ajoutez ces lignes près du début du composant
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,3}$/;
    const telephoneRegex = /^\d{10}$/;

    const validateBuyerDetails = (): boolean => {
        if (!buyerDetails.firstName.trim()) {
            setSnackbarSeverity("error");
            setSnackbarMessage("Le prénom est requis.");
            setSnackbarOpen(true);
            return false;
        }
        if (!buyerDetails.lastName.trim()) {
            setSnackbarSeverity("error");
            setSnackbarMessage("Le nom est requis.");
            setSnackbarOpen(true);
            return false;
        }
        if ((!buyerDetails.email) || (buyerDetails.email && !emailRegex.test(buyerDetails.email))) {
            setSnackbarSeverity("error");
            setSnackbarMessage("L'email n'est pas valide.");
            setSnackbarOpen(true);
            return false;
        }
        if (!buyerDetails.telephone.trim()) {
            setSnackbarSeverity("error");
            setSnackbarMessage("Le téléphone est requis.");
            setSnackbarOpen(true);
            return false;
        } else if (!telephoneRegex.test(buyerDetails.telephone)) {
            setSnackbarSeverity("error");
            setSnackbarMessage("Le téléphone doit être composé de 10 chiffres.");
            setSnackbarOpen(true);
            return false;
        }
        return true;
    };


    // --- Récupération de la session active ---
    useEffect(() => {
        fetch(`${apiUrl}/saleSession/activeSession`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'active') {
                    setSessionActive(true);
                    setActiveSession(data.session);
                } else {
                    setSessionActive(false);
                }
            })
            .catch(error => {
                console.error("Erreur lors de la récupération de la session active", error);
                setSessionActive(false);
            });
    }, [apiUrl]);

    // --- Récupération des jeux en vente pour la session active ---
    useEffect(() => {
        if (activeSession) {
            fetch(`${apiUrl}/depot/forSaleGames/${activeSession.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
                .then(response => response.json())
                .then(data => setAvailableGames(data))
                .catch(error => console.error("Erreur lors de la récupération des jeux en vente:", error));
        }
    }, [activeSession, apiUrl]);

    // --- Récupération des acheteurs existants ---
    useEffect(() => {
        fetch(`${apiUrl}/user/users`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then(response => response.json())
            .then(data => setExistingBuyers(data))
            .catch(error => console.error("Erreur lors de la récupération des utilisateurs", error));
    }, [apiUrl]);

    const createTemporaryBuyer = async (): Promise<number | null> => {
        try {
            const response = await fetch(`${apiUrl}/temporaryBuyer/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(buyerDetails),
            });
            if (response.ok) {
                const data = await response.json();
                // Adaptez la propriété retournée en fonction de la structure de votre réponse
                return data.temporaryBuyer.id;
            } else {
                throw new Error("Erreur lors de la création du buyer temporaire.");
            }
        } catch (error) {
            console.error(error);
            setSnackbarSeverity("error");
            setSnackbarMessage("Impossible de créer le buyer temporaire.");
            setSnackbarOpen(true);
            return null;
        }
    };


    // --- Fonction d'ajout d'un jeu au panier ---
    const handleAddToCart = (game: GameType) => {
        if (!activeSession) return;
        const price = Number(game.price);
        const commissionRate = activeSession.commissionRate;
        const totalCost = price + price * (commissionRate / 100);
        const gameToAdd = { ...game, quantity: 1, totalCost };
        setCart(prev => [...prev, gameToAdd]);
        setAvailableGames(prev => prev.filter(g => g.uniqueIdentifier !== game.uniqueIdentifier));
        setSnackbarSeverity("success");
        setSnackbarMessage(`Jeu "${game.name}" ajouté au panier.`);
        setSnackbarOpen(true);
    };


    const handleRemoveFromCart = (index: number) => {
        const removedGame = cart[index];
        const updatedCart = [...cart];
        updatedCart.splice(index, 1);
        setCart(updatedCart);
        setAvailableGames(prev => [...prev, removedGame]);
    };


    // --- Calcul du coût total avec promotion ---
    const calculateTotalCost = () => {
        const cost = cart.reduce((sum, game) => sum + game.totalCost, 0);
        let discountValue = 0;
        if (discountAmount !== '') {
            if (discountType === 'percentage') {
                discountValue = cost * (Number(discountAmount) / 100);
            } else {
                discountValue = Number(discountAmount);
            }
            discountValue = Math.min(discountValue, cost); // éviter de dépasser le total
        }
        setFinalDiscount(discountValue);
        setFinalTotal(cost - discountValue);
    };

    useEffect(() => {
        calculateTotalCost();
    }, [cart, discountAmount, discountType]);

    const handleFinalizePurchase = async () => {
        if (!sessionActive || !activeSession) {
            setSnackbarSeverity("error");
            setSnackbarMessage("Aucune session active. Impossible de finaliser l'achat.");
            setSnackbarOpen(true);
            return;
        }

        let buyerId = selectedBuyer ? selectedBuyer.idUser : null;
        if (!buyerId && buyerDetails.firstName.trim() !== "" && buyerDetails.lastName.trim() !== "" && buyerDetails.email.trim() !== "") {
            const tempBuyerId = await createTemporaryBuyer();
            if (!tempBuyerId) return;
            buyerId = tempBuyerId;
        }

        // Conserver une copie des jeux achetés pour la facture
        const purchasedGames = [...cart];

        // Pour chaque jeu du panier, enregistrer la transaction puis mettre à jour l'état du jeu en "vendu"
        for (const game of cart) {
            try {
                const transactionResponse = await fetch(`${apiUrl}/transactions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({
                        gameId: game.id,
                        saleSessionId: activeSession.id,
                        totalAmount: game.totalCost,
                        commissionAmount: Number(game.price) * (activeSession.commissionRate / 100),
                        sellerEarnings: game.totalCost - Number(game.price) * (activeSession.commissionRate / 100),
                        sellerId: game.sellerId ? game.sellerId : game.userId,
                        userId: selectedBuyer ? selectedBuyer.idUser : null,
                        buyerId: selectedBuyer ? null : buyerId,
                        buyerDetails: selectedBuyer ? null : buyerDetails,
                        generateInvoice: generateInvoice,
                    }),
                    
                });
                if (!transactionResponse.ok) {
                    throw new Error(`Erreur lors de l'enregistrement de la transaction pour le jeu "${game.name}"`);
                }

                // Appel à la nouvelle route pour finaliser l'achat et marquer le jeu comme vendu
                const purchaseResponse = await fetch(`${apiUrl}/depot/purchaseGame/${game.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ gameId: game.id }),
                });
                if (!purchaseResponse.ok) {
                    throw new Error(`Erreur lors de la finalisation de l'achat pour le jeu "${game.name}"`);
                }
            } catch (error) {
                console.error(error);
                setSnackbarSeverity("error");
                setSnackbarMessage(`Erreur lors de l'enregistrement de la transaction pour le jeu "${game.name}"`);
                setSnackbarOpen(true);
                return;
            }
        }

        setCart([]);
        setBuyerDetails({
            firstName: '',
            lastName: '',
            email: '',
            telephone: '',
            postalCode: '',
            ville: '',
            adresse: ''
        });
        setSelectedBuyer(null);
        setOpenConfirmDialog(false);
        setSnackbarSeverity("success");
        setSnackbarMessage("Achat finalisé avec succès.");
        setSnackbarOpen(true);

        if (generateInvoice && purchasedGames.length > 0) {
            handleGenerateInvoice(purchasedGames);
        }
    };


    const handleCloseSnackbar = () => setSnackbarOpen(false);

    const handleBuyerSelection = (event: SyntheticEvent, value: BuyerType | null) => {
        setSelectedBuyer(value);
        console.log(value)
        if (value) {
            setBuyerDetails({ firstName: '', lastName: '', email: '', telephone: '', postalCode: '', ville: '', adresse: '' });
        }
    };

    const confirmBuyer = () => {
        if (selectedBuyer) {
            setOpenBuyerDialog(false);
            return;
        }
        if (!validateBuyerDetails()) {
            return;
        }
        setOpenBuyerDialog(false);
    };

    const handleGenerateInvoice = (purchasedGames: GameType[]) => {
        const newWindow = window.open('', '_blank');
        if (!newWindow) return;
        const purchaseDate = new Date().toLocaleString();
        let invoiceHtml = `
            <html>
                <head>
                    <title>Facture d'Achat</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .invoice { border: 1px solid #000; padding: 20px; }
                        h2 { text-align: center; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <div class="invoice">
                        <h2>Facture d'Achat</h2>
                        <p><strong>Date d'achat :</strong> ${purchaseDate}</p>
                        <table>
                            <thead>
                                <tr>
                                    <th>Référence</th>
                                    <th>Nom du jeu</th>
                                    <th>Éditeur</th>
                                    <th>Prix (€)</th>
                                    <th>Quantité</th>
                                    <th>Total (€)</th>
                                </tr>
                            </thead>
                            <tbody>
        `;
        purchasedGames.forEach(game => {
            invoiceHtml += `
                <tr>
                    <td>${game.uniqueIdentifier}</td>
                    <td>${game.name}</td>
                    <td>${game.publisher}</td>
                    <td>${Number(game.price).toFixed(2)}</td>
                    <td>${game.quantity}</td>
                    <td>${Number(game.totalCost).toFixed(2)}</td>
                </tr>
            `;
        });

        invoiceHtml += `
                            </tbody>
                        </table>
                    </div>
                    <script>
                        window.print();
                        setTimeout(() => window.close(), 0);
                    </script>
                </body>
            </html>
        `;
        newWindow.document.write(invoiceHtml);
    };

    return (
        <ThemeProvider theme={theme}>
            <Navbar />
            <div
                style={{
                    backgroundImage: 'url("/BlueWall (1).jpeg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '100vh',
                    paddingTop: '80px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start'
                }}
            >
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
                        Achat de Jeux
                    </Typography>
                    {/* Section pour sélectionner ou ajouter un acheteur */}
                    {!selectedBuyer && !buyerDetails.firstName ? (
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => setOpenBuyerDialog(true)}
                            style={{ marginBottom: '15px', width: '100%' }}  // La largeur reste identique à celle de la box
                        >
                            Sélectionner ou Ajouter un Acheteur
                        </Button>
                    ) : (
                        <Box style={{ marginBottom: '15px', width: '100%' }}>
                            <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                                Informations de l'Acheteur
                            </Typography>
                            {selectedBuyer ? (
                                <>
                                    <Typography variant="body2">
                                        Nom : {selectedBuyer.lastName} {selectedBuyer.firstName}
                                    </Typography>
                                    <Typography variant="body2">
                                        Email : {selectedBuyer.email}
                                    </Typography>
                                    {selectedBuyer.telephone && (
                                        <Typography variant="body2">
                                            Téléphone : {selectedBuyer.telephone}
                                        </Typography>
                                    )}
                                    {selectedBuyer.postalCode && (
                                        <Typography variant="body2">
                                            Code Postal : {selectedBuyer.postalCode}
                                        </Typography>
                                    )}
                                    {selectedBuyer.ville && (
                                        <Typography variant="body2">
                                            Ville : {selectedBuyer.ville}
                                        </Typography>
                                    )}
                                    {selectedBuyer.adresse && (
                                        <Typography variant="body2">
                                            Adresse : {selectedBuyer.adresse}
                                        </Typography>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Typography variant="body2">
                                        Nom : {buyerDetails.lastName}
                                    </Typography>
                                    <Typography variant="body2">
                                        Prénom : {buyerDetails.firstName}
                                    </Typography>
                                    {buyerDetails.email && (
                                        <Typography variant="body2">
                                            Email : {buyerDetails.email}
                                        </Typography>
                                    )}
                                    {buyerDetails.telephone && (
                                        <Typography variant="body2">
                                            Téléphone : {buyerDetails.telephone}
                                        </Typography>
                                    )}
                                    {buyerDetails.postalCode && (
                                        <Typography variant="body2">
                                            Code Postal : {buyerDetails.postalCode}
                                        </Typography>
                                    )}
                                    {buyerDetails.ville && (
                                        <Typography variant="body2">
                                            Ville : {buyerDetails.ville}
                                        </Typography>
                                    )}
                                    {buyerDetails.adresse && (
                                        <Typography variant="body2">
                                            Adresse : {buyerDetails.adresse}
                                        </Typography>
                                    )}
                                </>
                            )}
                            <Button
                                onClick={() => {
                                    setOpenBuyerDialog(true);
                                    setSelectedBuyer(null);
                                }}
                                style={{
                                    color: theme.palette.primary.main,
                                    textTransform: 'none',
                                    fontSize: '0.875rem',
                                    padding: '4px 8px',
                                    marginTop: '10px',
                                    border: `1px solid ${theme.palette.primary.main}`,
                                    backgroundColor: 'transparent',
                                }}
                            >
                                Modifier
                            </Button>
                        </Box>
                    )}
                    {/* Bouton pour ajouter un jeu au panier */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setOpenAddGameDialog(true)}
                            style={{ width: '100%' }}  // Conserver la largeur identique à la box
                        >
                            Ajouter un jeu au panier
                        </Button>
                    </Box>


                    {/* Dialog pour ajouter un jeu au panier */}
                    <Dialog
                        open={openAddGameDialog}
                        onClose={() => setOpenAddGameDialog(false)}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle>Sélectionner un jeu</DialogTitle>
                        <DialogContent>
                            <Autocomplete
                                options={availableGames}
                                getOptionLabel={(option) =>
                                    `${option.name} - ${option.publisher} - ${option.price}€ - ${option.uniqueIdentifier}`
                                }
                                renderInput={(params) => <TextField {...params} label="Rechercher un jeu" />}
                                onChange={(event, value) => {
                                    if (value) {
                                        handleAddToCart(value);
                                        // La fenêtre reste ouverte pour permettre l'ajout de plusieurs jeux.
                                    }
                                }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenAddGameDialog(false)}>Fermer</Button>
                        </DialogActions>
                    </Dialog>

                    {/* Dialog pour sélectionner ou saisir les informations de l'acheteur */}
                    <Dialog
                        open={openBuyerDialog}
                        onClose={() => setOpenBuyerDialog(false)}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle>Informations de l'Acheteur</DialogTitle>
                        <DialogContent>
                            <Autocomplete
                                options={existingBuyers}
                                getOptionLabel={(option) =>
                                    `${option.lastName} ${option.firstName} - ${option.email}`
                                }
                                renderInput={(params) => <TextField {...params} label="Rechercher un acheteur" />}
                                onChange={handleBuyerSelection}
                                style={{ marginBottom: '15px', marginTop: '10px' }}
                            />
                            {!selectedBuyer && (
                                <>
                                    <TextField
                                        label="Prénom"
                                        fullWidth
                                        value={buyerDetails.firstName}
                                        onChange={(e) =>
                                            setBuyerDetails({ ...buyerDetails, firstName: e.target.value })
                                        }
                                        style={{ marginBottom: '15px' }}
                                    />
                                    <TextField
                                        label="Nom"
                                        fullWidth
                                        value={buyerDetails.lastName}
                                        onChange={(e) =>
                                            setBuyerDetails({ ...buyerDetails, lastName: e.target.value })
                                        }
                                        style={{ marginBottom: '15px' }}
                                    />
                                    <TextField
                                        label="Email"
                                        fullWidth
                                        value={buyerDetails.email}
                                        onChange={(e) =>
                                            setBuyerDetails({ ...buyerDetails, email: e.target.value })
                                        }
                                        style={{ marginBottom: '15px' }}
                                    />
                                    <TextField
                                        label="Téléphone"
                                        fullWidth
                                        value={buyerDetails.telephone}
                                        onChange={(e) =>
                                            setBuyerDetails({ ...buyerDetails, telephone: e.target.value })
                                        }
                                        style={{ marginBottom: '15px' }}
                                    />
                                    <TextField
                                        label="Code Postal"
                                        fullWidth
                                        value={buyerDetails.postalCode}
                                        onChange={(e) =>
                                            setBuyerDetails({ ...buyerDetails, postalCode: e.target.value })
                                        }
                                        style={{ marginBottom: '15px' }}
                                    />
                                    <TextField
                                        label="Ville"
                                        fullWidth
                                        value={buyerDetails.ville}
                                        onChange={(e) =>
                                            setBuyerDetails({ ...buyerDetails, ville: e.target.value })
                                        }
                                        style={{ marginBottom: '15px' }}
                                    />
                                    <TextField
                                        label="Adresse"
                                        fullWidth
                                        value={buyerDetails.adresse}
                                        onChange={(e) =>
                                            setBuyerDetails({ ...buyerDetails, adresse: e.target.value })
                                        }
                                        style={{ marginBottom: '15px' }}
                                    />
                                </>
                            )}
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={generateInvoice}
                                        onChange={(e) => setGenerateInvoice(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Générer une facture"
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenBuyerDialog(false)} color="primary">
                                Annuler
                            </Button>
                            <Button onClick={confirmBuyer} color="primary">
                                Valider
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Récapitulatif du Panier */}
                    <Box mt={4}>
                        <Typography variant="h6" fontWeight="bold">
                            Récapitulatif du Panier
                        </Typography>
                        {cart.map((game, index) => (
                            <Box
                                key={`${game.uniqueIdentifier}-${index}`}
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mt={2}
                            >
                                <Typography>
                                    {game.name} - {game.uniqueIdentifier} - {game.totalCost.toFixed(2)} €
                                </Typography>
                                <IconButton onClick={() => handleRemoveFromCart(index)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ))}


                        {finalDiscount > 0 && (
                            <Typography variant="body1" color="textSecondary" mt={2}>
                                Promotion appliquée : - {finalDiscount.toFixed(2)} €
                            </Typography>
                        )}
                        <Typography variant="h6" mt={2}>
                            Total : {finalTotal.toFixed(2)} €
                        </Typography>
                        <Typography
                            style={{ color: '#1e3a8a', cursor: 'pointer', fontSize: '0.875rem', marginTop: '10px' }}
                            onClick={() => setShowPromotionDialog(true)}
                        >
                            Promotion ?
                        </Typography>

                        <Dialog
                            open={showPromotionDialog}
                            onClose={() => setShowPromotionDialog(false)}
                        >
                            <DialogTitle>Ajouter une promotion</DialogTitle>
                            <DialogContent>
                                <TextField
                                    label="Montant de la promotion"
                                    type="number"
                                    fullWidth
                                    value={discountAmount}
                                    onChange={(e) =>
                                        setDiscountAmount(e.target.value === '' ? '' : Number(e.target.value))
                                    }
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
                                <Button onClick={() => setShowPromotionDialog(false)} color="primary">
                                    Annuler
                                </Button>
                                <Button onClick={() => setShowPromotionDialog(false)} color="primary">
                                    Appliquer
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Box>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpenConfirmDialog(true)}
                        sx={{ mt: 2 }}
                    >
                        Finaliser l'Achat
                    </Button>

                    <Dialog
                        open={openConfirmDialog}
                        onClose={() => setOpenConfirmDialog(false)}
                    >
                        <DialogTitle>Confirmation</DialogTitle>
                        <DialogContent>
                            <Typography>
                                Êtes-vous sûr de vouloir finaliser l'achat ? Cette action est définitive.
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
                                Annuler
                            </Button>
                            <Button onClick={handleFinalizePurchase} color="secondary">
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
                        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>
                </Box>
            </div>
        </ThemeProvider>
    );
};

export default GamePurchase;
