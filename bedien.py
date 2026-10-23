"""
Bedien die brief oor jou eie WiFi, en maak die QR-kode om uit te druk.

    python bedien.py                 # kies self die regte adres
    python bedien.py 192.168.0.5     # as jy die adres wil vasstel
    python bedien.py 192.168.0.5 8080

Niks gaan internet toe nie. Net toestelle op dieselfde WiFi kan dit sien.
"""

import http.server
import mimetypes
import os
import socket
import socketserver
import sys
import webbrowser

HIER = os.path.dirname(os.path.abspath(__file__))
DRUK = os.path.join(HIER, "drukstuk")

mimetypes.add_type("application/manifest+json", ".webmanifest")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("audio/mpeg", ".mp3")
mimetypes.add_type("audio/mp4", ".m4a")


# ----------------------------------------------------------------- adres

def alle_adresse():
    """Elke IPv4-adres op die masjien, die mees waarskynlike eerste."""
    gevind = []

    # die adres wat Windows sou gebruik om buite te gaan: gewoonlik die regte een
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        gevind.append(s.getsockname()[0])
    except OSError:
        pass
    finally:
        s.close()

    try:
        for inligting in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            adres = inligting[4][0]
            if adres not in gevind:
                gevind.append(adres)
    except OSError:
        pass

    return [a for a in gevind
            if not a.startswith("127.") and not a.startswith("169.254.")]


def vrye_poort(begin=8080):
    for poort in range(begin, begin + 40):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                s.bind(("0.0.0.0", poort))
                return poort
            except OSError:
                continue
    raise SystemExit("Geen vrye poort gevind nie.")


# ----------------------------------------------------------------- drukstuk

DRUK_BLAD = """<!DOCTYPE html>
<html lang="af">
<head>
<meta charset="utf-8">
<title>Skandeer vir Lisatjie</title>
<style>
  @page { margin: 14mm; }
  *{ margin:0; padding:0; box-sizing:border-box; }
  body{
    font-family: "Noto Serif", Georgia, "Times New Roman", serif;
    background:#fff; color:#15110E;
    display:flex; align-items:center; justify-content:center;
    min-height:100vh; padding:10mm;
  }
  .kaart{
    width:104mm; text-align:center;
    border:1px solid #C9A86A;
    outline:1px solid #C9A86A; outline-offset:3mm;
    padding:13mm 10mm 11mm;
  }
  .bo{ font-size:8.4pt; letter-spacing:.26em; color:#8A7A5E; margin-bottom:7mm; }
  h1{ font-size:21pt; font-weight:400; line-height:1.2; margin-bottom:9mm; }
  img{ width:52mm; height:52mm; display:block; margin:0 auto 8mm; }
  .hoe{ font-size:10pt; line-height:1.65; color:#3A332A; }
  .adres{
    margin-top:6mm; font-size:8pt; letter-spacing:.06em; color:#9A8E7A;
  }
  .hart{ color:#C98A3A; font-size:12pt; margin-top:7mm; }
  @media print{ body{ min-height:auto; padding:0; } }
</style>
</head>
<body>
  <div class="kaart">
    <div class="bo">S K A N D E E R &nbsp; M Y</div>
    <h1>Vir Lisatjie</h1>
    <img src="qr.png" alt="QR-kode">
    <div class="hoe">
      Maak jou kamera oop<br>en hou dit oor die kode.
    </div>
    <div class="adres">__ADRES__</div>
    <div class="hart">&#10084;</div>
  </div>
</body>
</html>
"""


def maak_drukstuk(url):
    import qrcode
    from qrcode.image.pil import PilImage

    os.makedirs(DRUK, exist_ok=True)

    kode = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_Q,
        box_size=16,
        border=2,
    )
    kode.add_data(url)
    kode.make(fit=True)
    prent = kode.make_image(image_factory=PilImage, fill_color="#15110E", back_color="white")
    prent.save(os.path.join(DRUK, "qr.png"))

    blad = DRUK_BLAD.replace("__ADRES__", url)
    with open(os.path.join(DRUK, "druk.html"), "w", encoding="utf-8") as f:
        f.write(blad)


# ----------------------------------------------------------------- bediener

class Hanteerder(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=HIER, **kw)

    def end_headers(self):
        # geen kas nie, sodat jou veranderinge dadelik op die foon wys
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Referrer-Policy", "no-referrer")
        super().end_headers()

    def log_message(self, fmt, *args):
        pad = args[0] if args else ""
        if "favicon" not in str(pad):
            sys.stdout.write("   %s\n" % (fmt % args))


class Bediener(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


# ----------------------------------------------------------------- loop

def main():
    adresse = alle_adresse()
    if not adresse:
        raise SystemExit("Geen netwerk-adres gevind nie. Is die WiFi aan?")

    adres = sys.argv[1] if len(sys.argv) > 1 else adresse[0]
    poort = int(sys.argv[2]) if len(sys.argv) > 2 else vrye_poort()
    url = "http://%s:%d/" % (adres, poort)

    maak_drukstuk(url)

    streep = "-" * 58
    print("")
    print(streep)
    print("  Die brief is oop op:   %s" % url)
    print(streep)
    print("")
    print("  1. Druk die bladsy wat nou oopmaak, en knip die kaartjie uit.")
    print("  2. Haar foon moet op dieselfde WiFi wees as hierdie rekenaar.")
    print("  3. Laat hierdie venster oop solank sy lees.")
    print("")
    if len(adresse) > 1:
        print("  Ander adresse op hierdie rekenaar: %s" % ", ".join(adresse[1:]))
        print("  Werk die kode nie, probeer:  python bedien.py <ander adres>")
        print("")
    print("  Let op: kry hierdie rekenaar later 'n nuwe adres van die router,")
    print("  moet die kode weer gedruk word. Druk dit die dag self uit.")
    print("")
    print("  Sluit af met Ctrl+C")
    print(streep)
    print("")

    webbrowser.open("file:///" + os.path.join(DRUK, "druk.html").replace("\\", "/"))

    with Bediener(("0.0.0.0", poort), Hanteerder) as bediener:
        try:
            bediener.serve_forever()
        except KeyboardInterrupt:
            print("\n  Toegemaak.\n")


if __name__ == "__main__":
    main()
