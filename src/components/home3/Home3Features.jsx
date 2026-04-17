import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    Radio,
    UploadCloud,
    BarChart2,
    Maximize,
    MessageSquare,
    Share2,
} from 'lucide-react';
import './Home3Features.css';

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════
   Card visual components
   ══════════════════════════════ */

const AutoRecordVisual = () => (
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
);

const ZeroUploadsVisual = () => (
    <div className="visual-network">
        <div className="net-node stream-src">Stream</div>
        <div className="net-flow">
            <span className="flow-arrow"></span>
            <span className="flow-arrow delay-1"></span>
            <span className="flow-arrow delay-2"></span>
        </div>
        <div className="net-node cloud-dest">Cloud</div>
    </div>
);

const ViralScoringVisual = () => (
    <div className="visual-score">
        <div className="score-gauge">
            <svg viewBox="0 0 100 50" className="gauge-svg">
                <path d="M10,50 A40,40 0 1,1 90,50" className="gauge-bg"   fill="none" stroke="#222"    strokeWidth="8" />
                <path d="M10,50 A40,40 0 1,1 90,50" className="gauge-fill" fill="none" stroke="#8b5cf6" strokeWidth="8" strokeDasharray="126" strokeDashoffset="10" />
            </svg>
            <div className="score-val">98</div>
        </div>
    </div>
);

const SmartFramingVisual = () => (
    <div className="visual-crop">
        <div className="crop-landscape">
            <div className="crop-portrait"></div>
        </div>
    </div>
);

const AutoCaptionsVisual = () => (
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
);

const OneClickPostVisual = () => (
    <div className="visual-social">
        <div className="social-icon tiktok"></div>
        <div className="social-icon instagram"></div>
        <div className="social-icon youtube"></div>
        <div className="social-check">✓ Posted</div>
    </div>
);

/* ══════════════════════════════
   Feature card
   ══════════════════════════════ */
const FeatureCard = ({ icon, title, desc, visual }) => (
    <div className="feature-card">
        <div className="feature-card-header">
            <div className="feature-icon">{icon}</div>
            <h4 className="feature-card-title">{title}</h4>
        </div>
        <p className="feature-card-desc">{desc}</p>
        <div className="feature-card-preview">
            {visual}
        </div>
    </div>
);

/* ══════════════════════════════
   Section rows data
   ══════════════════════════════ */
const ROWS = [
    {
        num: '01',
        title: 'Live Capture',
        desc: 'Connect your stream source instantly. No complex setup required.',
        reversed: false,
        cards: [
            {
                icon: <Radio size={24} />,
                title: 'Auto-Record',
                desc: 'Connects to Twitch/YouTube automatically. No OBS plugins needed.',
                visual: <AutoRecordVisual />,
            },
            {
                icon: <UploadCloud size={24} />,
                title: 'Zero Uploads',
                desc: 'We process the stream directly. Save your bandwidth.',
                visual: <ZeroUploadsVisual />,
            },
        ],
    },
    {
        num: '02',
        title: 'AI Intelligence',
        desc: 'Our neural networks scan for engagement, excitement, and keywords.',
        reversed: true,
        cards: [
            {
                icon: <BarChart2 size={24} />,
                title: 'Viral Scoring',
                desc: 'Every clip gets a 0–100 score based on engagement potential.',
                visual: <ViralScoringVisual />,
            },
            {
                icon: <Maximize size={24} />,
                title: 'Smart Framing',
                desc: 'Auto-crops to 9:16 keeping the action centered.',
                visual: <SmartFramingVisual />,
            },
        ],
    },
    {
        num: '03',
        title: 'Instant Distribution',
        desc: 'Post to TikTok and Shorts with one click while still live.',
        reversed: false,
        cards: [
            {
                icon: <MessageSquare size={24} />,
                title: 'Auto Captions',
                desc: '98% accurate subtitles generated instantly.',
                visual: <AutoCaptionsVisual />,
            },
            {
                icon: <Share2 size={24} />,
                title: 'One-Click Post',
                desc: 'Share to TikTok, Reels, and Shorts directly.',
                visual: <OneClickPostVisual />,
            },
        ],
    },
];

/* ══════════════════════════════
   Main component
   ══════════════════════════════ */
const Home3Features = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const tweens = [];
        const rowEls = gsap.utils.toArray('.feature-row', sectionRef.current);

        rowEls.forEach((row) => {
            const text  = row.querySelector('.feature-text');
            const cards = Array.from(row.querySelectorAll('.feature-card'));

            const t = gsap.fromTo(
                [text, ...cards],
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    stagger: 0.12,
                    duration: 0.75,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: row,
                        start: 'top 78%',
                        once: true,
                    },
                }
            );
            tweens.push(t);
        });

        return () => tweens.forEach((t) => t.kill());
    }, []);

    return (
        <section className="home3-features" ref={sectionRef}>
            {ROWS.map((row) => (
                <div
                    key={row.num}
                    className={`feature-row${row.reversed ? ' feature-row--reversed' : ''}`}
                >
                    <div className="feature-text">
                        <div className="step-ghost">{row.num}</div>
                        <h3 className="feature-title">{row.title}</h3>
                        <p className="feature-desc">{row.desc}</p>
                    </div>

                    <div className="feature-cards">
                        {row.cards.map((card) => (
                            <FeatureCard key={card.title} {...card} />
                        ))}
                    </div>
                </div>
            ))}
        </section>
    );
};

export default Home3Features;
