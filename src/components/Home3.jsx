import React from 'react';
import Home3Hero from './home3/Home3Hero';
import Home3SystemReveal from './home3/Home3SystemReveal';
import Home3Timeline from './home3/Home3Timeline';
import Home3Features from './home3/Home3Features';
import Home3Personas from './home3/Home3Personas';
import Home3EditorShowcase from './home3/Home3EditorShowcase';
import Home3CTA from './home3/Home3CTA';

const Home3 = () => {
    return (
        <div style={{ backgroundColor: '#050505', minHeight: '100vh' }}>
            <Home3Hero />
            <Home3SystemReveal />
            <Home3Timeline />
            <Home3Features />
            <Home3Personas />
            <Home3EditorShowcase />
            <Home3CTA />
        </div>
    );
};

export default Home3;
