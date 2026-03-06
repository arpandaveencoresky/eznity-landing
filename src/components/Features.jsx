import React, { useRef } from 'react';
import './Features.css';

const Features = () => {
    const features = [
        {
            group: 'Live Capture',
            items: [
                {
                    title: 'Auto-Record',
                    desc: 'Connects to Twitch/YouTube automatically. No OBS plugins needed.',
                    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v8" /></svg>,
                    visual: (
                        <div className="visual-rec">
                            <div className="rec-text">
                                <span className="rec-dot"></span> REC
                            </div>
                            <div className="rec-waveforms">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="feature-wave-bar" style={{ animationDelay: `${i * 0.1}s` }}></div>
                                ))}
                            </div>
                        </div>
                    )
                },
                {
                    title: 'Zero Uploads',
                    desc: 'We process the stream directly. Save your bandwidth.',
                    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m16 16-4-4-4 4" /></svg>,
                    visual: (
                        <div className="visual-network">
                            <div className="net-node stream-src">Stream</div>
                            <div className="net-flow">
                                <span className="flow-arrow"></span>
                                <span className="flow-arrow delay-1"></span>
                                <span className="flow-arrow delay-2"></span>
                            </div>
                            <div className="net-node cloud-dest">Cloud</div>
                        </div>
                    )
                },
            ]
        },
        {
            group: 'AI Intelligence',
            items: [
                {
                    title: 'Viral Scoring',
                    desc: 'Every clip gets a 0-100 score based on engagement potential.',
                    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" /></svg>,
                    visual: (
                        <div className="visual-score">
                            <div className="score-gauge">
                                <svg viewBox="0 0 100 50" className="gauge-svg">
                                    <path d="M10,50 A40,40 0 1,1 90,50" className="gauge-bg" fill="none" stroke="#222" strokeWidth="8" />
                                    <path d="M10,50 A40,40 0 1,1 90,50" className="gauge-fill" fill="none" stroke="#8b5cf6" strokeWidth="8" strokeDasharray="126" strokeDashoffset="10" />
                                </svg>
                                <div className="score-val">98</div>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'Emotion Analysis',
                    desc: 'Detects laughter, screams, and high-focus moments.',
                    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>,
                    visual: (
                        <div className="visual-face">
                            <div className="face-frame">
                                <div className="face-target"></div>
                                <div className="face-tag">Joy: 99%</div>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'Smart Framing',
                    desc: 'Auto-crops to 9:16 keeping the action centered.',
                    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 7h1a2 2 0 0 0 2-2V4" /><path d="M16 4v1a2 2 0 0 0 2 2h1" /><path d="M19 17h-1a2 2 0 0 0-2 2v1" /><path d="M8 20v-1a2 2 0 0 0-2-2H5" /></svg>,
                    visual: (
                        <div className="visual-crop">
                            <div className="crop-landscape">
                                <div className="crop-portrait"></div>
                            </div>
                        </div>
                    )
                },
            ]
        },
        {
            group: 'Distribution',
            items: [
                {
                    title: 'Auto Captions',
                    desc: '98% accurate subtitles generated instantly.',
                    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2" /><path d="M7 15h10" /><path d="M7 11h7" /></svg>,
                    visual: (
                        <div className="visual-chat">
                            <div className="chat-bubble left">
                                <div className="text-line w-80"></div>
                            </div>
                            <div className="chat-bubble left delay-1">
                                <div className="text-line w-60"></div>
                            </div>
                            <div className="chat-bubble highlight">
                                <div className="text-line w-80"></div>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'One-Click Post',
                    desc: 'Share to TikTok, Reels, and Shorts directly.',
                    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>,
                    visual: (
                        <div className="visual-social">
                            <div className="social-icon tiktok"></div>
                            <div className="social-icon instagram"></div>
                            <div className="social-icon youtube"></div>
                            <div className="social-check">✓ Posted</div>
                        </div>
                    )
                },
            ]
        }
    ];

    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    };

    return (
        <section className="features-section" id="features">
            <div className="container">
                <div className="features-grid">
                    {features.map((group, idx) => (
                        <div key={idx} className="feature-group">
                            <h3 className="group-title">{group.group}</h3>
                            <div className="group-cards">
                                {group.items.map((item, i) => (
                                    <div
                                        key={i}
                                        className="feature-card"
                                        onMouseMove={handleMouseMove}
                                    >
                                        <div className="card-header">
                                            <div className="feature-icon">{item.icon}</div>
                                            <h4>{item.title}</h4>
                                        </div>
                                        <p>{item.desc}</p>
                                        <div className="feature-visual">
                                            {item.visual}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
