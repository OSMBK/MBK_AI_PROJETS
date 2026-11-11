import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';

import { saveAudioMemo, getAudioMemos, saveStudentNote, getStudentNotes, recordChatMessage } from './src/db/codex.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { optionalAuth, AuthRequest } from './src/middleware/auth.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json());

// Initialize Gemini AI client
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAI;
}

// Scholar personas definitions
const scholarPersonas: Record<string, {
  name: string;
  era: string;
  style: string;
  liveVoice: string;
}> = {
  newton: {
    name: 'Sir Isaac Newton',
    era: 'Cambridge, 1687 (Auteur des Philosophiae Naturalis Principia Mathematica)',
    style: 'Rigoureux, austère, passionné d\'optique, de calcul différentiel et de gravitation céleste. Parle un français classique posé et savant avec l\'autorité du président de la Royal Society.',
    liveVoice: 'Fenrir' // Deep authoritative masculine voice
  },
  pythagore: {
    name: 'Pythagore de Samos',
    era: 'Crotone / Samos, ~530 av. J.-C.',
    style: 'Mystique, géomètre, harmoniste. Voit l\'univers entier comme nombres, proportions musicales et vibration des sphères. Sage, poétique et posé.',
    liveVoice: 'Puck' // Warm, calm masculine voice
  },
  socrate: {
    name: 'Socrate d’Athènes',
    era: 'Athènes, ~420 av. J.-C.',
    style: 'Maïeutique pure. Interroge sans imposer de dogme, pousse l\'interlocuteur à accoucher de sa propre pensée, utilise l\'ironie bienveillante et l\'examen méthodique.',
    liveVoice: 'Zephyr' // Engaging, agile masculine voice
  },
  curie: {
    name: 'Marie Curie',
    era: 'Paris, Institut du Radium, ~1911',
    style: 'Déterminée, humble, passionnée par la méthode expérimentale, l\'isolation des éléments radioactifs et le désintéressement de la science.',
    liveVoice: 'Kore' // Composed, clear feminine voice
  },
  hypatie: {
    name: 'Hypatie d’Alexandrie',
    era: 'Alexandrie, ~400 ap. J.-C.',
    style: 'Éloquente, lumineuse, mathématicienne et astronome néoplatonicienne. Passionnée par la géométrie conique, la liberté de penser et la transmission du savoir.',
    liveVoice: 'Kore' // Luminous feminine voice
  }
};

// -------------------------------------------------------------
// 1. CLOUD SQL POSTGRESQL API ENDPOINTS (Codex, Notes & Auth Sync)
// -------------------------------------------------------------

// Sync user from Firebase Auth to Cloud SQL
app.post('/api/auth/sync', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { uid, email, displayName, photoUrl } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ error: 'UID and email required' });
    }
    const dbUser = await getOrCreateUser(uid, email, displayName, photoUrl);
    res.json({ success: true, user: dbUser });
  } catch (error) {
    console.error('Failed to sync user to Cloud SQL:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// Fetch Audio Memos from Cloud SQL
app.get('/api/codex/memos', async (req, res) => {
  try {
    const memos = await getAudioMemos();
    res.json(memos);
  } catch (error) {
    console.error('Error fetching memos from SQL:', error);
    res.status(500).json({ error: 'Failed to fetch memos' });
  }
});

// Save Audio Memo to Cloud SQL
app.post('/api/codex/memos', async (req, res) => {
  try {
    const memo = await saveAudioMemo(req.body);
    res.json({ success: true, memo });
  } catch (error) {
    console.error('Error saving memo to SQL:', error);
    res.status(500).json({ error: 'Failed to save memo' });
  }
});

// Fetch Student Notes from Cloud SQL
app.get('/api/codex/notes', async (req, res) => {
  try {
    const notes = await getStudentNotes();
    res.json(notes);
  } catch (error) {
    console.error('Error fetching student notes from SQL:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Save Student Note to Cloud SQL
app.post('/api/codex/notes', async (req, res) => {
  try {
    const note = await saveStudentNote(req.body);
    res.json({ success: true, note });
  } catch (error) {
    console.error('Error saving note to SQL:', error);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

// -------------------------------------------------------------
// 2. CHAT & REASONING ENDPOINT (Gemini-3.8-Flash + SQL Persistence)
// -------------------------------------------------------------

// Autonomous classical knowledge engine for scholar personas (used when API quota is exhausted)
function generateAutonomousScholarReply(scholarId: string, message: string, history: Array<{ sender: string; text: string }> = []): string {
  const lowerMsg = (message || '').toLowerCase();

  if (scholarId === 'newton') {
    if (lowerMsg.includes('pomme') || lowerMsg.includes('lune') || lowerMsg.includes('tombe') || lowerMsg.includes('gravit') || lowerMsg.includes('orbite')) {
      return `La pesanteur qui précipite la pomme de son arbre à Woolsthorpe est rigoureusement la même puissance qui retient la Lune sur son orbite. Si la distance double, l'attraction est divisée par quatre : c'est la loi en carré inverse que j'ai consignée dans mes Principia Mathematica. Sans cette attraction continue vers la Terre, la Lune s'échapperait en ligne droite par son inertie.`;
    }
    if (lowerMsg.includes('prisme') || lowerMsg.includes('lumi') || lowerMsg.includes('couleur') || lowerMsg.includes('spectre')) {
      return `Les rayons du Soleil ne sont point modifiés par le verre : leur réfrangibilité distincte est une propriété fondamentale et immuable. Le prisme ne crée pas les couleurs, il ne fait que séparer les rayons hétérogènes de la lumière blanche. C'est l'expérience que j'ai menée dans l'obscurité de ma chambre à Trinity College.`;
    }
    return `Considérez avec rigueur les lois du mouvement : tout corps persévère dans son état de repos ou de translation uniforme, à moins qu'une force n'agisse sur lui. En mathématiques comme en philosophie naturelle, n'admettez point d'hypothèses gratuites, mais soumettez chaque phénomène au calcul et à l'expérience.`;
  }

  if (scholarId === 'pythagore') {
    if (lowerMsg.includes('triangle') || lowerMsg.includes('hypothénuse') || lowerMsg.includes('carré') || lowerMsg.includes('aire')) {
      return `Dans tout triangle rectangle, la superficie du carré érigé sur l'hypoténuse équivaut exactement à la somme des superficies des deux carrés assis sur les côtés de l'angle droit. Ce n'est point un simple artifice d'arpenteur, mais la loi géométrique par laquelle l'espace s'ordonne et chante.`;
    }
    if (lowerMsg.includes('nombre') || lowerMsg.includes('musique') || lowerMsg.includes('harmonie') || lowerMsg.includes('corde')) {
      return `Tout est nombre et proportion. En divisant la longueur d'une corde par deux, vous entendez l'octave ; par trois demis, la quinte pure. Les astres qui tournent dans la voûte céleste obéissent à ces mêmes intervalles sonores que nous nommons l'Harmonie des Sphères.`;
    }
    return `Écoutez la vibration secrète qui sous-tend les choses visibles. Nul désordre n'est souverain : dès que vous cherchez la proportion juste, l'esprit s'apaise et retrouve la monade première. Quelle mesure désirez-vous accorder aujourd'hui ?`;
  }

  if (scholarId === 'socrate') {
    if (lowerMsg.includes('vérité') || lowerMsg.includes('savoir') || lowerMsg.includes('ignor') || lowerMsg.includes('rien')) {
      return `Je ne me vante d'aucun savoir que je pourrais déverser dans votre âme comme de l'eau dans une cruche vide. Tout ce que je sais, c'est que je ne sais rien ; mais c'est précisément ce constat qui me délivre des illusions et m'oblige à interroger sans relâche ce que nous tenons pour vrai.`;
    }
    if (lowerMsg.includes('maïeutique') || lowerMsg.includes('accouch') || lowerMsg.includes('pensée')) {
      return `Ma mère Phénarète était sage-femme pour les corps ; moi, c'est pour les âmes que j'exerce cet art. Je ne conçois point la pensée à votre place, mais par des questions serrées, je vous aide à accoucher de vos propres vérités intérieures. Avez-vous le courage d'examiner ce dont vous vous croyiez certain ?`;
    }
    return `Arrêtons-nous un instant sur cette place publique de l'esprit. Ce que vous dites semble évident au premier abord, mais l'avez-vous passé au crible de l'examen ? Une vie sans examen ne mérite point d'être vécue. Définissons d'abord les termes dont nous faisons usage.`;
  }

  if (scholarId === 'curie') {
    if (lowerMsg.includes('radium') || lowerMsg.includes('uranium') || lowerMsg.includes('radioactiv') || lowerMsg.includes('pechblende')) {
      return `Dans notre modeste hangar de la rue Lhomond, nous avons traité des tonnes de pechblende de Bohême pour en extraire quelques milligrammes d'un chlorure de radium pur. Cette matière luit dans la nuit d'une clarté spontanée, libérant une énergie continue sans précédent qui transforme notre regard sur l'atome.`;
    }
    if (lowerMsg.includes('danger') || lowerMsg.includes('peur') || lowerMsg.includes('femme') || lowerMsg.includes('chercheu')) {
      return `Rien dans la vie n'est à craindre, tout est à comprendre. Il est temps de comprendre plus, pour craindre moins. Ne laissez jamais les préjugés ni la rudesse des conditions matérielles étouffer la vocation de votre curiosité scientifique.`;
    }
    return `La recherche scientifique exige un désintéressement complet et une infinie patience. Ne cherchez point l'éclat immédiat, mais la certitude de la mesure répétée. Chaque expérience méthodique dissipe un voile devant la vérité du monde minéral.`;
  }

  // Hypatie
  return `À Alexandrie, nous avons appris à contempler les sections coniques d'Apollonius et les épicycles des cieux sans dogme préalable. Préservez à tout prix votre liberté d'examen : mieux vaut penser par soi-même avec imperfection que d'adopter docilement les certitudes imposées par autrui.`;
}

app.post('/api/chat', async (req, res) => {
  const {
    scholarId,
    message,
    conversationHistory = [],
    isAudio = false,
    audioDuration,
    model = 'gemini-3.8-flash',
    useGoogleSearch = false
  } = req.body;

  const persona = scholarPersonas[scholarId] || scholarPersonas.newton;

  const allowedModels = [
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-4-argon',
    'gemini-4-carbon'
  ];
  let targetModel = allowedModels.includes(model) ? model : 'gemini-3.8-flash';

  if (useGoogleSearch) {
    targetModel = 'gemini-3.8-flash';
  }

  // Record user message in Cloud SQL
  recordChatMessage({
    scholarId,
    sender: 'user',
    text: message,
    isAudio,
    audioDuration
  }).catch(() => {});

  const ai = getGeminiClient();
  if (!ai) {
    const simulatedReply = generateAutonomousScholarReply(scholarId, message, conversationHistory);

    recordChatMessage({
      scholarId,
      scholarName: persona.name,
      sender: 'scholar',
      text: simulatedReply,
      isAudio: true,
      audioDuration: '0:24'
    }).catch(() => {});

    return res.json({
      text: simulatedReply,
      source: 'offline_classical_engine',
      scholar: persona.name,
      modelUsed: targetModel,
      sources: []
    });
  }

  const searchDirective = useGoogleSearch
    ? `Tu as accès à la recherche Google en direct. Tu peux t'appuyer sur des sources historiques authentifiées, des découvertes récentes ou des vérifications d'archives sans jamais briser ton incarnation théâtrale de ${persona.name}.`
    : '';

  const systemInstruction = `Tu incarnes fidèlement ${persona.name} (${persona.era}).
Ton style : ${persona.style}
Tu t'adresses à un disciple ou étudiant de l'Agora des Siècles dans une conversation à plusieurs tours (multi-turn conversation).
${searchDirective}
Réponds de manière concise, élégante, percutante (2 à 4 phrases bien ciselées, style littéraire d'époque en français châtié). N'utilise aucun jargon moderne d'informatique. Reste fidèle à ton personnage, ton érudition et tes découvertes scientifiques ou philosophiques.`;

  const contents = [
    ...conversationHistory.map((m: { sender: string; text: string }) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    })),
    { role: 'user', parts: [{ text: message }] }
  ];

  const generateConfig: any = {
    systemInstruction
  };

  if (useGoogleSearch) {
    generateConfig.tools = [{ googleSearch: {} }];
  }

  let response: any = null;
  let usedModel = targetModel;
  let quotaHit = false;

  try {
    response = await ai.models.generateContent({
      model: targetModel,
      contents: contents,
      config: generateConfig
    });
  } catch (primaryErr: any) {
    const errMsg = primaryErr?.message || String(primaryErr);
    console.warn(`Primary Gemini call failed with model ${targetModel}:`, errMsg);
    const isQuotaError = errMsg.includes('429') ||
                         errMsg.includes('RESOURCE_EXHAUSTED') ||
                         primaryErr?.status === 429 ||
                         primaryErr?.code === 429;

    if (isQuotaError) {
      quotaHit = true;
      // Try graceful fast fallback with gemini-3.1-flash-lite (without search grounding to minimize quota)
      if (targetModel !== 'gemini-3.1-flash-lite' || useGoogleSearch) {
        try {
          console.log("Attempting fallback retry with gemini-3.1-flash-lite...");
          response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: contents,
            config: {
              systemInstruction
            }
          });
          if (response && response.text) {
            usedModel = 'gemini-3.1-flash-lite';
            quotaHit = false;
          }
        } catch (retryErr: any) {
          console.warn("Retry with gemini-3.1-flash-lite also reached quota limit:", retryErr?.message || retryErr);
        }
      }
    } else {
      console.error('Non-quota Gemini error:', primaryErr);
    }
  }

  if (quotaHit || !response || !response.text) {
    // Graceful autonomous scholar reply
    const scholarReplyText = generateAutonomousScholarReply(scholarId, message, conversationHistory);

    recordChatMessage({
      scholarId,
      scholarName: persona.name,
      sender: 'scholar',
      text: scholarReplyText,
      isAudio: true,
      audioDuration: '0:26'
    }).catch(() => {});

    return res.json({
      text: scholarReplyText,
      source: 'autonomous_archive_engine',
      scholar: persona.name,
      modelUsed: 'Archives Érudites (Mode Autonome)',
      quotaExceeded: true,
      quotaMessage: "Le quota de requêtes de l'API Gemini est temporairement atteint (429 RESOURCE_EXHAUSTED). Les Maîtres répondent depuis leur corpus autonome d'archives. Vous pouvez connecter une clé d'API avec facturation dans Settings > Secrets pour un débit accru.",
      sources: []
    });
  }

  const replyText = response.text || "La nature garde encore son secret en cet instant.";

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const webSources = groundingChunks
    ?.map((c: any) => c.web)
    .filter((w: any) => w && w.uri)
    .map((w: any) => ({
      title: w.title || 'Source historique / web',
      uri: w.uri
    })) || [];

  const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

  recordChatMessage({
    scholarId,
    scholarName: persona.name,
    sender: 'scholar',
    text: replyText,
    isAudio: true,
    audioDuration: '0:26'
  }).catch(() => {});

  res.json({
    text: replyText,
    source: 'gemini',
    scholar: persona.name,
    modelUsed: usedModel,
    sources: webSources,
    searchQueries: searchQueries
  });
});

// Daily Audio Question
app.get('/api/daily-question', (req, res) => {
  res.json({
    question: "« Pourquoi la Lune ne tombe-t-elle pas sur la Terre ? »",
    scholar: "Sir Isaac Newton",
    location: "Cambridge, 1687",
    duration: "01:42",
    context: "Loi de l'attraction universelle et inertie orbitale."
  });
});

// -------------------------------------------------------------
// 3. GEMINI-3.8-LIVE (LIVE API) REAL-TIME WEBSOCKET STREAMING
// -------------------------------------------------------------

const wss = new WebSocketServer({ server, path: '/api/live' });

wss.on('connection', async (clientWs: WebSocket) => {
  let liveSession: any = null;
  let activeScholarId = 'newton';

  clientWs.on('message', async (data: Buffer | string) => {
    try {
      const payload = JSON.parse(data.toString());

      // 1. Initial configuration or start command
      if (payload.type === 'start') {
        activeScholarId = payload.scholarId || 'newton';
        const persona = scholarPersonas[activeScholarId] || scholarPersonas.newton;
        const ai = getGeminiClient();

        if (!ai) {
          clientWs.send(JSON.stringify({
            type: 'error',
            message: 'Clé API Gemini non configurée pour le Live API.'
          }));
          return;
        }

        try {
          const systemInstruction = `Tu es ${persona.name} (${persona.era}).
Tu es en dialogue vocal temps réel (Live API) avec un étudiant de l'Agora des Siècles.
Ton élocution est vivante, immédiate, chaleureuse et naturelle. Réponds en 1 à 3 phrases fluides, concises et orales en français d'époque noble.`;

          liveSession = await ai.live.connect({
            model: 'gemini-3.8-live',
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: persona.liveVoice
                  }
                }
              },
              systemInstruction
            },
            callbacks: {
              onmessage: (message: LiveServerMessage) => {
                for (const part of message.serverContent?.modelTurn?.parts ?? []) {
                  if (part.inlineData?.data) {
                    // Send 24kHz PCM audio chunk to client
                    clientWs.send(JSON.stringify({
                      type: 'audio',
                      audio: part.inlineData.data
                    }));
                  }
                  if (part.text) {
                    clientWs.send(JSON.stringify({
                      type: 'text',
                      text: part.text
                    }));
                  }
                }
                if (message.serverContent?.interrupted) {
                  clientWs.send(JSON.stringify({ type: 'interrupted' }));
                }
                if (message.serverContent?.turnComplete) {
                  clientWs.send(JSON.stringify({ type: 'turnComplete' }));
                }
              }
            }
          });

          clientWs.send(JSON.stringify({
            type: 'connected',
            scholar: persona.name,
            voice: persona.liveVoice
          }));
        } catch (err: any) {
          console.error('Failed to connect to gemini-3.8-live:', err);
          clientWs.send(JSON.stringify({
            type: 'error',
            message: 'Connexion au flux vocal Live API indisponible.'
          }));
        }
      }

      // 2. Client sending realtime audio (16kHz PCM base64)
      if (payload.type === 'audio' && liveSession) {
        liveSession.sendRealtimeInput({
          audio: {
            data: payload.audio,
            mimeType: 'audio/pcm;rate=16000'
          }
        });
      }

      // 3. Client sending text in live session
      if (payload.type === 'text' && liveSession) {
        liveSession.send({
          parts: [{ text: payload.text }]
        });
      }
    } catch (err) {
      console.error('Live WS error:', err);
    }
  });

  clientWs.on('close', () => {
    if (liveSession && typeof liveSession.close === 'function') {
      try {
        liveSession.close();
      } catch {
        // ignore
      }
    }
  });
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Agora Savoirs full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
