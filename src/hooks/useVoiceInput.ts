import { useCallback, useRef, useState } from 'react';

export type VoiceState = 'idle' | 'listening' | 'unsupported';

interface UseVoiceInputOptions {
  onResult: (transcript: string) => void;
  append?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SR: any = typeof window !== 'undefined'
  ? ((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null)
  : null;

export function useVoiceInput({ onResult, append = true }: UseVoiceInputOptions) {
  const [state, setState] = useState<VoiceState>(SR ? 'idle' : 'unsupported');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recogRef = useRef<any>(null);

  const start = useCallback((currentValue = '') => {
    if (!SR) return;
    const recog = new SR();
    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.onstart  = () => setState('listening');
    recog.onend    = () => setState('idle');
    recog.onerror  = () => setState('idle');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recog.onresult = (e: any) => {
      const transcript: string = e.results[0][0].transcript;
      onResult(append && currentValue.trim() ? `${currentValue.trimEnd()} ${transcript}` : transcript);
    };
    recogRef.current = recog;
    recog.start();
  }, [onResult, append]);

  const stop = useCallback(() => recogRef.current?.stop(), []);

  return { state, start, stop };
}
