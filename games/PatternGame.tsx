import React, { useState, useEffect } from 'react';
import { speakText } from '../services/gemini';

interface PatternGameProps {
  onComplete: () => void;
  voiceName: string;
  level: number;
}

const PATTERNS = [
    { seq: ['🍎', '🍌', '🍎', '🍌'], answer: '🍎', options: ['🍇', '🍎', '🍕'] },
    { seq: ['🐶', '🐱', '🐶', '🐱'], answer: '🐶', options: ['🦁', '🐶', '🐮'] },
    { seq: ['🔴', '🔵', '🔴', '🔵'], answer: '🔴', options: ['🟢', '🔴', '🟡'] },
    { seq: ['☀️', '🌙', '⭐', '☀️', '🌙'], answer: '⭐', options: ['⭐', '☁️', '⚡'] },
    { seq: ['🔺', '🔺', '🟦', '🔺', '🔺'], answer: '🟦', options: ['🟦', '🔺', '🟢'] }
];

const PatternGame: React.FC<PatternGameProps> = ({ onComplete, voiceName, level }) => {
  
  const patternIndex = (level - 1) % PATTERNS.length;
  const { seq, answer, options } = PATTERNS[patternIndex];

  useEffect(() => {
    speakText("Look at the pattern! What comes next?", voiceName);
  }, [voiceName, level]);

  const handleOptionClick = (opt: string) => {
    if (opt === answer) {
      speakText("Correct! That fits perfectly!", voiceName);
      setTimeout(onComplete, 1500);
    } else {
      speakText("Not that one. Try again!", voiceName);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
       <h2 className="text-3xl text-white font-bold mb-12 drop-shadow-md bg-vivid-pink px-6 py-2 rounded-full border-2 border-white">Complete the Pattern</h2>
       
       <div className="flex flex-wrap justify-center gap-4 mb-16 bg-white/80 backdrop-blur p-6 rounded-3xl shadow-lg border-4 border-vivid-pink">
          {seq.map((item, idx) => (
            <div key={idx} className="text-6xl animate-bounce" style={{ animationDelay: `${idx * 0.1}s`}}>
              {item}
            </div>
          ))}
          <div className="w-20 h-20 border-4 border-dashed border-gray-400 rounded-xl flex items-center justify-center text-4xl text-gray-400">
            ?
          </div>
       </div>

       <div className="flex gap-8">
          {options.map((opt, idx) => (
            <button 
              key={idx}
              onClick={() => handleOptionClick(opt)}
              className="w-24 h-24 bg-white rounded-2xl shadow-[0_8px_0_rgba(0,0,0,0.1)] text-6xl hover:scale-110 transition-transform flex items-center justify-center border-b-4 border-gray-200 active:border-b-0 active:translate-y-2"
            >
              {opt}
            </button>
          ))}
       </div>
    </div>
  );
};

export default PatternGame;