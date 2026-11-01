'use strict';
// The two video formats: vertical Shorts and horizontal long videos.
const { env } = require('./lib');

function hours(name, fallback) {
  return env(name, fallback);
}

const FORMATS = {
  short: {
    kind: 'short',
    label: 'Short',
    scenes: () => Number(env('SHORT_SCENES', '6')),
    wordsPerLine: '10 to 16',
    lengthText: 'a YouTube Short of about 40-50 seconds',
    width: 1080, height: 1920,
    pic: 1080, picX: 0, picY: 330,
    gap: 0.4,
    subSize: 80, subMarginV: 330, hookSize: 66, hookMarginV: 175, brandSize: 42, brandMarginV: 110, brandAlign: 8,
    publishHours: () => hours('SHORT_PUBLISH_HOURS', env('PUBLISH_AT_HOUR', '')),
    footer: () => env('DESCRIPTION_FOOTER', '#Shorts #AIWala #Kahani'),
    extraRules: '- Keep it fast and punchy: one small situation, a twist, and a quick lesson.'
  },
  long: {
    kind: 'long',
    label: 'Long video',
    scenes: () => Number(env('LONG_SCENES', '32')),
    wordsPerLine: '16 to 26',
    lengthText: 'a full YouTube story video of about 4-5 minutes',
    width: 1920, height: 1080,
    pic: 1080, picX: 420, picY: 0,
    gap: 0.3,
    subSize: 58, subMarginV: 55, hookSize: 60, hookMarginV: 45, brandSize: 34, brandMarginV: 30, brandAlign: 9,
    publishHours: () => hours('LONG_PUBLISH_HOURS', '20'),
    footer: () => env('LONG_DESCRIPTION_FOOTER', '#AIWala #Kahani #UrduStory #CartoonStory'),
    extraRules:
      '- Tell a complete story in 3 parts: setup (problem), middle (attempts, comedy, a setback), end (solution and lesson).\n' +
      '- Use dialogue between the characters often, with a narrator line in between to move the story.\n' +
      '- Keep the viewer curious: every 5-6 scenes add a small surprise or question.'
  }
};

function format(kind) {
  return FORMATS[kind] || FORMATS.short;
}

module.exports = { format, FORMATS };
