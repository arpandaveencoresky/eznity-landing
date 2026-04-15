import React, { useState, useEffect } from 'react';
import './Navbar.css';

import { Link } from 'react-router-dom';

import EznityLogo from './common/EznityLogo';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-container">
                <Link to="/" className="navbar-logo">
                    <EznityLogo />
                </Link>

                <div className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                    <Link to="/pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                </div>

                <div className="navbar-actions">
                    <Link to="/product/login" className="btn-text">Log in</Link>
                    <Link to="/product/signup" className="btn-primary btn-sm">Sign up free</Link>
                </div>

                <button
                    className="mobile-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
                    <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
                    <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
