'use strict';
// AI Wala — makes story videos from scratch and uploads them.
// Usage:
//   node make-video.js                      the daily plan from .env (LONGS_PER_RUN long + SHORTS_PER_RUN Shorts)
//   node make-video.js --count 2            only 2 Shorts
//   node make-video.js --long               only 1 long video (4-5 min)
//   node make-video.js --topic "Nani aur ChatGPT"   topic for the first video of the run
//   node make-video.js --no-upload          make the videos but don't upload (for testing)
const fs = require('fs');
const path = require('path');
const { ROOT, env, log, slugify } = require('./src/lib');
const { writeStory, addHistory, readHistory } = require('./src/story');
const { makeSceneImages } = require('./src/images');
const { makeVoiceOvers } = require('./src/voice');
const { buildVideo } = require('./src/video');
const { upload } = require('./src/youtube');

function arg(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : (process.argv[i + 1] || '');
}
const NO_UPLOAD = process.argv.includes('--no-upload') || env('UPLOAD', 'yes').toLowerCase() === 'no';

function cleanup(workDir) {
  for (const f of fs.readdirSync(workDir)) {
    if (/^(seg\d+\.mp4|joined\.mp4|voice_all\.wav|voice_full\d*\.wav|voice\d+\.wav|subs\d+\.ass|thumb\.ass|list\.txt)$/.test(f)) fs.rmSync(path.join(workDir, f), { force: true });
  }
  fs.rmSync(path.join(workDir, 'fonts'), { recursive: true, force: true });
  const keepDays = Number(env('KEEP_DAYS', '7'));
  const outRoot = path.join(ROOT, 'output');
  for (const d of fs.readdirSync(outRoot)) {
    const p = path.join(outRoot, d);
    try {
      if (Date.now() - fs.statSync(p).mtimeMs > keepDays * 86400000) fs.rmSync(p, { recursive: true, force: true });
    } catch (_) { /* ignore */ }
  }
}

async function makeOne(topic, kind) {
  const story = await writeStory(topic, kind);
  const n = new Date(), p = v => String(v).padStart(2, '0');
  const stamp = `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}_${p(n.getHours())}-${p(n.getMinutes())}`;
  const workDir = path.join(ROOT, 'output', `${stamp}_${slugify(story.title)}`);
  fs.mkdirSync(workDir, { recursive: true });
  fs.writeFileSync(path.join(workDir, 'story.json'), JSON.stringify(story, null, 2));

  const images = await makeSceneImages(story, workDir);
  const voices = await makeVoiceOvers(story, workDir);
  const video = await buildVideo(story, images, voices, workDir);

  let videoId = null, publishAt = null;
  if (NO_UPLOAD) log('Upload skipped (--no-upload). Video is in: ' + workDir);
  else {
    const usedSlots = readHistory()
      .filter(h => (h.kind || 'short') === story.kind)
      .map(h => h.publishAt).filter(t => t && new Date(t).getTime() > Date.now());
    ({ id: videoId, publishAt } = await upload(video.file, story, usedSlots, video.thumbnail));
  }

  addHistory({ title: story.title, kind: story.kind, date: new Date().toISOString(), videoId, publishAt, folder: path.basename(workDir) });
  cleanup(workDir);
  return { story, videoId, file: video.file };
}

function plan() {
  if (process.argv.includes('--long')) return ['long'];
  if (arg('--count')) return Array(Math.max(1, Number(arg('--count')))).fill('short');
  const longs = Math.max(0, Number(env('LONGS_PER_RUN', '0')));
  const shorts = Math.max(0, Number(env('SHORTS_PER_RUN', env('VIDEOS_PER_RUN', '1'))));
  // Long video first, so it is ready well before its evening slot.
  return [...Array(longs).fill('long'), ...Array(shorts).fill('short')];
}

(async () => {
  const jobs = plan();
  const topic = arg('--topic');
  const nl = jobs.filter(k => k === 'long').length, ns = jobs.length - nl;
  log(`===== AI Wala pipeline started (${nl} long, ${ns} Shorts) =====`);
  let failed = 0;
  for (const [i, kind] of jobs.entries()) {
    try {
      const r = await makeOne(i === 0 ? topic : null, kind);
      log(`Done ${i + 1}/${jobs.length}: ${r.story.title}`);
    } catch (err) {
      failed++;
      log(`✗ Video ${i + 1} (${kind}) failed: ${err.message}`);
      if (/FREE limit is used up/.test(err.message) && /voice/i.test(err.message)) {
        log('Voice limit reached for today, stopping this run.');
        failed += jobs.length - i - 1;
        break;
      }
    }
  }
  log(`===== Finished: ${jobs.length - failed} ok, ${failed} failed =====`);
  process.exit(failed ? 1 : 0);
})();
