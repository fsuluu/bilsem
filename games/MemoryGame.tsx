import React, { useState, useEffect } from 'react';
import { speakText } from '../services/gemini';

interface MemoryGameProps {
  onComplete: () => void;
  voiceName: string;
  level: number;
}

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

const MemoryGame: React.FC<MemoryGameProps> = ({ onComplete, voiceName, level }) => {
  const [cards, setCards] = useState<{id: number, content: string, isFlipped: boolean, isMatched: boolean}[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isPreview, setIsPreview] = useState(true);

  useEffect(() => {
    // Generate deck based on level
    let pairCount = 4; // Level 1 (8 cards)
    if (level > 2) pairCount = 6;
    if (level > 4) pairCount = 8;

    const selectedEmojis = EMOJIS.slice(0, pairCount);
    // Create deck with isFlipped = true initially for preview
    const deck = [...selectedEmojis, ...selectedEmojis]
        .sort(() => Math.random() - 0.5)
        .map((emoji, index) => ({
            id: index,
            content: emoji,
            isFlipped: true, 
            isMatched: false
        }));
    
    setCards(deck);
    setIsPreview(true);
    speakText("Memorize the cards!", voiceName);

    // After 3 seconds, flip them back
    const timer = setTimeout(() => {
        setCards(prev => prev.map(c => ({ ...c, isFlipped: false })));
        setIsPreview(false);
        speakText("Find the matching pairs!", voiceName);
    }, 3000);

    return () => clearTimeout(timer);
  }, [level, voiceName]);

  const handleCardClick = (id: number) => {
      if (isPreview) return; // Disable clicking during preview
      if (flippedCards.length >= 2) return;
      const clickedCard = cards.find(c => c.id === id);
      if (clickedCard?.isFlipped || clickedCard?.isMatched) return;

      // Flip the card
      const newCards = cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
      setCards(newCards);
      setFlippedCards([...flippedCards, id]);

      // If it's the second card
      if (flippedCards.length === 1) {
          const firstId = flippedCards[0];
          const firstCard = cards.find(c => c.id === firstId);
          
          if (firstCard && clickedCard && firstCard.content === clickedCard.content) {
              // Match!
              speakText("You found a match!", voiceName);
              setTimeout(() => {
                  setCards(prev => prev.map(c => 
                      c.id === firstId || c.id === id 
                      ? { ...c, isMatched: true, isFlipped: true } 
                      : c
                  ));
                  setFlippedCards([]);
                  
                  // Check win
                  const allMatched = newCards.filter(c => !c.isMatched && c.id !== firstId && c.id !== id).length === 0;
                  if (allMatched) {
                      setTimeout(onComplete, 1000);
                  }
              }, 500);
          } else {
              // No match
              setTimeout(() => {
                  setCards(prev => prev.map(c => 
                      c.id === firstId || c.id === id 
                      ? { ...c, isFlipped: false } 
                      : c
                  ));
                  setFlippedCards([]);
              }, 1000);
          }
      }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <h2 className="text-3xl text-white font-bold mb-8 drop-shadow-md bg-vivid-purple px-6 py-2 rounded-full border-2 border-white">
          {isPreview ? "Memorize!" : "Memory Match!"}
      </h2>
      <div className="grid grid-cols-4 gap-4 p-4 max-w-2xl">
          {cards.map(card => (
              <div 
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`
                    aspect-square rounded-2xl cursor-pointer transition-all duration-500 transform
                    flex items-center justify-center text-5xl shadow-lg border-4
                    ${card.isFlipped || card.isMatched ? 'bg-white rotate-y-180 border-vivid-blue' : 'bg-vivid-cyan border-white hover:scale-105'}
                `}
                style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
              >
                  {card.isFlipped || card.isMatched ? card.content : '❓'}
              </div>
          ))}
      </div>
    </div>
  );
};

export default MemoryGame;