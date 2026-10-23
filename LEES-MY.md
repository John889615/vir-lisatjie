# Vir Lisatjie

A private slideshow that opens on her phone from a printed QR code. It runs off
your own PC over your WiFi — nothing is published to the internet, and nobody
outside your network can reach it.

---

## Running it

Double-click **Begin.cmd**.

It will:

1. Find your WiFi address and start serving the app.
2. Open a print page with the QR code — print that and cut out the card.
3. Keep running. Leave the window open while she's reading.

Press `Ctrl+C` in the window (or just close it) when you're done.

**The first time**, Windows Firewall will ask whether to allow Python. Tick
**Private networks** and allow it, otherwise her phone can't connect.

### On her phone

She just opens her camera and points it at the code. It opens in her browser,
full screen.

Her phone must be on **the same WiFi** as this PC.

She can also tap her browser menu → *Add to Home screen*, and it gets the
glowing heart icon and opens without any browser chrome, like a real app.

---

## The music

Currently playing: *Robert Grace — Home*.

You don't have to name the song anything in particular. Drop any `.mp3` (or
`.m4a`, `.ogg`, `.wav`) into the **musiek** folder and the app picks it up by
itself. To swap songs, delete the old one and drop in the new one.

If you keep more than one file in there, put the one you want in `inhoud.js`:

```js
const LIEDJIE = "musiek/Home.mp3";
```

The music can't start on its own — phone browsers block that — so it begins the
moment she taps **Kom in** on the first screen, and fades up over about four
seconds rather than starting with a jolt. It loops for as long as she's
reading. There's a small speaker button in the top corner if she wants it off,
and if there's no song file at all that button simply doesn't appear.

---

## The ending

After the letter she gets **Ja** and **Nee**.

**Ja** sets off fireworks over the photo of the two of you, the letter clears,
and *Kom Soen jou MAN!* glows up in its place. The veil over the photo lifts at
the same time so you can both be seen properly. Only then does *Lees dit weer*
appear, so the two answers are the only thing in front of her while she decides.

**Nee** brings up a glowing arrow pointing at **Ja** with *Enigste antwoord*.
The Ja button starts pulsing and Nee shrinks away and dims. She can press Nee
as often as she likes — the arrow bounces again each time. Nothing is ever
locked; **Ja** stays there waiting.

---

## Changing the words

Everything you'll want to edit lives in one file: **inhoud.js**.

Open it in Notepad, change the wording, save, and reload the page on her phone.
Nothing else needs touching.

- `WELKOM` — the opening line and the button on it
- `SLAAIE` — the nine slides, each with `opskrif` (the glowing heading),
  `teks` (the paragraph) and `foto` (the picture's filename, no extension)
- `VRAAG` — the two answers, the celebration line and the Nee hint
- `WOORDE` — the wording on the Volgende / Terug buttons

Keep the backticks `` ` `` around the paragraphs — they're what lets you use
apostrophes like `'n` without breaking anything.

---

## The photos

They live in the **fotos** folder and are matched by the `foto:` name in
`inhoud.js`. The extension doesn't matter — `.jpg`, `.jpeg`, `.png` and `.webp`
all work, so you can swap a picture without editing anything as long as the
name stays the same.

Portrait pictures suit the layout best. Every photo is given the same warm
evening grade so they feel like one set rather than nine separate snapshots.
If you want them brighter or darker, change `brightness(.88)` near the top of
**styl.css** — `1` is the original exposure.

---

## Checking a single slide

Add `#` and a number to the address to jump straight there — `#1` is the first
slide, `#9` is the letter, `#0` is the welcome. Useful while you're fiddling
with wording.

---

## Worth knowing

**Reprint the code on the day.** Your router hands out the address, and it can
change when the PC reconnects. If the old printed code stops working, run
`Begin.cmd` again and print the fresh one.

If the code doesn't work at all, the window lists the other addresses on this
PC. Try one of them directly:

```
python bedien.py 192.168.0.5
```

---

## What's in here

| | |
|---|---|
| `Begin.cmd` | double-click this to start |
| `inhoud.js` | **the words and photo names — edit this** |
| `fotos/` | the pictures |
| `musiek/` | the song (any filename) |
| `index.html`, `styl.css`, `app.js` | the app itself |
| `bedien.py` | the little web server, and the QR maker |
| `drukstuk/` | the printable QR card, made fresh on each run |
| `ikoon*.png`, `ikoon.svg` | the home-screen icon |
| `gereedskap/` | the script that drew the icon |
