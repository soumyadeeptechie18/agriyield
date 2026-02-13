import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Language } from '../types';
import { generateAgriAdvice } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';
import { Mic, Send, Volume2, User, Bot } from 'lucide-react';

interface Props {
  language: Language;
}

const VoiceChat: React.FC<Props> = ({ language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'model',
      text: TRANSLATIONS[language].welcome + "! " + TRANSLATIONS[language].assistant,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[language];

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice Input Setup
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input not supported in this browser.");
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Map internal language enum to BCP 47 tags
    const langMap = {
      [Language.ENGLISH]: 'en-IN',
      [Language.HINDI]: 'hi-IN',
      [Language.MARATHI]: 'mr-IN',
      [Language.TELUGU]: 'te-IN',
      [Language.TAMIL]: 'ta-IN',
    };
    
    recognition.lang = langMap[language];
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("Speech error", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    recognition.start();
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      // Try to match language
      // Note: Browser support for Indian languages varies
      utterance.lang = language === 'en' ? 'en-IN' : language + '-IN'; 
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsLoading(true);

    // Call Gemini
    const responseText = await generateAgriAdvice(textToSend, language);
    
    const newBotMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newBotMsg]);
    setIsLoading(false);
    
    // Auto-speak response if the user used voice (simulated logic: if listening was recently active)
    // For this demo, we add a manual speaker button instead for better UX control
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-50 rounded-xl overflow-hidden shadow-xl border border-gray-200">
      <div className="bg-agri-600 p-4 text-white flex justify-between items-center shadow-md">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Bot size={24} /> Kisan Mitra AI
        </h3>
        <span className="text-xs bg-agri-700 px-2 py-1 rounded">Online</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-3 shadow-sm relative group ${
                msg.role === 'user'
                  ? 'bg-agri-600 text-white rounded-tr-none'
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}
            >
              <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
              {msg.role === 'model' && (
                <button 
                  onClick={() => speakText(msg.text)}
                  className="absolute -right-8 top-1 text-gray-400 hover:text-agri-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Read Aloud"
                >
                  <Volume2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-agri-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-agri-500 rounded-full animate-bounce delay-75" />
              <div className="w-2 h-2 bg-agri-500 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={startListening}
            className={`p-3 rounded-full transition-all ${
              isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={t.speak}
          >
            <Mic size={24} />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? t.listening : "Type or speak..."}
            className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-agri-500"
          />
          
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() && !isLoading}
            className="p-3 bg-agri-600 text-white rounded-full hover:bg-agri-700 disabled:opacity-50 transition-colors"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceChat;