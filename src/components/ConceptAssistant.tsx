import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  Bot,
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  modelUsed?: string;
}

interface ConceptAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onInteract?: () => void;
  prefillText?: string | null;
  onConsumePrefill?: () => void;
}

const CHAT_MODES = [
  { id: 'general', label: 'General', model: 'gemini-4-hydrogen', paid: false },
  { id: 'fast', label: 'Fast', model: 'gemini-3.1-flash-lite', paid: false },
  { id: 'complex', label: 'Complex', model: 'gemini-4-neon', paid: true },
  { id: 'deep', label: 'Deep Reasoning', model: 'gemini-4-carbon', paid: true },
] as const;

const CHAT_ROLES = [
  { id: 'architect', label: 'Systems Architect' },
  { id: 'neural', label: 'Neural Specialist' },
  { id: 'robotics', label: 'Robotics Engineer' },
  { id: 'ethics', label: 'AI Ethics Advisor' },
] as const;

const STARTER_PROMPTS = [
  'How could non-invasive neural interfaces protect user privacy?',
  'Compare edge AI co-reasoning with cloud-dependent robotics.',
  'Design an ergonomic augmentation principle for long-term wear.',
];

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to encode audio recording.'));
    reader.readAsDataURL(blob);
  });
}

export function ConceptAssistant({
  isOpen,
  onClose,
  onInteract,
  prefillText,
  onConsumePrefill,
}: ConceptAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Welcome to CYBERNEX Intelligence. Select a specialist role and model tier above, then ask anything about AI architecture, neural interfaces, robotics, or human augmentation.',
      modelUsed: 'gemini-4-hydrogen',
    },
  ]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<(typeof CHAT_MODES)[number]['id']>('general');
  const [role, setRole] = useState<(typeof CHAT_ROLES)[number]['id']>('architect');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDictating, setIsDictating] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (prefillText) {
      setInput(prefillText);
      onConsumePrefill?.();
    }
  }, [prefillText, onConsumePrefill]);

  useEffect(() => {
    if (!isOpen) return;
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const sendMessageText = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInput('');
    setIsLoading(true);
    onInteract?.();

    try {
      // Exclude initial static welcome message from API multi-turn history
      const apiMessages = nextHistory
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, mode, role }),
      });

      const data = (await res.json()) as {
        text?: string;
        model?: string;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || 'Failed to receive a response from Gemini.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: data.text || '(No text returned)',
          modelUsed: data.model,
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to reach Gemini chat service.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessageText(input);
  };

  const toggleDictation = async () => {
    if (isDictating) {
      mediaRecorderRef.current?.stop();
      setIsDictating(false);
      return;
    }

    setError(null);
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      setError('Audio recording is not supported in this browser or context.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const detectedMime =
        typeof MediaRecorder.isTypeSupported === 'function'
          ? MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : MediaRecorder.isTypeSupported('audio/mp4')
            ? 'audio/mp4'
            : ''
          : '';
      const recorder = detectedMime
        ? new MediaRecorder(stream, { mimeType: detectedMime })
        : new MediaRecorder(stream);
      const effectiveMime = recorder.mimeType || detectedMime || 'audio/webm';
      audioChunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) {
          audioChunksRef.current.push(ev.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: effectiveMime });
        if (blob.size === 0) return;

        setIsTranscribing(true);
        try {
          const audioBase64 = await blobToBase64(blob);
          const res = await fetch('/api/gemini/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64, mimeType: effectiveMime }),
          });
          const data = (await res.json()) as {
            transcript?: string;
            error?: string;
          };
          if (!res.ok) {
            throw new Error(data.error || 'Audio transcription failed.');
          }
          if (data.transcript) {
            setInput((prev) =>
              prev ? `${prev.trim()} ${data.transcript}` : data.transcript || ''
            );
          }
        } catch (err) {
          setError(
            err instanceof Error ? err.message : 'Unable to transcribe audio.'
          );
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsDictating(true);
      onInteract?.();
    } catch {
      setError('Microphone permission is required for voice dictation.');
    }
  };

  const activeModeObj = CHAT_MODES.find((m) => m.id === mode) ?? CHAT_MODES[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          role="dialog"
          aria-label="CYBERNEX Gemini Chat"
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="glass-surface fixed right-4 bottom-20 z-50 flex h-[76vh] max-h-[640px] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 shadow-2xl sm:right-6 dark:border-slate-700/90"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 dark:border-slate-800/90">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:border-cyan-400/40 dark:bg-cyan-400/15 dark:text-cyan-300">
                <Bot className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                  CYBERNEX Gemini Chat
                </h3>
                <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {activeModeObj.model}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setMessages((prev) => prev.slice(0, 1));
                  setError(null);
                  onInteract?.();
                }}
                aria-label="Reset conversation"
                title="Clear conversation"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Gemini Chat"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Role & Model Selectors */}
          <div className="space-y-2.5 border-b border-slate-200 bg-slate-100/70 px-4 py-3 dark:border-slate-800/80 dark:bg-[#060B17]/80">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="chat-role-select"
                className="font-mono text-[11px] text-slate-500 uppercase"
              >
                Role
              </label>
              <select
                id="chat-role-select"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as (typeof CHAT_ROLES)[number]['id']);
                  onInteract?.();
                }}
                className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {CHAT_ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 gap-1 rounded-lg border border-slate-200 bg-white/80 p-1 dark:border-slate-800 dark:bg-[#050812]">
              {CHAT_MODES.map((m) => {
                const active = m.id === mode;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setMode(m.id);
                      setError(null);
                      onInteract?.();
                    }}
                    title={
                      m.paid
                        ? `${m.model} (Requires paid API key in Settings > Secrets)`
                        : m.model
                    }
                    className={`rounded-md px-1.5 py-1.5 text-[11px] font-medium truncate transition-colors cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white dark:bg-cyan-500/20 dark:text-cyan-100 dark:border dark:border-cyan-400/40'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {activeModeObj.paid && (
              <p className="text-[11px] text-amber-700 dark:text-amber-300/90">
                Note: {activeModeObj.model} requires a billing-enabled key in Settings &gt; Secrets.
              </p>
            )}
          </div>

          {/* Scrollable Thread */}
          <div className="flex-1 space-y-3.5 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed sm:text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white dark:bg-blue-600/35 dark:border dark:border-cyan-400/35 dark:text-slate-100'
                      : 'border border-slate-200 bg-white/90 text-slate-800 dark:border-slate-800 dark:bg-[#060B18]/90 dark:text-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                {msg.modelUsed && (
                  <span className="mt-1 px-1 font-mono text-[10px] text-slate-400">
                    {msg.modelUsed}
                  </span>
                )}
              </div>
            ))}

            {messages.length === 1 && !isLoading && (
              <div className="space-y-1.5 pt-2">
                <p className="font-mono text-[11px] text-slate-500 uppercase">
                  Suggested Prompts
                </p>
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessageText(prompt)}
                    className="block w-full rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:border-blue-500/40 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-cyan-400/40 dark:hover:text-cyan-200 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-cyan-300">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                <span>Generating response via {activeModeObj.model}...</span>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-rose-500/35 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div ref={threadEndRef} />
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 bg-white/80 p-3 dark:border-slate-800/90 dark:bg-[#050812]/90"
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void toggleDictation()}
                disabled={isTranscribing || isLoading}
                aria-label={isDictating ? 'Stop voice dictation' : 'Dictate with microphone'}
                title={isDictating ? 'Stop recording' : 'Dictate via gemini-3.5-transcribe'}
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors cursor-pointer disabled:opacity-50 ${
                  isDictating
                    ? 'border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-300'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-blue-500/50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-cyan-400/50 dark:hover:text-cyan-200'
                }`}
              >
                {isTranscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isDictating ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>

              <label htmlFor="gemini-chat-input" className="sr-only">
                Message CYBERNEX Gemini Chat
              </label>
              <input
                id="gemini-chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isDictating
                    ? 'Listening... tap mic to stop'
                    : isTranscribing
                    ? 'Transcribing audio...'
                    : 'Ask CYBERNEX Gemini...'
                }
                className="min-h-[40px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none sm:text-sm dark:border-slate-700 dark:bg-slate-900/90 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading || isDictating}
                aria-label="Send message"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white transition-opacity hover:opacity-95 disabled:opacity-40 cursor-pointer"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </form>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
