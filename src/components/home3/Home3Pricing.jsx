import React, { useState } from 'react';
import './Home3Pricing.css';

const Home3Pricing = () => {
    const [billingCycle, setBillingCycle] = useState('monthly');

    return (
        <section className="home3-pricing">
            <div className="pricing-header">
                <h2>Simple, Transparent Pricing</h2>

                <div className="billing-toggle">
                    <span className={billingCycle === 'monthly' ? 'active' : ''}>Monthly</span>
                    <div
                        className="toggle-switch"
                        onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                    >
                        <div className={`switch-knob ${billingCycle}`}></div>
                    </div>
                    <span className={billingCycle === 'yearly' ? 'active' : ''}>Yearly (Save 20%)</span>
                </div>
            </div>

            <div className="pricing-cards">
                <div className="pricing-card">
                    <h3>Starter</h3>
                    <div className="price">$0<span>/mo</span></div>
                    <ul>
                        <li>3 hours stream analysis</li>
                        <li>720p clips</li>
                        <li>Standard support</li>
                    </ul>
                    <button className="btn-plan">Get Started</button>
                </div>

                <div className="pricing-card pro">
                    <div className="popular-tag">Most Popular</div>
                    <h3>Pro Creator</h3>
                    <div className="price">{billingCycle === 'monthly' ? '$29' : '$24'}<span>/mo</span></div>
                    <ul>
                        <li>Unlimited analysis</li>
                        <li>1080p 60fps clips</li>
                        <li>Priority processing</li>
                        <li>AI Chat highlights</li>
                    </ul>
                    <button className="btn-plan primary">Upgrade to Pro</button>
                </div>

                <div className="pricing-card">
                    <h3>Agency</h3>
                    <div className="price">Talk to us</div>
                    <ul>
                        <li>Custom API access</li>
                        <li>Dedicated account manager</li>
                        <li>White-label options</li>
                    </ul>
                    <button className="btn-plan">Contact Sales</button>
                </div>
            </div>
        </section>
    );
};

export default Home3Pricing;
