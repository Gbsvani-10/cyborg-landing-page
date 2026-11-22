import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  Film,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  Upload,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface AiStudioSectionProps {
  onInteract?: () => void;
  onConfirm?: () => void;
  onSendTranscriptToChat?: (transcript: string) => void;
}

type StudioTab = 'live-voice' | 'transcribe' | 'video';

interface LiveLogEntry {
  id: string;
  speaker: 'user' | 'model' | 'system';
  text: string;
}

const LIVE_VOICES = ['Zephyr', 'Kore', 'Puck', 'Charon', 'Fenrir'] as const;

const VIDEO_PRESETS = [
  'A serene futuristic cyborg engineer examining glowing sapphire optical neural circuits inside a dark obsidian studio, slow cinematic dolly shot.',
  'Close-up macro shot of an articulated matte titanium and carbon cybernetic hand flexing softly under cool cyan and violet rim lighting.',
  'Futuristic neon-lit cybernetic research atrium at twilight with holographic neural waves rippling across dark glass architecture.',
];

function downsampleBuffer(
  buffer: Float32Array,
  inputRate: number,
  targetRate: number
): Float32Array {
  if (inputRate === targetRate || inputRate <= 0) {
    return buffer;
  }
  const ratio = inputRate / targetRate;
  const newLength = Math.max(1, Math.round(buffer.length / ratio));
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(buffer.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    let count = 0;
    for (let j = start; j < end; j++) {
      sum += buffer[j];
      count++;
    }
    result[i] = count > 0 ? sum / count : buffer[Math.min(start, buffer.length - 1)];
  }
  return result;
}

function float32ToPcmBase64(float32: Float32Array): string {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(int16.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64PcmToAudioBuffer(
  ctx: AudioContext,
  base64: string
): AudioBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const buffer = ctx.createBuffer(1, int16.length, 24000);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < int16.length; i++) {
    channel[i] = int16[i] / 32768;
  }
  return buffer;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = () => reject(new Error('Failed to read audio file.'));
    reader.readAsDataURL(blob);
  });
}

export function AiStudioSection({
  onInteract,
  onConfirm,
  onSendTranscriptToChat,
}: AiStudioSectionProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>('live-voice');

  // --- Tab 1: Live Voice (gemini-3.8-live) ---
  const [voiceName, setVoiceName] = useState<(typeof LIVE_VOICES)[number]>('Zephyr');
  const [liveStatus, setLiveStatus] = useState<
    'idle' | 'connecting' | 'connected' | 'error'
  >('idle');
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveLogs, setLiveLogs] = useState<LiveLogEntry[]>([]);
  const [liveTextNudge, setLiveTextNudge] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // --- Tab 2: Audio Transcription (gemini-3.5-transcribe) ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  const transcribeRecorderRef = useRef<MediaRecorder | null>(null);
  const transcribeChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  // --- Tab 3: Text-to-Video (gemini-omni-1.2-flash) ---
  const [videoPrompt, setVideoPrompt] = useState(VIDEO_PRESETS[0]);
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoDuration, setVideoDuration] = useState<'5s' | '8s' | '10s'>('5s');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const stopLiveSession = (nextStatus: 'idle' | 'error' = 'idle') => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch {
        // Ignore already-stopped nodes
      }
    });
    activeSourcesRef.current.clear();
    nextPlayTimeRef.current = 0;

    if (inputCtxRef.current) {
      void inputCtxRef.current.close().catch(() => {});
      inputCtxRef.current = null;
    }
    if (outputCtxRef.current) {
      void outputCtxRef.current.close().catch(() => {});
      outputCtxRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // Ignore close errors
      }
      wsRef.current = null;
    }
    setLiveStatus(nextStatus);
  };

  useEffect(() => {
    return () => {
      stopLiveSession();
      if (recordTimerRef.current) window.clearInterval(recordTimerRef.current);
      if (
        transcribeRecorderRef.current &&
        transcribeRecorderRef.current.state !== 'inactive'
      ) {
        transcribeRecorderRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    };
  }, [recordedAudioUrl]);

  useEffect(() => {
    return () => {
      if (generatedVideoUrl && generatedVideoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(generatedVideoUrl);
      }
    };
  }, [generatedVideoUrl]);

  const startLiveSession = async () => {
    stopLiveSession();
    setLiveError(null);
    setLiveStatus('connecting');
    onInteract?.();

    try {
      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        throw new Error(
          'Microphone streaming requires a secure HTTPS context with browser audio support.'
        );
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      micStreamRef.current = stream;

      const AudioContextCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const inputCtx = new AudioContextCtor({ sampleRate: 16000 });
      const outputCtx = new AudioContextCtor({ sampleRate: 24000 });
      if (inputCtx.state === 'suspended') await inputCtx.resume();
      if (outputCtx.state === 'suspended') await outputCtx.resume();
      inputCtxRef.current = inputCtx;
      outputCtxRef.current = outputCtx;
      nextPlayTimeRef.current = outputCtx.currentTime;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(
        `${protocol}//${window.location.host}/api/live?voice=${encodeURIComponent(
          voiceName
        )}`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (event) => {
          const activeWs = wsRef.current;
          if (!activeWs || activeWs.readyState !== WebSocket.OPEN) return;
          const samples = event.inputBuffer.getChannelData(0);
          const pcmSamples = downsampleBuffer(samples, inputCtx.sampleRate, 16000);
          const base64 = float32ToPcmBase64(pcmSamples);
          activeWs.send(JSON.stringify({ type: 'audio', audio: base64 }));
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data) as {
          type?: string;
          audio?: string;
          text?: string;
          message?: string;
        };

        if (msg.type === 'ready') {
          setLiveStatus('connected');
          setLiveLogs((prev) => [
            ...prev,
            {
              id: `sys-${Date.now()}`,
              speaker: 'system',
              text: `Connected to gemini-3.8-live (${voiceName} voice). Speak naturally.`,
            },
          ]);
          onConfirm?.();
        } else if (msg.type === 'audio' && msg.audio && outputCtxRef.current) {
          const outCtx = outputCtxRef.current;
          const audioBuf = base64PcmToAudioBuffer(outCtx, msg.audio);
          const sourceNode = outCtx.createBufferSource();
          sourceNode.buffer = audioBuf;
          sourceNode.connect(outCtx.destination);

          const startAt = Math.max(outCtx.currentTime, nextPlayTimeRef.current);
          sourceNode.start(startAt);
          nextPlayTimeRef.current = startAt + audioBuf.duration;

          activeSourcesRef.current.add(sourceNode);
          sourceNode.onended = () => {
            activeSourcesRef.current.delete(sourceNode);
          };
        } else if (msg.type === 'interrupted') {
          activeSourcesRef.current.forEach((src) => {
            try {
              src.stop();
            } catch {
              // Ignore
            }
          });
          activeSourcesRef.current.clear();
          if (outputCtxRef.current) {
            nextPlayTimeRef.current = outputCtxRef.current.currentTime;
          }
        } else if (msg.type === 'inputTranscript' && msg.text) {
          const chunk = msg.text;
          setLiveLogs((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.speaker === 'user') {
              return [
                ...prev.slice(0, -1),
                { ...last, text: `${last.text}${chunk}` },
              ];
            }
            return [
              ...prev,
              { id: `u-${Date.now()}`, speaker: 'user', text: chunk },
            ];
          });
        } else if (msg.type === 'outputTranscript' && msg.text) {
          const chunk = msg.text;
          setLiveLogs((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.speaker === 'model') {
              return [
                ...prev.slice(0, -1),
                { ...last, text: `${last.text}${chunk}` },
              ];
            }
            return [
              ...prev,
              { id: `m-${Date.now()}`, speaker: 'model', text: chunk },
            ];
          });
        } else if (msg.type === 'error') {
          setLiveError(msg.message || 'Live API session error.');
          stopLiveSession('error');
        } else if (msg.type === 'closed') {
          stopLiveSession();
        }
      };

      ws.onerror = () => {
        setLiveError('Unable to establish Live API WebSocket connection.');
        stopLiveSession('error');
      };
    } catch (err) {
      setLiveError(
        err instanceof Error
          ? err.message
          : 'Microphone access is required for real-time voice conversations.'
      );
      stopLiveSession('error');
    }
  };

  const sendLiveNudge = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = liveTextNudge.trim();
    if (!trimmed || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    wsRef.current.send(JSON.stringify({ type: 'text', text: trimmed }));
    setLiveLogs((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, speaker: 'user', text: trimmed },
    ]);
    setLiveTextNudge('');
  };

  const transcribeAudioBlob = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setTranscribeError(null);
    try {
      const audioBase64 = await blobToBase64(blob);
      const res = await fetch('/api/gemini/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64, mimeType }),
      });
      const data = (await res.json()) as {
        transcript?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to transcribe audio.');
      }
      setTranscript(data.transcript || '(No speech detected)');
      onConfirm?.();
    } catch (err) {
      setTranscribeError(
        err instanceof Error ? err.message : 'Transcription request failed.'
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      transcribeRecorderRef.current?.stop();
      setIsRecording(false);
      if (recordTimerRef.current) {
        window.clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      return;
    }

    setTranscribeError(null);
    setTranscript('');
    setRecordSeconds(0);
    onInteract?.();

    try {
      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === 'undefined'
      ) {
        throw new Error(
          'Microphone recording is not supported in this browser or context.'
        );
      }
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
      transcribeChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) transcribeChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(transcribeChunksRef.current, { type: effectiveMime });
        if (blob.size > 0) {
          const url = URL.createObjectURL(blob);
          setRecordedAudioUrl(url);
          void transcribeAudioBlob(blob, effectiveMime);
        }
      };

      transcribeRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      recordTimerRef.current = window.setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch {
      setTranscribeError('Microphone permission is required to record audio.');
    }
  };

  const handleAudioFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setTranscribeError(null);
    setTranscript('');
    const url = URL.createObjectURL(file);
    setRecordedAudioUrl(url);
    void transcribeAudioBlob(file, file.type || 'audio/mp3');
  };

  const handleGenerateVideo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!videoPrompt.trim() || isGeneratingVideo) return;

    setVideoError(null);
    setIsGeneratingVideo(true);
    onInteract?.();

    try {
      const res = await fetch('/api/gemini/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt.trim(),
          aspectRatio: videoAspectRatio,
          duration: videoDuration,
        }),
      });
      const data = (await res.json()) as {
        videoData?: string | null;
        videoUri?: string | null;
        mimeType?: string;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || 'Video generation failed.');
      }

      if (data.videoData) {
        const binary = atob(data.videoData);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: data.mimeType || 'video/mp4' });
        setGeneratedVideoUrl(URL.createObjectURL(blob));
      } else if (data.videoUri) {
        setGeneratedVideoUrl(data.videoUri);
      }
      onConfirm?.();
    } catch (err) {
      setVideoError(
        err instanceof Error ? err.message : 'Unable to generate video.'
      );
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const tabs: { id: StudioTab; label: string; model: string }[] = [
    { id: 'live-voice', label: 'Live Voice', model: 'gemini-3.8-live' },
    { id: 'transcribe', label: 'Audio Transcribe', model: 'gemini-3.5-transcribe' },
    { id: 'video', label: 'Video Studio', model: 'gemini-omni-1.2-flash' },
  ];

  return (
    <section
      id="ai-studio"
      aria-labelledby="ai-studio-heading"
      className="relative z-10 border-t border-slate-200/80 py-16 sm:py-24 lg:py-28 dark:border-slate-900/90"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 'some' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6 border-b border-slate-200 pb-8 lg:flex-row lg:items-end lg:justify-between dark:border-slate-800/80"
        >
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-violet-700 uppercase dark:text-cyan-300">
              Interactive Multimodal Lab
            </p>
            <h2
              id="ai-studio-heading"
              className="mt-2.5 font-display text-2xl leading-tight font-semibold tracking-tight text-slate-900 sm:mt-3 sm:text-4xl dark:text-white"
              style={{ textWrap: 'balance' }}
            >
              Speak, transcribe, and synthesize futuristic concepts.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
              Converse in real time with Gemini Live voice, transcribe microphone recordings, or render concept video via the Gemini Interactions API.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="CYBERNEX AI Multimodal Tools"
            className="flex flex-wrap gap-1.5 self-start rounded-xl border border-slate-200 bg-white/80 p-1 lg:self-end dark:border-slate-800 dark:bg-[#060913]"
          >
            {tabs.map((tab) => {
              const active = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    if (
                      tab.id !== 'live-voice' &&
                      (liveStatus === 'connected' || liveStatus === 'connecting')
                    ) {
                      stopLiveSession();
                    }
                    setActiveTab(tab.id);
                    onInteract?.();
                  }}
                  className={`min-h-[42px] rounded-lg px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm dark:border dark:border-cyan-400/40 dark:bg-gradient-to-r dark:from-blue-600/35 dark:to-violet-600/35 dark:text-cyan-100'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="glass-surface mt-8 rounded-2xl border border-slate-200 p-5 sm:p-8 dark:border-slate-800/90">
          <AnimatePresence mode="wait">
            {/* TAB 1: LIVE VOICE CONVERSATION */}
            {activeTab === 'live-voice' && (
              <motion.div
                key="tab-live-voice"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 gap-8 lg:grid-cols-12"
              >
                <div className="flex flex-col justify-between lg:col-span-5">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-xs text-blue-600 uppercase dark:text-cyan-300">
                      <Radio className="h-4 w-4" aria-hidden="true" />
                      <span>gemini-3.8-live · Live API</span>
                    </div>
                    <h3 className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white">
                      Real-Time Voice Conversation
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      Stream 16kHz microphone audio over WebSocket and receive natural 24kHz spoken responses with live interruption support.
                    </p>

                    <div className="mt-6">
                      <span
                        id="live-voice-label"
                        className="block text-xs font-medium tracking-wide text-slate-700 uppercase dark:text-slate-300"
                      >
                        Voice Persona
                      </span>
                      <div
                        role="group"
                        aria-labelledby="live-voice-label"
                        className="mt-2 flex flex-wrap gap-2"
                      >
                        {LIVE_VOICES.map((v) => {
                          const selected = voiceName === v;
                          return (
                            <button
                              key={v}
                              type="button"
                              disabled={liveStatus === 'connected' || liveStatus === 'connecting'}
                              onClick={() => {
                                setVoiceName(v);
                                onInteract?.();
                              }}
                              className={`min-h-[38px] rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                                selected
                                  ? 'border-blue-600 bg-blue-600/10 text-blue-800 dark:border-cyan-400/50 dark:bg-cyan-400/15 dark:text-cyan-200'
                                  : 'border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300'
                              }`}
                            >
                              {v}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    {liveStatus === 'connected' || liveStatus === 'connecting' ? (
                      <button
                        type="button"
                        onClick={() => stopLiveSession()}
                        className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-6 py-3 text-xs font-semibold tracking-wider text-white uppercase transition-colors hover:bg-rose-700 sm:w-auto cursor-pointer"
                      >
                        <PhoneOff className="h-4 w-4" aria-hidden="true" />
                        <span>End Voice Session</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void startLiveSession()}
                        className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-6 py-3 text-xs font-semibold tracking-wider text-white uppercase shadow-[0_0_24px_-6px_rgba(56,189,248,0.55)] transition-all hover:scale-[1.01] sm:w-auto cursor-pointer"
                      >
                        <Mic className="h-4 w-4" aria-hidden="true" />
                        <span>Start Live Voice</span>
                      </button>
                    )}

                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      Status: {liveStatus === 'connected' ? 'Live Audio Active' : liveStatus === 'connecting' ? 'Connecting...' : 'Ready'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white/75 p-4 sm:p-5 lg:col-span-7 dark:border-slate-800 dark:bg-[#050812]/90">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                    <span className="font-mono text-xs text-slate-500 uppercase">
                      Live Conversation Transcript
                    </span>
                    {liveLogs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setLiveLogs([])}
                        className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="my-4 h-56 space-y-3 overflow-y-auto pr-1">
                    {liveLogs.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center text-center text-xs text-slate-500">
                        <p>
                          Click &ldquo;Start Live Voice&rdquo; and speak into your microphone to converse with CYBERNEX in real time.
                        </p>
                      </div>
                    ) : (
                      liveLogs.map((entry) => (
                        <div
                          key={entry.id}
                          className={`rounded-lg px-3.5 py-2.5 text-xs leading-relaxed sm:text-sm ${
                            entry.speaker === 'user'
                              ? 'ml-6 bg-blue-600/10 text-slate-900 dark:bg-blue-600/25 dark:text-slate-100'
                              : entry.speaker === 'model'
                              ? 'mr-6 border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200'
                              : 'text-center font-mono text-[11px] text-slate-500'
                          }`}
                        >
                          {entry.speaker !== 'system' && (
                            <span className="mb-1 block font-mono text-[10px] text-blue-600 uppercase dark:text-cyan-300">
                              {entry.speaker === 'user' ? 'You' : 'CYBERNEX Live'}
                            </span>
                          )}
                          <span>{entry.text}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {liveError && (
                    <div
                      role="alert"
                      className="mb-3 flex items-start gap-2 rounded-lg border border-rose-500/35 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{liveError}</span>
                    </div>
                  )}

                  <form onSubmit={sendLiveNudge} className="flex gap-2">
                    <label htmlFor="live-nudge-input" className="sr-only">
                      Send text prompt to live session
                    </label>
                    <input
                      id="live-nudge-input"
                      type="text"
                      disabled={liveStatus !== 'connected'}
                      value={liveTextNudge}
                      onChange={(e) => setLiveTextNudge(e.target.value)}
                      placeholder={
                        liveStatus === 'connected'
                          ? 'Optional: send a text prompt into the live voice session...'
                          : 'Start Live Voice to send prompts'
                      }
                      className="min-h-[42px] flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                    />
                    <button
                      type="submit"
                      disabled={liveStatus !== 'connected' || !liveTextNudge.trim()}
                      className="min-h-[42px] rounded-lg border border-slate-300 bg-white px-4 text-xs font-medium text-slate-700 transition-colors hover:border-blue-500/50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* TAB 2: AUDIO TRANSCRIPTION */}
            {activeTab === 'transcribe' && (
              <motion.div
                key="tab-transcribe"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 gap-8 lg:grid-cols-12"
              >
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-2 font-mono text-xs text-blue-600 uppercase dark:text-cyan-300">
                    <Mic className="h-4 w-4" aria-hidden="true" />
                    <span>gemini-3.5-transcribe</span>
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white">
                    Microphone Audio Transcription
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    Record directly from your microphone or upload an audio file to transcribe speech accurately into editable text.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void toggleRecording()}
                      disabled={isTranscribing}
                      className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg px-5 py-3 text-xs font-semibold tracking-wider text-white uppercase transition-all cursor-pointer disabled:opacity-50 ${
                        isRecording
                          ? 'bg-rose-600 hover:bg-rose-700'
                          : 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-[0_0_24px_-6px_rgba(56,189,248,0.55)]'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="h-4 w-4" aria-hidden="true" />
                          <span>Stop ({recordSeconds}s)</span>
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" aria-hidden="true" />
                          <span>Record Microphone</span>
                        </>
                      )}
                    </button>

                    <label className="inline-flex min-h-[46px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-xs font-semibold tracking-wider text-slate-700 uppercase transition-colors hover:border-blue-500/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer">
                      <Upload className="h-4 w-4" aria-hidden="true" />
                      <span>Upload Audio</span>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioFileUpload}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  {recordedAudioUrl && (
                    <div className="mt-5 rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                      <p className="mb-2 font-mono text-[11px] text-slate-500 uppercase">
                        Audio Preview
                      </p>
                      <audio controls src={recordedAudioUrl} className="w-full" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white/75 p-5 lg:col-span-7 dark:border-slate-800 dark:bg-[#050812]/90">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                      <span className="font-mono text-xs text-slate-500 uppercase">
                        Transcribed Output
                      </span>
                      {transcript && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              void navigator.clipboard.writeText(transcript);
                              setCopiedTranscript(true);
                              window.setTimeout(() => setCopiedTranscript(false), 1800);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white cursor-pointer"
                          >
                            {copiedTranscript ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                            <span>{copiedTranscript ? 'Copied' : 'Copy'}</span>
                          </button>

                          {onSendTranscriptToChat && (
                            <button
                              type="button"
                              onClick={() => onSendTranscriptToChat(transcript)}
                              className="inline-flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:border-cyan-400/40 dark:bg-cyan-400/15 dark:text-cyan-200 cursor-pointer"
                            >
                              <MessageSquare className="h-3 w-3" />
                              <span>Ask Gemini Chat</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 min-h-[160px]">
                      {isTranscribing ? (
                        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-cyan-300">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Transcribing via gemini-3.5-transcribe...</span>
                        </div>
                      ) : transcribeError ? (
                        <div
                          role="alert"
                          className="flex items-start gap-2 rounded-lg border border-rose-500/35 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300"
                        >
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>{transcribeError}</span>
                        </div>
                      ) : transcript ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-800 sm:text-base dark:text-slate-200">
                          {transcript}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500">
                          Your transcribed speech will appear here once recording finishes or an audio clip is uploaded.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: TEXT-TO-VIDEO STUDIO */}
            {activeTab === 'video' && (
              <motion.div
                key="tab-video"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 gap-8 lg:grid-cols-12"
              >
                <form onSubmit={handleGenerateVideo} className="space-y-5 lg:col-span-5">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-xs text-violet-700 uppercase dark:text-cyan-300">
                      <Film className="h-4 w-4" aria-hidden="true" />
                      <span>gemini-omni-1.2-flash · Interactions API</span>
                    </div>
                    <h3 className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white">
                      Text-to-Video Generation
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      Synthesize futuristic cybernetic concept clips in landscape (16:9) or portrait (9:16) format.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="video-prompt-input"
                      className="block text-xs font-medium tracking-wide text-slate-700 uppercase dark:text-slate-300"
                    >
                      Scene Prompt
                    </label>
                    <textarea
                      id="video-prompt-input"
                      rows={4}
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      placeholder="Describe the futuristic scene to generate..."
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-[#050812]/90 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400"
                    />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {VIDEO_PRESETS.map((preset, idx) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setVideoPrompt(preset)}
                          className="rounded-md border border-slate-200 bg-white/70 px-2.5 py-1 text-[11px] text-slate-600 hover:border-blue-500/40 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 cursor-pointer"
                        >
                          Preset 0{idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-xs font-medium tracking-wide text-slate-700 uppercase dark:text-slate-300">
                        Aspect Ratio
                      </span>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {(['16:9', '9:16'] as const).map((ratio) => (
                          <button
                            key={ratio}
                            type="button"
                            onClick={() => setVideoAspectRatio(ratio)}
                            className={`min-h-[40px] rounded-lg border px-2 py-2 text-xs font-medium transition-colors cursor-pointer ${
                              videoAspectRatio === ratio
                                ? 'border-blue-600 bg-blue-600/10 text-blue-800 dark:border-cyan-400/50 dark:bg-cyan-400/15 dark:text-cyan-100'
                                : 'border-slate-200 bg-white/70 text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400'
                            }`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="block text-xs font-medium tracking-wide text-slate-700 uppercase dark:text-slate-300">
                        Duration
                      </span>
                      <div className="mt-2 grid grid-cols-3 gap-1.5">
                        {(['5s', '8s', '10s'] as const).map((dur) => (
                          <button
                            key={dur}
                            type="button"
                            onClick={() => setVideoDuration(dur)}
                            className={`min-h-[40px] rounded-lg border px-2 py-2 text-xs font-medium transition-colors cursor-pointer ${
                              videoDuration === dur
                                ? 'border-blue-600 bg-blue-600/10 text-blue-800 dark:border-cyan-400/50 dark:bg-cyan-400/15 dark:text-cyan-100'
                                : 'border-slate-200 bg-white/70 text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400'
                            }`}
                          >
                            {dur}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-700 dark:text-amber-300/90">
                    Note: gemini-omni-1.2-flash requires a billing-enabled API key in Settings &gt; Secrets.
                  </p>

                  <button
                    type="submit"
                    disabled={isGeneratingVideo || !videoPrompt.trim()}
                    className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-6 py-3 text-xs font-semibold tracking-wider text-white uppercase shadow-[0_0_24px_-6px_rgba(56,189,248,0.55)] transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
                  >
                    {isGeneratingVideo ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating Video...</span>
                      </>
                    ) : (
                      <>
                        <Film className="h-4 w-4" />
                        <span>Generate Video</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-100/80 p-5 lg:col-span-7 dark:border-slate-800 dark:bg-[#050812]/90">
                  {videoError ? (
                    <div
                      role="alert"
                      className="flex max-w-md items-start gap-2.5 rounded-xl border border-rose-500/35 bg-rose-500/10 p-4 text-xs leading-relaxed text-rose-700 dark:text-rose-300"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{videoError}</span>
                    </div>
                  ) : generatedVideoUrl ? (
                    <div className="flex w-full flex-col items-center gap-4">
                      <div
                        className={`overflow-hidden rounded-xl border border-slate-300 bg-black dark:border-slate-700 ${
                          videoAspectRatio === '9:16'
                            ? 'aspect-[9/16] max-h-[420px]'
                            : 'aspect-video w-full'
                        }`}
                      >
                        <video
                          src={generatedVideoUrl}
                          controls
                          autoPlay
                          loop
                          playsInline
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <a
                        href={generatedVideoUrl}
                        download={`cybernex-${videoAspectRatio.replace(':', 'x')}.mp4`}
                        className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-800 hover:border-blue-500/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download MP4</span>
                      </a>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-12 text-center">
                      <Film
                        className="h-8 w-8 text-slate-400 dark:text-slate-600"
                        aria-hidden="true"
                      />
                      <p className="mt-3 max-w-sm text-sm text-slate-600 dark:text-slate-400">
                        {isGeneratingVideo
                          ? 'Rendering video via gemini-omni-1.2-flash. This typically takes 30–90 seconds...'
                          : `Generated ${videoAspectRatio} video output will play here.`}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
