import React, { useState } from 'react';
import { Language } from './types';
import { TRANSLATIONS } from './constants';
import Dashboard from './components/Dashboard';
import YieldPredictor from './components/YieldPredictor';
import VoiceChat from './components/VoiceChat';
import LanguageSelector from './components/LanguageSelector';
import { LayoutDashboard, Sprout, MessageSquareText, Menu, X } from 'lucide-react';

// Simple navigation state instead of Router for SPA
type View = 'dashboard' | 'predict' | 'assistant';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>(Language.ENGLISH);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = TRANSLATIONS[currentLang];

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard language={currentLang} />;
      case 'predict': return <YieldPredictor language={currentLang} />;
      case 'assistant': return <VoiceChat language={currentLang} />;
      default: return <Dashboard language={currentLang} />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setMobileMenuOpen(false);
      }}
      className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-colors ${
        currentView === view 
          ? 'bg-agri-100 text-agri-800 font-bold' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-agri-50">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold text-agri-800 flex items-center gap-2">
          <Sprout className="text-agri-600" /> Agri-Yield
        </h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed md:sticky md:top-0 h-screen w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-agri-800 flex items-center gap-2 hidden md:flex">
            <Sprout className="text-agri-600" size={28} /> Agri-Yield
          </h1>
          
          <div className="mt-8 space-y-2">
            <NavItem view="dashboard" icon={LayoutDashboard} label={t.dashboard} />
            <NavItem view="predict" icon={Sprout} label={t.predict} />
            <NavItem view="assistant" icon={MessageSquareText} label={t.assistant} />
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Language</p>
            <div className="flex flex-wrap gap-2">
               {/* Custom simple selector for sidebar */}
               <button onClick={() => setCurrentLang(Language.ENGLISH)} className={`text-xs px-2 py-1 rounded border ${currentLang === 'en' ? 'bg-agri-600 text-white' : 'bg-white'}`}>EN</button>
               <button onClick={() => setCurrentLang(Language.HINDI)} className={`text-xs px-2 py-1 rounded border ${currentLang === 'hi' ? 'bg-agri-600 text-white' : 'bg-white'}`}>HI</button>
               <button onClick={() => setCurrentLang(Language.MARATHI)} className={`text-xs px-2 py-1 rounded border ${currentLang === 'mr' ? 'bg-agri-600 text-white' : 'bg-white'}`}>MR</button>
               <button onClick={() => setCurrentLang(Language.GUJARATI)} className={`text-xs px-2 py-1 rounded border ${currentLang === 'gu' ? 'bg-agri-600 text-white' : 'bg-white'}`}>GU</button>
               <button onClick={() => setCurrentLang(Language.BANGLA)} className={`text-xs px-2 py-1 rounded border ${currentLang === 'bn' ? 'bg-agri-600 text-white' : 'bg-white'}`}>BN</button>
               <button onClick={() => setCurrentLang(Language.URDU)} className={`text-xs px-2 py-1 rounded border ${currentLang === 'ur' ? 'bg-agri-600 text-white' : 'bg-white'}`}>UR</button>
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
             <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
               <p className="text-xs text-blue-800 font-semibold mb-1">Empowering Farmers</p>
               <p className="text-[10px] text-blue-600">Built for a sustainable future.</p>
             </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
           <div>
             <h2 className="text-2xl font-bold text-gray-900">{t.welcome}</h2>
             <p className="text-gray-500 text-sm">Today is a good day for farming.</p>
           </div>
           <div className="hidden md:block">
              <LanguageSelector currentLang={currentLang} onLanguageChange={setCurrentLang} />
           </div>
        </header>

        <div className="max-w-5xl mx-auto space-y-8">
          {renderView()}
        </div>
      </main>

      {/* OVERLAY FOR MOBILE */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}