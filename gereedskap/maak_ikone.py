"""Maak die ikone vir die tuisskerm: 'n gloeiende hart in die nag."""
import math, os
from PIL import Image, ImageDraw, ImageFilter

UIT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

NAG      = (5, 8, 15)
SKEMER   = (42, 27, 46)
LANTERN  = (255, 196, 107)
KERN     = (255, 238, 205)
ROOS     = (232, 132, 155)


def hart_punte(cx, cy, skaal, n=720):
    pts = []
    for i in range(n):
        t = (i / n) * 2 * math.pi
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((cx + x * skaal, cy - y * skaal))
    return pts


def radiaal(size, binne, buite, r_fraksie=0.78, middel=(0.5, 0.42)):
    """Sagte radiale wasing, met die hand geteken."""
    img = Image.new("RGB", (size, size), buite)
    px = img.load()
    mx, my = middel[0] * size, middel[1] * size
    rmax = size * r_fraksie
    for y in range(size):
        for x in range(size):
            d = math.hypot(x - mx, y - my) / rmax
            d = min(1.0, d)
            e = d * d * (3 - 2 * d)          # smoothstep
            px[x, y] = tuple(int(binne[k] + (buite[k] - binne[k]) * e) for k in range(3))
    return img


def maak(size):
    ss = 4                                   # supersample vir skoon rande
    S = size * ss

    agter = radiaal(S, (26, 17, 32), NAG, 0.80, (0.5, 0.34))

    # die gloed agter die hart
    gloed = Image.new("RGB", (S, S), (0, 0, 0))
    g = ImageDraw.Draw(gloed)
    g.polygon(hart_punte(S * 0.5, S * 0.515, S * 0.0205), fill=LANTERN)
    gloed = gloed.filter(ImageFilter.GaussianBlur(S * 0.055))

    wyer = Image.new("RGB", (S, S), (0, 0, 0))
    g2 = ImageDraw.Draw(wyer)
    g2.polygon(hart_punte(S * 0.5, S * 0.515, S * 0.0205), fill=ROOS)
    wyer = wyer.filter(ImageFilter.GaussianBlur(S * 0.135))

    saam = Image.blend(agter, Image.new("RGB", (S, S), NAG), 0.0)
    saam = Image.eval(saam, lambda v: v)
    # gloede bo-op optel
    import PIL.ImageChops as C
    saam = C.add(saam, Image.eval(wyer, lambda v: int(v * 0.42)))
    saam = C.add(saam, Image.eval(gloed, lambda v: int(v * 0.48)))

    # die hart self, met 'n warm kern
    d = ImageDraw.Draw(saam)
    d.polygon(hart_punte(S * 0.5, S * 0.515, S * 0.0205), fill=LANTERN)
    kern = Image.new("RGB", (S, S), (0, 0, 0))
    dk = ImageDraw.Draw(kern)
    dk.polygon(hart_punte(S * 0.5, S * 0.505, S * 0.0120), fill=KERN)
    kern = kern.filter(ImageFilter.GaussianBlur(S * 0.022))
    saam = C.add(saam, Image.eval(kern, lambda v: int(v * 0.30)))

    return saam.resize((size, size), Image.LANCZOS)


for s in (180, 192, 512):
    pad = os.path.join(UIT, "ikoon-%d.png" % s)
    maak(s).save(pad, "PNG", optimize=True)
    print("geskryf:", pad)
