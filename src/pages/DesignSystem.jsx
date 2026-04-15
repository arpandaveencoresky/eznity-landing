import React, { useState } from 'react';

const SECTIONS = ['Colors', 'Typography', 'Components', 'Usage Examples'];

const DesignSystem = () => {
    const [activeTab, setActiveTab] = useState('Colors');

    return (
        <div style={{
            backgroundColor: 'var(--color-bg-dark)',
            color: 'var(--color-text-main)',
            minHeight: '100vh',
            fontFamily: 'var(--font-main)',
            position: 'relative' // Ensure sticky header works relative to this if needed, though window scroll is likely used
        }}>
            {/* Sticky Header */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backgroundColor: 'var(--color-navbar-bg)',
                borderBottom: '1px solid var(--color-navbar-border)',
                backdropFilter: 'blur(10px)',
                padding: '20px 24px 0 24px'
            }}>
                <div style={{ maxWidth: 'var(--container-width)', margin: '0 auto' }}>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        marginBottom: '20px',
                        letterSpacing: '-0.02em'
                    }}>Design System</h1>

                    <div style={{ display: 'flex', gap: '32px' }}>
                        {SECTIONS.map(section => (
                            <button
                                key={section}
                                onClick={() => setActiveTab(section)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '0 0 16px 0',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: activeTab === section ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                    borderBottom: activeTab === section ? '2px solid var(--color-primary)' : '2px solid transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {section}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div style={{
                maxWidth: 'var(--container-width)',
                margin: '0 auto',
                padding: '48px 24px 120px'
            }}>
                {activeTab === 'Colors' && <ColorsTab />}
                {activeTab === 'Typography' && <TypographyTab />}
                {activeTab === 'Components' && <ComponentsTab />}
                {activeTab === 'Usage Examples' && <UsageTab />}
            </div>
        </div>
    );
};

/* --- Tabs --- */

const ColorsTab = () => {
    const colorGroups = [
        {
            title: 'Backgrounds',
            tokens: [
                { name: '--color-bg-dark', label: 'Page Background' },
                { name: '--color-bg-card', label: 'Card Background' },
                { name: '--color-bg-card-hover', label: 'Card Hover' },
                { name: '--color-navbar-bg', label: 'Navbar Background' },
            ]
        },
        {
            title: 'Brand & Accents',
            tokens: [
                { name: '--color-primary', label: 'Primary Brand' },
                { name: '--color-primary-glow', label: 'Primary Glow (Alpha)' },
                { name: '--color-accent', label: 'Accent / Live' },
                { name: '--color-accent-glow', label: 'Accent Glow (Alpha)' },
            ]
        },
        {
            title: 'Text',
            tokens: [
                { name: '--color-text-main', label: 'Primary Text (Headings)' },
                { name: '--color-text-muted', label: 'Muted Text (Body)' },
                { name: '--color-text-on-dark', label: 'Text on Dark' },
                { name: '--color-text-inverse', label: 'Text Inverse' },
            ]
        },
        {
            title: 'Borders & Overlays',
            tokens: [
                { name: '--color-border', label: 'Default Border' },
                { name: '--color-border-hover', label: 'Hover Border' },
                { name: '--color-bg-overlay', label: 'Overlay' },
                { name: '--color-navbar-border', label: 'Navbar Border' },
            ]
        },
        {
            title: 'Lighting Effects',
            tokens: [
                { name: '--glow-stage-blue', label: 'Stage Blue' },
                { name: '--glow-stage-purple', label: 'Stage Purple' },
            ]
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {colorGroups.map(group => (
                <div key={group.title}>
                    <h2 style={{ fontSize: '18px', marginBottom: '24px', color: 'var(--color-text-main)' }}>{group.title}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
                        {group.tokens.map(token => (
                            <div key={token.name} style={{
                                backgroundColor: 'var(--color-bg-card)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '12px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '120px',
                                    backgroundColor: `var(${token.name})`,
                                    position: 'relative',
                                    borderBottom: '1px solid var(--color-border)'
                                }}>
                                    {/* Checkerboard for alpha transparency visualization */}
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        zIndex: -1,
                                        backgroundImage: 'linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)',
                                        backgroundSize: '20px 20px',
                                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                                        opacity: 0.2
                                    }} />
                                </div>
                                <div style={{ padding: '16px' }}>
                                    <p style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--color-text-main)' }}>{token.label}</p>
                                    <code style={{
                                        display: 'block',
                                        fontSize: '12px',
                                        color: 'var(--color-text-muted)',
                                        fontFamily: 'monospace',
                                        marginBottom: '12px'
                                    }}>{token.name}</code>
                                    <div style={{
                                        fontSize: '12px',
                                        color: 'var(--color-text-muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <span>Usage:</span>
                                        <code style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            padding: '2px 6px',
                                            borderRadius: '4px'
                                        }}>var({token.name})</code>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const TypographyTab = () => {
    const scales = [
        { el: 'h1', size: '2em', weight: '700', label: 'Heading 1' },
        { el: 'h2', size: '1.5em', weight: '700', label: 'Heading 2' },
        { el: 'h3', size: '1.17em', weight: '700', label: 'Heading 3' },
        { el: 'h4', size: '1em', weight: '700', label: 'Heading 4' },
        { el: 'p', size: '1em', weight: '400', label: 'Body Paragraph' },
        { el: 'small', size: '0.875em', weight: '400', label: 'Small / Caption', color: 'var(--color-text-muted)' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            <div>
                <h2 style={{ fontSize: '18px', marginBottom: '24px' }}>Type Scale (Inter)</h2>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '32px',
                    backgroundColor: 'var(--color-bg-card)',
                    padding: '40px',
                    borderRadius: '16px',
                    border: '1px solid var(--color-border)'
                }}>
                    {scales.map(scale => (
                        <div key={scale.label} style={{
                            borderBottom: '1px solid var(--color-border)',
                            paddingBottom: '24px',
                            display: 'grid',
                            gridTemplateColumns: '200px 1fr'
                        }}>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                <p style={{ fontWeight: '600', color: 'var(--color-text-main)', marginBottom: '4px' }}>{scale.label}</p>
                                <p>Font: Inter</p>
                                <p>Weight: {scale.weight}</p>
                                <p>Size: {scale.size}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <scale.el style={{
                                    margin: 0,
                                    fontSize: scale.size,
                                    fontWeight: scale.weight,
                                    color: scale.color || 'var(--color-text-main)'
                                }}>
                                    The quick brown fox jumps over the lazy dog.
                                </scale.el>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h2 style={{ fontSize: '18px', marginBottom: '24px' }}>Font Stacks</h2>
                <div style={{
                    backgroundColor: 'var(--color-bg-card)',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)'
                }}>
                    <code style={{ color: 'var(--color-primary)' }}>--font-main</code>
                    <p style={{ marginTop: '8px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                        'Inter', system-ui, -apple-system, sans-serif
                    </p>
                </div>
            </div>
        </div>
    );
};

const ComponentsTab = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

            {/* Buttons */}
            <ComponentSection title="Buttons" description="Standard interaction elements.">
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <button style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-text-main)',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '16px'
                    }}>Primary Action</button>

                    <button style={{
                        backgroundColor: 'var(--color-bg-overlay)',
                        color: 'var(--color-text-main)',
                        border: '1px solid var(--color-border)',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '16px'
                    }}>Secondary Action</button>

                    <button disabled style={{
                        backgroundColor: 'var(--color-bg-card)',
                        color: 'var(--color-text-muted)',
                        border: '1px solid var(--color-border)',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '16px',
                        cursor: 'not-allowed',
                        opacity: 0.6
                    }}>Disabled</button>
                </div>
                <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Uses: <code>--color-primary</code>, <code>--color-bg-overlay</code>, <code>--color-border</code>
                </div>
            </ComponentSection>

            {/* Live Badges */}
            <ComponentSection title="Status Indicators" description="Used for real-time status updates.">
                <div className="live-badge">
                    <div className="live-dot"></div>
                    <span>Live Now</span>
                </div>
                <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Uses: <code>.live-badge</code> class from index.css (relies on <code>--color-accent</code>)
                </div>
            </ComponentSection>

            {/* Inputs */}
            <ComponentSection title="Form Inputs" description="Standard input fields for user data.">
                <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-muted)' }}>Email Address</label>
                        <input type="text" placeholder="name@example.com" style={{
                            width: '100%',
                            backgroundColor: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            padding: '12px',
                            borderRadius: '8px',
                            color: 'var(--color-text-main)',
                            outline: 'none'
                        }} />
                    </div>
                </div>
            </ComponentSection>

            {/* Cards */}
            <ComponentSection title="Cards" description="Containers for content grouping.">
                <div style={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '16px',
                    padding: '24px',
                    maxWidth: '400px'
                }}>
                    <h3 style={{ marginBottom: '8px' }}>Feature Card</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
                        This card serves as a container for concise content. It uses the standard card background token.
                    </p>
                </div>
            </ComponentSection>

        </div>
    );
};

const UsageTab = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            <div style={{ border: '1px dashed var(--color-border)', padding: '24px', borderRadius: '16px' }}>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontStyle: 'italic' }}>
                    Example: User Dashboard Composition
                </p>
                {/* Mock Dashboard UI */}
                <div style={{
                    backgroundColor: 'var(--color-bg-dark)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    maxWidth: '800px',
                    margin: '0 auto'
                }}>
                    {/* Mock Nav */}
                    <div style={{
                        backgroundColor: 'var(--color-navbar-bg)',
                        borderBottom: '1px solid var(--color-navbar-border)',
                        padding: '16px 24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontWeight: '900', letterSpacing: '-0.05em' }}>EZN!TY</span>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div className="live-badge" style={{ transform: 'scale(0.8)' }}>
                                <div className="live-dot"></div>
                                <span>Live</span>
                            </div>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }}></div>
                        </div>
                    </div>

                    {/* Mock Content */}
                    <div style={{ padding: '32px' }}>
                        <h2 style={{ marginBottom: '8px' }}>Overview</h2>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>Welcome back to your dashboard.</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div style={{
                                backgroundColor: 'var(--color-bg-card)',
                                padding: '24px',
                                borderRadius: '12px',
                                border: '1px solid var(--color-border)'
                            }}>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Total Views</p>
                                <p style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>124,592</p>
                            </div>
                            <div style={{
                                backgroundColor: 'var(--color-bg-card)',
                                padding: '24px',
                                borderRadius: '12px',
                                border: '1px solid var(--color-border)'
                            }}>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Active Sessions</p>
                                <p style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px', color: 'var(--color-accent)' }}>1,204</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const ComponentSection = ({ title, description, children }) => (
    <div>
        <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{title}</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{description}</p>
        </div>
        <div style={{
            padding: '40px',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            backgroundColor: 'rgba(255,255,255,0.02)'
        }}>
            {children}
        </div>
    </div>
);

export default DesignSystem;
