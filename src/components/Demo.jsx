import React, { useState, useEffect } from 'react';
import './Demo.css';

const Demo = () => {
    const [clips, setClips] = useState([
        { id: 1, time: '00:14:20', title: 'Triple Kill', reason: 'Action Spike' },
        { id: 2, time: '00:23:05', title: 'Funny Moment', reason: 'Chat Laughter' },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            const newClip = {
                id: Date.now(),
                time: `00:${Math.floor(Math.random() * 59)}:${Math.floor(Math.random() * 59)}`,
                title: 'New Highlight',
                reason: 'AI Detection',
                isNew: true
            };
            setClips(prev => [newClip, ...prev].slice(0, 5));
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="demo-section">
            <div className="container">
                <h2 className="section-title center">See it in action. <span className="text-gradient">Real-time.</span></h2>

                <div className="demo-interface">
                    {/* Left: Live Stream */}
                    <div className="demo-stream">
                        <div className="live-overlay">
                            <span className="live-badge-small">LIVE</span>
                        </div>
                        <div className="demo-video-placeholder"></div>
                    </div>

                    {/* Right: Clip Feed */}
                    <div className="demo-feed">
                        <div className="feed-header">
                            <h3>Generated Clips</h3>
                            <span className="pulse-dot"></span>
                        </div>
                        <div className="feed-list">
                            {clips.map((clip) => (
                                <div key={clip.id} className={`feed-item ${clip.isNew ? 'fade-in' : ''}`}>
                                    <div className="feed-thumb"></div>
                                    <div className="feed-info">
                                        <span className="feed-time">{clip.time}</span>
                                        <h4>{clip.title}</h4>
                                        <span className="feed-reason">✨ {clip.reason}</span>
                                    </div>
                                    <button className="btn-icon">⬇</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Demo;
