import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Box } from '@mui/material';

interface Tab {
  label: string;
  path: string;
}

interface TabBarProps {
  tabs: Tab[];
}

const TabBar: React.FC<TabBarProps> = ({ tabs }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedIndex, setSelectedIndex] = useState(
    tabs.findIndex((tab: Tab) => tab.path === location.pathname)
  );

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      p: 2,
      gap: '10px',
      borderBottom: '1px solid #e0e0e0',
    }}>
      {tabs.map((tab: Tab, index: number) => (
        <Button
          key={tab.path}
          onClick={() => {
            navigate(tab.path);
            setSelectedIndex(index);
          }}
          sx={{
            color: selectedIndex === index ? 'red' : 'black',
            fontWeight: 'normal',
            fontSize: '0.875rem',
            textTransform: 'none',
            bgcolor: 'transparent',
            '&:hover': {
              bgcolor: 'grey.200',
            },
            '&:not(:last-of-type)': {
              borderRight: '1px solid #e0e0e0',
            }
          }}
        >
          {tab.label}
        </Button>
      ))}
    </Box>
  );
};

export default TabBar;
