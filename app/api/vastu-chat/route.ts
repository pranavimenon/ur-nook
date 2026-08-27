import { NextResponse } from 'next/server';

/**
 * Proxies chat requests to Google's Gemini API using a free, no-credit-card
 * API key from Google AI Studio (aistudio.google.com) — kept server-side,
 * never exposed to the browser. This lets every visitor — signed in or
 * guest — use the Vastu consultant for free, and costs the site owner
 * nothing either, as long as usage stays within Gemini's free-tier limits
 * (as of writing: ~1,500 requests/day on the Flash model, no billing
 * required at all).
 *
 * The rate limiter below is a courtesy extra layer on top of Gemini's own
 * quota — it's a simple in-memory per-IP counter, good enough for moderate
 * traffic but resets on server restart and isn't perfectly synced across
 * regions on Vercel. If this app gets serious traffic, swap it for a real
 * shared store (e.g. Upstash Redis) — nothing else here would need to change.
 */

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 20; // per IP, per window

const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

function hitRateLimit(key: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSec = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - entry.windowStart)) / 1000);
    return { allowed: false, retryAfterSec };
  }
  entry.count += 1;
  return { allowed: true };
}

// Prevents rateLimitStore from growing unbounded over a long-running server process.
function pruneRateLimitStore() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) rateLimitStore.delete(key);
  }
}

function getClientKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return (forwarded ? forwarded.split(',')[0].trim() : null) || 'unknown';
}

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'The Vastu consultant is not configured yet — missing GEMINI_API_KEY on the server.' },
      { status: 503 }
    );
  }

  const clientKey = getClientKey(req);
  const { allowed, retryAfterSec } = hitRateLimit(clientKey);
  if (Math.random() < 0.02) pruneRateLimitStore(); // occasional cheap cleanup, no cron needed
  if (!allowed) {
    return NextResponse.json(
      { error: `Too many requests — please wait about ${retryAfterSec}s and try again.` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.messages) || typeof body.systemPrompt !== 'string') {
    return NextResponse.json({ error: 'Expected { systemPrompt, messages }' }, { status: 400 });
  }
  // Keep conversations bounded — this is a Vastu Q&A widget, not a general chat app.
  const messages: ChatMessage[] = body.messages.slice(-30);

  // Gemini's REST format differs from Anthropic's: history lives in `contents`
  // with role "user" | "model" (not "assistant"), and the system prompt is
  // its own top-level field rather than part of the messages array.
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const model = 'gemini-3.6-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents,
        system_instruction: { parts: [{ text: body.systemPrompt }] },
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      const message = (data && data.error && data.error.message) || `Upstream error (HTTP ${resp.status})`;
      return NextResponse.json({ error: message }, { status: resp.status === 401 || resp.status === 403 ? 502 : resp.status });
    }

    const candidate = data.candidates && data.candidates[0];
    const text = candidate?.content?.parts?.map((p: { text?: string }) => p.text || '').join('').trim();

    if (!text) {
      // Gemini returns no candidates (rather than an error) when it blocks a
      // prompt for safety reasons — surface that distinctly instead of a
      // generic failure.
      const blockReason = data.promptFeedback?.blockReason;
      return NextResponse.json({
        text: blockReason
          ? "I can't answer that one — it was flagged by the safety filter. Try rephrasing your question."
          : 'Sorry, I could not analyze the layout right now.',
      });
    }

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: 'Could not reach the Vastu consultant right now.' }, { status: 502 });
  }
}