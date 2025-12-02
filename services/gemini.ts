import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Audio Context Helper ---
let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return audioContext;
};

// --- Helper Functions ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): any {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- TTS Service ---
export const speakText = async (text: string, voiceName: string = 'Puck') => {
  if (!apiKey) return;
  
  // Stop previous audio if playing
  if (currentSource) {
      try {
          currentSource.stop();
      } catch (e) {
          // ignore if already stopped
      }
      currentSource = null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        ctx,
        24000,
        1
      );
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
      currentSource = source; // Store reference
      
      source.onended = () => {
          if (currentSource === source) {
              currentSource = null;
          }
      }
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
};

// --- Image Editing Service ---
export const editImageWithGemini = async (
  base64Image: string,
  prompt: string
): Promise<string | null> => {
  if (!apiKey) return null;

  try {
    // Remove header if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/png', // Canvas exports as PNG
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    return null;
  } catch (error) {
    console.error("Image Edit Error:", error);
    return null;
  }
};


// --- Live API Service (Conversational) ---
export class LiveClient {
    private session: any; // Holds the active session
    private inputAudioContext: AudioContext | null = null;
    private outputAudioContext: AudioContext | null = null;
    private inputSource: MediaStreamAudioSourceNode | null = null;
    private processor: ScriptProcessorNode | null = null;
    private nextStartTime = 0;
    private sources = new Set<AudioBufferSourceNode>();
    private stream: MediaStream | null = null;

    async connect(onClose: () => void, voiceName: string = 'Puck') {
        if (!apiKey) return;

        this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const config = {
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: async () => {
                    console.log("Live Session Opened");
                    if (!this.inputAudioContext || !this.stream) return;

                    this.inputSource = this.inputAudioContext.createMediaStreamSource(this.stream);
                    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

                    this.processor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        // Send audio chunk
                         this.session.then((s: any) => {
                             s.sendRealtimeInput({ media: pcmBlob });
                         }).catch((err: any) => console.error("Session send error", err));
                    };

                    this.inputSource.connect(this.processor);
                    this.processor.connect(this.inputAudioContext.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (base64Audio && this.outputAudioContext) {
                        this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
                        const audioBuffer = await decodeAudioData(
                            decode(base64Audio),
                            this.outputAudioContext,
                            24000,
                            1
                        );
                        const source = this.outputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(this.outputAudioContext.destination);
                        source.addEventListener('ended', () => {
                             this.sources.delete(source);
                        });
                        source.start(this.nextStartTime);
                        this.nextStartTime += audioBuffer.duration;
                        this.sources.add(source);
                    }

                    if (message.serverContent?.interrupted) {
                         this.sources.forEach(s => s.stop());
                         this.sources.clear();
                         this.nextStartTime = 0;
                    }
                },
                onclose: () => {
                    console.log("Live Session Closed");
                    onClose();
                },
                onerror: (e: any) => {
                    console.error("Live Session Error", e);
                    onClose();
                }
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } }
                },
                systemInstruction: "You are a friendly, encouraging companion for a 5-year-old child. Keep sentences short, simple, and very enthusiastic. Do not use complex words."
            }
        };

        this.session = ai.live.connect(config);
    }

    async disconnect() {
        if (this.session) {
            // No direct close method exposed easily on the promise wrapper in all SDK versions,
            // but we can close media resources
            // Assuming session handles its own closure or we just stop sending data.
            // In a real scenario, we might keep a reference to the underlying socket if possible.
            // For now, we clean up local resources.
        }
        if (this.inputSource) this.inputSource.disconnect();
        if (this.processor) this.processor.disconnect();
        if (this.inputAudioContext) this.inputAudioContext.close();
        if (this.outputAudioContext) this.outputAudioContext.close();
        if (this.stream) this.stream.getTracks().forEach(track => track.stop());
        this.sources.forEach(s => s.stop());
        this.sources.clear();
    }
}