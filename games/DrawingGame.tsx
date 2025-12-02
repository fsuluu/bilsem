import React, { useRef, useState, useEffect } from 'react';
import { speakText } from '../services/gemini';
import { Eraser, Trash2, Save, Brush, Stamp, SprayCan, PenTool } from 'lucide-react';

interface DrawingGameProps {
  onComplete: () => void;
  voiceName: string;
  level: number;
}

const DrawingGame: React.FC<DrawingGameProps> = ({ voiceName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FF4081');
  const [brushSize, setBrushSize] = useState(10);
  const [tool, setTool] = useState<'pen' | 'marker' | 'spray' | 'eraser' | 'sticker'>('pen');
  const [selectedSticker, setSelectedSticker] = useState('⭐');
  const [savedImages, setSavedImages] = useState<string[]>([]);

  const COLORS = [
    '#FF0000', '#FF9100', '#FFD600', '#00C853', '#00E5FF', '#2962FF', '#AA00FF', '#FF4081', 
    '#8D6E63', '#212121', '#FFFFFF'
  ];

  const STICKERS = ['⭐', '❤️', '🎈', '🐶', '🐱', '🦄', '🍎', '🍕', '🚗', '🚀', '🌈', '🌻', '👀', '😎'];

  useEffect(() => {
    speakText("Welcome to the Art Studio! Draw, paint, and add stickers!", voiceName);
    clearCanvas();
  }, [voiceName]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    const rect = canvas.getBoundingClientRect();
    return {
      offsetX: (clientX - rect.left) * (canvas.width / rect.width),
      offsetY: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Handle Sticker Stamp
    if (tool === 'sticker') {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const { offsetX, offsetY } = getCoordinates(e, canvas);
            ctx.font = `${brushSize * 5}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(selectedSticker, offsetX, offsetY);
            speakText("Pop!", voiceName); // Sound effect for sticker
        }
        return;
    }

    // Handle Drawing Start
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { offsetX, offsetY } = getCoordinates(e, canvas);
    
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    
    // Brush Styles
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    ctx.fillStyle = tool === 'eraser' ? '#FFFFFF' : color;
    
    if (tool === 'marker') {
        ctx.globalAlpha = 0.5; // Transparent ink
        ctx.lineWidth = brushSize * 1.5;
        ctx.lineCap = 'square';
    } else if (tool === 'spray') {
        ctx.globalAlpha = 1;
        // Spray logic happens in draw()
    } else {
        // Pen / Eraser
        ctx.globalAlpha = 1;
        ctx.lineWidth = tool === 'eraser' ? brushSize * 2 : brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || tool === 'sticker') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { offsetX, offsetY } = getCoordinates(e, canvas);

    if (tool === 'spray') {
        // Spray Effect
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * brushSize * 1.5;
            const x = offsetX + Math.cos(angle) * radius;
            const y = offsetY + Math.sin(angle) * radius;
            ctx.fillRect(x, y, 2, 2);
        }
    } else {
        // Line Drawing
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if(canvas) {
        const ctx = canvas.getContext('2d');
        if(ctx) {
            ctx.closePath();
            ctx.globalAlpha = 1; // Reset alpha
        }
    }
  };

  const saveDrawing = () => {
    if(!canvasRef.current) return;
    const data = canvasRef.current.toDataURL();
    setSavedImages(prev => [data, ...prev]);
    speakText("Saved to your gallery!", voiceName);
  };

  return (
    <div className="flex h-full w-full gap-4 p-4 max-w-7xl mx-auto">
      {/* Left Sidebar: Tools & Colors */}
      <div className="w-24 flex flex-col gap-4 shrink-0">
          
          {/* Brush Types */}
          <div className="bg-white/90 backdrop-blur rounded-2xl p-2 flex flex-col gap-2 shadow-lg border-2 border-white">
              <button onClick={() => setTool('pen')} className={`p-3 rounded-xl transition ${tool === 'pen' ? 'bg-vivid-blue text-white' : 'hover:bg-gray-100'}`} title="Pen"><PenTool size={24} /></button>
              <button onClick={() => setTool('marker')} className={`p-3 rounded-xl transition ${tool === 'marker' ? 'bg-vivid-blue text-white' : 'hover:bg-gray-100'}`} title="Marker"><Brush size={24} /></button>
              <button onClick={() => setTool('spray')} className={`p-3 rounded-xl transition ${tool === 'spray' ? 'bg-vivid-blue text-white' : 'hover:bg-gray-100'}`} title="Spray"><SprayCan size={24} /></button>
              <button onClick={() => setTool('eraser')} className={`p-3 rounded-xl transition ${tool === 'eraser' ? 'bg-vivid-blue text-white' : 'hover:bg-gray-100'}`} title="Eraser"><Eraser size={24} /></button>
              <button onClick={() => setTool('sticker')} className={`p-3 rounded-xl transition ${tool === 'sticker' ? 'bg-vivid-blue text-white' : 'hover:bg-gray-100'}`} title="Stickers"><Stamp size={24} /></button>
          </div>

          {/* Color Palette */}
          <div className="bg-white/90 backdrop-blur rounded-2xl p-2 flex flex-col gap-2 shadow-lg border-2 border-white overflow-y-auto flex-1 no-scrollbar">
              {COLORS.map(c => (
                  <button 
                    key={c}
                    onClick={() => { setColor(c); if(tool === 'eraser' || tool === 'sticker') setTool('pen'); }}
                    className={`w-full aspect-square rounded-full border-2 border-gray-100 transition-transform ${color === c && tool !== 'eraser' ? 'scale-110 ring-2 ring-black' : ''}`}
                    style={{ backgroundColor: c }}
                  />
              ))}
          </div>
      </div>

      {/* Main Area: Canvas */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Canvas Container */}
          <div className="flex-1 bg-white rounded-3xl shadow-2xl overflow-hidden relative border-4 border-white cursor-crosshair">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full h-full object-contain touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
          </div>

          {/* Bottom Bar: Sticker Selector & Actions */}
          <div className="bg-white/90 backdrop-blur rounded-2xl p-4 flex gap-4 items-center shadow-lg border-2 border-white min-h-[80px]">
              
              {/* Sticker Selector (Visible only if Sticker Tool active) */}
              {tool === 'sticker' ? (
                  <div className="flex-1 flex gap-2 overflow-x-auto pb-2 items-center">
                      <span className="font-bold text-gray-400 mr-2">Pick:</span>
                      {STICKERS.map(s => (
                          <button 
                            key={s} 
                            onClick={() => setSelectedSticker(s)}
                            className={`text-4xl hover:scale-125 transition p-2 rounded-lg ${selectedSticker === s ? 'bg-blue-100' : ''}`}
                          >
                              {s}
                          </button>
                      ))}
                  </div>
              ) : (
                  <div className="flex-1 flex items-center gap-4">
                      <span className="font-bold text-gray-500">Size:</span>
                      <input 
                        type="range" 
                        min="5" 
                        max="50" 
                        value={brushSize} 
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-64 accent-vivid-blue h-4"
                      />
                  </div>
              )}

              <div className="w-[1px] h-10 bg-gray-300 mx-2"></div>

              <button 
                onClick={clearCanvas} 
                className="p-3 bg-red-100 text-red-500 rounded-xl hover:bg-red-200 transition"
                title="Clear"
              >
                  <Trash2 size={24} />
              </button>
              
              <button 
                onClick={saveDrawing} 
                className="p-3 bg-vivid-green text-white rounded-xl hover:bg-green-600 transition shadow-md"
                title="Save"
              >
                  <Save size={24} />
              </button>
          </div>
      </div>

      {/* Right Sidebar: Gallery */}
      <div className="w-24 bg-white/60 rounded-xl overflow-y-auto p-2 flex flex-col gap-2 shrink-0 backdrop-blur-sm border-2 border-white/50">
         <div className="text-center font-bold text-white mb-2 drop-shadow-md text-xs">GALLERY</div>
         {savedImages.map((src, i) => (
             <img key={i} src={src} className="w-full h-20 object-cover rounded-lg border-2 border-white shadow-sm bg-white" alt="saved" />
         ))}
      </div>
    </div>
  );
};

export default DrawingGame;