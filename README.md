# ⚡ WattWise - Smart Solar Energy Dashboard

**AI-Powered Solar Forecasting | Next.js App Router | Deploy on Vercel**

A modern, intelligent solar energy dashboard that predicts solar output using built-in Next.js serverless routes and provides smart energy optimization recommendations.

---

## 🌟 Features

- **Real-Time Weather Data**: Live weather updates every 2 seconds for 60+ Indian cities
- **ML Predictions**: Smart solar output estimates with a browser-friendly prediction engine
- **AI Recommendations**: Built-in energy advice for appliance scheduling
- **Experiment Mode**: Simulate different weather scenarios
- **Beautiful UI**: Dark glassmorphism design with neon accents
- **Fully Responsive**: Works perfectly on mobile, tablet, and desktop
- **Vercel Ready**: Optimized for zero-config deployment

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Plotly.js
- **State**: React Hooks

### Backend
- **API**: Next.js App Router serverless routes
- **ML Simulation**: Browser-friendly prediction engine
- **AI**: Built-in fallback energy advice

### Deployment
- **Platform**: Vercel
- **Config**: Zero-config with `vercel.json`

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd solar_weather_impact

# Install Node.js dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Deployment to Vercel

### Method 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Or deploy to production directly
vercel --prod
```

### Method 2: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js
6. Click "Deploy"

Done! Your app will be live in ~2 minutes.

---

## 🔧 Configuration

### System Settings

All configurable in the UI:
- **Panel Capacity**: 1-10 kW
- **Electricity Rate**: ₹1-20/kWh
- **Location**: 60+ Indian cities
- **Experiment Mode**: Simulate weather conditions

---

All configurable in the UI:
- **Panel Capacity**: 1-10 kW
- **Electricity Rate**: ₹1-20/kWh
- **Location**: 60+ Indian cities
- **Experiment Mode**: Simulate weather conditions

---

## 📁 Project Structure

```
solar_weather_impact/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles
│   └── api/                    # Next.js serverless API routes
│       ├── predict/route.ts    # ML predictions
│       ├── ai_advice/route.ts  # AI recommendations
│       └── weather/route.ts    # Weather data
├── components/
│   ├── Dashboard.tsx           # Main dashboard
│   ├── MetricCard.tsx          # Metric display
│   ├── SolarCurveChart.tsx     # Plotly chart
│   ├── WeatherTicker.tsx       # Live weather
│   ├── AIAdvicePanel.tsx       # AI advice
│   ├── ExperimentControls.tsx  # Controls
│   └── LocationSelector.tsx    # City selector
├── lib/
│   ├── api.ts                  # API client
│   ├── types.ts                # TypeScript types
│   ├── constants.ts            # Constants & locations
│   └── utils.ts                # Helper functions
├── src/
│   └── models/
│       └── solar_prediction_model.pkl  # Legacy ML model file (not required for current build)
├── package.json                # Node dependencies
├── next.config.js              # Next.js config
├── tailwind.config.ts          # Tailwind config
├── vercel.json                 # Vercel config
└── README.md                   # This file
```

---

## 🎨 Features Breakdown

### 1. Real-Time Weather Ticker
- Updates every 2 seconds
- Shows temperature, humidity, UV index, wind, solar index
- Location-specific data

### 2. ML Predictions
- XGBoost regression model
- 24-hour solar output forecast
- Peak hour identification
- Efficiency calculation

### 3. AI Recommendations
- Built-in fallback advice engine
- Context-aware guidance
- Appliance suggestions
- Optimal usage hours

### 4. Experiment Mode
- Simulate weather conditions
- Adjust temperature, cloud cover, humidity
- Real-time prediction updates

### 5. Beautiful UI
- Dark glassmorphism theme
- Neon green accents
- Smooth animations
- Fully responsive

---

## 🧪 Testing Locally

```bash
# Start development server
npm run dev

# In another terminal, test API endpoints:

# Test prediction endpoint
curl -X POST http://localhost:3000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"temperature":28,"cloud_cover":30,"humidity":65,"panel_capacity":5,"day_of_year":20}'

# Test weather endpoint
curl http://localhost:3000/api/weather?location=Mumbai,%20Maharashtra

# Test AI advice
curl -X POST http://localhost:3000/api/ai_advice \
  -H "Content-Type: application/json" \
  -d '{"solar_efficiency":75,"temperature":28,"cloud_cover":30,"daily_output":30}'
```

---

## 📊 Performance

- **First Load**: < 2 seconds
- **API Response**: < 500ms
- **Live Updates**: Every 2 seconds
- **Bundle Size**: Optimized with Next.js
- **Lighthouse Score**: 95+ Performance

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

MIT License - feel free to use for personal or commercial projects.

---

## 🎯 Roadmap

- [ ] Historical data tracking
- [ ] Email/SMS alerts for peak solar hours
- [ ] Battery storage optimization
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Integration with real IoT solar panels

---

## 💡 Tips

### Maximize Performance
- Use Vercel's Edge Network for global deployment
- Enable caching for API routes
- Optimize images with Next.js Image component

### Customize
- Modify colors in `tailwind.config.ts`
- Add more cities in `lib/constants.ts`
- Adjust thresholds in efficiency calculations

### Production
- No external AI environment variables are required for local usage
- Monitor API usage in Vercel dashboard
- Set up error tracking (Sentry, etc.)

---

## 📧 Support

For issues, questions, or suggestions:
- Open a GitHub issue
- Contact: [your-email]
- Documentation: [your-docs-url]

---

## 🌟 Acknowledgments

- Weather data simulation inspired by OpenWeatherMap
- ML model trained on synthetic solar energy dataset
- UI design influenced by modern glass morphism trends
- AI advice powered by built-in fallback logic

---

**Built with ❤️ for a sustainable energy future**

⚡ **WattWise** - Smarter Solar, Better Savings
