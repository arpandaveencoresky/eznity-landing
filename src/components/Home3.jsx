import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Home3Hero from './home3/Home3Hero';
import Home3SystemReveal from './home3/Home3SystemReveal';
import Home3Timeline from './home3/Home3Timeline';
import Home3Features from './home3/Home3Features';
import Home3Personas from './home3/Home3Personas';
import Home3EditorShowcase from './home3/Home3EditorShowcase';
import Home3CTA from './home3/Home3CTA';

gsap.registerPlugin(ScrollTrigger);

const Home3 = () => {
    // After all pinned sections mount, refresh ScrollTrigger so pin
    // spacers and scroll distances are calculated from the correct layout.
    useEffect(() => {
        const id = setTimeout(() => ScrollTrigger.refresh(), 200);
        return () => clearTimeout(id);
    }, []);

    return (
        <div style={{ backgroundColor: '#050505', minHeight: '100vh' }}>
            <Home3Hero />
            <Home3Personas />
            <Home3Timeline />
            <Home3SystemReveal />
            <Home3Features />
            <Home3EditorShowcase />
            <Home3CTA />
        </div>
    );
};

export default Home3;
