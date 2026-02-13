import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Language } from '../types';
import { generateAgriAdvice, generateSpeechFromText } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';
import { Mic, Send, Volume2, User, Bot, Loader2 } from 'lucide-react';

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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
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
      [Language.GUJARATI]: 'gu-IN',
      [Language.BANGLA]: 'bn-IN',
      [Language.URDU]: 'ur-IN',
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

  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const pcmToAudioBuffer = (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number = 24000
  ): AudioBuffer => {
    // Handle potential odd byte length
    let pcm16: Int16Array;
    if (data.byteLength % 2 !== 0) {
      const newBuffer = new Uint8Array(data.byteLength + 1);
      newBuffer.set(data);
      pcm16 = new Int16Array(newBuffer.buffer);
    } else {
      pcm16 = new Int16Array(data.buffer);
    }

    const buffer = ctx.createBuffer(1, pcm16.length, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    // Convert Int16 to Float32
    for (let i = 0; i < pcm16.length; i++) {
      channelData[i] = pcm16[i] / 32768.0;
    }
    
    return buffer;
  };

  const speakText = async (text: string) => {
    // 1. Try Gemini API for high quality multilingual TTS
    setIsPlayingAudio(true);
    const audioData = await generateSpeechFromText(text);
    
    if (audioData) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass({ sampleRate: 24000 });
        
        const pcmBytes = decodeBase64(audioData);
        const audioBuffer = pcmToAudioBuffer(pcmBytes, audioContext, 24000);
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => setIsPlayingAudio(false);
        source.start(0);
        return; // Success
      } catch (e) {
        console.error("Audio playback error", e);
        // Fallthrough
      }
    }

    // 2. Fallback to Browser TTS (Low quality but works offline-ish)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/\*\*/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = language === 'en' ? 'en-IN' : language + '-IN'; 
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
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

    // Call Gemini for Text
    const responseText = await generateAgriAdvice(textToSend, language);
    
    const newBotMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newBotMsg]);
    setIsLoading(false);
    
    // Auto-speak response if the user used voice (indicated by textOverride being present)
    if (textOverride) {
      speakText(responseText);
    }
  };

  // Helper to render bold text
  const renderMessageText = (text: string) => {
    // Split by **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-agri-900">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-50 rounded-xl overflow-hidden shadow-xl border border-gray-200">
      <div className="bg-agri-600 p-4 text-white flex justify-between items-center shadow-md">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Bot size={24} /> Kisan Mitra AI
        </h3>
        <span className="flex items-center gap-2">
            {isPlayingAudio && <span className="flex gap-1 h-3 items-end">
                <span className="w-1 h-2 bg-white animate-bounce"></span>
                <span className="w-1 h-3 bg-white animate-bounce delay-100"></span>
                <span className="w-1 h-1 bg-white animate-bounce delay-200"></span>
            </span>}
            <span className="text-xs bg-agri-700 px-2 py-1 rounded">Online</span>
        </span>
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
              <div className="text-sm md:text-base leading-relaxed">
                {renderMessageText(msg.text)}
              </div>
              {msg.role === 'model' && (
                <button 
                  onClick={() => speakText(msg.text)}
                  disabled={isPlayingAudio}
                  className="absolute -right-8 top-1 text-gray-400 hover:text-agri-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
                  title="Read Aloud"
                >
                  {isPlayingAudio ? <Loader2 className="animate-spin" size={18} /> : <Volume2 size={18} />}
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