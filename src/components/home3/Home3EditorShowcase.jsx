import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Save, Download, Video, Type, Layout, Settings } from 'lucide-react';
import './Home3EditorShowcase.css';
import EznityLogo from '../common/EznityLogo';

gsap.registerPlugin(ScrollTrigger);

const features = [
    { id: '01', title: 'Automated Transcription', desc: 'Generate accurate captions automatically.' },
    { id: '02', title: 'Smart Subtitle Styling', desc: 'Apply professional caption styles instantly.' },
    { id: '03', title: 'Live Subtitle Editing', desc: 'Edit captions while previewing the reel.' },
    { id: '04', title: 'Real-Time Video Preview', desc: 'See changes immediately on the reel.' },
    { id: '05', title: 'Timeline Based Editing', desc: 'Control clip timing and caption placement.' },
    { id: '06', title: 'Preset Caption Templates', desc: 'Apply ready-to-use caption designs.' }
];

const Home3EditorShowcase = () => {
    const sectionRef = useRef(null);
    const editorRef = useRef(null);
    const [activeFeature, setActiveFeature] = useState(0);

    useEffect(() => {
        let ctx = gsap.context(() => {
            const featureItems = gsap.utils.toArray('.feature-narrative-item');
            const mm = gsap.matchMedia();

            // Desktop Intro Animation
            mm.add("(min-width: 1025px)", () => {
                
                // 1. Initial slide from center to right
                gsap.fromTo('.tour-right', 
                    { 
                        x: () => {
                            const container = document.querySelector('.tour-container');
                            const rightSide = document.querySelector('.tour-right');
                            const leftSide = document.querySelector('.tour-left');
                            if (!container || !rightSide || !leftSide) return -255;
                            
                            const containerWidth = container.offsetWidth;
                            const rightWidth = rightSide.offsetWidth;
                            const leftWidth = leftSide.offsetWidth;
                            const gap = 60; // gap from CSS
                            
                            // Distance to move from left to get to center
                            // normal position is leftWidth + gap
                            const centerPos = (containerWidth - rightWidth) / 2;
                            const normalPos = leftWidth + gap;
                            return centerPos - normalPos;
                        } 
                    },
                    { 
                        x: 0, 
                        ease: "power2.inOut",
                        scrollTrigger: {
                            trigger: ".tour-container",
                            start: "top 200px",
                            end: "+=400",
                            scrub: 1,
                            invalidateOnRefresh: true,
                        }
                    }
                );

                // 2. Fade in features list slightly after sliding starts
                gsap.fromTo('.features-list',
                    { opacity: 0, y: 50 },
                    { 
                        opacity: 1, 
                        y: 0,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: ".tour-container",
                            start: "top 100px",
                            end: "+=300",
                            scrub: 1,
                        }
                    }
                );

            });

            // Narrative sync happens on all screen sizes
            featureItems.forEach((item, index) => {
                ScrollTrigger.create({
                    trigger: item,
                    start: "top center+=200",
                    end: "bottom center+=200",
                    onEnter: () => setActiveFeature(index),
                    onEnterBack: () => setActiveFeature(index),
                });
            });

            // Initial appearance animation for the section title
            gsap.fromTo(".tour-header",
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0,
                    duration: 1,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: ".tour-header",
                        start: "top 80%",
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    // Effect for active feature animations
    useEffect(() => {
        let ctx = gsap.context(() => {
            // Reset state
            // Kill any ongoing animations to prevent conflicts
            gsap.killTweensOf('.caption-overlay, .main-caption, .inspector-body, .timeline-area, .left-sidebar, .right-sidebar, .video-container, .style-card, .style-panel, .playhead, .editor-video-placeholder, .inspector-body .prop-group');

            gsap.set('.caption-overlay', { opacity: 1 });
            gsap.set('.main-caption', { opacity: 1, y: 0 });
            gsap.set('.inspector-body', { opacity: 1 });
            gsap.set('.timeline-area', { opacity: 1 });
            gsap.set('.left-sidebar', { opacity: 1 });
            gsap.set('.right-sidebar', { opacity: 1 });
            gsap.set('.video-container', { scale: 1 });
            gsap.set('.style-card', { opacity: 1, x: 0, scale: 1 });
            gsap.set('.style-panel', { boxShadow: 'none', borderColor: 'transparent' });
            gsap.set('.playhead', { left: "10%" });
            gsap.set('.editor-video-placeholder', { scale: 1, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)" });
            gsap.set('.inspector-body .prop-group', { opacity: 1 });

            // Apply opacity dimming for non-active components to highlight active one
            if (activeFeature !== 0 && activeFeature !== 3) {
                gsap.to('.caption-overlay', { opacity: 0.3, duration: 0.4 });
            }
            if (activeFeature !== 1 && activeFeature !== 5) {
                gsap.to('.left-sidebar', { opacity: 0.3, duration: 0.4 });
            }
            if (activeFeature !== 2) {
                gsap.to('.right-sidebar', { opacity: 0.3, duration: 0.4 });
            }
            if (activeFeature !== 4) {
                gsap.to('.timeline-area', { opacity: 0.3, duration: 0.4 });
            }

            switch (activeFeature) {
                case 0: // Automated Transcription
                    gsap.fromTo('.main-caption',
                        { opacity: 0, y: 15 },
                        { opacity: 1, y: 0, duration: 0.6, stagger: 0.2, ease: "power2.out" }
                    );
                    break;
                case 1: // Smart Subtitle Styling
                    gsap.to('.style-panel', {
                        boxShadow: "0 0 30px rgba(255, 255, 255, 0.15)", // changed to white glow to match theme
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        duration: 0.6
                    });
                    gsap.fromTo('.style-card.active',
                        { scale: 1 },
                        { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1 }
                    );
                    break;
                case 2: // Live Subtitle Editing
                    gsap.fromTo('.inspector-body .prop-group',
                        { opacity: 0.5 },
                        { opacity: 1, stagger: 0.1, duration: 0.4 }
                    );
                    break;
                case 3: // Real-Time Video Preview
                    gsap.fromTo('.editor-video-placeholder',
                        { scale: 1 },
                        { scale: 1.02, boxShadow: "0 0 40px rgba(255, 255, 255, 0.1)", duration: 1.5, yoyo: true, repeat: -1, ease: "sine.inOut" }
                    );
                    break;
                case 4: // Timeline Based Editing
                    gsap.fromTo('.playhead',
                        { left: "10%" },
                        { left: "85%", duration: 3, ease: "none", repeat: -1 }
                    );
                    break;
                case 5: // Preset Caption Templates
                    gsap.fromTo('.style-card',
                        { x: -15, opacity: 0 },
                        { x: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: "back.out(1.5)" }
                    );
                    break;
            }

        }, editorRef);
    }, [activeFeature]);

    const textStyles = [
        { name: "Default", type: "default", active: true },
        { name: "No Text", type: "none" },
        { name: "Clean Modern", type: "modern" },
        { name: "Neon Cyberpunk", type: "neon" },
        { name: "Bold Impact", type: "bold" },
        { name: "Gradient Pill", type: "gradient" },
        { name: "Retro VHS", type: "retro" },
        { name: "Solid Block", type: "solid" }
    ];

    return (
        <section className="editor-showcase-section product-tour-section" ref={sectionRef}>
            <div className="tour-header">
                <h2>Pro-Level Editing Made Easy</h2>
                <p>Customize captions, apply styles, and fine-tune your reels in seconds.</p>
            </div>
            
            <div className="tour-container">
                {/* Left Column - Narrative */}
                <div className="tour-left">
                    <div className="features-list">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`feature-narrative-item ${activeFeature === index ? 'active' : ''}`}
                            >
                                <span className="feature-number">[{feature.id}]</span>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-desc">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column - Editor Mockup */}
                <div className="tour-right">
                    <div className="editor-mockup-wrapper sticky-mockup" ref={editorRef}>
                        <div className="editor-topbar">
                            <div className="topbar-left">
                                <div className="nav-btn"><Layout size={16} /></div>
                                <EznityLogo variant="inline" height={22} color="white" />
                            </div>
                            <div className="topbar-right">
                                <button className="btn-secondary"><Save size={14} /> Save</button>
                                <button className="btn-primary"><Download size={14} /> Export <span className="premium-icon">👑</span></button>
                                <div className="avatar">AD</div>
                            </div>
                        </div>

                        <div className="editor-main-area">
                            {/* Left Sidebar - Templates / Styles */}
                            <aside className="editor-sidebar left-sidebar">
                                <div className="sidebar-tabs">
                                    <button className="tab-btn"><Video size={18} /></button>
                                    <button className="tab-btn active"><Type size={18} /></button>
                                    <button className="tab-btn"><Layout size={18} /></button>
                                </div>
                                <div className="sidebar-content">
                                    <h3 className="panel-title">Templates</h3>
                                    <div className="style-panel">
                                        <div className="style-header">
                                            <h4>Text Style</h4>
                                            <p>Choose a style for your video text</p>
                                        </div>
                                        <div className="styles-grid">
                                            {textStyles.map((style, i) => (
                                                <div key={i} className={`style-card ${style.active ? 'active' : ''} style-${style.type}`}>
                                                    {style.name}
                                                    {style.active && <div className="check-mark">✓</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </aside>

                            {/* Center - Player */}
                            <main className="editor-player-area">
                                <div className="video-container">
                                    <div className="editor-video-placeholder">
                                        {/* Simulated Video Content */}
                                        <div className="video-content-sim">
                                            <div className="sim-face top-left"></div>
                                            <div className="sim-face top-right"></div>
                                            <div className="sim-face center-main"></div>
                                            <div className="sim-face bottom-left"></div>
                                        </div>

                                        {/* Simulated Captions */}
                                        <div className="caption-overlay">
                                            <div className="caption-text main-caption">
                                                Shoes Off, Take A Nap: Comedian Encourages Comfor
                                            </div>
                                            <div className="caption-text sub-caption highlight-box">
                                                <span className="highlight-word">Sir</span>, you took<br />your shoes off<br />already?
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="player-controls-strip">
                                    <div className="zoom-controls">
                                        <button className="ctrl-btn"><ZoomOut size={16} /></button>
                                        <div className="zoom-slider"><div className="zoom-track"></div><div className="zoom-thumb"></div></div>
                                        <button className="ctrl-btn"><ZoomIn size={16} /></button>
                                        <span className="zoom-level">110%</span>
                                    </div>

                                    <div className="playback-controls">
                                        <span className="time-display">00:00.0</span>
                                        <button className="play-btn"><Play size={20} fill="currentColor" /></button>
                                        <span className="time-display">00:58.6</span>
                                    </div>

                                    <div className="other-controls">
                                        <button className="ctrl-btn"><RotateCcw size={16} /></button>
                                    </div>
                                </div>

                                <div className="timeline-area">
                                    <div className="timeline-ruler">
                                        <div className="ruler-marker start">00:00.0</div>
                                        <div className="ruler-marker end">00:58.6</div>
                                    </div>
                                    <div className="timeline-tracks">
                                        <div className="playhead">
                                            <div className="playhead-line"></div>
                                            <div className="playhead-head"></div>
                                        </div>
                                        <div className="waveform-track">
                                            {/* Procedurally generate some bars for visual effect */}
                                            {[...Array(80)].map((_, i) => (
                                                <div key={i} className="waveform-bar" style={{ height: `${Math.max(10, Math.random() * 100)}%` }}></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </main>

                            {/* Right Sidebar - Inspector */}
                            <aside className="editor-sidebar right-sidebar">
                                <div className="inspector-header">
                                    <h3>Edit Text Style</h3>
                                    <button className="close-btn">×</button>
                                </div>

                                <div className="inspector-tabs">
                                    <button className="tab">Container</button>
                                    <button className="tab active">Text</button>
                                </div>

                                <div className="inspector-body">
                                    <div className="prop-group">
                                        <label><Type size={14} /> Font Family</label>
                                        <select className="prop-select" defaultValue="DynaPuff">
                                            <option value="DynaPuff">DynaPuff</option>
                                            <option value="Inter">Inter</option>
                                            <option value="Roboto">Roboto</option>
                                        </select>
                                    </div>

                                    <div className="prop-section">
                                        <div className="section-title">
                                            <span><Type size={14} /> Normal Text</span>
                                            <span className="collapse-icon">^</span>
                                        </div>

                                        <div className="prop-group">
                                            <div className="prop-label-row">
                                                <label>Font Size</label>
                                                <span className="prop-val">(52px)</span>
                                            </div>
                                            <div className="prop-slider">
                                                <div className="slider-track"><div className="slider-fill" style={{ width: '60%' }}></div></div>
                                                <div className="slider-thumb" style={{ left: '60%' }}></div>
                                            </div>
                                        </div>

                                        <div className="prop-group">
                                            <label>Text Color</label>
                                            <div className="color-picker">
                                                <div className="color-swatch" style={{ backgroundColor: '#ffffff' }}></div>
                                                <input type="text" value="#ffffff" readOnly />
                                            </div>
                                        </div>

                                        <div className="prop-group">
                                            <div className="prop-label-row">
                                                <label>Opacity (1)</label>
                                            </div>
                                            <div className="prop-slider">
                                                <div className="slider-track"><div className="slider-fill" style={{ width: '100%' }}></div></div>
                                                <div className="slider-thumb" style={{ left: '100%' }}></div>
                                            </div>
                                        </div>

                                        <div className="prop-group">
                                            <label>Formatting</label>
                                            <div className="formatting-btns">
                                                <button className="fmt-btn"><strong>B</strong></button>
                                                <button className="fmt-btn"><em>I</em></button>
                                                <button className="fmt-btn"><u>U</u></button>
                                                <button className="fmt-btn"><span style={{ textDecoration: 'line-through' }}>AB</span></button>
                                                <button className="fmt-btn">ab</button>
                                                <button className="fmt-btn">Aa</button>
                                            </div>
                                        </div>

                                        <div className="prop-group">
                                            <label>Line Height</label>
                                            <div className="number-input">
                                                <button className="num-btn">-</button>
                                                <input type="text" value="1.2" readOnly />
                                                <button className="num-btn">+</button>
                                            </div>
                                        </div>

                                        <div className="prop-group">
                                            <label>Word Spacing</label>
                                            <div className="number-input">
                                                <button className="num-btn">-</button>
                                                <input type="text" value="6" readOnly />
                                                <button className="num-btn">+</button>
                                            </div>
                                        </div>

                                        <div className="prop-group">
                                            <div className="prop-label-row">
                                                <label>Text Shadow</label>
                                                <span className="prop-val">Text Shadow</span>
                                            </div>
                                            <div className="shadow-inputs">
                                                <div className="s-ip"><label>X</label><input type="text" value="3" readOnly /></div>
                                                <div className="s-ip"><label>Y</label><input type="text" value="3" readOnly /></div>
                                                <div className="s-ip"><label>Blur</label><input type="text" value="0" readOnly /></div>
                                                <div className="s-ip"><label>Color</label><div className="color-sq black"></div></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Home3EditorShowcase;
