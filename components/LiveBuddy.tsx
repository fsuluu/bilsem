import React, { useEffect, useState, useRef } from 'react';
import { LiveClient } from '../services/gemini';
import { Character } from '../types';
import { Mic, MicOff, X } from 'lucide-react';

interface LiveBuddyProps {
  character: Character;
  onClose: () => void;
}

const LiveBuddy: React.FC<LiveBuddyProps> = ({ character, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<LiveClient | null>(null);

  useEffect(() => {
    const client = new LiveClient();
    clientRef.current = client;

    const startSession = async () => {
        try {
            await client.connect(() => setIsConnected(false), character.voiceName);
            setIsConnected(true);
        } catch (e) {
            console.error("Failed to connect", e);
        }
    };

    startSession();

    return () => {
        client.disconnect();
    };
  }, [character.voiceName]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
        <div className={`relative w-full max-w-md ${character.color} rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-8`}>
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/40 text-white"
            >
                <X size={24} />
            </button>

            <div className="text-9xl animate-bounce">
                {character.emoji}
            </div>
            
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Chat with {character.name}!</h2>
                <p className="text-white/80 text-lg">
                    {isConnected ? "I'm listening! Say hello!" : "Connecting..."}
                </p>
            </div>

            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${isConnected ? 'bg-white text-green-500 scale-110 shadow-lg ring-4 ring-green-200' : 'bg-gray-200 text-gray-400'}`}>
                {isConnected ? <Mic size={40} className="animate-pulse" /> : <MicOff size={40} />}
            </div>

            <p className="text-sm text-white/60 text-center">
                Uses Gemini Live API
            </p>
        </div>
    </div>
  );
};

export default LiveBuddy;