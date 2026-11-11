import { db } from './index.ts';
import { audioMemos, studentNotes, conversations, messages, users } from './schema.ts';
import { desc, eq } from 'drizzle-orm';

// Save an Audio Memo to PostgreSQL
export async function saveAudioMemo(data: {
  userId?: number;
  scholarId: string;
  scholarName: string;
  category: string;
  topic: string;
  title: string;
  quoteExcerpt: string;
  duration: string;
  tag: string;
}) {
  try {
    const result = await db.insert(audioMemos)
      .values({
        userId: data.userId || null,
        scholarId: data.scholarId,
        scholarName: data.scholarName,
        category: data.category,
        topic: data.topic,
        title: data.title,
        quoteExcerpt: data.quoteExcerpt,
        duration: data.duration,
        tag: data.tag
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database error saving audio memo:", error);
    throw new Error("Failed to save audio memo to database", { cause: error });
  }
}

// Fetch all Audio Memos
export async function getAudioMemos(userId?: number) {
  try {
    if (userId) {
      return await db.select().from(audioMemos)
        .where(eq(audioMemos.userId, userId))
        .orderBy(desc(audioMemos.createdAt));
    }
    return await db.select().from(audioMemos).orderBy(desc(audioMemos.createdAt));
  } catch (error) {
    console.error("Database error fetching audio memos:", error);
    throw new Error("Failed to fetch audio memos", { cause: error });
  }
}

// Save Student Vocal Note
export async function saveStudentNote(data: {
  userId?: number;
  title: string;
  duration: string;
  studentTranscript: string;
  feedbackScholarId: string;
  feedbackScholarName: string;
  feedbackStatus: string;
  feedbackText: string;
}) {
  try {
    const result = await db.insert(studentNotes)
      .values({
        userId: data.userId || null,
        title: data.title,
        duration: data.duration,
        studentTranscript: data.studentTranscript,
        feedbackScholarId: data.feedbackScholarId,
        feedbackScholarName: data.feedbackScholarName,
        feedbackStatus: data.feedbackStatus,
        feedbackText: data.feedbackText
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database error saving student note:", error);
    throw new Error("Failed to save student note to database", { cause: error });
  }
}

// Fetch all Student Vocal Notes
export async function getStudentNotes(userId?: number) {
  try {
    if (userId) {
      return await db.select().from(studentNotes)
        .where(eq(studentNotes.userId, userId))
        .orderBy(desc(studentNotes.createdAt));
    }
    return await db.select().from(studentNotes).orderBy(desc(studentNotes.createdAt));
  } catch (error) {
    console.error("Database error fetching student notes:", error);
    throw new Error("Failed to fetch student notes", { cause: error });
  }
}

// Record chat message into Cloud SQL
export async function recordChatMessage(data: {
  scholarId: string;
  scholarName?: string;
  sender: 'scholar' | 'user';
  text: string;
  isAudio?: boolean;
  audioDuration?: string;
  highlight?: string;
  referenceDoc?: string;
  userId?: number;
}) {
  try {
    // Find or create active conversation
    const activeConv = await db.select().from(conversations)
      .where(eq(conversations.scholarId, data.scholarId))
      .orderBy(desc(conversations.createdAt))
      .limit(1);

    let convId: number;
    if (activeConv.length > 0) {
      convId = activeConv[0].id;
    } else {
      const newConv = await db.insert(conversations)
        .values({
          scholarId: data.scholarId,
          title: `Dialogue avec ${data.scholarName || data.scholarId}`,
          userId: data.userId || null,
          mode: 'standard'
        })
        .returning();
      convId = newConv[0].id;
    }

    const insertedMsg = await db.insert(messages)
      .values({
        conversationId: convId,
        sender: data.sender,
        scholarId: data.scholarId,
        scholarName: data.scholarName || null,
        text: data.text,
        isAudio: data.isAudio ?? false,
        audioDuration: data.audioDuration || null,
        highlight: data.highlight || null,
        referenceDoc: data.referenceDoc || null
      })
      .returning();

    return insertedMsg[0];
  } catch (error) {
    console.error("Database error recording message:", error);
    // Don't crash chat if message recording fails
    return null;
  }
}
