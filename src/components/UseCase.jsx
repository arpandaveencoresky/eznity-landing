import React from 'react';
import './UseCase.css';

const UseCase = () => {
    const personas = [
        {
            title: "Streamers",
            icon: "🎮",
            before: "Hours of manual scrubbing through VODs.",
            after: "Clips ready to post the moment you end stream."
        },
        {
            title: "Podcasters",
            icon: "🎙️",
            before: "Paying editors to find 'good parts'.",
            after: "AI identifies topics and extracts viral shorts."
        },
        {
            title: "Events",
            icon: "🎟️",
            before: "Delayed highlights, missed momentum.",
            after: "Real-time updates to social media during the event."
        }
    ];

    return (
        <section className="use-case-section">
            <div className="container">
                <h2 className="section-title center">Built for live creators</h2>
                <div className="persona-grid">
                    {personas.map((p, i) => (
                        <div key={i} className="persona-card">
                            <div className="persona-header">
                                <span className="persona-icon">{p.icon}</span>
                                <h3>{p.title}</h3>
                            </div>
                            <div className="comparison-box">
                                <div className="state before">
                                    <span className="state-label">Before</span>
                                    <p>{p.before}</p>
                                </div>
                                <div className="divider"></div>
                                <div className="state after">
                                    <span className="state-label">With Eznity</span>
                                    <p>{p.after}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default UseCase;
