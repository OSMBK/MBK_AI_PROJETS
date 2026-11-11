/**
 * Real-time Audio streaming bridge for Gemini Live API (gemini-3.8-live)
 * - Captures user microphone input at 16kHz PCM
 * - Streams low-latency responses from Live API at 24kHz PCM
 * - Manages queue, barge-in / interruption, and speech feedback
 */

// Helper to convert float32 audio samples [-1.0, 1.0] to base64 16-bit PCM
function float32To16BitPCMBase64(float32Array: Float32Array): string {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to convert base64 24kHz 16-bit PCM to AudioBuffer for playback
function base64To24kPcmBuffer(audioCtx: AudioContext, base64: string): AudioBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const int16Array = new Int16Array(bytes.buffer);
  const audioBuffer = audioCtx.createBuffer(1, int16Array.length, 24000);
  const channelData = audioBuffer.getChannelData(0);
  for (let i = 0; i < int16Array.length; i++) {
    channelData[i] = int16Array[i] / 32768.0;
  }
  return audioBuffer;
}

export interface LiveSessionController {
  disconnect: () => void;
  sendTextMessage: (text: string) => void;
}

export function startLiveVoiceSession({
  scholarId,
  onConnected,
  onModelSpeechStart,
  onModelTextChunk,
  onModelInterrupted,
  onAudioLevel,
  onError,
  onClose
}: {
  scholarId: string;
  onConnected: (info: { scholar: string; voice: string }) => void;
  onModelSpeechStart?: () => void;
  onModelTextChunk?: (text: string) => void;
  onModelInterrupted?: () => void;
  onAudioLevel?: (level: number) => void;
  onError: (err: string) => void;
  onClose?: () => void;
}): LiveSessionController {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/api/live`;

  let ws: WebSocket | null = null;
  let micStream: MediaStream | null = null;
  let inputAudioCtx: AudioContext | null = null;
  let outputAudioCtx: AudioContext | null = null;
  let scriptNode: ScriptProcessorNode | null = null;
  let scheduledPlaybackTime = 0;
  const activeSources: AudioBufferSourceNode[] = [];

  const stopActivePlayback = () => {
    while (activeSources.length > 0) {
      const src = activeSources.pop();
      try {
        src?.stop();
        src?.disconnect();
      } catch {
        // ignore
      }
    }
    if (outputAudioCtx) {
      scheduledPlaybackTime = outputAudioCtx.currentTime;
    }
  };

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = async () => {
      // 1. Send start command
      ws?.send(JSON.stringify({ type: 'start', scholarId }));

      // 2. Setup Mic capture at 16kHz
      try {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        inputAudioCtx = new AudioCtxClass({ sampleRate: 16000 });
        outputAudioCtx = new AudioCtxClass({ sampleRate: 24000 });
        scheduledPlaybackTime = outputAudioCtx.currentTime;

        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        const micSource = inputAudioCtx.createMediaStreamSource(micStream);
        scriptNode = inputAudioCtx.createScriptProcessor(4096, 1, 1);

        scriptNode.onaudioprocess = (e) => {
          if (ws?.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);

            // Compute energy level
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) {
              sum += inputData[i] * inputData[i];
            }
            const rms = Math.sqrt(sum / inputData.length);
            if (onAudioLevel) onAudioLevel(Math.min(1, rms * 5));

            const base64Pcm = float32To16BitPCMBase64(inputData);
            ws.send(JSON.stringify({ type: 'audio', audio: base64Pcm }));
          }
        };

        micSource.connect(scriptNode);
        scriptNode.connect(inputAudioCtx.destination);
      } catch (err: any) {
        console.error('Mic access error:', err);
        onError('Accès au microphone requis pour la conversation temps réel.');
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'connected') {
          onConnected({ scholar: msg.scholar, voice: msg.voice });
        } else if (msg.type === 'audio') {
          if (onModelSpeechStart) onModelSpeechStart();
          if (outputAudioCtx) {
            const buffer = base64To24kPcmBuffer(outputAudioCtx, msg.audio);
            const source = outputAudioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(outputAudioCtx.destination);

            const now = outputAudioCtx.currentTime;
            const startTime = Math.max(now, scheduledPlaybackTime);
            source.start(startTime);
            scheduledPlaybackTime = startTime + buffer.duration;

            activeSources.push(source);
            source.onended = () => {
              const idx = activeSources.indexOf(source);
              if (idx > -1) activeSources.splice(idx, 1);
            };
          }
        } else if (msg.type === 'text') {
          if (onModelTextChunk) onModelTextChunk(msg.text);
        } else if (msg.type === 'interrupted') {
          stopActivePlayback();
          if (onModelInterrupted) onModelInterrupted();
        } else if (msg.type === 'error') {
          onError(msg.message || 'Erreur Live API');
        }
      } catch (e) {
        console.error('Parse WS message error:', e);
      }
    };

    ws.onerror = () => {
      onError('Impossible d’établir la liaison WebSocket avec le modèle Live API.');
    };

    ws.onclose = () => {
      if (onClose) onClose();
    };
  } catch (err: any) {
    onError(err.message || 'Échec initialisation Live');
  }

  const disconnect = () => {
    stopActivePlayback();

    if (scriptNode) {
      try {
        scriptNode.disconnect();
      } catch {}
      scriptNode = null;
    }
    if (micStream) {
      micStream.getTracks().forEach(t => t.stop());
      micStream = null;
    }
    if (inputAudioCtx) {
      inputAudioCtx.close().catch(() => {});
      inputAudioCtx = null;
    }
    if (outputAudioCtx) {
      outputAudioCtx.close().catch(() => {});
      outputAudioCtx = null;
    }
    if (ws) {
      ws.close();
      ws = null;
    }
  };

  const sendTextMessage = (text: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'text', text }));
    }
  };

  return { disconnect, sendTextMessage };
}
