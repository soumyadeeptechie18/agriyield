import React, { useEffect, useState } from 'react';
import { Language, RiskAlert, WeatherData } from '../types';
import { TRANSLATIONS } from '../constants';
import { getForecast, analyzeRisk } from '../services/mockBackend';
import { Sun, CloudRain, AlertTriangle, Droplets, Thermometer, Wind } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  language: Language;
}

const Dashboard: React.FC<Props> = ({ language }) => {
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  
  const t = TRANSLATIONS[language];

  useEffect(() => {
    const data = getForecast();
    setWeather(data);
    const risk = analyzeRisk(data, 'Rice'); // Default crop for risk
    setAlerts(risk);
  }, []);

  const currentWeather = weather[0] || { temp: 30, condition: 'Sunny', rainProb: 0 };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* WEATHER CARD */}
      <div className="lg:col-span-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <CloudRain size={120} />
        </div>
        
        <div className="p-6 relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-blue-100 font-medium text-lg">{t.weather}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl font-bold">{currentWeather.temp}°</span>
                <span className="text-xl opacity-90">{currentWeather.condition}</span>
              </div>
              <div className="mt-4 flex gap-4 text-sm font-medium">
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                  <Droplets size={14} /> {currentWeather.rainProb}% Rain
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                  <Wind size={14} /> 12 km/h
                </div>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm opacity-80">Pune, Maharashtra</p>
              <p className="text-xs opacity-60 mt-1">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mt-8 h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weather}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff'}}
                  itemStyle={{color: '#fff'}}
                />
                <Area type="monotone" dataKey="temp" stroke="#ffffff" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RISK ALERTS */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h3 className="text-gray-800 font-bold text-lg mb-4 flex items-center gap-2">
          <AlertTriangle className="text-orange-500" /> {t.risk}
        </h3>
        <div className="space-y-3">
          {alerts.map((alert, idx) => (
            <div key={idx} className={`p-3 rounded-lg border-l-4 ${
              alert.level === 'High' ? 'bg-red-50 border-red-500' :
              alert.level === 'Medium' ? 'bg-orange-50 border-orange-500' :
              'bg-green-50 border-green-500'
            }`}>
              <div className="flex justify-between">
                <span className={`text-xs font-bold uppercase ${
                   alert.level === 'High' ? 'text-red-700' :
                   alert.level === 'Medium' ? 'text-orange-700' :
                   'text-green-700'
                }`}>{alert.type} Risk</span>
                <span className="text-xs text-gray-500">{alert.level}</span>
              </div>
              <p className="text-sm font-medium text-gray-800 mt-1">{alert.message}</p>
              <p className="text-xs text-gray-600 mt-1">💡 {alert.action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;