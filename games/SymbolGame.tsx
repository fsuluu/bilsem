import React, { useState, useEffect } from 'react';
import { speakText } from '../services/gemini';
import { Delete } from 'lucide-react';

interface SymbolGameProps {
  onComplete: () => void;
  voiceName: string;
  level: number;
}

// Map specific symbols to fixed numbers for the "Legend"
const SYMBOL_MAP = [
    { symbol: '🌸', number: 1 },
    { symbol: '🐞', number: 2 },
    { symbol: '🍀', number: 3 },
    { symbol: '🍄', number: 4 },
    { symbol: '⭐', number: 5 },
    { symbol: '🌙', number: 6 },
    { symbol: '🍎', number: 7 },
    { symbol: '🚙', number: 8 },
    { symbol: '🎈', number: 9 },
];

const SymbolGame: React.FC<SymbolGameProps> = ({ onComplete, voiceName, level }) => {
  const [legend, setLegend] = useState<{symbol: string, number: number}[]>([]);
  const [questionSequence, setQuestionSequence] = useState<{symbol: string, number: number}[]>([]);
  const [userInputs, setUserInputs] = useState<number[]>([]);
  
  // Game Setup
  useEffect(() => {
    // Determine Difficulty
    let legendSize = 3;
    let sequenceLength = 2;

    if (level > 1) { legendSize = 4; sequenceLength = 3; }
    if (level > 3) { legendSize = 5; sequenceLength = 4; }
    if (level > 5) { legendSize = 6; sequenceLength = 5; }

    // 1. Create Legend (Pick unique symbols)
    const shuffledMap = [...SYMBOL_MAP].sort(() => 0.5 - Math.random());
    const currentLegend = shuffledMap.slice(0, legendSize).sort((a, b) => a.number - b.number);
    setLegend(currentLegend);

    // 2. Create Question Sequence based on the legend
    const newSequence = [];
    for (let i = 0; i < sequenceLength; i++) {
        const randomItem = currentLegend[Math.floor(Math.random() * currentLegend.length)];
        newSequence.push(randomItem);
    }
    setQuestionSequence(newSequence);
    setUserInputs([]);

    speakText(`Look at the code map! Then type the numbers to solve the puzzle!`, voiceName);

  }, [level, voiceName]);

  const handleNumberClick = (num: number) => {
    if (userInputs.length < questionSequence.length) {
        const newInputs = [...userInputs, num];
        setUserInputs(newInputs);
        
        // Check if this specific input was correct for the current position
        const currentIndex = newInputs.length - 1;
        if (newInputs[currentIndex] !== questionSequence[currentIndex].number) {
            speakText("Oops! Check the map again.", voiceName);
        } else {
             // Speak number to confirm
             speakText(`${num}`, voiceName);
        }

        // Check for full completion
        if (newInputs.length === questionSequence.length) {
            const isCorrect = newInputs.every((val, index) => val === questionSequence[index].number);
            if (isCorrect) {
                setTimeout(() => {
                   speakText("You cracked the code! Amazing!", voiceName);
                   onComplete();
                }, 500);
            } else {
                 setTimeout(() => {
                    speakText("Not quite right. Let's try that again!", voiceName);
                    setUserInputs([]); // Reset on failure
                 }, 1000);
            }
        }
    }
  };

  const handleDelete = () => {
      setUserInputs(prev => prev.slice(0, -1));
  };

  return (
    <div className="flex flex-col items-center h-full w-full gap-4 pt-2 overflow-hidden">
      <h2 className="text-2xl text-white font-bold drop-shadow-md bg-vivid-purple px-6 py-2 rounded-full border-2 border-white shrink-0">Crack the Code!</h2>
      
      {/* 1. LEGEND / MAP */}
      <div className="bg-white/80 backdrop-blur p-4 rounded-3xl shadow-lg border-4 border-vivid-purple flex flex-wrap justify-center gap-4 shrink-0 max-h-[30%] overflow-y-auto">
          {legend.map((item) => (
              <div key={item.number} className="flex flex-col items-center gap-1">
                  <div className="text-3xl">{item.symbol}</div>
                  <div className="text-xl font-bold text-gray-400">=</div>
                  <div className="text-2xl font-bold text-white bg-vivid-purple w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                      {item.number}
                  </div>
              </div>
          ))}
      </div>

      {/* 2. QUESTION SEQUENCE */}
      <div className="flex items-center gap-2 my-2 bg-blue-50/80 p-4 rounded-3xl border-4 border-dashed border-vivid-blue shadow-inner min-w-[280px] justify-center shrink-0">
          {questionSequence.map((item, idx) => {
              const userAnswer = userInputs[idx];
              const isFilled = userAnswer !== undefined;
              const isCorrect = isFilled && userAnswer === item.number;
              const isWrong = isFilled && userAnswer !== item.number;

              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                     <div className="text-4xl animate-bounce" style={{ animationDelay: `${idx * 0.2}s` }}>
                         {item.symbol}
                     </div>
                     <div className="text-xl text-gray-300">⬇️</div>
                     <div className={`
                        w-12 h-12 rounded-xl border-4 flex items-center justify-center text-2xl font-bold transition-all shadow-md
                        ${!isFilled ? 'bg-white border-gray-300 text-transparent' : ''}
                        ${isCorrect ? 'bg-vivid-green border-green-600 text-white scale-110' : ''}
                        ${isWrong ? 'bg-red-100 border-red-500 text-red-600 shake' : ''}
                     `}>
                         {userAnswer}
                     </div>
                </div>
              );
          })}
      </div>

      {/* 3. NUMPAD (Always forced to bottom with mt-auto) */}
      <div className="grid grid-cols-5 gap-2 mt-auto mb-2 bg-white/80 backdrop-blur p-3 rounded-3xl shadow-xl w-full max-w-md shrink-0 border-4 border-white">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
              const inLegend = legend.some(l => l.number === num);
              
              return (
                <button
                    key={num}
                    onClick={() => handleNumberClick(num)}
                    disabled={!inLegend} 
                    className={`
                        aspect-square rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 transition-all
                        text-2xl font-bold flex items-center justify-center border-2
                        ${inLegend 
                            ? 'bg-vivid-yellow text-gray-800 border-yellow-500 hover:bg-yellow-300' 
                            : 'bg-gray-200 text-gray-400 border-transparent opacity-40 cursor-not-allowed'}
                    `}
                >
                    {num}
                </button>
              );
          })}
           <button
                onClick={handleDelete}
                className="col-span-1 aspect-square rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 transition-all bg-vivid-pink text-white border-2 border-pink-700 flex items-center justify-center hover:bg-pink-400"
            >
                <Delete size={20} />
            </button>
      </div>

    </div>
  );
};

export default SymbolGame;