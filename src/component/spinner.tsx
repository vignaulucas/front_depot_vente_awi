import React from 'react';
import { PuffLoader } from 'react-spinners';

const override = {
  display: 'block',
  margin: '0 auto',
};

const spinnerContainerStyle: React.CSSProperties = {
    position: 'fixed', 
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  };
  

const Spinner = () => {
  return (
    <div style={spinnerContainerStyle}>
      <PuffLoader color="#36D7B7" cssOverride={override} size={150} />
    </div>
  );
};

export default Spinner;
