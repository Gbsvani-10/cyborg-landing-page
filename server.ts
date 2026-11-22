import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Modality, ThinkingLevel } from '@google/genai';
import type { LiveServerMessage } from '@google/genai';
import { WebSocketServer } from 'ws';
import type { WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw Object.assign(
      new Error(
        'GEMINI_API_KEY is not configured. Please add your API key in Settings > Secrets.'
      ),
      { status: 400 }
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function parseGeminiError(error: unknown): { status: number; message: string } {
  const errObj = error as { status?: number; code?: number; message?: string };
  let rawMessage = errObj?.message || 'An unexpected Gemini API error occurred.';
  if (rawMessage.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(rawMessage) as {
        error?: { message?: string; code?: number };
        message?: string;
      };
      if (parsed?.error?.message) {
        rawMessage = parsed.error.message;
      } else if (parsed?.message) {
        rawMessage = parsed.message;
      }
    } catch {
      // Keep original string if not valid JSON
    }
  }
  const status = errObj?.status || errObj?.code || 500;

  if (
    status === 403 ||
    rawMessage.includes('PERMISSION_DENIED') ||
    rawMessage.includes('API_KEY_INVALID')
  ) {
    return {
      status: status === 403 ? 403 : 400,
      message:
        'API key permission denied or invalid. Please check your key in Settings > Secrets.',
    };
  }
  if (status === 429 || rawMessage.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message:
        'Quota exceeded or billing-enabled API key required for this model. Select a paid API key in Settings > Secrets or switch to a standard model.',
    };
  }
  if (status === 404 || rawMessage.includes('NOT_FOUND')) {
    return {
      status: 404,
      message: `Model or resource not found: ${rawMessage}`,
    };
  }
  return {
    status: status >= 400 && status < 600 ? status : 500,
    message: rawMessage,
  };
}

const CHAT_ROLES: Record<string, string> = {
  architect:
    'You are the CYBERNEX Systems Architect. Explain AI co-reasoning, cybernetic system architecture, and human-machine integration clearly and concisely.',
  neural:
    'You are the CYBERNEX Neural Interface Specialist. Discuss bio-optical signal bridges, non-invasive neural coupling, and biometric privacy thoughtfully.',
  robotics:
    'You are the CYBERNEX Robotics & Augmentation Engineer. Explain bio-inspired kinematics, tactile actuation, and ergonomic human augmentation clearly.',
  ethics:
    'You are the CYBERNEX AI Ethics & Autonomy Advisor. Focus on human agency, local-first data sovereignty, reversibility, and responsible innovation.',
};

const MODEL_MAP: Record<string, { model: string; thinkingLevel?: ThinkingLevel }> = {
  general: { model: 'gemini-4-hydrogen' },
  fast: { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL },
  complex: { model: 'gemini-4-neon', thinkingLevel: ThinkingLevel.HIGH },
  deep: { model: 'gemini-4-carbon', thinkingLevel: ThinkingLevel.HIGH },
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  // 1. Multi-turn Gemini Chatbot endpoint
  app.post('/api/gemini/chat', async (req: Request, res: Response) => {
    try {
      const { messages, mode = 'general', role = 'architect' } = req.body as {
        messages?: Array<{ role: 'user' | 'model'; text: string }>;
        mode?: string;
        role?: string;
      };

      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: 'At least one message is required.' });
        return;
      }

      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.role !== 'user' || !lastMessage.text?.trim()) {
        res.status(400).json({ error: 'The latest message must be non-empty user text.' });
        return;
      }

      const selectedModel = MODEL_MAP[mode] ?? MODEL_MAP.general;
      const systemInstruction = CHAT_ROLES[role] ?? CHAT_ROLES.architect;
      const ai = getAiClient();

      const history = messages.slice(0, -1).map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const config: {
        systemInstruction: string;
        thinkingConfig?: { thinkingLevel: ThinkingLevel };
      } = {
        systemInstruction,
      };

      if (selectedModel.thinkingLevel) {
        config.thinkingConfig = { thinkingLevel: selectedModel.thinkingLevel };
      }

      const chat = ai.chats.create({
        model: selectedModel.model,
        config,
        history,
      });

      const response = await chat.sendMessage({
        message: lastMessage.text.trim(),
      });

      res.json({
        text: response.text ?? '',
        model: selectedModel.model,
      });
    } catch (error) {
      const parsed = parseGeminiError(error);
      res.status(parsed.status).json({ error: parsed.message });
    }
  });

  // 2. Audio Transcription endpoint (gemini-3.5-transcribe)
  app.post('/api/gemini/transcribe', async (req: Request, res: Response) => {
    try {
      const { audioBase64, mimeType } = req.body as {
        audioBase64?: string;
        mimeType?: string;
      };

      if (!audioBase64 || !mimeType) {
        res.status(400).json({ error: 'Audio data and mimeType are required.' });
        return;
      }

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: audioBase64,
              },
            },
            { text: 'Transcribe this audio accurately. Return only the spoken transcript.' },
          ],
        },
      });

      res.json({
        transcript: response.text?.trim() ?? '',
        model: 'gemini-3.5-transcribe',
      });
    } catch (error) {
      const parsed = parseGeminiError(error);
      res.status(parsed.status).json({ error: parsed.message });
    }
  });

  // 3. Text-to-Video Generation endpoint (gemini-omni-1.2-flash via Interactions API)
  app.post('/api/gemini/video', async (req: Request, res: Response) => {
    try {
      const {
        prompt,
        aspectRatio = '16:9',
        duration = '5s',
      } = req.body as {
        prompt?: string;
        aspectRatio?: '16:9' | '9:16';
        duration?: '5s' | '8s' | '10s';
      };

      if (!prompt || !prompt.trim()) {
        res.status(400).json({ error: 'A video prompt is required.' });
        return;
      }

      const safeAspectRatio = aspectRatio === '9:16' ? '9:16' : '16:9';
      const safeDuration =
        duration === '8s' || duration === '10s' ? duration : '5s';

      const ai = getAiClient();
      const interaction = await ai.interactions.create(
        {
          model: 'gemini-omni-1.2-flash',
          input: prompt.trim(),
          background: false,
          store: false,
          stream: false,
          response_format: {
            type: 'video',
            aspect_ratio: safeAspectRatio,
            duration: safeDuration,
            resolution: '720p',
          },
        },
        { timeout: 300000 }
      );

      const videoPart = interaction.output_video;
      if (!videoPart || (!videoPart.data && !videoPart.uri)) {
        res.status(502).json({
          error: 'Video generation completed without returning video media.',
        });
        return;
      }

      res.json({
        videoData: videoPart.data ?? null,
        videoUri: videoPart.uri ?? null,
        mimeType: videoPart.mime_type || 'video/mp4',
        aspectRatio: safeAspectRatio,
        model: 'gemini-omni-1.2-flash',
      });
    } catch (error) {
      const parsed = parseGeminiError(error);
      res.status(parsed.status).json({ error: parsed.message });
    }
  });

  // Vite middleware in dev / static dist serving in production
  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  // WebSocket upgrade handler for Gemini Live API (/api/live)
  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    if (url.pathname === '/api/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else if (IS_PRODUCTION) {
      socket.destroy();
    }
  });

  wss.on('connection', async (clientWs: WebSocket, request) => {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    const voiceParam = url.searchParams.get('voice') || 'Zephyr';
    const allowedVoices = new Set(['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr']);
    const voiceName = allowedVoices.has(voiceParam) ? voiceParam : 'Zephyr';

    let liveSession: Awaited<ReturnType<GoogleGenAI['live']['connect']>> | null = null;
    let isClosing = false;

    const sendJson = (payload: Record<string, unknown>) => {
      if (clientWs.readyState === clientWs.OPEN) {
        clientWs.send(JSON.stringify(payload));
      }
    };

    try {
      const ai = getAiClient();
      liveSession = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
          systemInstruction:
            'You are CYBERNEX Live Voice, an articulate futuristic systems guide specializing in artificial intelligence, neural interfaces, robotic engineering, and human augmentation. Speak concisely and conversationally.',
        },
        callbacks: {
          onopen: () => {
            sendJson({ type: 'ready', voice: voiceName, model: 'gemini-3.8-live' });
          },
          onmessage: (message: LiveServerMessage) => {
            const content = message.serverContent;
            if (content?.inputTranscription?.text) {
              sendJson({
                type: 'inputTranscript',
                text: content.inputTranscription.text,
              });
            }
            if (content?.outputTranscription?.text) {
              sendJson({
                type: 'outputTranscript',
                text: content.outputTranscription.text,
              });
            }
            for (const part of content?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                sendJson({ type: 'audio', audio: part.inlineData.data });
              }
            }
            if (content?.interrupted) {
              sendJson({ type: 'interrupted' });
            }
            if (content?.turnComplete) {
              sendJson({ type: 'turnComplete' });
            }
          },
          onerror: (event: unknown) => {
            const msg =
              (event as { message?: string })?.message ||
              'Live API connection error.';
            sendJson({ type: 'error', message: msg });
          },
          onclose: () => {
            if (!isClosing) {
              sendJson({ type: 'closed' });
            }
          },
        },
      });
    } catch (error) {
      const parsed = parseGeminiError(error);
      sendJson({ type: 'error', message: parsed.message });
      clientWs.close();
      return;
    }

    clientWs.on('message', (rawData) => {
      if (!liveSession) return;
      try {
        const parsed = JSON.parse(rawData.toString()) as {
          type?: string;
          audio?: string;
          text?: string;
        };
        if (parsed.type === 'audio' && parsed.audio) {
          liveSession.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (parsed.type === 'text' && parsed.text) {
          liveSession.sendRealtimeInput({ text: parsed.text });
        }
      } catch {
        // Ignore malformed client message
      }
    });

    clientWs.on('close', () => {
      isClosing = true;
      if (liveSession) {
        try {
          liveSession.close();
        } catch {
          // Ignore close errors
        }
        liveSession = null;
      }
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`CYBERNEX server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
