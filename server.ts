import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAI;
}

// API: Chat with a Historical Scholar
app.post('/api/chat', async (req, res) => {
  const { scholarId, message, conversationHistory = [] } = req.body;

  const scholarPersonas: Record<string, { name: string; era: string; style: string }> = {
    newton: {
      name: 'Sir Isaac Newton',
      era: 'Cambridge, 1687 (Auteur des Philosophiae Naturalis Principia Mathematica)',
      style: 'Rigoureux, austère, passionné d\'optique, de calcul différentiel et de gravitation céleste. Parle un français classique posé et savant avec l\'autorité du président de la Royal Society.'
    },
    pythagore: {
      name: 'Pythagore de Samos',
      era: 'Crotone / Samos, ~530 av. J.-C.',
      style: 'Mystique, géomètre, harmoniste. Voit l\'univers entier comme nombres, proportions musicales et vibration des sphères. Sage, poétique et précis.'
    },
    socrate: {
      name: 'Socrate d’Athènes',
      era: 'Athènes, ~420 av. J.-C.',
      style: 'Maïeutique pure. Interroge sans imposer de dogme, pousse l\'interlocuteur à accoucher de sa propre pensée, utilise l\'ironie bienveillante et l\'examen méthodique.'
    },
    curie: {
      name: 'Marie Curie',
      era: 'Paris, Institut du Radium, ~1911',
      style: 'Déterminée, humble, passionnée par la méthode expérimentale, l\'isolation des éléments radioactifs (polonium, radium) et le désintéressement de la science.'
    }
  };

  const persona = scholarPersonas[scholarId] || scholarPersonas.newton;

  const ai = getGeminiClient();
  if (!ai) {
    // Elegant classical simulated in-character fallback response
    let simulatedReply = "";
    if (scholarId === 'newton') {
      simulatedReply = `Considérez ceci, jeune esprit : la nature est simple et ne se complaît point en causes superflues. Tout corps persévère dans l'état de repos ou de mouvement uniforme en ligne droite dans lequel il se trouve, à moins qu'une force n'agisse sur lui. Qu'en déduisez-vous pour la trajectoire céleste de nos planètes ?`;
    } else if (scholarId === 'pythagore') {
      simulatedReply = `Écoute le nombre qui vibre au cœur de la corde tendue. Si tu divises sa longueur par deux, tu obtiens l'octave parfaite. Tout dilemme humain trouve son équilibre dans une proportion harmonique cachée. Que cherches-tu à harmoniser ?`;
    } else if (scholarId === 'socrate') {
      simulatedReply = `Mais dis-moi, mon cher ami : quand tu formules cette interrogation, crois-tu que la certitude réside dans la réponse que je t'offrirais, ou dans l'examen courageux de ce que tu tenais jusqu'ici pour vrai ? Que signifie pour toi le terme même de vérité ?`;
    } else {
      simulatedReply = `Dans notre laboratoire de la rue Cuvier, nous avons appris la patience minérale. La matière recèle des énergies insoupçonnées. Ne craignez jamais l'obscurité de l'inconnu ; chaque mesure méthodique apporte sa parcelle de lumière.`;
    }

    return res.json({
      text: simulatedReply,
      source: 'offline_classical_engine',
      scholar: persona.name
    });
  }

  try {
    const systemInstruction = `Tu incarnes fidèlement ${persona.name} (${persona.era}).
Ton style : ${persona.style}
Tu t'adresses à un disciple ou étudiant de l'Agora des Siècles.
Réponds de manière concise, élégante, percutante (2 à 4 phrases bien ciselées, style littéraire d'époque en français châtié). N'utilise aucun jargon moderne d'informatique. Reste strictement dans ton siècle et ton domaine d'érudition.`;

    const contents = [
      ...conversationHistory.map((m: { sender: string; text: string }) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 250
      }
    });

    const replyText = response.text || "La nature garde encore son secret en cet instant.";
    res.json({
      text: replyText,
      source: 'gemini',
      scholar: persona.name
    });
  } catch (err: unknown) {
    console.error('Gemini chat error:', err);
    res.json({
      text: `La réflexion demande concentration. Reprenons : ${persona.name} vous invite à préciser votre pensée expérimentale.`,
      source: 'fallback'
    });
  }
});

// API: Daily Audio Question
app.get('/api/daily-question', (req, res) => {
  res.json({
    question: "« Pourquoi la Lune ne tombe-t-elle pas sur la Terre ? »",
    scholar: "Sir Isaac Newton",
    location: "Cambridge, 1687",
    duration: "01:42",
    context: "Loi de l'attraction universelle et inertie orbitale."
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Agora Savoirs server running on port ${PORT}`);
  });
}

startServer();
