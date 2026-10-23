/* ===========================================================
   Hou die brief op haar foon, sodat dit ook sonder sein werk.
   Verander jy iets aan die app, maak KAS hieronder 'n nommer
   hoër, dan gooi elke foon sy ou kopie weg.
   =========================================================== */

var KAS = "lisatjie-v1";

/* Die app self. Fotos en musiek word nie vooraf gelaai nie: hulle is
   swaar, en hulle beland in die kas sodra sy by hulle kom. */
var SKELET = [
  "./",
  "./index.html",
  "./styl.css",
  "./app.js",
  "./inhoud.js",
  "./manifest.webmanifest",
  "./ikoon.svg",
  "./ikoon-192.png",
  "./ikoon-512.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(KAS).then(function (kas) {
      /* een stukkende adres moet nie die hele installasie laat misluk nie */
      return Promise.all(SKELET.map(function (u) {
        return kas.add(u).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (name) {
      return Promise.all(name.map(function (n) {
        return n === KAS ? null : caches.delete(n);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;

  var swaar = /\.(jpe?g|png|webp|gif|mp3|m4a|aac|ogg|oga|wav|flac)$/i.test(url.pathname);

  if (swaar) {
    /* Fotos en musiek verander nie: vat die kas eerste, dis dadelik daar. */
    e.respondWith(
      caches.match(req).then(function (gekas) {
        return gekas || fetch(req).then(function (r) {
          var kopie = r.clone();
          caches.open(KAS).then(function (kas) { kas.put(req, kopie); });
          return r;
        });
      })
    );
    return;
  }

  /* Die woorde kom netwerk-eerste, sodat jou veranderinge dadelik wys.
     Is daar nie sein nie, kom die kopie uit die kas. */
  e.respondWith(
    fetch(req).then(function (r) {
      var kopie = r.clone();
      caches.open(KAS).then(function (kas) { kas.put(req, kopie); });
      return r;
    }).catch(function () {
      return caches.match(req).then(function (gekas) {
        return gekas || caches.match("./index.html");
      });
    })
  );
});
