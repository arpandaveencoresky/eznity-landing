import React from 'react';
import './Difference.css';

const Difference = () => {
    return (
        <section className="difference-section">
            <div className="container">
                <div className="section-header">
                    <span className="section-label">The Eznity Difference</span>
                    <h2 className="section-title">
                        Not just features. <br />
                        <span className="text-gradient">A complete content engine.</span>
                    </h2>
                    <p className="section-desc">
                        Stop treating clips as an afterthought. Eznity makes short-form creation part of your live infrastructure.
                    </p>
                </div>

                <div className="process-grid">
                    {/* Card 1: Go Live */}
                    <div className="process-card card-1">
                        <div className="card-visual">
                            <div className="signal-waves">
                                <span></span><span></span><span></span>
                            </div>
                            <div className="icon-badge">🔴</div>
                        </div>
                        <div className="card-content">
                            <h3>1. You Go Live</h3>
                            <p>Just stream as usual. We connect to your Twitch or YouTube feed instantly.</p>
                        </div>
                        <div className="progress-line active"></div>
                    </div>

                    {/* Card 2: AI Watches */}
                    <div className="process-card card-2">
                        <div className="card-visual">
                            <div className="brain-pulse">
                                <div className="brain-core"></div>
                                <div className="scan-line"></div>
                            </div>
                        </div>
                        <div className="card-content">
                            <h3>2. AI Watches</h3>
                            <p>Our models analyze audio, chat energy, and gameplay triggers in real-time.</p>
                        </div>
                        <div className="progress-line pending"></div>
                    </div>

                    {/* Card 3: Clips Ready */}
                    <div className="process-card card-3">
                        <div className="card-visual">
                            <div className="clips-stack">
                                <div className="stack-item item-1"></div>
                                <div className="stack-item item-2"></div>
                                <div className="stack-item item-3">
                                    <span className="play-icon">▶</span>
                                </div>
                            </div>
                        </div>
                        <div className="card-content">
                            <h3>3. Clips Ready</h3>
                            <p>Viral-worthy shorts are generated and ready to post before you sign off.</p>
                        </div>
                        <div className="progress-line pending"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Difference;
