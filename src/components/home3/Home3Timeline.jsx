import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Home3Timeline.css';

gsap.registerPlugin(ScrollTrigger);

const Home3Timeline = () => {
    const sectionRef = useRef(null);
    const playheadRef = useRef(null);
    const spikesRef = useRef([]);

    useEffect(() => {
        let ctx = gsap.context(() => {
            const section = sectionRef.current;
            const playhead = playheadRef.current;
            const spikes = spikesRef.current; // Array of spike elements

            // Pin the timeline section
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: "center center",
                    end: "+=150%", // Long duration for interaction
                    pin: true,
                    scrub: 1,
                }
            });

            // Move Playhead
            tl.to(playhead, {
                left: "100%",
                ease: "none"
            });

            // Animate spikes as playhead passes
            spikes.forEach((spike, i) => {
                // Calculate progress point for this spike
                if (!spike) return; // Guard against null refs
                const progress = i / spikes.length;

                tl.to(spike, {
                    scaleY: 1.5,
                    backgroundColor: "#ff2a6d",
                    duration: 0.1,
                    ease: "power2.out",
                    yoyo: true, // Go back down? maybe stay up? "Highlight spikes animate upward"
                }, progress * 0.9); // Sync with playhead (approx)

                // Revert spike style after playhead passes? Keep it highlighted?
                // "Highlight spikes animate upward" - let's keep it simple, they pop scaleY
                tl.to(spike, {
                    scaleY: 1,
                    backgroundColor: "#444",
                    duration: 0.3,
                }, (progress * 0.9) + 0.1);

                // Show label when passing significant spikes
                if (spike.getAttribute("data-label")) {
                    const label = spike.querySelector('.spike-label');
                    if (label) {
                        tl.fromTo(label,
                            { opacity: 0, y: 10 },
                            { opacity: 1, y: -20, duration: 0.2 },
                            progress * 0.9
                        );
                    }
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const addToRefs = (el) => {
        if (el && !spikesRef.current.includes(el)) {
            spikesRef.current.push(el);
        }
    };

    // Generate dummy spikes
    const spikeData = Array.from({ length: 40 }).map((_, i) => ({
        height: Math.random() * 60 + 20 + "%",
        label: (i === 10) ? "High Emotion" : (i === 25) ? "Chat Spike" : null
    }));

    return (
        <section className="home3-timeline-section" ref={sectionRef}>
            <div className="section-header">
                <h2>Precision Moment Detection</h2>
                <p>Scroll to scan the stream timeline</p>
            </div>

            <div className="timeline-container">
                <div className="timeline-track">
                    {spikeData.map((data, i) => (
                        <div
                            key={i}
                            className={`spike ${data.label ? 'significant' : ''}`}
                            ref={addToRefs}
                            style={{ height: data.height }}
                            data-label={data.label}
                        >
                            {data.label && (
                                <div className="spike-label">{data.label}</div>
                            )}
                            {data.label && (
                                <div className="spike-tooltip">
                                    <div className="tooltip-preview"></div>
                                    <span>Watch Clip</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="playhead" ref={playheadRef}></div>
            </div>
        </section>
    );
};

export default Home3Timeline;
