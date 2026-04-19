import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "WattWise | Smart Solar Energy Dashboard",
    description: "Intelligent solar energy forecasting and cost optimization powered by AI. Real-time predictions, ML-driven insights, and weather-based recommendations for maximum solar efficiency.",
    keywords: "solar energy, solar prediction, renewable energy, AI solar, machine learning, weather forecast, energy optimization",
    authors: [{ name: "WattWise Team" }],
    openGraph: {
        title: "WattWise - Smart Solar Energy Dashboard",
        description: "AI-powered solar forecasting and optimization",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body className={inter.className}>
                <div className="min-h-screen bg-slate-950 text-white">
                    <header className="border-b border-white/10 bg-slate-900/80 p-4 backdrop-blur-md">
                        <nav className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4">
                            <div className="text-lg font-semibold tracking-tight">WattWise</div>
                            <div className="flex items-center gap-4 text-sm">
                                <a href="/" className="text-white/80 transition hover:text-white">Home</a>
                                <a href="/experiment" className="text-white/80 transition hover:text-white">Experiment Mode</a>
                            </div>
                        </nav>
                    </header>
                    <main>{children}</main>
                </div>
            </body>
        </html>
    );
}
