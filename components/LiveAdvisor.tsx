import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

const LiveAdvisor: React.FC = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const frameIntervalRef = useRef<number | null>(null);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
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
  };

  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startSession = async () => {
    try {
      setIsConnecting(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputNodeRef.current = audioContextOutRef.current.createGain();
      outputNodeRef.current.connect(audioContextOutRef.current.destination);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.0-flash-exp',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            
            const source = audioContextInRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextInRef.current!.destination);

            frameIntervalRef.current = window.setInterval(() => {
              if (isCameraOff || !videoRef.current || !canvasRef.current) return;
              const ctx = canvasRef.current.getContext('2d');
              if (!ctx) return;
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
              ctx.drawImage(videoRef.current, 0, 0);
              canvasRef.current.toBlob(async (blob) => {
                if (blob) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64Data = (reader.result as string).split(',')[1];
                    sessionPromise.then(s => s.sendRealtimeInput({
                      media: { data: base64Data, mimeType: 'image/jpeg' }
                    }));
                  };
                  reader.readAsDataURL(blob);
                }
              }, 'image/jpeg', 0.6);
            }, 1000);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioContextOutRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextOutRef.current.currentTime);
              const buffer = await decodeAudioData(decode(audioData), audioContextOutRef.current, 24000, 1);
              const source = audioContextOutRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(outputNodeRef.current!);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error('XYZ Bank Live API Error:', e),
          onclose: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: "You are a friendly and professional XYZ Bank Video Advisor. You are here to help customers with their banking questions, document preparation, and service inquiries. You can see the customer via their camera, so feel free to comment on documents they hold up. Keep your answers concise and professional as per XYZ Bank standards."
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start session:', err);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    if (audioContextInRef.current) audioContextInRef.current.close();
    if (audioContextOutRef.current) audioContextOutRef.current.close();
    
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    
    setIsActive(false);
    setIsConnecting(false);
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 max-w-[1500px] mx-auto">
      <div className="w-full max-w-5xl bg-gray-900 rounded-3xl overflow-hidden shadow-2xl relative aspect-video group">
        
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-20'}`}
        />
        <canvas ref={canvasRef} className="hidden" />

        {!isActive && !isConnecting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 bg-blue-900/50 rounded-full flex items-center justify-center mb-6 ring-4 ring-blue-500/20 animate-pulse">
              <i className="fas fa-headset text-4xl text-blue-400"></i>
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Connect with an XYZ Advisor</h2>
            <p className="text-gray-400 max-w-md">Our official AI specialists are ready to help you with real-time verification and account assistance.</p>
            <button 
              onClick={startSession}
              className="mt-8 bg-blue-600 hover:bg-blue-500 text-white px-12 py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 transition-all active:scale-95"
            >
              Start Secure Video Call
            </button>
          </div>
        )}

        {isConnecting && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white">
            <div className="flex space-x-2 mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="font-bold tracking-widest uppercase text-xs opacity-70">Securing Official Line...</p>
          </div>
        )}

        {isActive && (
          <>
            <div className="absolute top-8 left-8 flex items-center gap-3">
              <div className="bg-red-600 px-4 py-1.5 rounded-full flex items-center gap-2 animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                <span className="text-[11px] font-black text-white uppercase tracking-widest">Official Live Support</span>
              </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 transition-all opacity-0 group-hover:opacity-100 focus-within:opacity-100">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-600 text-white' : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-xl'}`}
              >
                <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-xl`}></i>
              </button>
              <button 
                onClick={stopSession}
                className="w-24 h-24 rounded-3xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-2xl transition-all active:scale-90"
              >
                <i className="fas fa-phone-slash text-3xl"></i>
              </button>
              <button 
                onClick={() => setIsCameraOff(!isCameraOff)}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isCameraOff ? 'bg-red-600 text-white' : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-xl'}`}
              >
                <i className={`fas ${isCameraOff ? 'fa-video-slash' : 'fa-video'} text-xl`}></i>
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <i className="fas fa-file-invoice text-xl"></i>
          </div>
          <div>
            <h4 className="font-black text-gray-900 text-base">Formal Document Review</h4>
            <p className="text-sm text-gray-500 mt-2 font-medium">Verify your compliance documents with an XYZ expert advisor instantly.</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <i className="fas fa-lock text-xl"></i>
          </div>
          <div>
            <h4 className="font-black text-gray-900 text-base">Encrypted Channel</h4>
            <p className="text-sm text-gray-500 mt-2 font-medium">Banking-grade secure video transmission for your privacy and safety.</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
            <i className="fas fa-bolt text-xl"></i>
          </div>
          <div>
            <h4 className="font-black text-gray-900 text-base">Instant Resolution</h4>
            <p className="text-sm text-gray-500 mt-2 font-medium">Minimize branch visits by resolving queries through our live digital advisor.</p>
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => navigate('/dashboard')}
        className="mt-12 text-gray-400 hover:text-blue-600 font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all"
      >
        <i className="fas fa-arrow-left"></i>
        Return to XYZ Dashboard
      </button>
    </div>
  );
};

export default LiveAdvisor;