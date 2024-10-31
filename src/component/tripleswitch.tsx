import React, { useState, CSSProperties } from 'react';

interface TripleSwitchProps {
    initialOption?: string;
    onChange?: (option: string) => void;
}

const TripleSwitch: React.FC<TripleSwitchProps> = ({ initialOption = 'tous', onChange }) => {
    const [selectedOption, setSelectedOption] = useState(initialOption);

    const handleChange = (option: string) => {
        setSelectedOption(option);
        if (onChange) {
            onChange(option);
        }
    };

    const buttonStyle = (option: string): CSSProperties => ({
        backgroundColor: selectedOption === option ? '#0b3d91' : '#e0e0e0', // Bleu foncé pour l'option sélectionnée
        color: selectedOption === option ? 'white' : 'black',
        border: 'none',
        borderRadius: '5px',
        padding: '8px 15px',
        margin: '0 5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s, color 0.3s',
        fontWeight: 'bold',
        textTransform: 'uppercase' as 'uppercase',
    });

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <button style={buttonStyle('manager')} onClick={() => handleChange('manager')}>
                Gestionnaire
            </button>
            <button style={buttonStyle('admin')} onClick={() => handleChange('admin')}>
                Admin
            </button>
            <button style={buttonStyle('tous')} onClick={() => handleChange('tous')}>
                Tous
            </button>
        </div>
    );
};

export default TripleSwitch;
