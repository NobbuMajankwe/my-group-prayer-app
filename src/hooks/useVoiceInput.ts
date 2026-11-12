import { useCallback, useRef, useState } from 'react';

export type VoiceState = 'idle' | 'listening' | 'unsupported';

interface UseVoiceInputOptions {
  onResult: (transcript: string) => void;
  append?: boolean;
}

export function useVoiceInput({ onResult, append = true }: UseVoiceInputOptions) {
  const [state, setState] = useState<VoiceState>(() =>
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
      ? 'idle'
      : 'unsupported',
  );
  const recogRef = useRef<SpeechRecognition | null>(null);

  const start = useCallback((currentValue = '') => {
    if (state === 'unsupported') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: typeof SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    const recog = new SR();
    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.onstart  = () => setState('listening');
    recog.onend    = () => setState('idle');
    recog.onerror  = () => setState('idle');
    recog.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onResult(append && currentValue.trim() ? `${currentValue.trimEnd()} ${transcript}` : transcript);
    };
    recogRef.current = recog;
    recog.start();
  }, [state, onResult, append]);

  const stop = useCallback(() => recogRef.current?.stop(), []);

  return { state, start, stop };
}
