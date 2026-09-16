/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Volume2, Loader2, Download, Play, Pause, AlertCircle, Type, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { VoiceType } from './types';

const SAMPLE_TAMIL_TEXT = `தமிழ் மொழி உலகின் மிகப் பழமையான மொழிகளில் ஒன்றாகும். இதன் இலக்கியங்கள் இரண்டாயிரம் ஆண்டுகளுக்கும் மேற்பட்ட பழமை வாய்ந்தவை. திருக்குறள், சிலப்பதிகாரம் போன்ற நூல்கள் தமிழின் பெருமையை உலகுக்குப் பறைசாற்றுகின்றன.`;

const VOICES: { id: VoiceType; name: string }[] = [
  { id: 'Kore', name: 'Female 1 (Kore)' },
  { id: 'Fenrir', name: 'Male 1 (Fenrir)' },
  { id: 'Puck', name: 'Male 2 (Puck)' },
  { id: 'Charon', name: 'Male 3 (Charon)' },
  { id: 'Zephyr', name: 'Female 2 (Zephyr)' },
];

export default function App() {
  const [text, setText] = useState(SAMPLE_TAMIL_TEXT);
  const [voice, setVoice] = useState<VoiceType>('Kore');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("Please enter some text to read.");
      return;
    }

    setIsLoading(true);
    setError(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setIsPlaying(false);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `Server error: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err: any) {
      setError(err.message || "Failed to generate audio.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const onEnded = () => setIsPlaying(false);
      audio.addEventListener('ended', onEnded);
      return () => audio.removeEventListener('ended', onEnded);
    }
  }, [audioUrl]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-rose-200">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <header className="mb-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 bg-rose-100 rounded-2xl mb-6 shadow-sm"
          >
            <Languages className="w-8 h-8 text-rose-600" strokeWidth={1.5} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 mb-4"
          >
            Kural Voice
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-neutral-600 max-w-2xl mx-auto"
          >
            Experience natural, high-quality Tamil text-to-speech. Paste your paragraphs below to hear them read aloud instantly.
          </motion.p>
        </header>

        {/* Main Content Card */}
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl border border-neutral-100 overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            
            {/* Input Area */}
            <div className="mb-6 relative">
              <label htmlFor="tamil-text" className="sr-only">Tamil Text</label>
              <textarea
                id="tamil-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="இங்கே உங்கள் தமிழ் உரையை தட்டச்சு செய்யவும்..."
                className="w-full h-48 sm:h-64 p-6 bg-neutral-50 border border-neutral-200 rounded-2xl text-lg resize-none focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all duration-200"
                dir="auto"
              />
              <div className="absolute bottom-4 right-4 text-xs text-neutral-400 font-medium bg-neutral-100 px-2 py-1 rounded-md">
                {text.length} characters
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex-1">
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value as VoiceType)}
                  className="w-full sm:w-64 bg-neutral-50 border border-neutral-200 text-neutral-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none cursor-pointer"
                >
                  {VOICES.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading || !text.trim()}
                className="group relative inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                {isLoading ? 'Generating Audio...' : 'Read Aloud'}
              </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="flex items-center gap-2 p-4 text-red-700 bg-red-50 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Audio Player Section */}
          <AnimatePresence>
            {audioUrl && (
              <motion.div
                initial={{ opacity: 0, backgroundColor: '#ffffff' }}
                animate={{ opacity: 1, backgroundColor: '#fafafa' }}
                exit={{ opacity: 0 }}
                className="border-t border-neutral-100 p-6 sm:p-8"
              >
                <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlay}
                      className="flex items-center justify-center w-14 h-14 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-md hover:shadow-lg active:scale-95"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 fill-current ml-1" />
                      )}
                    </button>
                    <div>
                      <h3 className="font-semibold text-neutral-900">Generated Audio</h3>
                      <p className="text-sm text-neutral-500">Ready for playback</p>
                    </div>
                  </div>

                  <a
                    href={audioUrl}
                    download={`kural_voice_${Date.now()}.wav`}
                    className="flex items-center justify-center w-full sm:w-auto gap-2 px-6 py-3 bg-white border border-neutral-200 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 hover:text-neutral-900 transition-all duration-200 shadow-sm active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    Download .wav
                  </a>
                </div>
                
                {/* Hidden Audio Element */}
                <audio 
                  ref={audioRef} 
                  src={audioUrl} 
                  className="hidden" 
                  preload="auto"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
      </div>
    </div>
  );
}

