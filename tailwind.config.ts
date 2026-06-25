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
                // Backgrounds — deep navy, not pure black
                'base':    '#09090F',
                'surface': '#0F0F17',
                'raised':  '#16161F',
                'overlay': '#1C1C28',
                // Accents
                'blue':        '#3B82F6',
                'blue-bright': '#60A5FA',
                'blue-dim':    'rgba(59,130,246,0.12)',
                'green':        '#22C55E',
                'green-bright': '#4ADE80',
                'green-dim':    'rgba(34,197,94,0.10)',
                'amber':        '#F59E0B',
                'amber-bright': '#FCD34D',
                'amber-dim':    'rgba(245,158,11,0.10)',
                'red':          '#EF4444',
                'red-dim':      'rgba(239,68,68,0.10)',
                // Text scale
                't1': '#F1F1F3',
                't2': '#9898A6',
                't3': '#4A4A5A',
                // Borders
                'b1': 'rgba(255,255,255,0.07)',
                'b2': 'rgba(255,255,255,0.12)',
                // Legacy aliases
                'neon-green':     '#22C55E',
                'text-primary':   '#F1F1F3',
                'text-secondary': '#9898A6',
                'bg-primary':     '#09090F',
                'bg-secondary':   '#0F0F17',
            },
            fontFamily: {
                sans:    ['Inter', 'system-ui', 'sans-serif'],
                display: ['Inter', 'system-ui', 'sans-serif'],
                mono:    ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
            },
            boxShadow: {
                'card':      '0 1px 4px rgba(0,0,0,0.5)',
                'card-hover':'0 4px 20px rgba(0,0,0,0.6)',
                'dropdown':  '0 12px 48px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)',
                'blue-ring': '0 0 0 3px rgba(59,130,246,0.2)',
                'green-glow':'0 0 24px rgba(34,197,94,0.2)',
                'amber-glow':'0 0 24px rgba(245,158,11,0.2)',
                'glass':     '0 8px 32px rgba(0,0,0,0.4)',
            },
            animation: {
                'enter':     'enter 0.25s ease both',
                'fade-up':   'fadeUp 0.3s ease both',
                'pulse-dot': 'pulseDot 2s ease-out infinite',
                'value-in':  'valueIn 0.25s ease',
                'bar-grow':  'barGrow 0.8s cubic-bezier(0.4,0,0.2,1) both',
                // legacy
                'pulse-slow':    'pulseDot 2s ease-out infinite',
                'float':         'none',
                'float-delay':   'none',
                'float-slow':    'none',
                'slide-up':      'enter 0.25s ease both',
                'slide-in-right':'enter 0.25s ease both',
                'fade-in-up':    'fadeUp 0.3s ease both',
                'glow-pulse':    'none',
                'toast-in':      'toastIn 0.3s ease both',
                'toast-out':     'toastOut 0.2s ease both',
            },
            keyframes: {
                enter: {
                    from: { opacity: '0', transform: 'translateY(8px)' },
                    to:   { opacity: '1', transform: 'translateY(0)' },
                },
                fadeUp: {
                    from: { opacity: '0', transform: 'translateY(14px)' },
                    to:   { opacity: '1', transform: 'translateY(0)' },
                },
                pulseDot: {
                    '0%':   { boxShadow: '0 0 0 0 rgba(34,197,94,0.6)' },
                    '70%':  { boxShadow: '0 0 0 5px rgba(34,197,94,0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(34,197,94,0)' },
                },
                valueIn: {
                    from: { opacity: '0.3', transform: 'translateY(4px)' },
                    to:   { opacity: '1',   transform: 'translateY(0)' },
                },
                barGrow: {
                    from: { width: '0%' },
                    to:   { width: '100%' },
                },
                toastIn: {
                    from: { opacity: '0', transform: 'translateX(16px) scale(0.96)' },
                    to:   { opacity: '1', transform: 'translateX(0)   scale(1)' },
                },
                toastOut: {
                    from: { opacity: '1', transform: 'translateX(0)   scale(1)' },
                    to:   { opacity: '0', transform: 'translateX(16px) scale(0.96)' },
                },
            },
        },
    },
    plugins: [],
};
export default config;
