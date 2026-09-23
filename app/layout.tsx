import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://wattwise.vercel.app'),
    title: {
        default: 'WattWise | Solar Intelligence Platform',
        template: '%s | WattWise',
    },
    description: 'AI-powered solar energy forecasting, real-time weather intelligence, and ROI optimisation for Indian solar panel owners. Predict 24-hour output, reduce bills, and maximise savings.',
    keywords: [
        'solar energy dashboard',
        'solar prediction India',
        'AI solar forecasting',
        'solar panel output calculator',
        'renewable energy India',
        'solar ROI calculator',
        'WattWise solar',
        'solar energy savings India',
    ],
    authors: [{ name: 'WattWise Team' }],
    creator: 'WattWise',
    publisher: 'WattWise',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        title: 'WattWise — Solar Intelligence Platform',
        description: 'AI-powered solar forecasting, real-time weather, and financial optimisation for Indian solar installations.',
        url: 'https://wattwise.vercel.app',
        siteName: 'WattWise',
        type: 'website',
        locale: 'en_IN',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'WattWise Solar Intelligence Dashboard Preview',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'WattWise | Solar Intelligence Platform',
        description: 'AI-powered solar forecasting and energy optimisation for India.',
        images: ['/og-image.png'],
    },
    alternates: {
        canonical: '/',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.variable}>
            <head>
                <link rel="icon" href="/favicon.png" type="image/png" />
                <link rel="apple-touch-icon" href="/favicon.png" />
                <meta name="theme-color" content="#09090F" />
                {/* JetBrains Mono for data values — loaded separately as it's not in next/font/google subset */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body style={{ fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}>
                <div style={{ display: 'flex', minHeight: '100vh' }}>

                    {/* ── Sidebar ── */}
                    <aside className="sidebar print:hidden">
                        {/* Logo */}
                        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--b1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                    background: 'var(--blue-dim)', border: '1px solid rgba(59,130,246,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 15,
                                }}>
                                    ⚡
                                </div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--t1)' }}>WattWise</div>
                                    <div style={{ fontSize: 10, color: 'var(--t3)', letterSpacing: '0.04em', marginTop: 1 }}>Solar Intelligence</div>
                                </div>
                            </div>
                        </div>

                        {/* Nav */}
                        <nav style={{ padding: '12px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
                            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--t4)', padding: '4px 10px 8px' }}>
                                Platform
                            </div>
                            <a href="/" className="sidebar-link">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/>
                                    <rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
                                </svg>
                                Dashboard
                            </a>
                            <a href="#energy-flow" className="sidebar-link">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                                </svg>
                                Energy Flow
                            </a>
                            <a href="#heatmap" className="sidebar-link">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" x2="8" y1="2" y2="18"/><line x1="16" x2="16" y1="6" y2="22"/>
                                </svg>
                                Solar Heatmap
                            </a>
                            <a href="#forecast" className="sidebar-link">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
                                </svg>
                                7-Day Forecast
                            </a>
                            <a href="#load-dispatcher" className="sidebar-link">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                </svg>
                                Load Dispatcher
                            </a>
                            <a href="#ev-sync" className="sidebar-link">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.8 2 11 2 11.3V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
                                </svg>
                                EV Solar Sync
                            </a>
                            <a href="/experiment" className="sidebar-link">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
                                </svg>
                                Experiment
                            </a>
                            <a href="#battery" className="sidebar-link">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="16" height="10" x="2" y="7" rx="2"/><line x1="22" x2="22" y1="11" y2="13"/>
                                </svg>
                                Battery Optimizer
                            </a>
                            <a href="#outage-planner" className="sidebar-link">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                                </svg>
                                Outage Survival
                            </a>

                            <div style={{ margin: '8px 0', borderTop: '1px solid var(--b1)' }} />
                            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--t4)', padding: '4px 10px 8px' }}>
                                Analysis & Geometry
                            </div>
                            <a href="#geometry" className="sidebar-link">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                                </svg>
                                3D Roof Tilt
                            </a>
                            <a href="#calculator" className="sidebar-link">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01"/>
                                </svg>
                                Financial / Subsidy
                            </a>
                            <a href="#analytics" className="sidebar-link">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>
                                </svg>
                                History & Export
                            </a>
                            <a href="#diagnostics" className="sidebar-link">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/>
                                </svg>
                                Fault Diagnostics
                            </a>
                            <a href="#health" className="sidebar-link">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                                </svg>
                                Panel Health
                            </a>
                            <a href="#goals" className="sidebar-link">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                                </svg>
                                Savings Goal
                            </a>
                        </nav>


                        {/* Footer */}
                        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--b1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                                <div className="live-dot" />
                                <span style={{ fontSize: 12, color: 'var(--t2)' }}>Live data active</span>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--t3)' }}>v2.0 · India Weather API</div>
                        </div>
                    </aside>

                    {/* ── Main ── */}
                    <div className="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        {/* Top bar */}
                        <header style={{
                            height: 'var(--topbar-h)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '0 28px', borderBottom: '1px solid var(--b1)',
                            background: 'rgba(9,9,15,0.85)', backdropFilter: 'blur(12px)',
                            position: 'sticky', top: 0, zIndex: 30,
                        }} className="print:hidden">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 13, color: 'var(--t3)' }}>WattWise</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--t3)' }}>
                                    <polyline points="9 18 15 12 9 6"/>
                                </svg>
                                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)' }}>Dashboard</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="badge badge-blue">⚡ ML v2.0</span>
                                <span className="badge badge-green">
                                    <span className="live-dot" style={{ width: 5, height: 5 }} />
                                    Live
                                </span>
                            </div>
                        </header>

                        {/* Page content */}
                        <main style={{ padding: '28px', flex: 1 }}>
                            {children}
                        </main>
                    </div>
                </div>
            </body>
        </html>
    );
}
