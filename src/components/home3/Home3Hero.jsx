import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import './Home3Hero.css';

gsap.registerPlugin(ScrollTrigger);

const Home3Hero = () => {
    const heroRef = useRef(null);
    const headlineRef = useRef(null);
    const actionBarRef = useRef(null);
    const mockupRef = useRef(null);
    const timelineRef = useRef(null);
    const fileInputRef = useRef(null);

    const markersData = [
        { id: 'm1', time: '02:45', title: 'Epic Win Clip', color: '#ff2a6d', left: '20%', video: '/videos/clip1.mp4' },
        { id: 'm2', time: '14:20', title: 'Viral Reaction', color: '#7b2cbf', left: '55%', video: '/videos/simulation.mp4' },
        { id: 'm3', time: '28:15', title: 'Top Moment', color: '#00f2ff', left: '85%', video: '/videos/m3-preview.mp4' }
    ];

    const [activeMarker, setActiveMarker] = useState(markersData[2]);
    const [videoLink, setVideoLink] = useState('');


    useEffect(() => {
        let ctx = gsap.context(() => {
            const hero = heroRef.current;
            const headline = headlineRef.current;
            const actionBar = actionBarRef.current;

            // Headline word reveal on load (not scroll-dependent)
            const words = headline.querySelectorAll('.word');
            gsap.fromTo(words,
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.07,
                    ease: "power3.out",
                    delay: 0.1,
                }
            );

            // Action bar fades in after headline
            gsap.fromTo(actionBar,
                { y: 20, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.7,
                    ease: "power2.out",
                    delay: 0.6,
                }
            );

            // Pin the hero section for the video mockup scroll effect
            ScrollTrigger.create({
                trigger: hero,
                start: "top top",
                end: "+=60%",
                pin: true,
                scrub: 1,
            });

            // Timeline bar scrub animation
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: hero,
                    start: "top top",
                    end: "+=60%",
                    scrub: 1,
                }
            });

            tl.to(timelineRef.current, {
                width: "100%",
                ease: "none"
            })
            .to(".marker", {
                opacity: 1,
                scale: 1,
                stagger: 0.2,
                ease: "back.out(1.7)"
            }, "<0.2");

        }, heroRef);

        return () => ctx.revert();
    }, []);

    const handleGetClips = () => {
        if (videoLink.trim()) {
            window.location.href = `/product/login?url=${encodeURIComponent(videoLink)}`;
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleGetClips();
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <section className="home3-hero" ref={heroRef}>
            <div className="hero-content">
                <div className="live-indicator">
                    <span className="dot"></span> AI Video Clipper
                </div>

                <h1 ref={headlineRef}>
                    <span className="word">Turn</span>{' '}
                    <span className="word">Long</span>{' '}
                    <span className="word">Videos</span>{' '}
                    <span className="word">&amp;</span>{' '}
                    <span className="word">Live</span>{' '}
                    <span className="word">Streams</span>
                    <br />
                    <span className="word">Into</span>{' '}
                    <span className="word">Viral</span>{' '}
                    <span className="word">Short</span>{' '}
                    <span className="word">Clips,</span>{' '}
                    <span className="word highlight-word">Instantly.</span>
                </h1>

                <p className="hero-subtext">
                    AI watches while you stream. Moments turn into clips automatically — no editing required.
                </p>

                {/* Action Bar — visible immediately, no scroll dependency */}
                <div className="hero-action-bar" ref={actionBarRef}>
                    <div className="video-input-pill">
                        <svg className="input-link-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                        <input
                            type="text"
                            placeholder="Drop a video link"
                            className="video-link-input"
                            value={videoLink}
                            onChange={(e) => setVideoLink(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button className="btn-get-clips" onClick={handleGetClips}>
                            Get free clips
                        </button>
                    </div>

                    <span className="action-or">or</span>

                    <button className="btn-upload-files" onClick={handleUploadClick}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Upload files
                    </button>

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                window.location.href = '/product/login';
                            }
                        }}
                    />
                </div>

                {/* Video Mockup */}
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
                        </video>
                        <div className="overlay-ui">
                            <span className="rec-badge">REC</span>
                            <span className="viewer-count">12.4k watching</span>
                        </div>

                        {/* Clip Preview Tooltip — always visible, driven by activeMarker */}
                        {activeMarker && (
                            <div
                                className="clip-preview-card active"
                                style={{ left: activeMarker.left }}
                            >
                                <div className="preview-video-mini">
                                    <video key={activeMarker.id} autoPlay muted loop playsInline>
                                        <source src={activeMarker.video} type="video/mp4" />
                                    </video>
                                    <div className="preview-time">{activeMarker.time}</div>
                                </div>
                                <div className="preview-info">
                                    <div className="preview-title">{activeMarker.title}</div>
                                    <div className="preview-status">AI Generated Clip</div>
                                </div>
                                <div className="preview-arrow"></div>
                            </div>
                        )}
                    </div>

                    <div className="timeline-bar-container">
                        <div className="timeline-bar" ref={timelineRef}></div>
                        {markersData.map((marker) => (
                            <div
                                key={marker.id}
                                className={`marker ${marker.id} ${activeMarker?.id === marker.id ? 'active' : ''}`}
                                onClick={() => setActiveMarker(marker)}
                                style={{
                                    '--marker-color': marker.color,
                                    left: marker.left,
                                    cursor: 'pointer'
                                }}
                            >
                                <div className="marker-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Home3Hero;
