import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': '#0a0a0f',
                'bg-secondary': '#12121a',
                'neon-green': '#00ff88',
                'text-primary': '#ffffff',
                'text-secondary': '#a0a0a0',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'neon': '0 0 20px rgba(0, 255, 136, 0.5)',
                'glass': '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 255, 136, 0.1)',
            },
            animation: {
                'pulse-slow': 'pulse 1.5s ease-in-out infinite',
            },
        },
    },
    plugins: [],
};

export default config;
