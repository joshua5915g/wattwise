'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { PredictionResult, WeatherData, ChatMessage } from '@/lib/types';

interface WattBotChatProps {
    prediction: PredictionResult | null;
    weather: WeatherData | null;
    location: string;
    panelKw: number;
    electricityRate: number;
}

const INITIAL_MESSAGES: ChatMessage[] = [
    {
        id: 'msg-1',
        sender: 'wattbot',
        text: "⚡ Hello! I'm **WattBot**, your AI Solar Copilot. How can I assist you with your solar energy generation, appliance scheduling, or savings today?",
        timestamp: 'Just now',
        quickSuggestions: [
            'Why is my efficiency low today?',
            'When is the best time to charge my EV?',
            'Explain PM Surya Ghar subsidy',
            'How often should I clean panels?'
        ]
    }
];

export default function WattBotChat({
    prediction,
    weather,
    location,
    panelKw,
    electricityRate
}: WattBotChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const sendMessage = async (textToSend?: string) => {
        const query = (textToSend || inputText).trim();
        if (!query || isLoading) return;

        const userMsg: ChatMessage = {
            id: 'user-' + Date.now(),
            sender: 'user',
            text: query,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, userMsg]);
        if (!textToSend) setInputText('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/wattbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: query,
                    context: {
                        location,
                        panelKw,
                        dailyOutputKwh: prediction?.total_daily_output,
                        efficiencyPercent: prediction?.efficiency_percent,
                        temperature: weather?.temperature,
                        cloudCover: weather ? 100 - weather.solar_index : 20,
                        electricityRate,
                    }
                }),
            });

            if (!res.ok) throw new Error('API error');
            const data = await res.json();

            const botMsg: ChatMessage = {
                id: 'bot-' + Date.now(),
                sender: 'wattbot',
                text: data.reply,
                timestamp: data.timestamp || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                quickSuggestions: data.suggestions,
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            const fallbackMsg: ChatMessage = {
                id: 'bot-err-' + Date.now(),
                sender: 'wattbot',
                text: `⚡ Based on your ${panelKw} kW setup in ${location.split(',')[0]}, your peak generation window today is around 11:00 AM - 2:00 PM. Shift your heavy appliances to these hours for maximum zero-cost savings!`,
                timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                quickSuggestions: ['Why is my efficiency low today?', 'Explain PM Surya Ghar subsidy'],
            };
            setMessages(prev => [...prev, fallbackMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div id="wattbot-widget" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 60 }} className="print:hidden">
            {/* Floating Trigger Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="float-glow"
                    style={{
                        width: 54,
                        height: 54,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                        border: '2px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 8px 24px rgba(59,130,246,0.45)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        transition: 'transform 0.2s ease',
                    }}
                    title="Open WattBot Solar Copilot"
                >
                    🤖
                </button>
            )}

            {/* Chat Window Modal / Drawer */}
            {isOpen && (
                <div
                    className="card fade-in"
                    style={{
                        width: 360,
                        height: 520,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 'var(--r-lg)',
                        background: 'rgba(15,15,23,0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(59,130,246,0.3)',
                        boxShadow: '0 16px 40px rgba(0,0,0,0.6), 0 0 20px rgba(59,130,246,0.2)',
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '14px 18px',
                        background: 'var(--raised)',
                        borderBottom: '1px solid var(--b1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: 8, background: 'var(--blue-dim)',
                                border: '1px solid rgba(59,130,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                            }}>
                                🤖
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>WattBot Copilot</div>
                                <div style={{ fontSize: 10, color: 'var(--green-bright)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span className="live-dot" style={{ width: 4, height: 4 }} />
                                    AI Live Assistant
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--t3)',
                                fontSize: 18,
                                cursor: 'pointer',
                                padding: 4,
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div style={{
                        flex: 1,
                        padding: '16px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                    }}>
                        {messages.map(msg => {
                            const isBot = msg.sender === 'wattbot';
                            return (
                                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isBot ? 'flex-start' : 'flex-end', gap: 4 }}>
                                    <div style={{
                                        maxWidth: '85%',
                                        padding: '10px 14px',
                                        borderRadius: isBot ? '14px 14px 14px 2px' : '14px 14px 2px 14px',
                                        background: isBot ? 'var(--raised)' : 'var(--blue)',
                                        color: isBot ? 'var(--t1)' : '#fff',
                                        fontSize: 12.5,
                                        lineHeight: 1.45,
                                        border: isBot ? '1px solid var(--b2)' : 'none',
                                        whiteSpace: 'pre-line',
                                    }}>
                                        {msg.text}
                                    </div>
                                    <span style={{ fontSize: 9, color: 'var(--t3)' }}>{msg.timestamp}</span>

                                    {/* Quick suggestion chips */}
                                    {isBot && msg.quickSuggestions && msg.quickSuggestions.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                            {msg.quickSuggestions.map((s, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => sendMessage(s)}
                                                    style={{
                                                        background: 'var(--surface)',
                                                        border: '1px solid var(--b2)',
                                                        borderRadius: 99,
                                                        padding: '4px 10px',
                                                        fontSize: 10.5,
                                                        color: 'var(--blue-bright)',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        transition: 'all 0.15s ease'
                                                    }}
                                                >
                                                    ⚡ {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {isLoading && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--t3)', fontSize: 11, padding: 8 }}>
                                <div className="live-dot" style={{ width: 6, height: 6 }} />
                                WattBot is analyzing solar metrics…
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Bar */}
                    <form
                        onSubmit={e => { e.preventDefault(); sendMessage(); }}
                        style={{
                            padding: '12px 16px',
                            background: 'var(--raised)',
                            borderTop: '1px solid var(--b1)',
                            display: 'flex',
                            gap: 8,
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Ask WattBot about your solar..."
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                background: 'var(--surface)',
                                border: '1px solid var(--b2)',
                                borderRadius: 8,
                                padding: '8px 12px',
                                color: 'var(--t1)',
                                fontSize: 12,
                                outline: 'none'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputText.trim()}
                            className="btn btn-primary"
                            style={{ padding: '0 14px', height: 36, fontSize: 12 }}
                        >
                            ➤
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
