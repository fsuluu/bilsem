
import React, { useState, useEffect } from 'react';
import { AppState, GameType, Character, CHARACTERS, LevelConfig } from './types';
import { speakText } from './services/gemini';
import TangramGame from './games/TangramGame';
import PatternGame from './games/PatternGame';
import DrawingGame from './games/DrawingGame';
import SymbolGame from './games/SymbolGame';
import MemoryGame from './games/MemoryGame';
import ShadowGame from './games/ShadowGame';
import LiveBuddy from './components/LiveBuddy';
import Button from './components/Button';
import { ChevronLeft, Star, Palette, Puzzle, Grid, MessageCircle, Brain, Sun, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameType>(GameType.NONE);
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);

  const handleStart = () => {
    setAppState(AppState.CHARACTER_SELECT);
    speakText("Welcome! Pick a friend to play with!", 'Puck');
  };

  const handleCharacterSelect = (char: Character) => {
    setSelectedCharacter(char);
    setAppState(AppState.DASHBOARD);
    speakText(`Hi! I'm ${char.name}. Let's play some games!`, char.voiceName);
  };

  const handleGameSelect = (game: GameType) => {
    setSelectedGame(game);
    setAppState(AppState.PLAYING);
    setLevel(1);
  };

  const handleBackToDashboard = () => {
    setSelectedGame(GameType.NONE);
    setAppState(AppState.DASHBOARD);
    if(selectedCharacter) {
        speakText("Back to the fun zone!", selectedCharacter.voiceName);
    }
  };

  const handleLevelComplete = () => {
    if(selectedCharacter) {
        speakText("Yay! You did it! Next level!", selectedCharacter.voiceName);
    }
    setShowLevelUp(true);
    
    // Automatic progression after animation
    setTimeout(() => {
        setLevel(prev => prev + 1);
        setShowLevelUp(false);
    }, 2000);
  };

  // Helper for pattern styles
  const getPatternStyle = (pattern: 'dots' | 'stripes' | 'grid' | 'none') => {
      switch (pattern) {
          case 'dots': return { backgroundImage: 'radial-gradient(rgba(255,255,255,0.25) 3px, transparent 3px)', backgroundSize: '20px 20px' };
          case 'stripes': return { backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 10px, transparent 10px, transparent 20px)' };
          case 'grid': return { backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.2) 2px, transparent 2px)', backgroundSize: '30px 30px' };
          default: return {};
      }
  };

  // Helper for dashboard card content
  const GameCard = ({ 
    type, 
    title, 
    icon: Icon, 
    bgClass, 
    shadowColor,
    pattern = 'dots'
  }: { 
    type: GameType, 
    title: string, 
    icon: any, 
    bgClass: string, 
    shadowColor: string,
    pattern?: 'dots' | 'stripes' | 'grid' | 'none'
  }) => (
    <div 
      onClick={() => handleGameSelect(type)} 
      className={`
        group relative overflow-hidden rounded-[2rem] p-4 cursor-pointer transition-all duration-300
        ${bgClass}
        shadow-[0_8px_0_${shadowColor}] hover:translate-y-1 hover:shadow-[0_5px_0_${shadowColor}] active:translate-y-2 active:shadow-none
        border-4 border-white aspect-square flex flex-col items-center justify-center
      `}
    >
        {/* Pattern Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-60" style={getPatternStyle(pattern)}></div>

        {/* Decorative Shapes */}
        <div className="absolute top-[-30%] right-[-30%] w-40 h-40 bg-white/20 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-150 group-hover:rotate-12"></div>
        <div className="absolute bottom-[-20%] left-[-20%] w-32 h-32 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-xl transition-transform duration-500 group-hover:scale-125"></div>

        {/* Content */}
        <div className="z-10 flex flex-col items-center gap-3 transform transition-transform duration-300 group-hover:scale-110">
            <div className="bg-white/25 p-5 rounded-3xl backdrop-blur-sm border-2 border-white/40 shadow-inner group-hover:bg-white/40 transition-colors relative">
                <Icon size={52} className="text-white drop-shadow-md relative z-10" strokeWidth={2.5} />
                <Sparkles size={20} className="text-yellow-200 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-xl md:text-2xl font-black text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] text-center leading-tight tracking-wide uppercase">
                {title}
            </span>
        </div>
    </div>
  );

  // --- Renders ---

  if (appState === AppState.WELCOME) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-starry-sky">
        <div className="absolute inset-0 bg-gradient-to-t from-vivid-purple/50 to-transparent pointer-events-none"></div>
        <div className="text-9xl mb-8 animate-float">🚀</div>
        <h1 className="text-6xl font-bold text-white mb-12 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] text-center px-4 z-10 font-sans">
          Little Learners<br/><span className="text-vivid-yellow">Magic App</span>
        </h1>
        <Button onClick={handleStart} color="bg-vivid-green" className="text-3xl px-12 py-6 border-4 border-white z-10 shadow-[0_10px_0_#008000] hover:bg-green-400">
          Start Game! 🌟
        </Button>
      </div>
    );
  }

  if (appState === AppState.CHARACTER_SELECT) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-starry-sky p-8">
        <h2 className="text-4xl font-bold text-white mb-12 bg-white/20 backdrop-blur px-8 py-4 rounded-full shadow-lg border-2 border-white/50">Pick Your Friend</h2>
        <div className="grid grid-cols-2 gap-8 w-full max-w-4xl z-10">
          {CHARACTERS.map(char => (
            <div 
              key={char.id}
              onClick={() => handleCharacterSelect(char)}
              className={`${char.color} h-64 rounded-3xl shadow-[0_10px_0_rgba(0,0,0,0.2)] flex flex-col items-center justify-center cursor-pointer transform hover:scale-105 transition-all border-4 border-white relative overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              <div className="text-8xl mb-4 animate-bounce z-10">{char.emoji}</div>
              <div className="text-3xl font-bold text-white tracking-wider drop-shadow-md z-10">{char.name}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (appState === AppState.DASHBOARD && selectedCharacter) {
    return (
      <div className="h-full w-full bg-starry-sky flex flex-col relative overflow-hidden">
        {/* Header - Vibrant Rainbow Wave */}
        <div className={`
            p-4 
            bg-gradient-to-r from-vivid-purple via-vivid-pink to-vivid-orange 
            flex items-center justify-between z-10 
            shadow-[0_4px_20px_rgba(0,0,0,0.2)] 
            border-b-[6px] border-white/30 
            rounded-b-[3rem] 
            mx-2
        `}>
           <div className="flex items-center gap-3 pl-2">
               <div className={`w-14 h-14 flex items-center justify-center ${selectedCharacter.color} rounded-full border-4 border-white shadow-lg text-3xl transform hover:scale-110 transition-transform`}>
                   {selectedCharacter.emoji}
               </div>
               <div className="flex flex-col">
                   <span className="text-white/80 text-xs font-bold uppercase tracking-widest">Player</span>
                   <span className="text-2xl font-black text-white drop-shadow-md tracking-wide">{selectedCharacter.name}</span>
               </div>
           </div>
           
           <button 
             onClick={() => setShowLiveChat(true)}
             className="bg-white text-vivid-purple px-6 py-2 rounded-full font-black shadow-[0_4px_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 border-2 border-vivid-purple hover:bg-purple-50"
           >
               <MessageCircle size={20} strokeWidth={3} />
               <span className="uppercase tracking-wider">Chat</span>
           </button>
        </div>

        {/* Game Grid */}
        <div className="flex-1 p-4 md:p-6 grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto w-full content-center z-10 overflow-y-auto pb-8">
            <GameCard 
                type={GameType.TANGRAM} 
                title="Tangram" 
                icon={Puzzle} 
                bgClass="bg-gradient-to-br from-[#29B6F6] via-[#039BE5] to-[#0277BD]"
                shadowColor="#01579B" 
                pattern="grid"
            />
            <GameCard 
                type={GameType.PATTERN} 
                title="Pattern Pop" 
                icon={Grid} 
                bgClass="bg-gradient-to-br from-[#FF4081] via-[#F50057] to-[#C51162]"
                shadowColor="#880E4F" 
                pattern="dots"
            />
            <GameCard 
                type={GameType.DRAWING} 
                title="Creative Studio" 
                icon={Palette} 
                bgClass="bg-gradient-to-br from-[#EA80FC] via-[#AB47BC] to-[#7B1FA2]"
                shadowColor="#4A148C" 
                pattern="stripes"
            />
            <GameCard 
                type={GameType.SYMBOL} 
                title="Code Break" 
                icon={Star} 
                bgClass="bg-gradient-to-br from-[#FFCA28] via-[#FFB300] to-[#FF6F00]"
                shadowColor="#E65100" 
                pattern="dots"
            />
            <GameCard 
                type={GameType.MEMORY} 
                title="Memory" 
                icon={Brain} 
                bgClass="bg-gradient-to-br from-[#69F0AE] via-[#00E676] to-[#00C853]"
                shadowColor="#1B5E20" 
                pattern="grid"
            />
            <GameCard 
                type={GameType.SHADOW} 
                title="Shadows" 
                icon={Sun} 
                bgClass="bg-gradient-to-br from-[#26C6DA] via-[#00BCD4] to-[#0097A7]"
                shadowColor="#006064" 
                pattern="stripes"
            />
        </div>

        {showLiveChat && (
            <LiveBuddy character={selectedCharacter} onClose={() => setShowLiveChat(false)} />
        )}
      </div>
    );
  }

  if (appState === AppState.PLAYING && selectedCharacter) {
    return (
      <div className="h-full w-full bg-starry-sky flex flex-col">
        {/* Transparent Overlay to show stars */}
        <div className="absolute inset-0 z-0"></div>
        
        {/* Game Header - Floating Glass Pill */}
        <div className="pt-4 px-4 flex items-center justify-center z-10 w-full max-w-5xl mx-auto">
            <div className="w-full bg-white/20 backdrop-blur-md rounded-full p-2 pl-3 pr-3 flex items-center justify-between border-2 border-white/50 shadow-lg">
                <button onClick={handleBackToDashboard} className="p-2 bg-white rounded-full shadow-[0_4px_0_rgba(0,0,0,0.1)] hover:bg-gray-50 border-2 border-gray-200 transition group active:translate-y-1 active:shadow-none">
                    <ChevronLeft size={28} className="text-vivid-blue group-hover:-translate-x-1 transition-transform" strokeWidth={3} />
                </button>
                
                <div className={`px-8 py-2 rounded-full shadow-inner ${selectedCharacter.color} border-4 border-white/30 flex items-center gap-3 transform -skew-x-6`}>
                     <div className="skew-x-6 font-black text-white text-xl tracking-wider flex items-center gap-2">
                        <span>{selectedGame === GameType.DRAWING ? 'Creative Studio' : `LEVEL ${level}`}</span>
                        {selectedGame !== GameType.DRAWING && <span className="text-2xl filter drop-shadow-md animate-pulse">⭐</span>}
                     </div>
                </div>
                
                <div className="w-12 h-12 rounded-full bg-white/30 border-2 border-white flex items-center justify-center">
                    <span className="text-2xl">{selectedCharacter.emoji}</span>
                </div>
            </div>
        </div>

        {/* Game Content */}
        <div className="flex-1 relative overflow-hidden p-2 md:p-4 flex items-center justify-center z-10">
            {selectedGame === GameType.TANGRAM && <TangramGame key={level} level={level} onComplete={handleLevelComplete} voiceName={selectedCharacter.voiceName} />}
            {selectedGame === GameType.PATTERN && <PatternGame key={level} level={level} onComplete={handleLevelComplete} voiceName={selectedCharacter.voiceName} />}
            {selectedGame === GameType.DRAWING && <DrawingGame key={level} level={level} onComplete={handleLevelComplete} voiceName={selectedCharacter.voiceName} />}
            {selectedGame === GameType.SYMBOL && <SymbolGame key={level} level={level} onComplete={handleLevelComplete} voiceName={selectedCharacter.voiceName} />}
            {selectedGame === GameType.MEMORY && <MemoryGame key={level} level={level} onComplete={handleLevelComplete} voiceName={selectedCharacter.voiceName} />}
            {selectedGame === GameType.SHADOW && <ShadowGame key={level} level={level} onComplete={handleLevelComplete} voiceName={selectedCharacter.voiceName} />}
            
            {/* Level Up Overlay - Stable & Beautiful */}
            {showLevelUp && selectedGame !== GameType.DRAWING && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-500 animate-in fade-in">
                    <div className="relative bg-white/95 p-8 rounded-[3rem] flex flex-col items-center border-[6px] border-vivid-yellow shadow-[0_0_80px_rgba(255,214,0,0.6)] max-w-sm w-full">
                        {/* Background effect inside card */}
                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-50 to-transparent opacity-50 rounded-[2.5rem] pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="text-8xl mb-2 drop-shadow-2xl animate-bounce">🌟</div>
                            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-vivid-purple to-vivid-pink mb-2 tracking-tight">
                                GREAT!
                            </h2>
                            <div className="flex items-center gap-2 text-xl font-bold text-vivid-green bg-green-50 px-6 py-2 rounded-full border-2 border-vivid-green shadow-sm">
                                <span>Next Level</span>
                                <span className="text-2xl">➡️</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
};

export default App;
