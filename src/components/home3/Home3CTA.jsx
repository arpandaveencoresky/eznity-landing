import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Home3CTA.css';

gsap.registerPlugin(ScrollTrigger);

const Home3CTA = () => {
    const sectionRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            const section = sectionRef.current;
            const content = contentRef.current;

            gsap.fromTo(content,
                { y: 50, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    duration: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 70%",
                    }
                }
            );

            // Subtly animate the background gradient
            gsap.to(section, {
                backgroundPosition: "100% 50%",
                duration: 10,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="home3-cta" ref={sectionRef}>
            <div className="cta-content" ref={contentRef}>
                <h2>Ready to turn your stream into gold?</h2>
                <div className="cta-glow-container">
                    <button className="btn-primary" style={{ fontSize: '1.25rem', padding: '16px 32px' }}>
                        Start for Free
                    </button>
                    <div className="ambient-glow"></div>
                </div>
            </div>
        </section>
    );
};

export default Home3CTA;
