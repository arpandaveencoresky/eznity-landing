import React, { useEffect } from 'react';
import Navbar from './Navbar';

const LandingLayout = ({ children, theme = 'dark' }) => {
    // Apply theme class to body/app for global overrides if needed, 
    // currently wrapping in a div is safer for the transition

    return (
        <div className={`app-layout ${theme === 'light' ? 'light-theme' : ''}`}>
            <Navbar theme={theme} />
            {children}
        </div>
    );
};

export default LandingLayout;
