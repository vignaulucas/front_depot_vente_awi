import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

const Logout: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');  
        navigate('/login');               
    };

    return (
        <Tooltip title="Déconnexion" placement="bottom">
            <IconButton
                onClick={handleLogout}
                size="large"
                color="inherit"
                style={{ padding: '8px' }}
            >
                <LogoutIcon />
            </IconButton>
        </Tooltip>
    );
};

export default Logout;
