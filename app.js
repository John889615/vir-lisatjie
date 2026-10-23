/* ===========================================================
   Vir Lisatjie  —  die enjin
   Die woorde en fotos kom alles uit inhoud.js
   =========================================================== */

(function () {
  "use strict";

  var toneel = document.getElementById("toneel");
  var padBalk = document.getElementById("pad");
  var klankKnop = document.getElementById("klank");
  var orrel = document.getElementById("orrel");

  var stil = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var slaaie = [];        // al die slaai-elemente, welkom ingesluit
  var hier = 0;
  var besig = false;      // keer dubbel-tikke tydens 'n oorgang

  /* ---------- klein helpers ---------- */

  function maak(tag, klas, ouer) {
    var n = document.createElement(tag);
    if (klas) n.className = klas;
    if (ouer) ouer.appendChild(n);
    return n;
  }

  /* Breek teks in woorde op, elkeen met sy eie vertraging,
     sodat die opskrif woord vir woord kan ontvlam. */
  function woordVirWoord(teks, ouer) {
    var woorde = String(teks).split(/\s+/).filter(Boolean);
    woorde.forEach(function (w, i) {
      var s = maak("span", "w", ouer);
      s.textContent = w;
      s.style.setProperty("--i", i);
      if (i < woorde.length - 1) ouer.appendChild(document.createTextNode(" "));
    });
  }

  /* ---------- fotos ---------- */

  var EXTS = [".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG", ".WEBP"];

  /* Hy noem die fotos na die opskrifte, maar ons weet nie watter
     tipe lêer nie. Probeer elkeen tot een laai. */
  function soekFoto(naam, klaar) {
    if (!naam) return klaar(null);
    var i = 0;
    (function probeer() {
      if (i >= EXTS.length) return klaar(null);
      var pad = "fotos/" + encodeURIComponent(naam + EXTS[i]);
      var beeld = new Image();
      beeld.onload = function () { klaar(pad); };
      beeld.onerror = function () { i++; probeer(); };
      beeld.src = pad;
    })();
  }

  /* ---------- die welkom-slaai ---------- */

  function bouWelkom() {
    var s = maak("section", "slaai", toneel);
    s.id = "welkom";

    var doek = maak("canvas", null, s);
    doek.id = "sterre";

    var blok = maak("div", "welkom-woorde", s);
    var teller = 0;
    (WELKOM.lyne || []).forEach(function (lyn) {
      var p = maak("p", null, blok);
      var woorde = String(lyn).split(/\s+/).filter(Boolean);
      woorde.forEach(function (w, i) {
        var sp = maak("span", "w", p);
        sp.textContent = w;
        sp.style.setProperty("--i", teller++);
        if (i < woorde.length - 1) p.appendChild(document.createTextNode(" "));
      });
    });

    var knop = maak("button", "volgende", s);
    knop.id = "begin";
    knop.type = "button";
    knop.textContent = WELKOM.knoppie || "Kom in";
    knop.addEventListener("click", function () {
      wekMusiek();
      verder();
    });

    sterrehemel(doek);
    return s;
  }

  /* ---------- 'n gewone slaai ---------- */

  function bouSlaai(data, nommer, laaste) {
    var isBrief = data.soort === "brief";
    var s = maak("section", "slaai" + (isBrief ? " brief-slaai" : ""), toneel);
    if (data.beweging) s.classList.add("b-" + data.beweging);

    /* Die brief kry ook 'n foto, maar agter 'n digter sluier sodat
       die woorde leesbaar bly. */
    var fotoNaam = data.foto || (isBrief ? null : data.opskrif);
    if (fotoNaam) {
      var raam = maak("div", "raam", s);
      var doek = maak("div", "doek", raam);
      s._doek = doek;
      s._fotoNaam = fotoNaam;
      maak("div", "skerm", s);
    }

    var blok = maak("div", "woord-blok", s);

    var h = maak("h1", "opskrif", blok);
    woordVirWoord(data.opskrif, h);

    if (isBrief) {
      var brief = maak("div", "brief", blok);
      var reels = String(data.teks).split(/\n\s*\n/);
      reels.forEach(function (r, i) {
        var p = maak("p", "reel", brief);
        p.style.setProperty("--i", i);
        var skoon = r.trim();
        if (skoon.indexOf("?") !== -1) p.classList.add("vraag");
        if (i === reels.length - 1) p.classList.add("naam");
        p.textContent = skoon;
      });
      bouAntwoord(s, blok, reels.length);
    } else {
      var para = maak("p", "paragraaf", blok);
      para.textContent = data.teks;
    }

    var stuur = maak("div", "stuur", s);

    var terug = maak("button", "terug", stuur);
    terug.type = "button";
    terug.textContent = WOORDE.terug;
    terug.addEventListener("click", vorige);

    var vort = maak("button", "volgende", stuur);
    vort.type = "button";
    vort.textContent = laaste ? WOORDE.weer : WOORDE.volgende;
    vort.addEventListener("click", function () {
      if (laaste) wys(0); else verder();
    });

    return s;
  }

  /* ---------- die vraag: Ja of Nee ---------- */

  function bouAntwoord(slaai, blok, naReels) {
    var ry = maak("div", "antwoord", blok);
    ry.style.setProperty("--i", naReels);

    var ja = maak("button", "ja", ry);
    ja.type = "button";
    ja.textContent = VRAAG.ja;

    var nee = maak("button", "nee", ry);
    nee.type = "button";
    nee.textContent = VRAAG.nee;

    /* Die wenk wys eers wanneer sy "Nee" waag. */
    var wenk = maak("div", "wenk", blok);
    /* 'n pyl wat boontoe na die Ja wys */
    wenk.innerHTML =
      '<svg class="pyl" viewBox="0 0 58 40" aria-hidden="true">' +
      '<path class="steel" d="M53 34 C38 37, 16 32, 10 16" />' +
      '<path class="punt" d="M9 6 L17 20 L1 18 Z" />' +
      '</svg>';
    var wenkWoorde = maak("span", null, wenk);
    wenkWoorde.textContent = VRAAG.wenk;

    /* Die jubel, vir wanneer sy Ja sê. */
    var jubel = maak("p", "jubel", blok);
    woordVirWoord(VRAAG.jubel, jubel);

    nee.addEventListener("click", function () {
      slaai.classList.remove("gewys");   /* herbegin die wip as sy weer druk */
      void slaai.offsetWidth;
      slaai.classList.add("gewys");
    });

    ja.addEventListener("click", function () {
      if (slaai.classList.contains("gevier")) return;
      slaai.classList.remove("gewys");
      slaai.classList.add("gevier");
      laatDitReent();
      var weer = slaai.querySelector(".volgende");
      if (weer) weer.textContent = WOORDE.weer;
    });
  }

  /* ---------- vuurwerk ---------- */

  /* amber en goud dra die vuurwerk; die roos is net 'n aksent */
  var VONK_KLEURE = [
    "#FFC46B", "#FFC46B", "#FFD9A0", "#FFD9A0",
    "#FFE9C4", "#FFF3DF", "#F2A85A", "#E8849B"
  ];
  var reentAanGang = false;

  function laatDitReent() {
    if (reentAanGang) return;
    reentAanGang = true;

    var doek = maak("canvas", null, document.body);
    doek.id = "vuurwerk";
    var ctx = doek.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;
    var vonke = [], rakette = [];

    function meet() {
      w = window.innerWidth; h = window.innerHeight;
      doek.width = Math.round(w * dpr);
      doek.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    meet();
    window.addEventListener("resize", meet);

    function kleur() {
      return VONK_KLEURE[Math.floor(Math.random() * VONK_KLEURE.length)];
    }

    function skietOp() {
      rakette.push({
        x: w * (0.18 + Math.random() * 0.64),
        y: h + 8,
        vy: -(h / 92) * (0.92 + Math.random() * 0.3),
        vx: (Math.random() - 0.5) * 0.7,
        doel: h * (0.16 + Math.random() * 0.3),
        k: kleur()
      });
    }

    function bars(x, y, k) {
      var hoeveel = 54 + Math.floor(Math.random() * 46);
      var spoed = (h / 230) * (0.8 + Math.random() * 0.55);
      for (var i = 0; i < hoeveel; i++) {
        var hoek = (i / hoeveel) * Math.PI * 2 + Math.random() * 0.22;
        var s = spoed * (0.45 + Math.random() * 0.75);
        vonke.push({
          x: x, y: y, px: x, py: y,
          vx: Math.cos(hoek) * s,
          vy: Math.sin(hoek) * s,
          leef: 1,
          verval: 0.0075 + Math.random() * 0.011,
          grootte: 0.8 + Math.random() * 1.1,
          k: Math.random() < 0.22 ? kleur() : k,
          flikker: Math.random() * Math.PI * 2
        });
      }
    }

    var vorige = null;

    function stap(t) {
      if (vorige === null) vorige = t;
      var dt = Math.min(2.6, (t - vorige) / 16.667);
      vorige = t;

      /* Elke vonk teken sy eie stert uit sy eie spoed. Vroeër het ons die
         hele doek laat verdof om sterte te kry, maar dan vreet die verdowing
         die sagte rande ongelyk weg en die strale lyk soos kraletjies. */
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      for (var i = rakette.length - 1; i >= 0; i--) {
        var r = rakette[i];
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        r.vy += 0.052 * dt;
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = r.k;
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - r.vx * 5, r.y - r.vy * 5);
        ctx.stroke();
        if (r.vy >= -0.6 || r.y <= r.doel) {
          bars(r.x, r.y, r.k);
          rakette.splice(i, 1);
        }
      }

      for (var j = vonke.length - 1; j >= 0; j--) {
        var v = vonke[j];
        v.x += v.vx * dt;
        v.y += v.vy * dt;
        v.vy += 0.033 * dt;          /* swaartekrag */
        v.vx *= Math.pow(0.986, dt); /* lug */
        v.vy *= Math.pow(0.986, dt);
        v.leef -= v.verval * dt;
        if (v.leef <= 0) { vonke.splice(j, 1); continue; }

        var a = v.leef * (0.86 + 0.14 * Math.sin(t * 0.004 + v.flikker));
        a = Math.max(0, Math.min(1, a));
        ctx.strokeStyle = v.k;

        /* Die stert loop agteruit langs die rigting waarin hy vlieg. Hy kry
           'n minimum lengte, anders krimp hy saam met die spoed weg en dan
           lyk die vuurwerk soos konfetti in plaas van strale. */
        var spoedNou = Math.sqrt(v.vx * v.vx + v.vy * v.vy) || 0.0001;
        var ux = v.vx / spoedNou, uy = v.vy / spoedNou;
        var stert = Math.min(44, Math.max(9, spoedNou * 16));
        var kop = Math.min(15, Math.max(3.5, spoedNou * 5.5));

        ctx.globalAlpha = a * 0.30;
        ctx.lineWidth = v.grootte * 1.15;
        ctx.beginPath();
        ctx.moveTo(v.x, v.y);
        ctx.lineTo(v.x - ux * stert, v.y - uy * stert);
        ctx.stroke();

        ctx.globalAlpha = a;
        ctx.lineWidth = v.grootte * 1.8;
        ctx.beginPath();
        ctx.moveTo(v.x, v.y);
        ctx.lineTo(v.x - ux * kop, v.y - uy * kop);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      requestAnimationFrame(stap);
    }

    if (stil) {
      /* vir wie beweging vermy: een stil, helder oomblik */
      bars(w * 0.5, h * 0.38, "#FFC46B");
      ctx.globalCompositeOperation = "lighter";
      vonke.forEach(function (v) {
        ctx.beginPath();
        ctx.arc(v.x, v.y, v.grootte, 0, Math.PI * 2);
        ctx.fillStyle = v.k;
        ctx.fill();
      });
      return;
    }

    /* 'n vlaag om mee te begin, en dan hou dit aan solank sy kyk */
    [0, 180, 360, 560, 760, 980].forEach(function (ms) {
      setTimeout(skietOp, ms);
    });
    setInterval(function () {
      skietOp();
      if (Math.random() < 0.45) setTimeout(skietOp, 240);
    }, 760);

    requestAnimationFrame(stap);
  }

  /* ---------- bou alles ---------- */

  slaaie.push(bouWelkom());
  SLAAIE.forEach(function (d, i) {
    slaaie.push(bouSlaai(d, i + 1, i === SLAAIE.length - 1));
  });

  /* die kolletjies boontoe: een per slaai, sonder die welkom */
  var kolle = [];
  SLAAIE.forEach(function () { kolle.push(maak("i", null, padBalk)); });

  /* ---------- beweeg tussen slaaie ---------- */

  function laaiFoto(s) {
    if (!s || !s._doek || s._gelaai) return;
    s._gelaai = true;
    soekFoto(s._fotoNaam, function (pad) {
      if (pad) s._doek.style.backgroundImage = 'url("' + pad + '")';
    });
  }

  function wys(n) {
    if (n < 0 || n >= slaaie.length) return;

    laaiFoto(slaaie[n]);
    laaiFoto(slaaie[n + 1]);   // die volgende een reeds reg hê

    slaaie.forEach(function (s, i) {
      if (i === n) s.classList.add("aktief");
      else s.classList.remove("aktief");
    });

    hier = n;

    /* die kolletjies en die klank-knoppie wys net sodra sy begin het */
    padBalk.classList.toggle("sien", n > 0);
    klankKnop.classList.toggle("sien", n > 0 && !!orrel.src);

    kolle.forEach(function (k, i) {
      k.className = "";
      if (i === n - 1) k.className = "hier";
      else if (i < n - 1) k.className = "verby";
    });

    /* die eerste slaai na die welkom het nêrens om terug te gaan nie */
    var terugKnop = slaaie[n].querySelector(".terug");
    if (terugKnop) terugKnop.hidden = (n <= 1);

    besig = true;
    setTimeout(function () { besig = false; }, 620);
  }

  function verder() { if (!besig && hier < slaaie.length - 1) wys(hier + 1); }
  function vorige() { if (!besig && hier > 0) wys(hier - 1); }

  /* ---------- die musiek ---------- */

  var musiekAan = true;
  var KLANK_SOORTE = /\.(mp3|m4a|aac|ogg|oga|wav|flac)$/i;

  /* Soek die liedjie self op, sodat hy enige naam kan hê. Staan daar 'n naam
     in inhoud.js, kry dit voorkeur; anders vat ons wat ook al in musiek/ lê. */
  function soekLiedjie(klaar) {
    /* Staan die naam in inhoud.js, gebruik dit sommer net. Is die lêer nie
       daar nie, hoor ons dit by die "error" hieronder en die knoppie gaan weg. */
    if (LIEDJIE) klaar(LIEDJIE);
    else blaaiDeurMusiek(klaar);
  }

  /* Vra die bediener wat in musiek/ lê. Dit werk net by die plaaslike
     bediener; GitHub Pages gee nie so 'n lys nie. */
  function blaaiDeurMusiek(klaar) {
    fetch("musiek/")
      .then(function (r) { return r.ok ? r.text() : ""; })
      .then(function (html) {
        var houer = document.createElement("div");
        houer.innerHTML = html;
        var skakels = houer.querySelectorAll("a[href]");
        for (var i = 0; i < skakels.length; i++) {
          var h = skakels[i].getAttribute("href");
          var naam = h;
          try { naam = decodeURIComponent(h); } catch (e) {}
          if (KLANK_SOORTE.test(naam)) {
            return klaar(h.indexOf("/") === 0 || h.indexOf("musiek/") === 0
              ? h : "musiek/" + h);
          }
        }
        klaar(null);
      })
      .catch(function () { klaar(null); });
  }

  /* Die bron word reeds by die laai gestel, sodat play() binne haar
     tik kan gebeur. Foonblaaiers laat musiek net dán toe. */
  soekLiedjie(function (pad) {
    if (pad) orrel.src = pad;
    else klankKnop.classList.remove("sien");
  });

  function wekMusiek() {
    if (!orrel.src) return;
    orrel.volume = 0;
    var belofte = orrel.play();
    if (belofte && belofte.catch) {
      belofte.catch(function () { klankKnop.classList.remove("sien"); });
    }
    /* stadig insluip, nie met 'n skok nie */
    var teiken = 0.55, stap = 0;
    var tik = setInterval(function () {
      stap += 1;
      orrel.volume = Math.min(teiken, (stap / 60) * teiken);
      if (stap >= 60) clearInterval(tik);
    }, 70);
  }

  klankKnop.addEventListener("click", function () {
    musiekAan = !musiekAan;
    klankKnop.classList.toggle("af", !musiekAan);
    if (musiekAan) {
      if (!orrel.src) wekMusiek();
      else orrel.play().catch(function () {});
    } else {
      orrel.pause();
    }
  });

  orrel.addEventListener("error", function () {
    klankKnop.classList.remove("sien");
  });

  /* ---------- sy sal vee, nie net tik nie ---------- */

  var vanX = 0, vanY = 0, tyd = 0;

  toneel.addEventListener("touchstart", function (e) {
    var t = e.changedTouches[0];
    vanX = t.clientX; vanY = t.clientY; tyd = Date.now();
  }, { passive: true });

  toneel.addEventListener("touchend", function (e) {
    var t = e.changedTouches[0];
    var dx = t.clientX - vanX;
    var dy = t.clientY - vanY;
    if (Date.now() - tyd > 700) return;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    if (hier === 0) return;                 // welkom wag vir die knoppie
    if (dx < 0) verder(); else vorige();
  }, { passive: true });

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "PageDown") verder();
    if (e.key === "ArrowLeft" || e.key === "PageUp") vorige();
  });

  /* ---------- die sterre bo die werf ---------- */

  function sterrehemel(doek) {
    var ctx = doek.getContext("2d");
    var sterre = [], w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

    function meet() {
      w = doek.clientWidth; h = doek.clientHeight;
      doek.width = Math.round(w * dpr);
      doek.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var hoeveel = Math.round(Math.min(150, (w * h) / 5200));
      sterre = [];
      for (var i = 0; i < hoeveel; i++) {
        sterre.push({
          x: Math.random() * w,
          /* digter bo, yl na die horison toe */
          y: Math.pow(Math.random(), 1.5) * h * 0.92,
          r: Math.random() * 1.05 + 0.3,
          f: Math.random() * Math.PI * 2,
          s: Math.random() * 0.8 + 0.25,
          warm: Math.random() > 0.78
        });
      }
    }

    function teken(t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < sterre.length; i++) {
        var s = sterre[i];
        var flikker = stil ? 0.7 : 0.52 + 0.48 * Math.sin(t * 0.0009 * s.s + s.f);
        var a = flikker * (1 - s.y / (h * 1.5)) * 0.9;
        if (a <= 0.01) continue;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.warm
          ? "rgba(255,206,146," + a.toFixed(3) + ")"
          : "rgba(238,240,255," + a.toFixed(3) + ")";
        ctx.fill();
      }
    }

    function loop(t) { teken(t); requestAnimationFrame(loop); }

    meet();
    window.addEventListener("resize", function () { meet(); if (stil) teken(0); });
    if (stil) teken(0); else requestAnimationFrame(loop);
  }

  /* ---------- begin ---------- */

  /* Sit #3 agter die adres om reguit na 'n slaai te spring.
     Handig terwyl jy die woorde verander. */
  function uitHash() {
    var n = parseInt(String(location.hash || "").replace("#", ""), 10);
    return (!isNaN(n) && n >= 0 && n < slaaie.length) ? n : 0;
  }

  window.addEventListener("hashchange", function () { wys(uitHash()); });

  wys(uitHash());
})();
