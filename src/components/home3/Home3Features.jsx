import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    Clock,
    UploadCloud,
    BarChart2,
    Smile,
    Maximize,
    MessageSquare,
    Share2,
    Radio
} from 'lucide-react'; // Assuming lucide-react or similar icons, using SVGs if not available
import './Home3Features.css';

gsap.registerPlugin(ScrollTrigger);

const Home3Features = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            const sections = gsap.utils.toArray('.feature-stage');

            sections.forEach((stage, i) => {
                const content = stage.querySelector('.stage-content');
                const visual = stage.querySelector('.stage-visual');
                const cards = stage.querySelectorAll('.home3-feature-card');

                // Directions alternates
                const xDir = i % 2 === 0 ? 100 : -100;

                // Animate content text normally
                gsap.fromTo(content,
                    { opacity: 0, x: -xDir },
                    {
                        opacity: 1, x: 0,
                        scrollTrigger: {
                            trigger: stage,
                            start: "top 80%",
                            end: "top 50%",
                            scrub: 1,
                        }
                    }
                );

                // For the cards, we want to PIN the stage and stack cards
                // Set initial state of cards: all pushed down except first? Or all in place?
                // Strategy: Cards start at y: 100% (hidden below).
                // We pin the stage for X screens height (based on card count).
                // We animate cards entering one by one.

                if (cards.length > 0) {
                    // Initialize cards: all invisible/below except first one maybe?
                    // actually, let's have them all enter from bottom.
                    gsap.set(cards, {
                        y: "120%", // Start further down to be completely off visual
                        opacity: 0,
                        zIndex: (i) => i + 1
                    });

                    // Specific timeline for this stage
                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: stage,
                            start: "top top", // Pin exactly when top touches viewport top
                            end: `+=${cards.length * 500}`, // Extended pinning duration
                            pin: true, // PIN THE STAGE
                            scrub: 1, // Smooth scrubbing
                            anticipatePin: 1
                        }
                    });

                    cards.forEach((card, index) => {
                        // Animate each card up to the CENTER
                        // Since container is relative, y:0 puts it at top-left.
                        // We want it centered. If card is 100% width/height of container, y:0 is fine.
                        // CSS sets width/height 100%, so y:0 is correct for filling the container.

                        tl.to(card, {
                            y: "0%",
                            opacity: 1,
                            duration: 1,
                            ease: "power2.out"
                        }, index * 1.5); // increased stagger for distinct "arrival"

                        // Scale down previous card to create depth/stack effect
                        if (index > 0) {
                            tl.to(cards[index - 1], {
                                scale: 0.9,
                                filter: "brightness(0.4)", // Darker brightness for depth
                                duration: 1
                            }, "<");
                        }
                    });
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const features = {
        liveCapture: [
            {
                title: 'Auto-Record',
                desc: 'Connects to Twitch/YouTube automatically. No OBS plugins needed.',
                icon: <Radio size={24} />,
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
                icon: <UploadCloud size={24} />,
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
            }
        ],
        aiIntelligence: [
            {
                title: 'Viral Scoring',
                desc: 'Every clip gets a 0-100 score based on engagement potential.',
                icon: <BarChart2 size={24} />,
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
                icon: <Smile size={24} />,
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
                icon: <Maximize size={24} />,
                visual: (
                    <div className="visual-crop">
                        <div className="crop-landscape">
                            <div className="crop-portrait"></div>
                        </div>
                    </div>
                )
            }
        ],
        distribution: [
            {
                title: 'Auto Captions',
                desc: '98% accurate subtitles generated instantly.',
                icon: <MessageSquare size={24} />,
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
                icon: <Share2 size={24} />,
                visual: (
                    <div className="visual-social">
                        <div className="social-icon tiktok"></div>
                        <div className="social-icon instagram"></div>
                        <div className="social-icon youtube"></div>
                        <div className="social-check">✓ Posted</div>
                    </div>
                )
            }
        ]
    };

    const renderFeatureCards = (items) => (
        <div className="feature-cards-grid">
            {items.map((item, i) => (
                <div key={i} className="home3-feature-card">
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
    );

    return (
        <section className="home3-features" ref={sectionRef}>
            {/* Stage 1: Live Capture */}
            <div className="feature-stage">
                <div className="stage-content">
                    <div className="stage-num">01</div>
                    <h3>Live Capture</h3>
                    <p>Connect your stream source instantly. No complex setup required.</p>
                </div>
                <div className="stage-visual">
                    {renderFeatureCards(features.liveCapture)}
                </div>
            </div>

            {/* Stage 2: AI Intelligence */}
            <div className="feature-stage reverse">
                <div className="stage-content">
                    <div className="stage-num">02</div>
                    <h3>AI Intelligence</h3>
                    <p>Our neural networks scan for engagement, excitement, and keywords.</p>
                </div>
                <div className="stage-visual">
                    {renderFeatureCards(features.aiIntelligence)}
                </div>
            </div>

            {/* Stage 3: Distribution */}
            <div className="feature-stage">
                <div className="stage-content">
                    <div className="stage-num">03</div>
                    <h3>Instant Distribution</h3>
                    <p>Post to TikTok and Shorts with one click while still live.</p>
                </div>
                <div className="stage-visual">
                    {renderFeatureCards(features.distribution)}
                </div>
            </div>
        </section>
    );
};

export default Home3Features;
