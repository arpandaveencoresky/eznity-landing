import React, { useState, useEffect, useRef } from 'react';
import './Home3Personas.css';

const Home3Personas = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const intervalRef = useRef(null);

    const personas = [
        {
            title: "The Speedrunner",
            desc: "Never miss a PB or fail. Moments are captured instantly.",
            icon: "⏱️",
            color: "#ff2a6d"
        },
        {
            title: "The Just Chatting Star",
            desc: "Highlighted chat spikes and high-laughter moments.",
            icon: "💬",
            color: "#7b2cbf",
            videoUrl: "/videos/just chatting new.mp4"
        },
        {
            title: "The Esports Pro",
            desc: "Tactical plays and clutch rounds automatically clipped.",
            icon: "🎮",
            color: "#00b4d8",
            videoUrl: "/videos/esports new.mp4"
        }
    ];

    useEffect(() => {
        startInterval();
        return () => stopInterval();
    }, []);

    const startInterval = () => {
        intervalRef.current = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % personas.length);
        }, 4000);
    };

    const stopInterval = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const handleMouseEnter = (index) => {
        stopInterval();
        setActiveIndex(index);
    };

    const handleMouseLeave = () => {
        startInterval();
    };

    return (
        <section className="home3-personas">
            <h2>Built for Live Creators</h2>
            <div className="personas-container">
                {personas.map((persona, index) => (
                    <div
                        key={index}
                        className={`persona-card ${index === activeIndex ? 'active' : ''}`}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                        style={{ '--accent-color': persona.color }}
                    >
                        <div className="card-header">
                            <span className="icon">{persona.icon}</span>
                            <h3>{persona.title}</h3>
                        </div>
                        <div className="card-body">
                            <p>{persona.desc}</p>
                            {persona.videoUrl ? (
                                <div className="clip-preview-video">
                                    <video
                                        src={persona.videoUrl}
                                        controls
                                        playsInline
                                        preload="metadata"
                                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                </div>
                            ) : (
                                <div className="fake-clip-preview">
                                    <div className="play-btn">▶</div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Home3Personas;
