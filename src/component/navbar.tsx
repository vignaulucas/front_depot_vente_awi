import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import Logout from './Logout';
import { useNavigate } from 'react-router-dom';
import Spinner from './spinner';

interface UserDetails {
    idUser: number;
    role: string;
}

function Navbar() {
    const token = localStorage.getItem('token');
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const navigate = useNavigate();
    const isAdmin = userDetails && userDetails.role === 'admin';
    const isManager = userDetails && userDetails.role === 'manager';
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        if (token) {
            const tokenBody = token.split('.')[1];
            const decodedToken = JSON.parse(window.atob(tokenBody));
            fetchUserData(decodedToken.id);
        }
    }, [token]);

    const fetchUserData = async (userId: number) => {
        try {
            const response = await fetch(`${apiUrl}/user/${userId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Erreur lors de la récupération des données utilisateur');
            const userData: UserDetails = await response.json();
            setUserDetails(userData);
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    if (!userDetails) {
        return <Spinner />;
    }

    return (
        <AppBar position="static" style={{ backgroundColor: isAdmin ? '#001A33' : '#001A33', width: '100%' }}>
            <Toolbar style={{ justifyContent: 'space-between' }}>
                <Button color="inherit" href="/">
                    <img src="/logoAWI.png" alt="Logo" style={{ height: 55 }} />
                </Button>
                <Box sx={{ display: 'flex', flexGrow: 1, justifyContent: 'center' }}>
                    {(isAdmin || isManager) && <Button color="inherit" href="/listeUtilisateur">Liste utilisateur</Button>}
                    {(isAdmin || isManager) && <Button color="inherit" href="/depotVente">Dépôt Vente</Button>}
                    {(isAdmin || isManager) && <Button color="inherit" href="/listeSessionsVente">Session Vente</Button>}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexGrow: 0 }}>
                    <Logout />
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
