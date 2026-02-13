import React, { useState } from 'react';
import { CROPS, DISTRICTS, SOIL_TYPES, SEASONS, TRANSLATIONS } from '../constants';
import { predictYieldMock } from '../services/mockBackend';
import { PredictionResult, Language } from '../types';
import { Sprout, CloudRain, MapPin, Calculator, IndianRupee, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  language: Language;
}

const YieldPredictor: React.FC<Props> = ({ language }) => {
  const [formData, setFormData] = useState({
    crop: CROPS[0],
    district: DISTRICTS[0],
    soil: SOIL_TYPES[0],
    season: SEASONS[0],
    area: 1, // hectare
    rainfall: 1000, // mm
    fertilizer: 100 // kg
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const t = TRANSLATIONS[language];

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await predictYieldMock(
        formData.crop,
        formData.district,
        formData.soil,
        formData.rainfall,
        formData.fertilizer,
        formData.area
      );
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const chartData = result ? [
    { name: 'Your Yield', value: result.yield, color: '#16a34a' },
    { name: 'District Avg', value: result.districtAvg, color: '#94a3b8' }
  ] : [];

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="bg-agri-50 p-4 border-b border-agri-100">
        <h2 className="text-xl font-bold text-agri-900 flex items-center gap-2">
          <Calculator className="text-agri-600" /> {t.predict}
        </h2>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* INPUT FORM */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <select 
                className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-agri-500"
                value={formData.district}
                onChange={e => setFormData({...formData, district: e.target.value})}
              >
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
              <select 
                className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-agri-500"
                value={formData.soil}
                onChange={e => setFormData({...formData, soil: e.target.value})}
              >
                {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
            <div className="grid grid-cols-3 gap-2">
              {CROPS.map(crop => (
                <button
                  key={crop}
                  onClick={() => setFormData({...formData, crop})}
                  className={`p-2 rounded-lg text-sm border ${
                    formData.crop === crop
                      ? 'bg-agri-100 border-agri-500 text-agri-800 font-bold ring-1 ring-agri-500'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rainfall (mm): <span className="font-bold text-agri-700">{formData.rainfall}</span>
            </label>
            <input 
              type="range" min="0" max="2000" step="50"
              value={formData.rainfall}
              onChange={e => setFormData({...formData, rainfall: Number(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-agri-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farm Size (Ha)</label>
                <input 
                  type="number" 
                  value={formData.area}
                  onChange={e => setFormData({...formData, area: Number(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fertilizer (kg)</label>
                <input 
                  type="number" 
                  value={formData.fertilizer}
                  onChange={e => setFormData({...formData, fertilizer: Number(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
             </div>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full py-3 bg-agri-600 hover:bg-agri-700 text-white font-bold rounded-lg shadow-md transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                {t.loading}
              </>
            ) : (
              <>
                <Sprout size={20} /> {t.submit}
              </>
            )}
          </button>
        </div>

        {/* RESULTS PANEL */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-col justify-center">
          {!result ? (
            <div className="text-center text-gray-400">
              <Sprout size={48} className="mx-auto mb-2 opacity-50" />
              <p>Enter farm details and click calculate to see AI predictions.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">{t.yieldResult}</p>
                <div className="text-4xl font-bold text-agri-800 my-2">
                  {result.yield.toLocaleString()} <span className="text-lg text-gray-600 font-normal">kg/ha</span>
                </div>
                <div className="inline-block bg-agri-100 text-agri-800 text-xs px-2 py-1 rounded-full font-medium">
                  {t.confidence}: {result.accuracy}%
                </div>
              </div>

              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis hide />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm grid grid-cols-2 gap-4">
                 <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">{t.savings}</p>
                    <p className="font-bold text-green-600 flex justify-center items-center gap-1">
                      <IndianRupee size={14} /> {result.costSaving.toLocaleString()}
                    </p>
                 </div>
                 <div className="text-center border-l border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Range</p>
                    <p className="font-bold text-gray-700 text-sm">
                      {result.confidenceLow} - {result.confidenceHigh}
                    </p>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YieldPredictor;