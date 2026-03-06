import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import './Home3Hero.css';

gsap.registerPlugin(ScrollTrigger);

const Home3Hero = () => {
    const heroRef = useRef(null);
    const headlineRef = useRef(null);
    const mockupRef = useRef(null);
    const timelineRef = useRef(null);
    const [hoveredMarker, setHoveredMarker] = useState(null);

    const markersData = [
        { id: 'm1', time: '02:45', title: 'Epic Win Clip', color: '#ff2a6d', left: '20%', video: '/videos/clip1.mp4' },
        { id: 'm2', time: '14:20', title: 'Viral Reaction', color: '#7b2cbf', left: '55%', video: '/videos/simulation.mp4' },
        { id: 'm3', time: '28:15', title: 'Top Moment', color: '#00f2ff', left: '85%', video: '/videos/m3-preview.mp4' }
    ];

    useEffect(() => {
        let ctx = gsap.context(() => {
            const hero = heroRef.current;
            const headline = headlineRef.current;
            const timeline = timelineRef.current;

            // Pin the hero section
            ScrollTrigger.create({
                trigger: hero,
                start: "top top",
                end: "+=80%",
                pin: true,
                scrub: 1,
            });

            // Headline animation (Text reveal)
            const words = headline.querySelectorAll('.word');
            gsap.fromTo(words,
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.1,
                    ease: "power3.out"
                }
            );

            // Timeline scrub animation
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: hero,
                    start: "top top",
                    end: "+=80%",
                    scrub: 1,
                }
            });

            tl.to(timeline, {
                width: "100%",
                ease: "none"
            })
                .to(".marker", {
                    opacity: 1,
                    scale: 1,
                    stagger: 0.2,
                    ease: "back.out(1.7)"
                }, "<0.2")
                .to(".cta-container", {
                    opacity: 1,
                    y: 0,
                    duration: 0.5
                }, ">");

        }, heroRef); // Scope to heroRef

        return () => ctx.revert();
    }, []);

    return (
        <section className="home3-hero" ref={heroRef}>
            <div className="hero-content">
                <div className="live-indicator">
                    <span className="dot"></span> LIVE INTELLIGENCE
                </div>
                <h1 ref={headlineRef}>
                    <span className="word">Your</span> <span className="word">Stream</span> <span className="word">Is</span> <span className="word">Gold.</span><br />
                    <span className="word">We</span> <span className="word">Minimize</span> <span className="word">The</span> <span className="word">Mining.</span>
                </h1>
                <p className="hero-subtext">AI watches while you stream. Moments turn into clips instantly.</p>

                <div className="mockup-container" ref={mockupRef}>
                    <div className="video-placeholder">
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="simulation-video"
                        >
                            <source src="/videos/simulation.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                        <div className="overlay-ui">
                            <span className="rec-badge">REC</span>
                            <span className="viewer-count">12.4k watching</span>
                        </div>

                        {/* Clip Preview Tooltip */}
                        {hoveredMarker && (
                            <div
                                className={`clip-preview-card active`}
                                style={{ left: hoveredMarker.left }}
                            >
                                <div className="preview-video-mini">
                                    <video key={hoveredMarker.id} autoPlay muted loop playsInline>
                                        <source src={hoveredMarker.video} type="video/mp4" />
                                    </video>
                                    <div className="preview-time">{hoveredMarker.time}</div>
                                </div>
                                <div className="preview-info">
                                    <div className="preview-title">{hoveredMarker.title}</div>
                                    <div className="preview-status">AI Generated Clip</div>
                                </div>
                                <div className="preview-arrow"></div>
                            </div>
                        )}
                    </div>
                    <div className="timeline-bar-container">
                        <div className="timeline-bar" ref={timelineRef}></div>
                        {markersData.map((marker, index) => (
                            <div
                                key={marker.id}
                                className={`marker ${marker.id} ${hoveredMarker?.id === marker.id ? 'active' : ''}`}
                                onMouseEnter={() => setHoveredMarker(marker)}
                                onMouseLeave={() => setHoveredMarker(null)}
                                style={{
                                    '--marker-color': marker.color,
                                    left: marker.left
                                }}
                            >
                                <div className="marker-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="cta-container">
                    <Link to="/product/login" className="btn-primary">Start Watching</Link>
                    <button className="btn-secondary">View Demo</button>
                </div>
            </div>
        </section>
    );
};

export default Home3Hero;
