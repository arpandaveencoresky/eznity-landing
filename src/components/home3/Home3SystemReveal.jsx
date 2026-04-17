import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Home3SystemReveal.css';

gsap.registerPlugin(ScrollTrigger);

/* ── Step video previews ── */

const LivePreview = () => (
    <div className="step-preview live-preview">
        <video autoPlay muted loop playsInline className="step-video">
            <source src="/videos/simulation.mp4" type="video/mp4" />
        </video>
        <div className="preview-live-badge">
            <span className="badge-dot"></span> LIVE
        </div>
        <div className="preview-viewer-count">12.4k watching</div>
    </div>
);

const AiScanPreview = () => (
    <div className="step-preview ai-preview">
        <div className="ai-spin-ring"></div>
        <div className="ai-spin-ring ring-2"></div>

        <video autoPlay muted loop playsInline className="step-video">
            <source src="/videos/simulation.mp4" type="video/mp4" />
        </video>

        <div className="ai-scan-line"></div>

        <div className="cbracket tl"></div>
        <div className="cbracket tr"></div>
        <div className="cbracket bl"></div>
        <div className="cbracket br"></div>

        <div className="ai-analyzing-label">
            <span className="analyzing-dot"></span>
            Analyzing…
        </div>
    </div>
);

const ClipReadyPreview = () => (
    <div className="step-preview clip-preview">
        <div className="reel-frame">
            <video autoPlay muted loop playsInline className="step-video reel-video">
                <source src="/videos/simulation.mp4" type="video/mp4" />
            </video>
            <div className="clip-ready-badge">
                <svg width="11" height="11" viewBox="0 0 12 12">
                    <polyline points="1.5 6 4.5 9 10.5 3" fill="none" stroke="#00e676"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Clip Ready
            </div>
            <div className="reel-social-row">
                <span className="reel-platform tk" title="TikTok"></span>
                <span className="reel-platform ig" title="Instagram"></span>
                <span className="reel-platform yt" title="YouTube"></span>
            </div>
        </div>
    </div>
);

/* ── Step data ── */
const steps = [
    {
        num: '01',
        preview: <LivePreview />,
        title: 'You Go Live',
        desc: 'Stream to Twitch or YouTube as usual. No OBS plugins or setup required.',
    },
    {
        num: '02',
        preview: <AiScanPreview />,
        title: 'AI Watches',
        desc: 'Our models scan audio, chat energy, and visual cues in real time.',
    },
    {
        num: '03',
        preview: <ClipReadyPreview />,
        title: 'Clips Ready',
        desc: 'Viral-worthy shorts are generated and ready to post before you sign off.',
    },
];

/* ── Component ── */
const Home3SystemReveal = () => {
    const sectionRef = useRef(null);
    const trackRef   = useRef(null);

    useEffect(() => {
        const mm = gsap.matchMedia();

        mm.add('(min-width: 769px)', () => {
            const section      = sectionRef.current;
            const track        = trackRef.current;
            const stepEls      = gsap.utils.toArray('.reveal-step', section);
            const connLines    = gsap.utils.toArray('.connector-line', section);
            const connWrappers = gsap.utils.toArray('.connector-wrapper', section);

            // ── x so step[i] is centred in the viewport ──
            const xForStep = (i) => {
                const vw = section.offsetWidth;
                const s  = stepEls[i];
                return vw / 2 - (s.offsetLeft + s.offsetWidth / 2);
            };

            // ── x so ALL steps + connectors are centred as a whole ──
            const xForAll = () => (section.offsetWidth - track.scrollWidth) / 2;

            // Step 2 starts slightly off-screen right
            gsap.set(stepEls[1], { x: 80, opacity: 0 });

            // Connector-wrapper 2 AND step 3 start together at the same offset →
            // they will always be flush: no gap between connector end and step 3.
            gsap.set([connWrappers[1], stepEls[2]], { x: 160 });
            gsap.set(stepEls[2], { opacity: 0 });  // step 3 also fades in

            // Both connector lines start invisible (drawn by scaleX)
            gsap.set(connLines, { scaleX: 0 });

            // ── Master scrubbed timeline ──
            //
            //  Track: step-1-centred → all-three-centred  (single linear move)
            //  t 0.05–0.37  Connector 1 grows
            //  t 0.15–0.51  Step 2 slides in
            //  t 0.50–0.86  Connector-wrapper 2 + Step 3 slide in together (flush)
            //  t 0.62–0.94  Connector 2 line grows (after they've settled)
            //
            const tl = gsap.timeline({ paused: true });

            // Track slides from step-1-centred to all-centred
            tl.fromTo(track,
                { x: () => xForStep(0) },
                { x: () => xForAll(),   ease: 'none', duration: 1 },
                0
            );

            // ── Phase 1: connector 1 + step 2 ──
            tl.fromTo(connLines[0],
                { scaleX: 0 },
                { scaleX: 1, ease: 'power1.inOut', duration: 0.32 },
                0.05
            );
            tl.fromTo(stepEls[1],
                { x: 80, opacity: 0 },
                { x: 0,  opacity: 1, ease: 'power2.out', duration: 0.36 },
                0.15
            );

            // ── Phase 2: connector-wrapper 2 + step 3 slide in as a unit ──
            // Both start at x:160 and land at x:0 together → always flush
            tl.fromTo([connWrappers[1], stepEls[2]],
                { x: 160 },
                { x: 0, ease: 'power2.out', duration: 0.36 },
                0.50
            );
            // Step 3 fades in at the same time
            tl.fromTo(stepEls[2],
                { opacity: 0 },
                { opacity: 1, ease: 'power2.out', duration: 0.36 },
                0.50
            );
            // Connector 2 line draws after the group has settled
            tl.fromTo(connLines[1],
                { scaleX: 0 },
                { scaleX: 1, ease: 'power1.inOut', duration: 0.32 },
                0.62
            );

            // ── ScrollTrigger: pin + scrub ──
            const getScrollDist = () => Math.abs(xForStep(0) - xForAll());

            ScrollTrigger.create({
                trigger: section,
                start: 'top top',
                end: () => `+=${getScrollDist() * 2.2}`,
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                animation: tl,
                onRefresh: () => {
                    if (!ScrollTrigger.isScrolling()) {
                        gsap.set(track, { x: xForStep(0) });
                    }
                },
            });
        });

        // Mobile: simple vertical stagger — no horizontal scroll
        mm.add('(max-width: 768px)', () => {
            const stepEls   = gsap.utils.toArray('.reveal-step', sectionRef.current);
            const connLines = gsap.utils.toArray('.connector-line', sectionRef.current);

            // Reset any transforms applied from desktop match
            gsap.set([...stepEls, ...connLines], { clearProps: 'all' });

            gsap.fromTo(
                stepEls,
                { y: 48, opacity: 0 },
                {
                    y: 0, opacity: 1, stagger: 0.2, duration: 0.65, ease: 'power3.out',
                    scrollTrigger: { trigger: sectionRef.current, start: 'top 72%', once: true },
                }
            );

            gsap.fromTo(
                connLines,
                { scaleX: 0 },
                {
                    scaleX: 1, stagger: 0.2, duration: 0.45, ease: 'power2.out', delay: 0.3,
                    scrollTrigger: { trigger: sectionRef.current, start: 'top 72%', once: true },
                }
            );
        });

        return () => mm.revert();
    }, []);

    return (
        <section className="home3-system-reveal" ref={sectionRef}>
            <div className="reveal-header">
                <span className="section-eyebrow">How it works</span>
                <h2>Three steps. <span className="eyebrow-accent">Zero effort.</span></h2>
            </div>

            {/* overflow wrapper clips steps sliding in/out */}
            <div className="reveal-overflow">
                <div className="reveal-track" ref={trackRef}>
                    {steps.map((step, i) => (
                        <React.Fragment key={step.num}>
                            <div className="reveal-step">
                                <div className="step-num-label">{step.num}</div>
                                <div className="step-preview-area">
                                    {step.preview}
                                </div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </div>

                            {i < steps.length - 1 && (
                                <div className="connector-wrapper">
                                    <div className="connector-line"></div>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Home3SystemReveal;
