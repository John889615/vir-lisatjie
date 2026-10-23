# Vir Lisatjie

A slideshow that opens on her phone from a printed QR code: nine pages of
photos, music and a question at the end.

It's published on GitHub Pages, so it works from anywhere and the printed code
never goes stale. You can also serve it from your own PC over WiFi while you're
trying out changes.

---

## Live on the internet

The app is published with GitHub Pages, so it works from anywhere — her phone
doesn't need to be on your WiFi, and your PC doesn't need to be on at all.

Its address never changes, which means **you print the QR code once** and it
keeps working forever.

```
python maak_qr.py https://john889615.github.io/vir-lisatjie/
```

Once she's opened it the first time, it keeps working even with no signal at
all — the photos, the music and the words are stored on her phone. That makes
it something she can keep rather than something that only worked that one
evening.

### Changing something after it's live

```
git add -A
git commit -m "nuwe woorde"
git push
```

Give it about a minute and her phone has the new version. The QR code stays
the same, so there's nothing to reprint.

If you change the app itself (not just the wording), bump `KAS = "lisatjie-v1"`
at the top of **sw.js** to `v2`, `v3` and so on. That tells every phone to throw
its stored copy away and fetch the new one.

### A note on what's public

The repository is public, which is what GitHub Pages needs on a free account.
That means the photos and the letter sit in a public repository, and they stay
in its history even if you delete them later. Nobody is likely to guess the
address, and the page asks search engines not to index it — but it isn't
private, and it can't be made private after the fact. If that ever stops
sitting right with you, say so and I'll move it somewhere the repository stays
closed.

---

## Running it on your own WiFi

You don't need this now that it's live, but it's handy for trying out changes
before you push them.

Double-click **Begin.cmd**.

It will:

1. Find your WiFi address and start serving the app.
2. Open a print page with a QR code for that local address.
3. Keep running while you test.

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

To swap songs, put the new file in the **musiek** folder and write its name in
`inhoud.js`:

```js
const LIEDJIE = "musiek/liedjie.mp3";
```

The name has to be written there now that it's live — a website can't look
inside a folder to see what's in it the way the local server could. `.mp3`,
`.m4a`, `.ogg` and `.wav` all work.

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

**Print the live code, not the local one.** `Begin.cmd` makes a QR code for
your PC's address on the WiFi, which is only good while that PC is running.
The one to print and give her is the live one:

```
python maak_qr.py https://john889615.github.io/vir-lisatjie/
```

**Test it yourself first.** Scan the printed card with your own phone, with
WiFi switched off, so you know it works over mobile data the way it will for
her.

---

## What's in here

| | |
|---|---|
| `Begin.cmd` | double-click this to start |
| `inhoud.js` | **the words and photo names — edit this** |
| `fotos/` | the pictures |
| `musiek/` | the song (any filename) |
| `index.html`, `styl.css`, `app.js` | the app itself |
| `maak_qr.py` | **makes the QR card for the live address** |
| `bedien.py` | serves it locally over WiFi, for testing |
| `sw.js` | what makes it work without signal |
| `drukstuk/` | the printable QR card, made fresh each run |
| `ikoon*.png`, `ikoon.svg` | the home-screen icon |
| `gereedskap/` | the script that drew the icon |
