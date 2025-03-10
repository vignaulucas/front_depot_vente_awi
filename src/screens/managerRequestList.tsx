import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, createTheme, ThemeProvider } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import TabBar from "../component/tapBar";
import Navbar from "../component/navbar";

interface User {
    idUser: number;
    firstName: string;
    lastName: string;
    ville: string;
    postalCode: string;
    telephone: string;
    email: string;
    adresse: string;
}

export default function ManagerRequestList() {
    const [users, setUsers] = useState<User[]>([]);
    const [searchByFirstName, setSearchByFirstName] = useState('');
    const [searchByLastName, setSearchByLastName] = useState('');
    const [searchByPhone, setSearchByPhone] = useState('');
    const [searchByEmail, setSearchByEmail] = useState('');
    const [searchByAddress, setSearchByAddress] = useState('');
    const [searchByPostalCode, setSearchByPostalCode] = useState('');
    const [searchByVille, setSearchByVille] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
    const [userIdToConfirm, setUserIdToConfirm] = useState<number | null>(null);
    const tabs = [
        { label: 'Liste des utilisateurs', path: `/listeUtilisateur` },
        { label: 'Liste des administrateurs et gestionnaires', path: `/listeGestionnairesAdmins` },
        { label: 'Demandes gestionnaire', path: `/listeDemandesGestionnaires` },
    ];
    const apiUrl = process.env.REACT_APP_API_URL || "";
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${apiUrl}/user/managerRequests`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then((data: User[]) => setUsers(data))
            .catch(console.error);
    }, [navigate, apiUrl]);

    const handleApproveRequest = async (userId: number) => {
        await fetch(`${apiUrl}/user/${userId}/manager`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        refreshUserList();
        setUserIdToConfirm(null);
    };

    const handleRejectRequest = async (userId: number) => {
        await fetch(`${apiUrl}/user/${userId}/deleteManagerRequest`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        refreshUserList();
        setUserIdToConfirm(null);
    };

    const openConfirmationDialog = (userId: number, action: "approve" | "reject") => {
        setConfirmAction(action);
        setUserIdToConfirm(userId);
    };

    const executeConfirmationAction = () => {
        if (userIdToConfirm && confirmAction) {
            confirmAction === "approve" ? handleApproveRequest(userIdToConfirm) : handleRejectRequest(userIdToConfirm);
            setConfirmAction(null);
        }
    };

    const refreshUserList = () => {
        fetch(`${apiUrl}/user/managerRequests`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then((data: User[]) => setUsers(data))
            .catch(console.error);
    };

    const theme = createTheme({
        palette: {
            primary: {
                main: '#0f7d21',
            },
            secondary: {
                main: '#918f8d',
            }
        },
    });

    const filteredUsers = users.filter(user => (
        (searchByFirstName === '' || user.firstName.toLowerCase().includes(searchByFirstName.toLowerCase())) &&
        (searchByLastName === '' || user.lastName.toLowerCase().includes(searchByLastName.toLowerCase())) &&
        (searchByPhone === '' || user.telephone.toLowerCase().includes(searchByPhone.toLowerCase())) &&
        (searchByEmail === '' || user.email.toLowerCase().includes(searchByEmail.toLowerCase())) &&
        (searchByAddress === '' || user.adresse.toLowerCase().includes(searchByAddress.toLowerCase())) &&
        (searchByPostalCode === '' || user.postalCode.toLowerCase().includes(searchByPostalCode.toLowerCase())) &&
        (searchByVille === '' || user.ville.toLowerCase().includes(searchByVille.toLowerCase()))
    ));

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
                    <h1 className="filters-container font-bold mb-5">Liste des demandes de gestionnaire</h1>
                    <div className="tapBar">
                        <TabBar tabs={tabs} />
                    </div>
                    <div className="filters-container">
                        <input type="text" value={searchByLastName} onChange={(e) => setSearchByLastName(e.target.value)} placeholder="Nom" />
                        <input type="text" value={searchByFirstName} onChange={(e) => setSearchByFirstName(e.target.value)} placeholder="Prénom" />
                        <input type="text" value={searchByEmail} onChange={(e) => setSearchByEmail(e.target.value)} placeholder="Email" />
                        <input type="text" value={searchByPhone} onChange={(e) => setSearchByPhone(e.target.value)} placeholder="Téléphone" />
                        <input type="text" value={searchByVille} onChange={(e) => setSearchByVille(e.target.value)} placeholder="Ville" />
                        <input type="text" value={searchByPostalCode} onChange={(e) => setSearchByPostalCode(e.target.value)} placeholder="Code Postal" />
                        <input type="text" value={searchByAddress} onChange={(e) => setSearchByAddress(e.target.value)} placeholder="Adresse" />
                    </div>

                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>Validation</th>
                                <th>Bilan</th>
                                <th>Nom</th>
                                <th>Prénom</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                                <th>Ville</th>
                                <th>Code Postal</th>
                                <th>Adresse</th>
                                <th>Suppression</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.idUser}>
                                    <td>
                                        <CheckIcon style={{ color: 'green', cursor: 'pointer' }} onClick={() => openConfirmationDialog(user.idUser, "approve")} />
                                        <CloseIcon style={{ color: 'red', cursor: 'pointer', marginLeft: '10px' }} onClick={() => openConfirmationDialog(user.idUser, "reject")} />
                                    </td>
                                    <td>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => navigate(`/user/bilan/${user.idUser}`)}
                                        >
                                            Bilan
                                        </Button>
                                    </td>
                                    <td>{user.lastName}</td>
                                    <td>{user.firstName}</td>
                                    <td>{user.email}</td>
                                    <td>{user.telephone}</td>
                                    <td>{user.ville}</td>
                                    <td>{user.postalCode}</td>
                                    <td>{user.adresse}</td>
                                    <td>
                                        <Button color="secondary" onClick={() => openConfirmationDialog(user.idUser, "reject")}>Supprimer</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <Dialog open={confirmAction !== null} onClose={() => setConfirmAction(null)}>
                        <DialogTitle>Confirmer l'action</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                {confirmAction === "approve"
                                    ? "Êtes-vous sûr de vouloir approuver cette demande ?"
                                    : "Êtes-vous sûr de vouloir refuser cette demande ?"}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setConfirmAction(null)}>Annuler</Button>
                            <Button onClick={executeConfirmationAction} color="primary">
                                Confirmer
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>
        </ThemeProvider>
    );
}
