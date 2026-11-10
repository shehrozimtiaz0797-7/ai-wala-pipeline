"""Finds when every word of the script is spoken in the voice-over.

Usage:  python align.py voice.wav lines.json out.json
lines.json = ["line one", "line two", ...]   (the exact story lines that were read)
out.json   = {"lines": [[{"w": "It's", "start": 0.42, "end": 0.61}, ...], ...]}

Uses faster-whisper (speech recognition) for word times, then matches the recognised
words to the script, so captions and scene cuts follow the real voice.

AI Wala: the lines are the Urdu-script voice lines, and WHISPER_LANGUAGE=ur tells the
recogniser to listen for Urdu. Spelling differences (ي/ی, ك/ک, ه/ہ, accents) are ignored
when matching.
"""
import difflib
import json
import os
import re
import sys

NUM = {'0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven',
       '8': 'eight', '9': 'nine', '10': 'ten', '11': 'eleven', '12': 'twelve', '13': 'thirteen'}

LANG = (os.environ.get('WHISPER_LANGUAGE') or '').strip().lower()

# Urdu / Arabic script: remove accents, unify letters that are written in several ways
AR_MARKS = re.compile('[\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u200c\u200d\u200e\u200f]')
AR_MAP = str.maketrans({
    '\u064A': '\u06CC', '\u0649': '\u06CC', '\u06D0': '\u06CC', '\u0626': '\u06CC',   # ي ى ې ئ -> ی
    '\u0643': '\u06A9',                                                                  # ك -> ک
    '\u0647': '\u06C1', '\u0629': '\u06C1', '\u06C3': '\u06C1', '\u06BE': '\u06C1',   # ه ة ۃ ھ -> ہ
    '\u06D3': '\u06D2',                                                                  # ۓ -> ے
    '\u0623': '\u0627', '\u0625': '\u0627', '\u0622': '\u0627',                       # أ إ آ -> ا
    '\u0624': '\u0648',                                                                  # ؤ -> و
})
DIGITS = str.maketrans('\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669'
                       '\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9', '0123456789' * 2)


def norm(w):
    w = w.lower().replace('\u2019', "'")
    w = AR_MARKS.sub('', w)
    w = w.translate(AR_MAP).translate(DIGITS)
    w = re.sub(r"[^\w']", '', w)      # keeps letters of any script (Urdu, English) and digits
    w = w.strip("'").replace('_', '')
    return NUM.get(w, w)


def whisper_words(wav, lines):
    from faster_whisper import WhisperModel
    model = WhisperModel(os.environ.get('WHISPER_MODEL', 'base.en'), device='cpu', compute_type='int8')
    kw = {'language': LANG} if LANG else {}
    segments, _ = model.transcribe(wav, word_timestamps=True, initial_prompt=' '.join(lines)[:800], beam_size=5,
                                   vad_filter=False, condition_on_previous_text=False, **kw)
    rec = []
    for seg in segments:
        for w in seg.words or []:
            n = norm(w.word)
            if n:
                rec.append({'n': n, 'start': float(w.start), 'end': float(w.end)})
    return rec


def sphinx_words(wav):
    """Offline English recogniser that ships with its model (pip install pocketsphinx). Needs 16 kHz mono wav."""
    import wave
    from pocketsphinx import Decoder
    w = wave.open(wav, 'rb')
    rate = w.getframerate()
    data = w.readframes(w.getnframes())
    d = Decoder(samprate=rate)
    d.start_utt()
    d.process_raw(data, full_utt=True)
    d.end_utt()
    rec = []
    for seg in d.seg():
        word = re.sub(r'\(\d+\)$', '', seg.word)
        if word.startswith('<') or word.startswith('['):
            continue
        n = norm(word)
        if n:
            rec.append({'n': n, 'start': seg.start_frame / 100.0, 'end': (seg.end_frame + 1) / 100.0})
    return rec


def main():
    wav, lines_file, out_file = sys.argv[1:4]
    lines = json.load(open(lines_file, encoding='utf-8'))
    rec, engine = [], ''
    try:
        rec, engine = whisper_words(wav, lines), 'whisper'
    except Exception as e:  # no whisper (or model download failed)
        if LANG and LANG != 'en':
            # the built-in recogniser only knows English: let the caller use pause detection instead
            print(f'ALIGN_FAIL whisper not available ({str(e)[:120]})', file=sys.stderr)
            sys.exit(2)
        print(f'whisper not available ({str(e)[:120]}), using pocketsphinx', file=sys.stderr)
        rec, engine = sphinx_words(wav), 'pocketsphinx'
    script = []  # (line, word text, normalised)
    for li, line in enumerate(lines):
        for w in line.split():
            script.append([li, w, norm(w) or '_'])

    times = [None] * len(script)
    sm = difflib.SequenceMatcher(None, [s[2] for s in script], [r['n'] for r in rec], autojunk=False)
    for op, a1, a2, b1, b2 in sm.get_opcodes():
        if op == 'equal':
            for k in range(a2 - a1):
                r = rec[b1 + k]
                times[a1 + k] = [r['start'], r['end']]
        elif op == 'replace' and b2 > b1 and (b2 - b1) <= 2 * (a2 - a1) + 1 \
                and rec[b2 - 1]['end'] - rec[b1]['start'] <= 0.9 * (a2 - a1) + 0.5:
            # different spelling of the same words (e.g. "3" vs "three"): spread over the recognised span
            s, e = rec[b1]['start'], rec[b2 - 1]['end']
            n = a2 - a1
            for k in range(n):
                times[a1 + k] = [s + (e - s) * k / n, s + (e - s) * (k + 1) / n]

    # drop lonely matches that are far away in time from the words around them
    # (e.g. a word like "you" that the voice also said in some extra speech before the story)
    for _ in range(2):
        idx = [i for i, t in enumerate(times) if t]
        for n, i in enumerate(idx):
            prev_i = idx[n - 1] if n > 0 else None
            next_i = idx[n + 1] if n + 1 < len(idx) else None
            def far(j):
                if j is None or times[j] is None:
                    return True
                gap = abs(times[j][0] - times[i][0])
                return gap > 3.0 + 0.8 * abs(j - i)
            close_neighbours = (prev_i == i - 1 and not far(prev_i)) or (next_i == i + 1 and not far(next_i))
            if not close_neighbours and far(prev_i) and far(next_i):
                times[i] = None

    matched = sum(1 for t in times if t)
    need = (0.5 if (not LANG or LANG == 'en') else 0.4) if engine == 'whisper' else 0.3
    if matched < max(3, len(script) * need):
        print(f'ALIGN_FAIL only {matched}/{len(script)} words matched', file=sys.stderr)
        sys.exit(2)

    # fill words that were not recognised: interpolate between known neighbours (by letters)
    total_end = rec[-1]['end'] if rec else 0
    k = 0
    while k < len(script):
        if times[k]:
            k += 1
            continue
        j = k
        while j < len(script) and not times[j]:
            j += 1
        left = times[k - 1][1] if k > 0 else (times[j][0] if j < len(script) else 0)
        right = times[j][0] if j < len(script) else total_end
        if right < left:
            right = left
        lens = [max(1, len(script[x][2])) for x in range(k, j)]
        tot = sum(lens)
        t = left
        for x, L in zip(range(k, j), lens):
            d = (right - left) * L / tot
            times[x] = [t, t + d]
            t += d
        k = j

    out = [[] for _ in lines]
    for (li, w, _), (s, e) in zip(script, times):
        out[li].append({'w': w, 'start': round(s, 3), 'end': round(max(e, s + 0.05), 3)})
    json.dump({'lines': out, 'matched': matched, 'total': len(script), 'engine': engine}, open(out_file, 'w', encoding='utf-8'))
    print(f'ALIGN_OK {matched}/{len(script)} words matched ({engine})')


if __name__ == '__main__':
    main()
