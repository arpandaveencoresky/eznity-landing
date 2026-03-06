import React, { useState } from 'react';
import './CoreInteraction.css';

const CoreInteraction = () => {
    const [activeClip, setActiveClip] = useState(null);

    const clips = [
        { id: 1, position: '20%', type: 'Chat Spike', duration: '30s', reason: 'Chat velocity increasd by 300%' },
        { id: 2, position: '45%', type: 'High Emotion', duration: '45s', reason: 'Laughter detected' },
        { id: 3, position: '70%', type: 'Kill Streak', duration: '25s', reason: 'Multiple rapid eliminations' },
        { id: 4, position: '85%', type: 'Reaction', duration: '15s', reason: 'Volume spike > 80db' },
    ];

    return (
        <section className="core-interaction">
            <div className="container">
                <div className="core-header">
                    <h2 className="section-title">Your stream is a timeline of moments.</h2>
                    <p className="section-desc">We identify them instantly.</p>
                </div>

                <div className="timeline-interactive-wrapper">
                    <div className="timeline-labels">
                        <span>Start Stream</span>
                        <span>Live Now</span>
                    </div>

                    <div className="timeline-main-track">
                        {/* Base line */}
                        <div className="timeline-base"></div>

                        {/* Progress fill */}
                        <div className="timeline-fill"></div>

                        {/* Simulated Waveform (Visual noise) */}
                        <div className="waveform-container">
                            {[...Array(50)].map((_, i) => (
                                <div
                                    key={i}
                                    className="wave-bar"
                                    style={{
                                        height: Math.random() * 40 + 10 + '%',
                                        left: `${i * 2}%`
                                    }}
                                ></div>
                            ))}
                        </div>

                        {/* Interactive Clips */}
                        {clips.map((clip) => (
                            <div
                                key={clip.id}
                                className="timeline-spike"
                                style={{ left: clip.position }}
                                onMouseEnter={() => setActiveClip(clip.id)}
                                onMouseLeave={() => setActiveClip(null)}
                            >
                                <div className="spike-visual"></div>
                                <div className="spike-pulse"></div>

                                {/* Popover */}
                                <div className={`clip-popover ${activeClip === clip.id ? 'active' : ''}`}>
                                    <div className="popover-header">
                                        <span className="popover-badge">{clip.type}</span>
                                        <span className="popover-duration">{clip.duration}</span>
                                    </div>
                                    <div className="popover-reason">
                                        <span className="reason-icon">⚡</span>
                                        {clip.reason}
                                    </div>
                                    <div className="popover-preview">
                                        {/* Abstract preview placeholder */}
                                        <div className="preview-placeholder"></div>
                                        <div className="play-overlay">▶</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="interaction-hint">
                        Hover over the markers to see what AI detected
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CoreInteraction;
