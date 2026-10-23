"""
Maak die QR-kaartjie om uit te druk, vir enige adres.

    python maak_qr.py https://john889615.github.io/vir-lisatjie/

Dit skryf drukstuk/qr.png en drukstuk/druk.html, en maak die bladsy oop
sodat jy dit kan druk. Hierdie een is vir die lewendige webwerf; die kode
bly altyd dieselfde, so jy hoef dit net een keer te druk.
"""

import os
import sys
import webbrowser

from bedien import DRUK, maak_drukstuk


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        raise SystemExit("Gee die adres saam, bv. python maak_qr.py https://...")

    url = sys.argv[1].strip()
    if not url.startswith("http"):
        raise SystemExit("Die adres moet met http of https begin.")
    if not url.endswith("/"):
        url += "/"

    maak_drukstuk(url)

    blad = os.path.join(DRUK, "druk.html")
    streep = "-" * 58
    print("")
    print(streep)
    print("  QR-kode gemaak vir:  %s" % url)
    print(streep)
    print("")
    print("  Die bladsy maak nou oop. Druk dit en knip die kaartjie uit.")
    print("  Hierdie adres verander nie, so die kode bly vir altyd geldig.")
    print("")
    print("  Toets dit self eers: skandeer dit met jou eie foon.")
    print(streep)
    print("")

    webbrowser.open("file:///" + blad.replace("\\", "/"))


if __name__ == "__main__":
    main()
