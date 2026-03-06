import React from 'react';
import './Pricing.css';

const Pricing = () => {
    return (
        <React.Fragment>
            <section className="pricing-section">
                <div className="container">
                    <h2 className="section-title center">Simple pricing for creators</h2>
                    <div className="pricing-grid">
                        <div className="price-card">
                            <h3>Starter</h3>
                            <div className="price">$0<span>/mo</span></div>
                            <ul>
                                <li>5 hours stream analysis</li>
                                <li>720p export</li>
                                <li>basic AI detection</li>
                            </ul>
                            <button className="btn-outline">Get Started</button>
                        </div>
                        <div className="price-card featured">
                            <div className="featured-badge">LIVE STREAMING CHOICE</div>
                            <h3>Pro</h3>
                            <div className="price">$29<span>/mo</span></div>
                            <ul>
                                <li>Unlimited stream analysis</li>
                                <li>4k export</li>
                                <li>Advanced Emotion AI</li>
                                <li>Auto-Posting</li>
                            </ul>
                            <button className="btn-primary full-width">Go Pro</button>
                        </div>
                        <div className="price-card">
                            <h3>Agency</h3>
                            <div className="price">$99<span>/mo</span></div>
                            <ul>
                                <li>10 Channels</li>
                                <li>Team seats</li>
                                <li>API Access</li>
                            </ul>
                            <button className="btn-outline">Contact Sales</button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="final-cta-section">
                <div className="container center">
                    <h2 className="cta-headline">Never miss a viral moment again.</h2>
                    <p className="cta-subline">Your AI editor works while you stream.</p>
                    <button className="btn-primary btn-large">Start Editing Live</button>
                </div>
            </section>
        </React.Fragment>
    );
};

export default Pricing;
