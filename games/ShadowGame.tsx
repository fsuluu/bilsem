import React, { useState, useEffect } from 'react';
import { speakText } from '../services/gemini';

interface ShadowGameProps {
  onComplete: () => void;
  voiceName: string;
  level: number;
}

const ITEMS = [
    { name: 'Car', emoji: '🚗' },
    { name: 'Bear', emoji: '🧸' },
    { name: 'Ball', emoji: '⚽' },
    { name: 'Rocket', emoji: '🚀' },
    { name: 'Pizza', emoji: '🍕' },
    { name: 'Robot', emoji: '🤖' },
    { name: 'Cat', emoji: '🐱' },
    { name: 'Dog', emoji: '🐶' },
    { name: 'Flower', emoji: '🌻' },
];

const ShadowGame: React.FC<ShadowGameProps> = ({ onComplete, voiceName, level }) => {
  const [items, setItems] = useState<any[]>([]);
  const [shadows, setShadows] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [matches, setMatches] = useState<string[]>([]);

  useEffect(() => {
      // Pick random items based on level
      const count = Math.min(3 + Math.floor((level - 1) / 2), 6);
      const gameItems = [...ITEMS].sort(() => 0.5 - Math.random()).slice(0, count);
      
      setItems(gameItems);
      // Shuffle shadows
      setShadows([...gameItems].sort(() => 0.5 - Math.random()));
      setMatches([]);
      setSelectedItem(null);
      speakText("Match the pictures to their dark shadows!", voiceName);
  }, [level, voiceName]);

  const handleItemClick = (name: string) => {
      if (matches.includes(name)) return;
      setSelectedItem(name);
      speakText(name, voiceName);
  };

  const handleShadowClick = (name: string) => {
      if (!selectedItem) {
          speakText("Pick a colorful picture first!", voiceName);
          return;
      }
      
      if (name === selectedItem) {
          setMatches(prev => [...prev, name]);
          setSelectedItem(null);
          speakText("Correct!", voiceName);
          if (matches.length + 1 === items.length) {
              setTimeout(onComplete, 1000);
          }
      } else {
          speakText("That's not the right shadow. Try again!", voiceName);
      }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-8">
        <h2 className="text-3xl text-white font-bold drop-shadow-md bg-vivid-yellow text-shadow-sm px-6 py-2 rounded-full border-2 border-white">
            Shadow Match
        </h2>
        
        <div className="flex justify-around w-full max-w-4xl px-8 items-center">
            {/* Real Items Column */}
            <div className="flex flex-col gap-4">
                {items.map(item => (
                    <button
                        key={item.name}
                        onClick={() => handleItemClick(item.name)}
                        disabled={matches.includes(item.name)}
                        className={`
                            w-24 h-24 rounded-2xl bg-white shadow-xl flex items-center justify-center text-6xl border-4 transition-all duration-300
                            ${matches.includes(item.name) ? 'opacity-0 pointer-events-none' : ''}
                            ${selectedItem === item.name 
                                ? 'border-vivid-pink scale-125 shadow-[0_0_20px_#FF4081] rotate-12 z-10' 
                                : 'border-white hover:scale-105 hover:rotate-6'}
                        `}
                    >
                        {item.emoji}
                    </button>
                ))}
            </div>

            {/* Connection Area / Space */}
            <div className="flex-1"></div>

            {/* Shadows Column */}
            <div className="flex flex-col gap-4">
                {shadows.map(item => (
                     <button
                        key={item.name}
                        onClick={() => handleShadowClick(item.name)}
                        disabled={matches.includes(item.name)}
                        className={`
                            w-24 h-24 rounded-2xl bg-white/40 shadow-inner flex items-center justify-center text-6xl border-4 border-white/50 transition-all duration-300
                            ${matches.includes(item.name) ? 'bg-vivid-green/80 border-vivid-green scale-110 !brightness-100 !contrast-100' : 'hover:bg-white/60'}
                        `}
                    >
                        {/* 
                           We use filter brightness(0) to make the emoji a solid black silhouette. 
                           If matched, we remove the filter to reveal the color.
                        */}
                        <span style={{ 
                            filter: matches.includes(item.name) ? 'none' : 'brightness(0)',
                            opacity: matches.includes(item.name) ? 1 : 0.7 
                        }}>
                            {item.emoji}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};

export default ShadowGame;