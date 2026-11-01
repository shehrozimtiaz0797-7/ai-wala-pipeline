'use strict';
// Builds the video: blurred background, picture with slow zoom/pan, burned-in Roman Urdu
// subtitles, one continuous voice track, optional background music.
// Shorts are vertical 1080x1920; long videos are horizontal 1920x1080 (plus a thumbnail).
const fs = require('fs');
const path = require('path');
const { ROOT, env, runFFmpeg, log } = require('./lib');
const { format } = require('./formats');

const FPS = 30;

function assTime(t) {
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  return `${h}:${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
}
function assText(s) {
  return String(s).replace(/\\/g, '/').replace(/[{}]/g, '').replace(/\r?\n/g, ' ');
}

// Split a line into short chunks timed by length, the way Shorts captions look.
function chunks(text, start, end, maxWords, maxChars) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const groups = [];
  let cur = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= maxWords || cur.join(' ').length >= maxChars) { groups.push(cur.join(' ')); cur = []; }
  }
  if (cur.length) groups.push(cur.join(' '));
  const total = groups.reduce((n, g) => n + g.length, 0) || 1;
  let t = start;
  return groups.map(g => {
    const d = (end - start) * (g.length / total);
    const item = { text: g, start: t, end: t + d };
    t += d;
    return item;
  });
}

function assHeader(f) {
  return [
    '[Script Info]', 'ScriptType: v4.00+', `PlayResX: ${f.width}`, `PlayResY: ${f.height}`, 'WrapStyle: 0', 'ScaledBorderAndShadow: yes', '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    `Style: Sub,Arial,${f.subSize},&H00FFFFFF,&H000000FF,&H00000000,&H78000000,-1,0,0,0,100,100,0,0,1,7,3,2,60,60,${f.subMarginV},1`,
    `Style: Brand,Arial,${f.brandSize},&H0000D7FF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,6,0,1,3,0,${f.brandAlign || 8},40,40,${f.brandMarginV},1`,
    `Style: Hook,Arial,${f.hookSize},&H0000FFFF,&H000000FF,&H00000000,&H78000000,-1,0,0,0,100,100,0,0,1,6,2,8,50,50,${f.hookMarginV},1`,
    `Style: Thumb,Arial,${Math.round(f.height * 0.085)},&H0000FFFF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,9,4,2,50,50,${Math.round(f.height * 0.06)},1`,
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text'
  ];
}

function buildAss({ subtitle, voiceDur, duration, hook, f }) {
  const brand = env('BRAND_TEXT', 'AI WALA');
  const lines = assHeader(f);
  lines.push(`Dialogue: 0,${assTime(0)},${assTime(duration)},Brand,,0,0,0,,${assText(brand)}`);
  if (hook) lines.push(`Dialogue: 1,${assTime(0.2)},${assTime(Math.min(3.2, duration))},Hook,,0,0,0,,{\\fad(200,300)}${assText(hook)}`);
  const [maxWords, maxChars] = f.kind === 'long' ? [6, 34] : [4, 22];
  for (const c of chunks(subtitle, 0.15, Math.max(0.6, voiceDur), maxWords, maxChars)) {
    lines.push(`Dialogue: 2,${assTime(c.start)},${assTime(c.end)},Sub,,0,0,0,,${assText(c.text)}`);
  }
  return lines.join('\n') + '\n';
}

const MOTIONS = [
  n => ({ z: `1+0.18*on/${n}`, x: 'iw/2-(iw/zoom/2)', y: 'ih/2-(ih/zoom/2)' }),            // zoom in
  n => ({ z: `1.18-0.18*on/${n}`, x: 'iw/2-(iw/zoom/2)', y: 'ih/2-(ih/zoom/2)' }),         // zoom out
  n => ({ z: '1.15', x: `(iw-iw/zoom)*on/${n}`, y: 'ih/2-(ih/zoom/2)' }),                   // pan left to right
  n => ({ z: '1.15', x: `(iw-iw/zoom)*(1-on/${n})`, y: 'ih/2-(ih/zoom/2)' }),               // pan right to left
  n => ({ z: '1.15', x: 'iw/2-(iw/zoom/2)', y: `(ih-ih/zoom)*(1-on/${n})` })                // pan up
];

function prepareFonts(workDir) {
  const dir = path.join(workDir, 'fonts');
  fs.mkdirSync(dir, { recursive: true });
  const winFonts = path.join(process.env.WINDIR || 'C:\\Windows', 'Fonts');
  for (const name of ['arial.ttf', 'arialbd.ttf']) {
    const src = path.join(winFonts, name);
    if (fs.existsSync(src)) { try { fs.copyFileSync(src, path.join(dir, name)); } catch (_) { /* ignore */ } }
  }
}

function backgroundFilter(f) {
  return `scale=${f.width}:${f.height}:force_original_aspect_ratio=increase,crop=${f.width}:${f.height},boxblur=30:3,eq=brightness=-0.12:saturation=1.15`;
}

async function renderScene(i, { image, voice, voiceDur, subtitle, hook, isLast, workDir, f }) {
  const frames = Math.round((voiceDur + (isLast ? 1.2 : f.gap)) * FPS);
  const duration = frames / FPS; // exact, so video and audio never drift
  const m = MOTIONS[i % MOTIONS.length](frames);
  const assName = `subs${i + 1}.ass`;
  fs.writeFileSync(path.join(workDir, assName), buildAss({ subtitle, voiceDur, duration, hook, f }));
  const img = path.basename(image), out = `seg${i + 1}.mp4`;
  const fadeOut = Math.max(0, duration - 0.3).toFixed(2);
  const filter = [
    `[0:v]${backgroundFilter(f)},fps=${FPS}[bg]`,
    `[1:v]scale=${f.pic * 2}:${f.pic * 2}:force_original_aspect_ratio=increase,crop=${f.pic * 2}:${f.pic * 2},zoompan=z='${m.z}':x='${m.x}':y='${m.y}':d=${frames}:s=${f.pic}x${f.pic}:fps=${FPS}[fg]`,
    `[bg][fg]overlay=${f.picX}:${f.picY}:shortest=1,fade=t=in:st=0:d=0.3,fade=t=out:st=${fadeOut}:d=0.3,subtitles=${assName}:fontsdir=fonts,format=yuv420p[v]`
  ].join(';');
  await runFFmpeg([
    '-y', '-loop', '1', '-t', String(duration), '-i', img, '-i', img,
    '-filter_complex', filter, '-map', '[v]', '-an',
    '-c:v', 'libx264', '-preset', env('X264_PRESET', 'veryfast'), '-crf', '21', '-r', String(FPS),
    '-frames:v', String(frames), out
  ], workDir);
  return { file: path.join(workDir, out), duration, voice: path.basename(voice), voiceDur };
}

function pickMusic() {
  const dir = path.join(ROOT, 'music');
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter(name => /\.(mp3|m4a|wav|aac|ogg)$/i.test(name));
  return files.length ? path.join(dir, files[Math.floor(Math.random() * files.length)]) : null;
}

// Thumbnail for long videos: first scene picture + big yellow title.
async function makeThumbnail(story, images, workDir) {
  const f = { ...format('long'), width: 1280, height: 720 };
  const pic = 720, picX = Math.round((1280 - 720) / 2);
  const title = story.title.length > 48 ? story.title.slice(0, 46).replace(/\s+\S*$/, '') + '…' : story.title;
  const lines = assHeader(f);
  lines.push(`Dialogue: 0,0:00:00.00,0:00:05.00,Thumb,,0,0,0,,${assText(title)}`);
  fs.writeFileSync(path.join(workDir, 'thumb.ass'), lines.join('\n') + '\n');
  const img = path.basename(images[0]);
  await runFFmpeg([
    '-y', '-i', img, '-i', img, '-filter_complex',
    `[0:v]${backgroundFilter(f)}[bg];[1:v]scale=${pic}:${pic}:force_original_aspect_ratio=increase,crop=${pic}:${pic}[fg];` +
    `[bg][fg]overlay=${picX}:0,subtitles=thumb.ass:fontsdir=fonts[v]`,
    '-map', '[v]', '-frames:v', '1', '-q:v', '3', 'thumbnail.jpg'
  ], workDir);
  return path.join(workDir, 'thumbnail.jpg');
}

async function buildVideo(story, images, voices, workDir) {
  const f = format(story.kind);
  prepareFonts(workDir);
  const segs = [];
  for (const [i, scene] of story.scenes.entries()) {
    log(`Rendering scene ${i + 1}/${story.scenes.length}...`);
    segs.push(await renderScene(i, {
      image: images[i], voice: voices[i].file, voiceDur: voices[i].duration,
      subtitle: scene.subtitle, hook: i === 0 ? story.title : null,
      isLast: i === story.scenes.length - 1, workDir, f
    }));
  }

  // Picture track: join the silent scene clips.
  fs.writeFileSync(path.join(workDir, 'list.txt'), segs.map(s => `file '${path.basename(s.file)}'`).join('\n') + '\n');
  await runFFmpeg(['-y', '-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'joined.mp4'], workDir);

  // Sound track: ONE continuous voice track (no joins between separately encoded pieces = no clicks/beeps).
  const voiceInputs = segs.flatMap(s => ['-i', s.voice]);
  const voiceFilter = segs.map((s, i) => {
    const fadeOutAt = Math.max(0, s.voiceDur - 0.04).toFixed(3);
    return `[${i}:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo,` +
      `afade=t=in:st=0:d=0.02,afade=t=out:st=${fadeOutAt}:d=0.04,apad=whole_dur=${s.duration.toFixed(4)},atrim=0:${s.duration.toFixed(4)}[a${i}]`;
  }).join(';') + ';' + segs.map((_, i) => `[a${i}]`).join('') + `concat=n=${segs.length}:v=0:a=1[voice]`;
  await runFFmpeg(['-y', ...voiceInputs, '-filter_complex', voiceFilter, '-map', '[voice]', '-c:a', 'pcm_s16le', 'voice_all.wav'], workDir);

  const total = segs.reduce((n, s) => n + s.duration, 0);
  const music = pickMusic();
  const final = path.join(workDir, 'final.mp4');
  const audioArgs = ['-c:a', 'aac', '-b:a', '160k', '-ar', '44100', '-ac', '2'];
  if (music) {
    log(`Adding music: ${path.basename(music)}`);
    const vol = env('MUSIC_VOLUME', '0.10');
    await runFFmpeg([
      '-y', '-i', 'joined.mp4', '-i', 'voice_all.wav', '-stream_loop', '-1', '-i', music,
      '-filter_complex', `[2:a]aresample=44100,aformat=channel_layouts=stereo,volume=${vol},afade=t=out:st=${Math.max(0, total - 1.5).toFixed(2)}:d=1.5[m];[1:a][m]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[a]`,
      '-map', '0:v', '-map', '[a]', '-c:v', 'copy', ...audioArgs, '-t', total.toFixed(3), 'final.mp4'
    ], workDir);
  } else {
    await runFFmpeg([
      '-y', '-i', 'joined.mp4', '-i', 'voice_all.wav', '-map', '0:v', '-map', '1:a',
      '-c:v', 'copy', ...audioArgs, '-t', total.toFixed(3), 'final.mp4'
    ], workDir);
  }

  let thumbnail = null;
  if (f.kind === 'long') {
    try { thumbnail = await makeThumbnail(story, images, workDir); }
    catch (err) { log(`Thumbnail could not be made (${err.message}); YouTube will pick one.`); }
  }
  log(`Video ready: ${final} (${f.label}, ${total.toFixed(1)}s)`);
  return { file: final, duration: total, thumbnail };
}

module.exports = { buildVideo, buildAss };
