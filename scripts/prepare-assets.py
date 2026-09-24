"""Convert the designer's raw assets in docs/ into web-ready files under src/assets/.

Sources:
  docs/FICCI Mascarade_ Interactive Display_Folder_3.zip  master .ai (17 artboards), Chhavi PNGs, fonts
  docs/Animations.rar                                     icon sprite sheets
  docs/*.mp3.mpeg                                         music + sound effects
  docs/burst-bubble.json                                  tap burst (Lottie)

Re-run whenever any of them change:
    python scripts/prepare-assets.py
Needs Pillow, NumPy, PyMuPDF and the Windows/bsdtar `tar` (reads .rar).
"""
import json
import re
import shutil
import statistics
import subprocess
import tempfile
import zipfile
from pathlib import Path

import numpy as np
import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / 'docs'
ASSETS = ROOT / 'src' / 'assets'
SCENARIOS = ROOT / 'src' / 'features' / 'game' / 'data' / 'scenarios.js'
MASTER_ZIP = DOCS / 'FICCI Mascarade_ Interactive Display_Folder_3.zip'

CELL = 128  # sprite output frame size (px)
COLS = 10  # sprite output grid columns

# Linked Chhavi PNG -> pose name used by <Chhavi pose="...">
MASCOT = {
    'chhavi new copy.png': 'trophy',
    'Chhavi-9.png': 'cheer',
    'Chhavi-6.png': 'clap',
    'Chhavi-4.png': 'think',
    'Chhavi-13.png': 'sad',
    'Chhavi-12.png': 'facepalm',
    'Chhavi-3.png': 'win',
    'One.png': 'one',
    'two.png': 'two',
    'three.png': 'three',
}

COUNTDOWN_POSES = ('One.png', 'two.png', 'three.png')

FONTS = {
    'EmberModernDisplayStd-Regular.ttf': 'ember-regular.ttf',
    'EmberModernDisplayStd-Bold.ttf': 'ember-bold.ttf',
    'Vaseline Extra.ttf': 'vaseline-extra.ttf',
    'PressStart2P-Regular.ttf': 'press-start-2p.ttf',
}

AUDIO = {
    'freesound_community-pixel-song-19-31953.mp3.mpeg': 'music.mp3',
    'correct-6033.mp3.mpeg': 'correct.mp3',
    'negative_beeps-6008.mp3.mpeg': 'wrong.mp3',
}

# UI art cut from the artboards (0-based artboard index, crop box in 1080×1920 px), trimmed to content.
UI_CROPS = {
    'logo': (9, (250, 30, 830, 300)),
    'tap-to-play': (0, (270, 820, 810, 1130)),
    'lets-go': (1, (150, 860, 930, 1110)),
    'stars': (1, (440, 650, 640, 730)),
    'starts-in': (6, (100, 530, 980, 710)),
    'digit-1': (6, (380, 720, 700, 1060)),
    'digit-2': (7, (380, 720, 700, 1060)),
    'digit-3': (8, (380, 720, 700, 1060)),
    'great-job': (4, (340, 90, 730, 300)),
    'nice-try': (5, (340, 90, 730, 300)),
    'pass-headline': (4, (100, 300, 980, 545)),
    'fail-headline': (5, (60, 300, 1020, 560)),
    'your-score': (4, (220, 598, 860, 692)),
    'qr': (4, (300, 952, 780, 1350)),
}
# Chhavi's speech bubbles, copy and all, as the designer set them (Chhavi's raster left out).
BUBBLES = {
    'bubble-ready': (0, (140, 1360, 680, 1610)),
    'bubble-nice-catch': (2, (270, 120, 790, 450)),
    'bubble-watch-out': (2, (140, 900, 600, 1170)),
    'bubble-too-slow': (2, (620, 1380, 1050, 1730)),
    'bubble-decoy': (3, (270, 90, 790, 450)),
    'bubble-keep-going': (3, (140, 900, 600, 1170)),
    'bubble-pass': (4, (60, 1470, 680, 1760)),
    'bubble-fail': (5, (90, 1470, 700, 1830)),
}
# Pixel-art drawn on top of a card: rebuilt from its vector paths alone.
UI_VECTORS = {
    'shield-ok': (9, (120, 1115, 235, 1245)),
    'shield-bad': (14, (120, 1095, 240, 1215)),
    'coin': (9, (235, 1065, 315, 1145)),
    # empty bubble shapes for reaction lines the artboards don't letter
    'bubble-blank-1': (2, (270, 120, 790, 450)),
    'bubble-blank-2': (3, (270, 90, 790, 450)),
}

# Card icons as assigned in the artboards (matched on normalised card text, first match wins).
CARD_ICONS = [
    ('accountlocked', 'lock'), ('deliverydelayed', 'box'), ('refundpending', 'card'), ('paymentfailed', 'link'),
    ('amazzon', 'globe'), ('urgentaccount', 'lock'), ('refundready', 'receipt'), ('confirmidentity', 'box'),
    ('payviaqr', 'card'), ('payoutside', 'PriceTag'), ('usethislinktocomplete', 'link'), ('scanqr', 'receipt'),
    ('paymentsystemdown', 'card'), ('verifybank', 'bank'), ('shareotp', 'moblie'), ('sendcvv', 'card'),
    ('personalupi', 'moblie'), ('unlockoffer', 'box'), ('10minutes', 'clock'), ('clicknow', 'siren'),
    ('refundexpires', 'coin'), ('5minutes', 'clock'), ('confirmdetails', 'lock'), ('completepaymentnow', 'siren'),
    ('megaoffer', 'PriceTag'), ('parcelwillbereturned', 'box'), ('codparcel', 'box'), ('familymember', 'coin'),
    ('unpaidfee', 'truck'), ('deliveryfailed', 'truck'), ('parcelwaiting', 'box'), ('beforeopening', 'box'),
    ('10000', 'PriceTag'), ('90off', 'present'), ('luxurywatch', 'watch'), ('smartphone', 'moblie'),
    ('exclusivedeal', 'link'), ('freeproduct', 'present'), ('50extra', 'coin'), ('bigbrands', 'PriceTag'),
    ('officialaccount', 'star'), ('sellerprofile', 'badge'), ('ordershipped', 'box'), ('arrivingtomorrow', 'truck'),
    ('deliverycompleted', 'box'), ('orderstatus', 'moblie'), ('viewdeliverydetails', 'truck'),
    ('productspecifications', 'receipt'), ('productreviews', 'star'), ('returnexchange', 'recycle'),
    ('sellerinformation', 'badge'), ('paymentsuccessful', 'card'), ('refundinitiated', 'receipt'),
    ('viewpaymentdetails', 'moblie'), ('needhelp', 'moblie'), ('supportticket', 'chat'),
    ('returnrefundpolicy', 'recycle'), ('orderready', 'box'), ('productsellerreturn', 'receipt'),
    ('paymentcompletedsecurely', 'card'), ('deliverydetailsavailable', 'truck'),
]
RED_FLAG_ARTBOARDS = range(9, 14)
DECOY_ARTBOARDS = range(14, 17)


# ---------- sprites ----------

def grid_offset(alpha, cell):
    """Where the rows really start. Some sheets centre their grid with a margin, so slicing from
    y=0 cuts every frame in two (the truck's top in one frame, its wheels in the next). Pick the
    middle of the widest run of offsets where no drawn pixel sits on a row edge; if every offset
    crosses art (coin, watch draw past their edges on purpose), keep 0."""
    rows = alpha.any(axis=1)
    lines = lambda o: [round(o + k * cell) for k in range(int(len(rows) / cell) + 1) if round(o + k * cell) < len(rows)]
    clear = [not any(rows[y] for y in lines(o)) for o in range(int(cell))]
    if not any(clear):
        return 0.0
    # widest circular run of clear offsets, and its middle
    best, start = (0, 0), None
    for i in range(2 * len(clear)):
        if clear[i % len(clear)]:
            start = i if start is None else start
            best = max(best, (i - start + 1, start))
        else:
            start = None
    length, first = best
    top = (first + (min(length, len(clear)) - 1) / 2) % cell
    return top - cell if top > cell / 2 else top  # a first row starting just above y=0 is empty margin


def repack_sprite(src, out_dir):
    """Source sheets use square cells (15 or 5 columns) with fractional sizes; repack to integer cells."""
    sheet = Image.open(src).convert('RGBA')
    w, h = sheet.size
    cols = 5 if w < 1000 else 15
    cell = w / cols
    alpha = sheet.getchannel('A').point(lambda p: 255 if p > 20 else 0)
    top = grid_offset(np.asarray(alpha) > 0, cell)
    rows = int((h - top) / cell + 0.01)
    boxes = [(int(c * cell), int(top + r * cell), int((c + 1) * cell), int(top + (r + 1) * cell)) for r in range(rows) for c in range(cols)]
    drawn = [i for i, b in enumerate(boxes) if alpha.crop(b).getbbox()]
    # the icon plays once as its card arrives, so blank lead-in frames would only show an empty slot
    frames = [sheet.crop(b).resize((CELL, CELL), Image.LANCZOS) for b in boxes[drawn[0] : drawn[-1] + 1]]
    # ...and it holds its last frame, so end on the last full-size one: chat shrinks to a dot
    # and star fades out at the tail of their loops, which would leave an empty slot.
    area = [np.count_nonzero(np.asarray(f.getchannel('A')) > 40) for f in frames]
    frames = frames[: max(i for i, a in enumerate(area) if a >= 0.8 * max(area)) + 1]
    out = Image.new('RGBA', (COLS * CELL, -(-len(frames) // COLS) * CELL))
    for i, f in enumerate(frames):
        out.paste(f, ((i % COLS) * CELL, (i // COLS) * CELL))
    name = src.stem.split(' (')[0]  # "link (1).png" -> "link"
    out.save(out_dir / f'{name}.webp', quality=85, method=6)
    print(f'sprite {name}: {len(frames)} frames, rows from y={top:.0f}')
    return name, len(frames)


# ---------- .ai artboards ----------

def top_level_groups(stream):
    """Byte ranges of the balanced top-level q…Q blocks in a content stream."""
    depth, start, out = 0, None, []
    for m in re.finditer(rb'(?<![A-Za-z])(q|Q)(?![A-Za-z])', stream):
        if m.group(1) == b'q':
            if depth == 0:
                start = m.start()
            depth += 1
        else:
            depth -= 1
            if depth == 0:
                out.append((start, m.end()))
    return out


def to_image(pix):
    return Image.frombytes('RGBA' if pix.alpha else 'RGB', (pix.width, pix.height), pix.samples)


def render_stream(ai, pno, stream, alpha):
    doc = pymupdf.open(ai)
    page = doc[pno]
    doc.update_stream(page.get_contents()[0], stream)
    return to_image(page.get_pixmap(alpha=alpha))


def background_groups(ai, pno):
    """The artboard background is the leading run of full-width groups."""
    stream = pymupdf.open(ai)[pno].read_contents()
    groups = top_level_groups(stream)
    head = stream[: groups[0][0]]
    bg = []
    for a, b in groups:
        box = render_stream(ai, pno, head + stream[a:b], True).getchannel('A').getbbox()
        if box and box[2] - box[0] < 1070:
            break
        bg.append((a, b))
    return stream, bg


def render_without_background(ai, pno, images=True):
    stream, bg = background_groups(ai, pno)
    kept, pos = [], 0
    for a, b in bg:
        kept.append(stream[pos:a])
        pos = b
    kept.append(stream[pos:])
    stream = b''.join(kept)
    if not images:
        stream = re.sub(rb'/Im\d+ Do', b'', stream)
    return render_stream(ai, pno, stream, True)


def render_vectors(ai, pno, box):
    """Redraw only the vector paths fully inside `box` (skips the card underneath and round star particles)."""
    src = pymupdf.open(ai)[pno]
    area = pymupdf.Rect(box)
    out = pymupdf.open()
    page = out.new_page(width=src.rect.width, height=src.rect.height)
    for d in src.get_drawings():
        if not area.contains(d['rect']) or all(it[0] == 'c' for it in d['items']):
            continue
        shape = page.new_shape()
        for it in d['items']:
            if it[0] == 'l':
                shape.draw_line(it[1], it[2])
            elif it[0] == 're':
                shape.draw_rect(it[1])
            elif it[0] == 'qu':
                shape.draw_quad(it[1])
            elif it[0] == 'c':
                shape.draw_bezier(it[1], it[2], it[3], it[4])
        shape.finish(fill=d.get('fill'), color=d.get('color'), width=d.get('width') or 0,
                     closePath=d.get('closePath', False), even_odd=d.get('even_odd', False),
                     fill_opacity=d.get('fill_opacity') or 1, stroke_opacity=d.get('stroke_opacity') or 1)
        shape.commit()
    return to_image(page.get_pixmap(alpha=True, clip=area))


def trim(im):
    return im.crop(im.getchannel('A').getbbox())


def scrub_strays(im):
    """The artboard background carries a stray dark panel. The scene is banded
    horizontally, so each affected row is repaired from clean pixels of that same row."""
    px = im.load()
    width, height = im.size
    patched = 0
    for y in range(height):
        row = [px[x, y] for x in range(width)]
        median = tuple(statistics.median(c[i] for c in row) for i in range(3))
        dark = [x for x, c in enumerate(row) if sum(median) - sum(c) > 40]
        if not dark:
            continue
        lo, hi = max(0, min(dark) - 6), min(width - 1, max(dark) + 6)
        span = hi - lo + 1
        if span > width * 0.4:  # a genuinely dark band, not a stray shape
            continue
        src = hi + 20 if hi + 20 + span < width else lo - 20 - span
        for i in range(span):
            px[lo + i, y] = row[src + i]
        patched += 1
    print(f'background: scrubbed {patched} rows')
    return im


def export_ui(ai, out_dir):
    stream, bg = background_groups(ai, 9)
    background = render_stream(ai, 9, stream[: bg[-1][1]], False)
    scrub_strays(background).save(out_dir / 'background.webp', quality=90, method=6)
    rendered = {}
    for name, (pno, box) in UI_CROPS.items():
        if pno not in rendered:
            rendered[pno] = render_without_background(ai, pno)
        im = trim(rendered[pno].crop(box))
        im.save(out_dir / f'{name}.webp', quality=92, method=6)
        print(f'ui {name}: {im.size}')
    for name, (pno, box) in BUBBLES.items():
        im = render_without_background(ai, pno, images=False).crop(box)
        x, y = im.getchannel('A').getbbox()[:2]
        im = trim(im)
        im.save(out_dir / f'{name}.webp', lossless=True)
        print(f'ui {name}: {im.size} at {(box[0] + x, box[1] + y)}')
    for name, (pno, box) in UI_VECTORS.items():
        im = trim(render_vectors(ai, pno, box))
        im.save(out_dir / f'{name}.webp', lossless=True)
        print(f'ui {name}: {im.size}')


def export_chhavi(links, out_dir):
    """Each pose trimmed to itself, except the countdown poses: those share one 2400×3967
    frame in the artboards and cross-fade in place, so they get one shared crop to stay aligned."""
    shutil.rmtree(out_dir, ignore_errors=True)
    out_dir.mkdir(parents=True)
    raw = {name: Image.open(links / name).convert('RGBA') for name in MASCOT}
    boxes = [raw[name].getchannel('A').getbbox() for name in COUNTDOWN_POSES]
    shared = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))
    print(f'chhavi: countdown crop {shared} of {raw[COUNTDOWN_POSES[0]].size}')
    for name, pose in MASCOT.items():
        im = raw[name].crop(shared) if name in COUNTDOWN_POSES else trim(raw[name])
        im.thumbnail((900, 900), Image.LANCZOS)
        im.save(out_dir / f'{pose}.webp', quality=88, method=6)


def outline_lottie(src, dst, width=10, color=(0.227, 0.027, 0.086, 1), fill=(1, 0.949, 0.749, 1)):
    """The burst's orange is the same as TAP TO PLAY and the horizon band behind both buttons,
    so recolour every stroke to `fill` (a gold-tinted white) and give each a dark maroon
    twin, `width` comp px wider, drawn behind it (in a Lottie
    group later items render underneath). A CSS drop-shadow did the same but stalled the page:
    the filter is re-rasterised every frame. A twin whose width animates with the original
    (and reaches 0 when it does) costs nothing extra."""
    data = json.loads(src.read_text(encoding='utf8'))

    def widen(prop):
        prop = json.loads(json.dumps(prop))
        if prop['a']:
            for key in prop['k']:
                if 's' in key:
                    key['s'] = [v + width if v > 0 else 0 for v in key['s']]
        else:
            prop['k'] = prop['k'] + width if prop['k'] > 0 else 0
        return prop

    def walk(items):
        out = []
        for it in items:
            out.append(it)
            if it.get('ty') == 'gr':
                it['it'] = walk(it['it'])
            elif it.get('ty') == 'st':
                it['c'] = {'a': 0, 'k': list(fill), 'ix': 3}
                twin = json.loads(json.dumps(it))
                twin['nm'] = 'Outline'
                twin['c'] = {'a': 0, 'k': list(color)}
                twin['w'] = widen(it['w'])
                out.append(twin)
        return out

    for layer in data['layers'] + [l for a in data.get('assets', []) for l in a.get('layers', [])]:
        if 'shapes' in layer:
            layer['shapes'] = walk(layer['shapes'])
    dst.write_text(json.dumps(data, separators=(',', ':')), encoding='utf8')


def normalise(text):
    return re.sub(r'[^a-z0-9]', '', text.lower())


def clean(text):
    text = text.replace('ﬁ', 'fi').replace('ﬂ', 'fl').strip()
    return re.sub(r'\s{3,}', '★ ', text)  # star glyph is drawn as an icon in the artboard


def card_icon(key):
    for fragment, icon in CARD_ICONS:
        if fragment in key:
            return icon
    raise SystemExit(f'No icon mapped for card "{key}", add it to CARD_ICONS')


def extract_cards(ai, artboards):
    """Card copy exactly as set in the artboards: two lines, each regular or bold, unique by text."""
    doc = pymupdf.open(ai)
    cards, seen = [], set()
    for pno in artboards:
        spans = [
            (round(s['bbox'][0]), round(s['bbox'][1]), 'Bold' in s['font'], s['text'])
            for b in doc[pno].get_text('dict')['blocks'] for l in b.get('lines', []) for s in l['spans']
            if s['text'].strip() and s['size'] < 40 and 'CoFo' not in s['font']
        ]
        spans.sort(key=lambda s: (s[0] // 50, s[1]))
        groups = []
        for s in spans:
            last = groups[-1][-1] if groups else None
            if last and abs(last[0] - s[0]) < 30 and 0 <= s[1] - last[1] < 45:
                groups[-1].append(s)
            else:
                groups.append([s])
        for g in sorted(groups, key=lambda g: (g[0][1], g[0][0])):
            lines = [{'text': clean(s[3]), 'bold': s[2]} for s in g]
            key = normalise(''.join(l['text'] for l in lines))
            if key not in seen:
                seen.add(key)
                cards.append({'icon': card_icon(key), 'lines': lines})
    return cards


def write_scenarios(red_flags, decoys):
    def js(cards):
        rows = []
        for c in cards:
            lines = ', '.join(f"[{json.dumps(l['text'], ensure_ascii=False)}, {'true' if l['bold'] else 'false'}]" for l in c['lines'])
            rows.append(f"  {{ icon: '{c['icon']}', lines: [{lines}] }},")
        return '\n'.join(rows)

    SCENARIOS.write_text(
        '// GENERATED by scripts/prepare-assets.py from the master .ai artboards; edit the artboards, not this file.\n'
        '// Each card: sprite icon + two lines of [text, bold] exactly as designed.\n\n'
        f'export const redFlags = [\n{js(red_flags)}\n]\n\nexport const decoys = [\n{js(decoys)}\n]\n',
        encoding='utf8',
    )
    print(f'scenarios: {len(red_flags)} red flags, {len(decoys)} decoys')


def main():
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        subprocess.run(['tar', '-xf', str(DOCS / 'Animations.rar'), '-C', str(tmp)], check=True)
        # Short names: the archive's own paths are too long for Windows temp folders.
        with zipfile.ZipFile(MASTER_ZIP) as z:
            for info in z.infolist():
                if info.filename.startswith('__MACOSX') or info.filename.endswith('/'):
                    continue
                rel = info.filename.split('/', 1)[1]
                target = tmp / ('master.ai' if rel.endswith('.ai') else rel)
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(z.read(info))
        ai = str(tmp / 'master.ai')

        sprites = ASSETS / 'sprites'
        sprites.mkdir(parents=True, exist_ok=True)
        manifest = {}
        for src in sorted((tmp / 'Animations').glob('*.png')):
            name, frames = repack_sprite(src, sprites)
            manifest[name] = frames
        (sprites / 'manifest.json').write_text(json.dumps({'cell': CELL, 'cols': COLS, 'frames': manifest}, indent=2) + '\n')
        print(f'sprites: {len(manifest)}')

        export_chhavi(tmp / 'Links', ASSETS / 'chhavi')

        fonts = ASSETS / 'fonts'
        shutil.rmtree(fonts, ignore_errors=True)
        fonts.mkdir(parents=True)
        for raw, name in FONTS.items():
            shutil.copyfile(tmp / 'Fonts' / raw, fonts / name)

        ui = ASSETS / 'ui'
        shutil.rmtree(ui, ignore_errors=True)
        ui.mkdir(parents=True)
        export_ui(ai, ui)

        write_scenarios(extract_cards(ai, RED_FLAG_ARTBOARDS), extract_cards(ai, DECOY_ARTBOARDS))

    audio = ASSETS / 'audio'
    audio.mkdir(parents=True, exist_ok=True)
    for raw, name in AUDIO.items():
        shutil.copyfile(DOCS / raw, audio / name)

    # tap burst on TAP TO PLAY / LET'S GO, a Lottie played by lottie-web
    outline_lottie(DOCS / 'burst-bubble.json', ASSETS / 'burst-bubble.json')


if __name__ == '__main__':
    main()
