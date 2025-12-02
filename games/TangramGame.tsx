import React, { useState, useEffect } from 'react';
import { speakText } from '../services/gemini';

interface TangramGameProps {
  onComplete: () => void;
  voiceName: string;
  level: number;
}

// Puzzle Configurations
const PUZZLES = [
    {
        name: 'Rocket',
        shapes: ['triangle', 'square', 'circle'],
        slots: [
            { type: 'triangle', top: 'top-4', left: 'left-1/2 -translate-x-1/2', color: 'border-b-vivid-pink', slotColor: 'border-b-gray-400' },
            { type: 'square', top: 'top-[110px]', left: 'left-1/2 -translate-x-1/2', color: 'bg-vivid-blue', slotColor: 'bg-gray-300' },
            { type: 'circle', top: 'top-[130px]', left: 'left-1/2 -translate-x-1/2', color: 'bg-vivid-yellow', slotColor: 'bg-gray-500' }
        ]
    },
    {
        name: 'House',
        shapes: ['triangle', 'square', 'rect'],
        slots: [
             { type: 'triangle', top: 'top-10', left: 'left-1/2 -translate-x-1/2', color: 'border-b-vivid-orange', slotColor: 'border-b-gray-500' },
             { type: 'square', top: 'top-[110px]', left: 'left-1/2 -translate-x-1/2', color: 'bg-vivid-green', slotColor: 'bg-gray-300' },
             { type: 'rect', top: 'top-[150px]', left: 'left-1/2 -translate-x-1/2', color: 'bg-vivid-purple', width: 'w-12', height: 'h-16', slotColor: 'bg-gray-400' }
        ]
    },
    {
        name: 'Traffic Light',
        shapes: ['rect', 'circle', 'circle2'],
        slots: [
            { type: 'rect', top: 'top-10', left: 'left-1/2 -translate-x-1/2', color: 'bg-gray-800', width: 'w-24', height: 'h-60', slotColor: 'bg-gray-300' },
            { type: 'circle', top: 'top-14', left: 'left-1/2 -translate-x-1/2', color: 'bg-red-500', slotColor: 'bg-gray-400' },
            { type: 'circle2', top: 'top-32', left: 'left-1/2 -translate-x-1/2', color: 'bg-green-500', slotColor: 'bg-gray-500' }
        ]
    }
];

const TangramGame: React.FC<TangramGameProps> = ({ onComplete, voiceName, level }) => {
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [placedShapes, setPlacedShapes] = useState<string[]>([]);
  
  // Choose puzzle based on level
  const puzzleIndex = (level - 1) % PUZZLES.length;
  const puzzle = PUZZLES[puzzleIndex];

  useEffect(() => {
    speakText(`Let's build a ${puzzle.name}! Click a colored shape, then click the gray shadow where it matches!`, voiceName);
  }, [voiceName, puzzle.name]);

  const handleShapeClick = (shape: string) => {
    if (placedShapes.includes(shape)) return;
    setSelectedShape(shape);
    speakText(`You picked the ${shape}!`, voiceName);
  };

  const handleTargetClick = (target: string) => {
    if (!selectedShape) return;
    if (selectedShape === target) {
      setPlacedShapes(prev => [...prev, target]);
      setSelectedShape(null);
      speakText("Perfect fit!", voiceName);
      if (placedShapes.length + 1 === puzzle.shapes.length) {
        setTimeout(onComplete, 1000);
      }
    } else {
      speakText("Oops, that piece doesn't go there!", voiceName);
    }
  };

  // Helper to render shape visual
  const renderShapeVisual = (type: string, isSlot: boolean = false, placed: boolean = false, slotColorClass: string = '') => {
      // Basic styles
      const shadow = isSlot ? '' : 'hover:scale-110 drop-shadow-md';
      const highlight = selectedShape === type ? 'scale-125 drop-shadow-xl ring-4 ring-white' : '';
      
      if (type.includes('triangle')) {
          return <div className={`w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[70px] ${placed ? 'border-b-vivid-pink' : (isSlot ? slotColorClass : 'border-b-vivid-pink')} ${shadow} ${highlight}`}></div>;
      }
      if (type.includes('square')) {
          return <div className={`w-20 h-20 ${placed ? 'bg-vivid-blue' : (isSlot ? slotColorClass : 'bg-vivid-blue')} ${shadow} ${highlight}`}></div>;
      }
      if (type.includes('circle')) {
          return <div className={`w-14 h-14 rounded-full ${placed ? 'bg-vivid-yellow' : (isSlot ? slotColorClass : 'bg-vivid-yellow')} ${shadow} ${highlight}`}></div>;
      }
      if (type.includes('rect')) {
        return <div className={`w-12 h-20 ${placed ? 'bg-vivid-green' : (isSlot ? slotColorClass : 'bg-vivid-green')} ${shadow} ${highlight}`}></div>;
      }
      return <div className="w-10 h-10 bg-gray-500"></div>;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative">
      <h2 className="text-3xl text-white font-bold mb-8 drop-shadow-md bg-vivid-blue px-6 py-2 rounded-full border-2 border-white">Build the {puzzle.name}!</h2>
      
      <div className="relative w-80 h-96 bg-white/70 backdrop-blur-sm rounded-3xl border-4 border-dashed border-white p-4 shadow-xl">
         {puzzle.slots.map((slot, i) => (
             <div
                key={i}
                onClick={() => handleTargetClick(slot.type)}
                className={`absolute ${slot.top} ${slot.left} transition-all duration-300 cursor-pointer`}
             >
                 {/* Slot Placeholder */}
                 {slot.type.includes('triangle') && (
                     <div className={`w-0 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-b-[100px] ${placedShapes.includes(slot.type) ? slot.color : slot.slotColor || 'border-b-gray-300'}`}></div>
                 )}
                 {slot.type.includes('square') && (
                     <div className={`w-28 h-28 ${placedShapes.includes(slot.type) ? slot.color : slot.slotColor || 'bg-gray-300'}`}></div>
                 )}
                 {slot.type.includes('circle') && (
                     <div className={`w-16 h-16 rounded-full ${placedShapes.includes(slot.type) ? slot.color : slot.slotColor || 'bg-gray-300'}`}></div>
                 )}
                 {slot.type.includes('rect') && (
                     <div className={`${slot.width || 'w-20'} ${slot.height || 'h-20'} ${placedShapes.includes(slot.type) ? slot.color : slot.slotColor || 'bg-gray-300'}`}></div>
                 )}
             </div>
         ))}
      </div>

      {/* Shapes Deck */}
      <div className="flex gap-8 mt-12 p-6 bg-white/90 backdrop-blur rounded-2xl border-4 border-vivid-blue min-h-[120px] items-center shadow-lg">
        {puzzle.shapes.map(shape => {
            if (placedShapes.includes(shape)) return null;
            return (
                <div key={shape} onClick={() => handleShapeClick(shape)} className="cursor-pointer transition-transform">
                    {renderShapeVisual(shape)}
                </div>
            );
        })}
        {placedShapes.length === puzzle.shapes.length && (
            <div className="text-2xl font-bold text-vivid-green animate-bounce">Good Job!</div>
        )}
      </div>
    </div>
  );
};

export default TangramGame;