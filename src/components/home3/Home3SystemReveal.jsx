import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Home3SystemReveal.css';

gsap.registerPlugin(ScrollTrigger);

const Home3SystemReveal = () => {
    const containerRef = useRef(null);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            const container = containerRef.current;
            const scrollContainer = scrollContainerRef.current;

            const sections = gsap.utils.toArray(".reveal-step");
            const totalSections = sections.length;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: container,
                    pin: true,
                    scrub: 1,
                    // base vertical scrolling amount on how wide the container is so it feels natural.
                    end: () => "+=" + scrollContainer.offsetWidth,
                }
            });

            // Move the sections horizontally
            tl.to(sections, {
                xPercent: -100 * (totalSections - 1),
                ease: "none",
                duration: totalSections - 1 // Use a duration that matches the number of transitions
            });

            // Animate connector lines
            // We want step-1 line to grow as we move from step 1 to 2 (time 0 to 1)
            tl.fromTo(".step-1 .connector-line",
                { scaleX: 0 },
                { scaleX: 1, duration: 1, ease: "power2.out" },
                0 // Start at time 0
            );

            // step-2 line grows as we move from step 2 to 3 (time 1 to 2)
            tl.fromTo(".step-2 .connector-line",
                { scaleX: 0 },
                { scaleX: 1, duration: 1, ease: "power2.out" },
                1 // Start at time 1
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="home3-system-reveal" ref={containerRef}>
            <div className="reveal-wrapper" ref={scrollContainerRef}>
                {/* Step 1 */}
                <div className="reveal-step step-1">
                    <div className="step-content">
                        <div className="step-number">01</div>
                        <div className="step-icon youtube-icon">▶</div>
                        <h2>You Go Live</h2>
                        <p>Stream to Twitch or YouTube as usual.</p>
                    </div>
                    <div className="connector-line"></div>
                </div>

                {/* Step 2 */}
                <div className="reveal-step step-2">
                    <div className="step-content">
                        <div className="step-number">02</div>
                        <div className="step-icon ai-orb">
                            <div className="orb-pulse"></div>
                        </div>
                        <h2>AI Watches</h2>
                        <p>Our algorithms analyze audio, visual, and chat cues.</p>
                    </div>
                    <div className="connector-line"></div>
                </div>

                {/* Step 3 */}
                <div className="reveal-step step-3">
                    <div className="step-content">
                        <div className="step-number">03</div>
                        <div className="step-icon clips-card">
                            <span className="clip-check">✓</span>
                        </div>
                        <h2>Clips Ready</h2>
                        <p>Viral moments are captured and formatted instantly.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Home3SystemReveal;
