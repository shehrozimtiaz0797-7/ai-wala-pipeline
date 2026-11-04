'use strict';
// Writes the story: title, description, tags and scenes (Roman Urdu subtitles, Urdu-script voice lines, image prompts).
const fs = require('fs');
const path = require('path');
const { ROOT, env, requireEnv, fetchRetry, log } = require('./lib');
const bible = require('../characters');
const { format } = require('./formats');

const HISTORY = path.join(ROOT, 'history.json');

function readHistory() {
  try { return JSON.parse(fs.readFileSync(HISTORY, 'utf8')); } catch (_) { return []; }
}
function addHistory(entry) {
  const h = readHistory();
  h.push(entry);
  fs.writeFileSync(HISTORY, JSON.stringify(h.slice(-200), null, 2));
}

function buildPrompt(topic, sceneCount, fmt) {
  const chars = Object.entries(bible.characters)
    .map(([name, c]) => `- ${name}: ${c.personality}`).join('\n');
  const past = readHistory().slice(-25).map(h => `- ${h.title}`).join('\n') || '- (none yet)';
  const theme = topic || bible.themes[Math.floor(Math.random() * bible.themes.length)];

  return `You write animated story videos for the Pakistani channel "AI Wala". This one is ${fmt.lengthText}.
Audience: Pakistani youth interested in tech, AI and earning online. Tone: warm, funny, with a small useful lesson.

Recurring characters (use 2 or 3 of them):
${chars}

Story idea: ${theme}

Write exactly ${sceneCount} scenes. Rules:
- Scene 1 is a strong hook that makes people keep watching.
${fmt.extraRules}
- The last scene gives the lesson in one line and ends with "AI Wala ko subscribe karna na bhoolna!".
- Each scene has ONE spoken line of ${fmt.wordsPerLine} words (narrator or a character speaking). Keep it natural, everyday Pakistani Urdu.
- "subtitle": the line in Roman Urdu (Urdu written in English letters), mixed with common English tech words.
- "voice": the SAME line written in Urdu script (اردو) for the voice-over. Keep English tech words in English letters inside it if natural.
- "image_prompt": an English description of the scene picture: who is in it (use the character names ZAIN, CHOTU BOT, NANI in capitals), what they are doing, their expressions, the location and the lighting. One clear moment, 25-50 words. Do NOT describe the characters' clothes or looks (that is added automatically). No text or signs in the picture.
- No fake statistics, no unrealistic money promises (small realistic amounts only).
- This is fiction; keep it family-friendly.

Do not repeat these earlier stories:
${past}

Return ONLY valid JSON in this exact shape:
{
  "title": "catchy title under 80 characters, Roman Urdu or Urdu-English mix",
  "description": "2-3 sentence description in Roman Urdu, mention it is a fictional story",
  "tags": ["8 to 12 short tags"],
  "scenes": [ { "subtitle": "...", "voice": "...", "image_prompt": "..." } ]
}`;
}

function parseJSON(text) {
  const cleaned = String(text).replace(/^```(?:json)?/i, '').replace(/```\s*$/, '').trim();
  try { return JSON.parse(cleaned); } catch (_) {
    const s = cleaned.indexOf('{'); const e = cleaned.lastIndexOf('}');
    if (s !== -1 && e > s) return JSON.parse(cleaned.slice(s, e + 1));
    throw new Error('Story writer did not return valid JSON');
  }
}

// Models to try in order. If the first is busy (503) or rate-limited, the next one writes the story.
function storyModels() {
  const main = env('GEMINI_TEXT_MODEL', 'gemini-3.8-flash');
  const backups = env('GEMINI_TEXT_FALLBACKS', 'gemini-3.5-flash-lite').split(/[,\s]+/).filter(Boolean);
  return [...new Set([main, ...backups])];
}

async function writeStory(topic, kind = 'short') {
  const fmt = format(kind);
  const key = requireEnv('GEMINI_API_KEY', 'Get one at https://aistudio.google.com/apikey');
  const sceneCount = fmt.scenes();
  const models = storyModels();
  let lastError = null;

  for (const [m, model] of models.entries()) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
    const isLast = m === models.length - 1;
    for (let attempt = 1; attempt <= 3; attempt++) {
      log(`Writing ${fmt.label} story (${sceneCount} scenes) with ${model}${topic ? ` (topic: ${topic})` : ''}...`);
      let data;
      try {
        // Fewer retries on the main model so a busy model hands over to the backup quickly.
        const res = await fetchRetry(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: buildPrompt(topic, sceneCount, fmt) }] }],
            generationConfig: { temperature: 0.9, responseMimeType: 'application/json' }
          })
        }, `Gemini story (${model})`, isLast ? 6 : 3);
        data = await res.json();
      } catch (err) {
        lastError = err;
        if (!isLast && /\[(429|500|502|503|504|404)\]|busy|FREE limit/i.test(err.message)) {
          log(`${model} is busy or unavailable, switching to ${models[m + 1]}...`);
          break; // next model
        }
        throw err;
      }
      const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
      try {
        const story = parseJSON(text);
        const scenes = (story.scenes || []).filter(s => s && s.subtitle && s.image_prompt);
        if (!story.title || scenes.length < Math.max(4, Math.floor(sceneCount * 0.7))) throw new Error(`story incomplete (${scenes.length} scenes)`);
        story.scenes = scenes.slice(0, sceneCount).map(s => ({
          subtitle: String(s.subtitle).trim(),
          voice: String(s.voice || s.subtitle).trim(),
          image_prompt: String(s.image_prompt).trim()
        }));
        story.tags = Array.isArray(story.tags) ? story.tags.map(String).slice(0, 15) : [];
        story.title = String(story.title).slice(0, 95);
        story.kind = fmt.kind;
        log(`Story ready: "${story.title}" (${story.scenes.length} scenes, ${model})`);
        return story;
      } catch (err) {
        lastError = err;
        log(`Story attempt ${attempt} was not usable (${err.message}), trying again...`);
      }
    }
  }
  throw new Error('Could not get a usable story from Gemini: ' + (lastError ? lastError.message : 'unknown error'));
}

module.exports = { writeStory, addHistory, readHistory };
