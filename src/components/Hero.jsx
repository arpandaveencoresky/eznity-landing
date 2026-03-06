import React, { useEffect, useState } from 'react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero-section">
            <div className="container hero-container">
                {/* Left Content */}
                <div className="hero-content">
                    <div className="live-badge-wrapper">
                        <span className="live-badge">
                            <span className="live-dot"></span>
                            Live Now
                        </span>
                        <span className="live-status-text">AI Stream Intelligence Active</span>
                    </div>

                    <h1 className="hero-headline">
                        The ultimate <span className="text-gradient">AI platform</span> for elite creators.
                    </h1>

                    <p className="hero-subline">
                        Eznity transforms your live stream into a high-performance growth engine. Real-time viral clipping, interaction depth analysis, and instant social distribution.
                    </p>

                    <div className="hero-cta-group">
                        <button className="btn-primary">Elevate Your Stream</button>
                        <button className="btn-secondary">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                            Explore Intelligence
                        </button>
                    </div>

                    <div className="hero-social-proof">
                        <div className="avatars">
                            <div className="avatar" style={{ background: 'linear-gradient(45deg, #8b5cf6, #ec4899)' }}></div>
                            <div className="avatar" style={{ background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)' }}></div>
                            <div className="avatar" style={{ background: 'linear-gradient(45deg, #10b981, #3b82f6)' }}></div>
                        </div>
                        <p>Powering 50,000+ hours of content daily</p>
                    </div>
                </div>

                {/* Right Dashboard Preview */}
                <div className="hero-dashboard">
                    <div className="dashboard-visual-wrapper">
                        <div className="dashboard-glow"></div>
                        <DashboardImage />
                        <div className="dashboard-interactive-overlay">
                            <div className="overlay-badge top-left">
                                <span className="pulse-dot"></span>
                                Analysis Active
                            </div>
                            <div className="overlay-badge bottom-right">
                                Viral Potential: 98.4%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const DashboardImage = () => {
    // We'll use the generated image here. 
    // Since I can't easily reference the absolute path from the brain directory in the public folder without moving it,
    // I would normally move it to /public/assets/dashboard.png.
    // For now, I'll assume the path is assets/dashboard.png and I will move it in the next step.
    return (
        <div className="dashboard-image-container">
            <img
                src="/assets/dashboard.png"
                alt="Eznity AI Dashboard"
                className="dashboard-main-img"
            />
        </div>
    );
};

export default Hero;
