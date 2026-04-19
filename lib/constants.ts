import { LocationMap } from './types';

// All India locations with weather baselines
export const LOCATIONS: LocationMap = {
    // Metro Cities
    "Mumbai, Maharashtra": { lat: 19.0760, lon: 72.8777, base_temp: 28.0, base_humidity: 70 },
    "Delhi, NCR": { lat: 28.6139, lon: 77.2090, base_temp: 25.0, base_humidity: 55 },
    "Bangalore, Karnataka": { lat: 12.9716, lon: 77.5946, base_temp: 24.0, base_humidity: 60 },
    "Chennai, Tamil Nadu": { lat: 13.0827, lon: 80.2707, base_temp: 30.0, base_humidity: 75 },
    "Kolkata, West Bengal": { lat: 22.5726, lon: 88.3639, base_temp: 29.0, base_humidity: 80 },
    "Hyderabad, Telangana": { lat: 17.3850, lon: 78.4867, base_temp: 27.0, base_humidity: 58 },

    // State Capitals & Major Cities
    "Ahmedabad, Gujarat": { lat: 23.0225, lon: 72.5714, base_temp: 29.0, base_humidity: 45 },
    "Pune, Maharashtra": { lat: 18.5204, lon: 73.8567, base_temp: 26.0, base_humidity: 55 },
    "Jaipur, Rajasthan": { lat: 26.9124, lon: 75.7873, base_temp: 28.0, base_humidity: 40 },
    "Lucknow, Uttar Pradesh": { lat: 26.8467, lon: 80.9462, base_temp: 26.0, base_humidity: 60 },
    "Kanpur, Uttar Pradesh": { lat: 26.4499, lon: 80.3319, base_temp: 27.0, base_humidity: 58 },
    "Nagpur, Maharashtra": { lat: 21.1458, lon: 79.0882, base_temp: 28.0, base_humidity: 50 },
    "Indore, Madhya Pradesh": { lat: 22.7196, lon: 75.8577, base_temp: 27.0, base_humidity: 48 },
    "Bhopal, Madhya Pradesh": { lat: 23.2599, lon: 77.4126, base_temp: 26.0, base_humidity: 50 },
    "Patna, Bihar": { lat: 25.5941, lon: 85.1376, base_temp: 28.0, base_humidity: 65 },
    "Vadodara, Gujarat": { lat: 22.3072, lon: 73.1812, base_temp: 28.0, base_humidity: 50 },
    "Surat, Gujarat": { lat: 21.1702, lon: 72.8311, base_temp: 29.0, base_humidity: 65 },
    "Visakhapatnam, Andhra Pradesh": { lat: 17.6868, lon: 83.2185, base_temp: 29.0, base_humidity: 75 },
    "Coimbatore, Tamil Nadu": { lat: 11.0168, lon: 76.9558, base_temp: 26.0, base_humidity: 60 },
    "Madurai, Tamil Nadu": { lat: 9.9252, lon: 78.1198, base_temp: 30.0, base_humidity: 65 },
    "Kochi, Kerala": { lat: 9.9312, lon: 76.2673, base_temp: 28.0, base_humidity: 80 },
    "Thiruvananthapuram, Kerala": { lat: 8.5241, lon: 76.9366, base_temp: 28.0, base_humidity: 78 },
    "Bhubaneswar, Odisha": { lat: 20.2961, lon: 85.8245, base_temp: 28.0, base_humidity: 70 },
    "Ranchi, Jharkhand": { lat: 23.3441, lon: 85.3096, base_temp: 25.0, base_humidity: 60 },
    "Guwahati, Assam": { lat: 26.1445, lon: 91.7362, base_temp: 26.0, base_humidity: 75 },
    "Chandigarh, Punjab": { lat: 30.7333, lon: 76.7794, base_temp: 24.0, base_humidity: 55 },
    "Amritsar, Punjab": { lat: 31.6340, lon: 74.8723, base_temp: 25.0, base_humidity: 50 },
    "Ludhiana, Punjab": { lat: 30.9010, lon: 75.8573, base_temp: 25.0, base_humidity: 52 },
    "Dehradun, Uttarakhand": { lat: 30.3165, lon: 78.0322, base_temp: 22.0, base_humidity: 60 },
    "Shimla, Himachal Pradesh": { lat: 31.1048, lon: 77.1734, base_temp: 15.0, base_humidity: 65 },
    "Srinagar, Jammu & Kashmir": { lat: 34.0837, lon: 74.7973, base_temp: 14.0, base_humidity: 55 },
    "Jammu, Jammu & Kashmir": { lat: 32.7266, lon: 74.8570, base_temp: 22.0, base_humidity: 50 },
    "Raipur, Chhattisgarh": { lat: 21.2514, lon: 81.6296, base_temp: 28.0, base_humidity: 55 },
    "Varanasi, Uttar Pradesh": { lat: 25.3176, lon: 82.9739, base_temp: 27.0, base_humidity: 62 },
    "Agra, Uttar Pradesh": { lat: 27.1767, lon: 78.0081, base_temp: 27.0, base_humidity: 55 },
    "Jodhpur, Rajasthan": { lat: 26.2389, lon: 73.0243, base_temp: 30.0, base_humidity: 35 },
    "Udaipur, Rajasthan": { lat: 24.5854, lon: 73.7125, base_temp: 28.0, base_humidity: 45 },
    "Goa (Panaji)": { lat: 15.4909, lon: 73.8278, base_temp: 29.0, base_humidity: 75 },
    "Mangalore, Karnataka": { lat: 12.9141, lon: 74.8560, base_temp: 28.0, base_humidity: 78 },
    "Mysore, Karnataka": { lat: 12.2958, lon: 76.6394, base_temp: 25.0, base_humidity: 58 },
    "Vijayawada, Andhra Pradesh": { lat: 16.5062, lon: 80.6480, base_temp: 30.0, base_humidity: 70 },
    "Tiruchirappalli, Tamil Nadu": { lat: 10.7905, lon: 78.7047, base_temp: 30.0, base_humidity: 68 },
    "Salem, Tamil Nadu": { lat: 11.6643, lon: 78.1460, base_temp: 28.0, base_humidity: 55 },
    "Aurangabad, Maharashtra": { lat: 19.8762, lon: 75.3433, base_temp: 28.0, base_humidity: 48 },
    "Nashik, Maharashtra": { lat: 19.9975, lon: 73.7898, base_temp: 26.0, base_humidity: 52 },
    "Rajkot, Gujarat": { lat: 22.3039, lon: 70.8022, base_temp: 28.0, base_humidity: 45 },
    "Jabalpur, Madhya Pradesh": { lat: 23.1815, lon: 79.9864, base_temp: 27.0, base_humidity: 52 },
    "Gwalior, Madhya Pradesh": { lat: 26.2183, lon: 78.1828, base_temp: 28.0, base_humidity: 48 },
    "Allahabad, Uttar Pradesh": { lat: 25.4358, lon: 81.8463, base_temp: 28.0, base_humidity: 58 },
    "Meerut, Uttar Pradesh": { lat: 28.9845, lon: 77.7064, base_temp: 26.0, base_humidity: 55 },
    "Faridabad, Haryana": { lat: 28.4089, lon: 77.3178, base_temp: 26.0, base_humidity: 52 },
    "Gurugram, Haryana": { lat: 28.4595, lon: 77.0266, base_temp: 26.0, base_humidity: 50 },
    "Noida, Uttar Pradesh": { lat: 28.5355, lon: 77.3910, base_temp: 26.0, base_humidity: 55 },
    "Thane, Maharashtra": { lat: 19.2183, lon: 72.9781, base_temp: 28.0, base_humidity: 72 },
    "Navi Mumbai, Maharashtra": { lat: 19.0330, lon: 73.0297, base_temp: 28.0, base_humidity: 70 },
    "Imphal, Manipur": { lat: 24.8170, lon: 93.9368, base_temp: 22.0, base_humidity: 70 },
    "Shillong, Meghalaya": { lat: 25.5788, lon: 91.8933, base_temp: 18.0, base_humidity: 80 },
    "Aizawl, Mizoram": { lat: 23.7271, lon: 92.7176, base_temp: 20.0, base_humidity: 75 },
    "Kohima, Nagaland": { lat: 25.6751, lon: 94.1086, base_temp: 18.0, base_humidity: 72 },
    "Agartala, Tripura": { lat: 23.8315, lon: 91.2868, base_temp: 26.0, base_humidity: 78 },
    "Gangtok, Sikkim": { lat: 27.3389, lon: 88.6065, base_temp: 14.0, base_humidity: 75 },
    "Itanagar, Arunachal Pradesh": { lat: 27.0844, lon: 93.6053, base_temp: 20.0, base_humidity: 72 },
    "Port Blair, Andaman & Nicobar": { lat: 11.6234, lon: 92.7265, base_temp: 28.0, base_humidity: 82 },
    "Puducherry": { lat: 11.9416, lon: 79.8083, base_temp: 29.0, base_humidity: 75 },
    "Leh, Ladakh": { lat: 34.1526, lon: 77.5771, base_temp: 8.0, base_humidity: 30 },
};

export const DEFAULT_LOCATION = "Mumbai, Maharashtra";

export const DEFAULT_PANEL_CAPACITY = 5.0; // kW
export const DEFAULT_ELECTRICITY_RATE = 7.0; // ₹/kWh

export const REFRESH_INTERVAL = 2000; // 2 seconds for live weather

export const EFFICIENCY_THRESHOLDS = {
    HIGH: 70,
    MEDIUM: 40,
};
