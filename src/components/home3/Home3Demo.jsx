import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Home3Demo.css';

gsap.registerPlugin(ScrollTrigger);

const Home3Demo = () => {
    const sectionRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            const listItems = listRef.current.children;

            gsap.fromTo(listItems,
                { opacity: 0, x: 50 },
                {
                    opacity: 1, x: 0,
                    duration: 0.5,
                    stagger: 0.2,
                    ease: "back.out(1)",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 60%",
                    }
                }
            );

            // Pulse animation for 'New clip detected'
            gsap.to(".new-badge", {
                scale: 1.1,
                opacity: 0.8,
                duration: 0.8,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const dummyClips = [
        { title: "Triple Kill - Valorant", time: "2m ago", views: "1.2k" },
        { title: "Funny Reaction", time: "15m ago", views: "850" },
        { title: "Chat Goes Wild", time: "42m ago", views: "2.1k" },
        { title: "Win Moment", time: "1h ago", views: "5.5k" },
    ];

    return (
        <section className="home3-demo" ref={sectionRef}>
            <div className="demo-header">
                <h2>Live Dashboard</h2>
                <p>See it happening in real-time</p>
            </div>

            <div className="dashboard-layout">
                <div className="stream-preview">
                    <div className="video-feed">
                        <span className="live-tag">LIVE</span>
                    </div>
                </div>

                <div className="clips-sidebar">
                    <div className="sidebar-header">
                        <h3>Generated Clips</h3>
                        <span className="new-badge">Scanning...</span>
                    </div>

                    <div className="clips-list" ref={listRef}>
                        {dummyClips.map((clip, i) => (
                            <div className="clip-item" key={i}>
                                <div className="clip-thumb"></div>
                                <div className="clip-info">
                                    <h4>{clip.title}</h4>
                                    <div className="clip-meta">
                                        <span>{clip.time}</span> • <span>{clip.views} views</span>
                                    </div>
                                </div>
                                <div className="clip-status">Ready</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Home3Demo;
