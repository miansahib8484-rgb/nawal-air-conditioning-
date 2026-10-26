/* Site behaviour. No libraries. Safe to edit. */
(function () {
  "use strict";
  window.__appReady = true;

  var S = window.SITE || {};
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  try { localStorage.setItem("lang", S.lang); } catch (e) {}
  window.dataLayer = window.dataLayer || [];

  /* ---------- language switch remembers the choice ---------- */
  $$("[data-lang]").forEach(function (a) {
    a.addEventListener("click", function () {
      try { localStorage.setItem("lang", a.getAttribute("data-lang")); } catch (e) {}
    });
  });

  /* ---------- click tracking hooks (for GTM / GA4 later; sends nothing by itself) ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (href.indexOf("tel:") === 0) window.dataLayer.push({ event: "phone_click", page: location.pathname });
    else if (href.indexOf("https://wa.me/") === 0) window.dataLayer.push({ event: "whatsapp_click", page: location.pathname });
  });

  /* ---------- header shadow, scroll progress bar, back-to-top ---------- */
  var header = $(".site-header");
  var totop = $("[data-totop]");
  var bar = document.createElement("div");
  bar.className = "progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || 0;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    if (totop) totop.classList.toggle("is-on", y > 700);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
  if (totop) totop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  /* ---------- mobile menu ---------- */
  var burger = $("[data-burger]");
  var mnav = $("#mobile-nav");
  if (burger && mnav) {
    burger.addEventListener("click", function () {
      var open = mnav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- services dropdown ---------- */
  var dd = $("[data-dd]");
  if (dd) {
    var ddBtn = $(".dd__btn", dd);
    var setDd = function (open) {
      dd.classList.toggle("is-open", open);
      ddBtn.setAttribute("aria-expanded", open ? "true" : "false");
    };
    ddBtn.addEventListener("click", function (e) { e.stopPropagation(); setDd(!dd.classList.contains("is-open")); });
    document.addEventListener("click", function (e) { if (!dd.contains(e.target)) setDd(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setDd(false); });
  }

  /* ---------- scroll reveal (staggered) ---------- */
  var REVEAL = [
    ".card", ".why__item", ".process li", ".steps3 li", ".finder__btn", ".checks li", ".svc", ".faq details",
    ".causes li", ".cta", ".panel", ".prose > div", ".notice", ".pills li", ".section .eyebrow", ".section .h2",
    ".section .lead", ".strip__list li", ".sd__main h2", ".faq-group h2", ".related a", ".two > div",
    ".sharebox", ".reviews__summary"
  ].join(",");
  if (!reduce && "IntersectionObserver" in window) {
    var revealEls = $$(REVEAL).filter(function (el) {
      return !el.closest(".hero, .page-hero, .site-header, .site-footer, .nav-mobile");
    });
    var seen = new Map();
    revealEls.forEach(function (el) {
      var p = el.parentNode;
      var n = seen.get(p) || 0;
      seen.set(p, n + 1);
      el.style.setProperty("--d", Math.min(n, 6) * 70 + "ms");
      el.classList.add("rv");
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- hero: pointer parallax + rotating "what we repair" word ---------- */
  var hero = $(".hero");
  var heroCard = $(".hero__card");
  if (hero && heroCard && !reduce && window.matchMedia("(hover: hover)").matches) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      heroCard.style.transform = "translate3d(" + (x * -14).toFixed(1) + "px," + (y * -10).toFixed(1) + "px,0)";
    });
    hero.addEventListener("pointerleave", function () { heroCard.style.transform = ""; });
  }
  $$("[data-rotate]").forEach(function (el) {
    var items;
    try { items = JSON.parse(el.getAttribute("data-rotate")); } catch (e) { return; }
    if (!items || items.length < 2 || reduce) return;
    var i = 0;
    setInterval(function () {
      if (document.hidden) return;
      el.classList.add("is-out");
      setTimeout(function () {
        i = (i + 1) % items.length;
        el.textContent = items[i];
        el.classList.remove("is-out");
      }, 260);
    }, 2600);
  });

  /* ---------- smooth FAQ accordion ---------- */
  $$(".faq details").forEach(function (d) {
    var summary = $("summary", d);
    var body = $("p", d);
    if (!summary || !body) return;
    summary.addEventListener("click", function (e) {
      if (reduce || !body.animate) return;
      e.preventDefault();
      if (d._anim) d._anim.cancel();
      if (!d.open) {
        d.open = true;
        var h = body.offsetHeight;
        d._anim = body.animate(
          [{ height: "0px", paddingBottom: "0px", opacity: 0 }, { height: h + "px", paddingBottom: "18px", opacity: 1 }],
          { duration: 260, easing: "ease-out" }
        );
        d._anim.onfinish = function () { d._anim = null; };
      } else {
        var h2 = body.offsetHeight;
        d._anim = body.animate(
          [{ height: h2 + "px", paddingBottom: "18px", opacity: 1 }, { height: "0px", paddingBottom: "0px", opacity: 0 }],
          { duration: 220, easing: "ease-in" }
        );
        d._anim.onfinish = function () { d.open = false; d._anim = null; };
      }
    });
  });

  /* ---------- live search on the services page ---------- */
  var q = $("[data-search]");
  if (q) {
    var norm = function (s) {
      return (s || "").toLowerCase()
        .replace(/[ً-ٰٟـ]/g, "")
        .replace(/[أإآ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه")
        .replace(/\s+/g, " ").trim();
    };
    var items = $$("[data-kw]");
    var none = $("[data-search-none]");
    var count = $("[data-search-count]");
    var clear = $("[data-search-clear]");
    items.forEach(function (el) { el._kw = norm(el.getAttribute("data-kw")); });
    var run = function () {
      var terms = norm(q.value).split(" ").filter(Boolean);
      var shown = 0;
      items.forEach(function (el) {
        var ok = terms.every(function (t) { return el._kw.indexOf(t) > -1; });
        el.hidden = !ok;
        if (ok) shown++;
      });
      if (none) none.hidden = shown > 0;
      if (count) count.textContent = terms.length ? ((S.search && S.search.count) || "").replace("{n}", shown).replace("{t}", items.length) : "";
      if (clear) clear.hidden = !q.value;
    };
    q.addEventListener("input", run);
    if (clear) clear.addEventListener("click", function () { q.value = ""; run(); q.focus(); });
    run();
  }

  /* ---------- helpers for WhatsApp forms ---------- */
  function showWa(status, url) {
    window.open(url, "_blank", "noopener");
    if (!status) return;
    status.hidden = false;
    status.textContent = "";
    var p = document.createElement("span");
    p.textContent = (S.opening || "") + " ";
    var a = document.createElement("a");
    a.href = url; a.target = "_blank"; a.rel = "noopener";
    a.textContent = S.openLink || "WhatsApp";
    status.appendChild(p);
    status.appendChild(a);
  }
  function shake(form) {
    if (reduce) return;
    form.classList.remove("shake");
    void form.offsetWidth;
    form.classList.add("shake");
  }

  /* ---------- request form (contact page) ---------- */
  var form = $("#req");
  if (form) {
    var rules = {
      name: function (v) { return v.length >= 2; },
      phone: function (v) { return /^\+?[\d\s\-()]{7,18}$/.test(v); },
      category: function (v) { return !!v; },
      service: function (v) { return !!v; },
      neighborhood: function (v) { return v.length >= 2; },
      problem: function (v) { return v.length >= 10; }
    };
    var mark = function (k, bad) {
      var out = $('[data-err="' + k + '"]', form);
      var input = form.elements[k];
      if (out) out.textContent = bad ? ((S.errors || {})[k] || "") : "";
      if (bad) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
    };
    Object.keys(rules).forEach(function (k) {
      var input = form.elements[k];
      var check = function () { mark(k, !rules[k](input.value.trim())); };
      input.addEventListener("blur", function () { if (input.value !== "" || input.getAttribute("aria-invalid")) check(); });
      input.addEventListener("input", function () { if (input.getAttribute("aria-invalid") && rules[k](input.value.trim())) mark(k, false); });
      input.addEventListener("change", function () { if (input.tagName === "SELECT") check(); });
    });
    var area = form.elements.problem;
    var counter = $("[data-count]", form);
    if (area && counter) {
      var upd = function () { counter.textContent = area.value.length + "/" + area.maxLength; };
      area.addEventListener("input", upd);
      upd();
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = {};
      ["name", "phone", "category", "service", "neighborhood", "brand", "problem"].forEach(function (k) { v[k] = form.elements[k].value.trim(); });
      var bad = 0;
      Object.keys(rules).forEach(function (k) { var b = !rules[k](v[k]); mark(k, b); if (b) bad++; });
      if (bad) {
        shake(form);
        var first = $('[aria-invalid="true"]', form);
        if (first) first.focus();
        return;
      }
      var T = S.tpl || {};
      var lines = [T.hello, T.appliance + ": " + v.category, T.service + ": " + v.service, T.area + ": " + v.neighborhood, T.problem + ": " + v.problem];
      if (v.brand) lines.push(T.brand + ": " + v.brand);
      window.dataLayer.push({ event: "form_submit_whatsapp", form: "request" });
      showWa($("#req-status"), S.wa + "?text=" + encodeURIComponent(lines.join("\n")));
    });
  }


  /* ---------- count-up numbers ---------- */
  var counters = $$("[data-count]");
  if (counters.length) {
    var runCount = function (el) {
      var to = parseInt(el.getAttribute("data-count"), 10);
      if (!isFinite(to) || reduce || to < 3) return;
      var t0 = null;
      var tick = function (t) {
        if (t0 === null) t0 = t;
        var k = Math.min(1, (t - t0) / 1100);
        el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(tick);
      };
      el.textContent = "0";
      requestAnimationFrame(tick);
    };
    if ("IntersectionObserver" in window) {
      var co = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { runCount(en.target); co.unobserve(en.target); } });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { co.observe(el); });
    }
  }


  /* ---------- extra motion (all skipped for reduced-motion users) ---------- */
  var finePointer = !!(window.matchMedia && window.matchMedia("(pointer: fine)").matches);

  // headings: animated underline when they scroll into view
  if ("IntersectionObserver" in window) {
    var hio = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-seen"); hio.unobserve(en.target); } });
    }, { threshold: 0.6 });
    $$(".h2").forEach(function (h) { hio.observe(h); });
  } else { $$(".h2").forEach(function (h) { h.classList.add("is-seen"); }); }

  if (!reduce) {
    // hero title: words rise in one by one
    var ht = $(".hero__title");
    if (ht) {
      var wi = 0;
      var splitNode = function (node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
          if (ch.nodeType === 3) {
            var parts = ch.textContent.split(/(\s+)/);
            var frag = document.createDocumentFragment();
            parts.forEach(function (t) {
              if (!t) return;
              if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(" ")); return; }
              var sp = document.createElement("span");
              sp.className = "w"; sp.style.setProperty("--i", wi++); sp.textContent = t;
              frag.appendChild(sp);
            });
            node.replaceChild(frag, ch);
          } else if (ch.nodeType === 1) { splitNode(ch); }
        });
      };
      ht.setAttribute("aria-label", ht.textContent.replace(/\s+/g, " ").trim());
      splitNode(ht);
    }

    // button ripple
    document.addEventListener("pointerdown", function (e) {
      var b = e.target.closest && e.target.closest(".btn");
      if (!b) return;
      var r = b.getBoundingClientRect(), d = Math.max(r.width, r.height);
      var rp = document.createElement("span");
      rp.className = "ripple";
      rp.style.cssText = "width:" + d + "px;height:" + d + "px;left:" + (e.clientX - r.left - d / 2) + "px;top:" + (e.clientY - r.top - d / 2) + "px";
      b.appendChild(rp);
      setTimeout(function () { if (rp.parentNode) rp.parentNode.removeChild(rp); }, 650);
    }, { passive: true });

    // 3D tilt on cards (mouse only)
    if (finePointer) {
      $$(".card,.pcard,.glance__i,.review-card").forEach(function (el) {
        el.setAttribute("data-tilt", "");
        el.addEventListener("pointermove", function (e) {
          var r = el.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = "perspective(800px) rotateX(" + (-py * 6).toFixed(2) + "deg) rotateY(" + (px * 7).toFixed(2) + "deg) translateY(-4px)";
        });
        el.addEventListener("pointerleave", function () { el.style.transform = ""; });
      });
    }

    // hero: pointer spotlight + drifting "cool air" particles
    var hero = $(".hero");
    if (hero) {
      if (finePointer) {
        hero.addEventListener("pointermove", function (e) {
          var r = hero.getBoundingClientRect();
          hero.style.setProperty("--mx", (e.clientX - r.left) + "px");
          hero.style.setProperty("--my", (e.clientY - r.top) + "px");
        }, { passive: true });
      }
      var cv = document.createElement("canvas");
      cv.className = "fx"; cv.setAttribute("aria-hidden", "true");
      hero.insertBefore(cv, hero.firstChild);
      var cx = cv.getContext && cv.getContext("2d");
      if (cx) {
        var W = 0, H = 0, dots = [], vis = true, dpr = Math.min(window.devicePixelRatio || 1, 2);
        var size = function () {
          W = hero.clientWidth; H = hero.clientHeight;
          cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
          var n = Math.round(Math.min(46, W / 28));
          dots = [];
          for (var i = 0; i < n; i++) dots.push({ x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 2.4, v: 0.15 + Math.random() * 0.45, s: Math.random() * 6, lime: Math.random() < 0.3 });
        };
        size();
        window.addEventListener("resize", size);
        if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(hero);
        var t = 0;
        var frame = function () {
          if (vis && !document.hidden) {
            t += 0.01;
            cx.clearRect(0, 0, W, H);
            dots.forEach(function (d) {
              d.y += d.v; d.x += Math.sin(t + d.s) * 0.35;
              if (d.y > H + 6) { d.y = -6; d.x = Math.random() * W; }
              cx.beginPath(); cx.arc(d.x, d.y, d.r, 0, 6.2832);
              cx.fillStyle = d.lime ? "rgba(182,242,60,.55)" : "rgba(255,255,255,.4)";
              cx.fill();
            });
          }
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      }
    }

    // gentle parallax on big pictures
    var pars = $$(".about-split__img img,.req__img img,.hero__img");
    if (pars.length) {
      pars.forEach(function (p) { p.classList.add("parallax"); });
      var ticking = false;
      var upd = function () {
        var vh = window.innerHeight;
        pars.forEach(function (p) {
          var r = p.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) return;
          var k = ((r.top + r.height / 2) - vh / 2) / vh;
          p.style.transform = "translateY(" + (k * -14).toFixed(1) + "px)";
        });
        ticking = false;
      };
      window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
      upd();
    }
  }


  /* ---------- photo lightbox ---------- */
  var galleries = $$("[data-gallery]");
  if (galleries.length) {
    var lbEl = null, lbList = [], lbIdx = 0, lbFrom = null, lbFig, lbImg, lbCap;
    var lbShow = function (i) {
      lbIdx = (i + lbList.length) % lbList.length;
      var a = lbList[lbIdx];
      lbImg.src = a.getAttribute("href");
      lbImg.alt = a.getAttribute("data-cap") || "";
      lbCap.textContent = a.getAttribute("data-cap") || "";
    };
    var lbClose = function () {
      if (!lbEl) return;
      lbEl.hidden = true;
      document.body.style.overflow = "";
      if (lbFrom && lbFrom.focus) lbFrom.focus();
    };
    var lbBuild = function (g) {
      if (!lbEl) {
        lbEl = document.createElement("div");
        lbEl.className = "lb"; lbEl.hidden = true;
        lbEl.setAttribute("role", "dialog"); lbEl.setAttribute("aria-modal", "true");
        lbEl.innerHTML = '<button type="button" class="lb__x"></button><button type="button" class="lb__p"></button><button type="button" class="lb__n"></button><figure><img alt=""><figcaption></figcaption></figure>';
        document.body.appendChild(lbEl);
        lbImg = $("img", lbEl); lbCap = $("figcaption", lbEl);
        $(".lb__x", lbEl).addEventListener("click", lbClose);
        $(".lb__p", lbEl).addEventListener("click", function () { lbShow(lbIdx - 1); });
        $(".lb__n", lbEl).addEventListener("click", function () { lbShow(lbIdx + 1); });
        lbEl.addEventListener("click", function (e) { if (e.target === lbEl) lbClose(); });
        var sx = null;
        lbEl.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
        lbEl.addEventListener("touchend", function (e) {
          if (sx === null) return;
          var dx = e.changedTouches[0].clientX - sx; sx = null;
          if (Math.abs(dx) > 50) lbShow(lbIdx + (dx < 0 ? 1 : -1) * (document.documentElement.dir === "rtl" ? -1 : 1));
        }, { passive: true });
        document.addEventListener("keydown", function (e) {
          if (lbEl.hidden) return;
          var rtl = document.documentElement.dir === "rtl";
          if (e.key === "Escape") lbClose();
          else if (e.key === "ArrowRight") lbShow(lbIdx + (rtl ? -1 : 1));
          else if (e.key === "ArrowLeft") lbShow(lbIdx + (rtl ? 1 : -1));
        });
      }
      $(".lb__x", lbEl).setAttribute("aria-label", g.getAttribute("data-close") || "Close");
      $(".lb__x", lbEl).textContent = "\u00D7";
      $(".lb__p", lbEl).setAttribute("aria-label", g.getAttribute("data-prev") || "Previous");
      $(".lb__n", lbEl).setAttribute("aria-label", g.getAttribute("data-next") || "Next");
      var rtl2 = document.documentElement.dir === "rtl";
      $(".lb__p", lbEl).textContent = rtl2 ? "\u203A" : "\u2039";
      $(".lb__n", lbEl).textContent = rtl2 ? "\u2039" : "\u203A";
    };
    galleries.forEach(function (g) {
      $$("a.gal__i", g).forEach(function (a, i, all) {
        a.addEventListener("click", function (e) {
          e.preventDefault();
          lbList = all; lbFrom = a;
          lbBuild(g);
          lbShow(i);
          lbEl.hidden = false;
          document.body.style.overflow = "hidden";
          $(".lb__x", lbEl).focus();
        });
      });
    });
  }

  /* ---------- reviews: carousel (only real reviews from assets/reviews.js) ---------- */
  var R = S.rev || {};
  var list = (Array.isArray(window.REVIEWS) ? window.REVIEWS : []).filter(function (r) {
    return r && r.name && r.text && Number(r.rating) >= 1 && Number(r.rating) <= 5 && (!r.lang || r.lang === S.lang);
  });
  var wrap = $("[data-reviews]");
  if (wrap && list.length) {
    wrap.hidden = false;
    var emptyMsg = $("[data-rev-empty]");
    if (emptyMsg) emptyMsg.hidden = true;
    var sum = $("[data-rev-summary]", wrap);
    var track = $("[data-rev-track]", wrap);
    var dotsBox = $("[data-rev-dots]", wrap);
    var ctrl = $("[data-rev-ctrl]", wrap);
    var prev = $("[data-rev-prev]", wrap);
    var next = $("[data-rev-next]", wrap);
    var total = 0;
    list.forEach(function (r) { total += Number(r.rating); });
    sum.textContent = (list.length === 1 ? R.avgOne : R.avgMany).replace("{avg}", (total / list.length).toFixed(1)).replace("{n}", list.length);

    list.forEach(function (r, i) {
      var rating = Math.round(Number(r.rating));
      var li = document.createElement("li");
      li.className = "review-card";
      var st = document.createElement("div");
      st.className = "stars-out";
      st.setAttribute("role", "img");
      st.setAttribute("aria-label", (R.starsLabel || "{r}").replace("{r}", rating));
      st.textContent = "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(0, 5 - rating);
      var bq = document.createElement("blockquote");
      bq.textContent = r.text;
      var ft = document.createElement("footer");
      ft.textContent = r.name;
      if (r.date) { var sp = document.createElement("span"); sp.textContent = " · " + r.date; ft.appendChild(sp); }
      li.appendChild(st); li.appendChild(bq); li.appendChild(ft);
      track.appendChild(li);
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", (R.slide || "{i}").replace("{i}", i + 1));
      dot.addEventListener("click", function () { goTo(i); });
      dotsBox.appendChild(dot);
    });

    var slides = $$(".review-card", track);
    var dots = $$("button", dotsBox);
    var cur = 0;
    var setCur = function (i) {
      cur = i;
      dots.forEach(function (d, k) { d.classList.toggle("is-on", k === i); });
    };
    var goTo = function (i) {
      i = (i + slides.length) % slides.length;
      var s = slides[i];
      if (s.scrollIntoView) s.scrollIntoView({ behavior: reduce ? "auto" : "smooth", inline: "start", block: "nearest" });
      setCur(i);
    };
    if (prev) prev.addEventListener("click", function () { goTo(cur - 1); });
    if (next) next.addEventListener("click", function () { goTo(cur + 1); });
    setCur(0);
    if ("IntersectionObserver" in window) {
      var so = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting && en.intersectionRatio > 0.6) setCur(slides.indexOf(en.target)); });
      }, { root: track, threshold: [0.6, 0.9] });
      slides.forEach(function (s) { so.observe(s); });
    }
    var fit = function () { if (ctrl) ctrl.hidden = track.scrollWidth <= track.clientWidth + 2; };
    fit();
    window.addEventListener("resize", fit);

    var timer = null;
    var play = function () {
      if (reduce || slides.length < 2 || (ctrl && ctrl.hidden)) return;
      stop();
      timer = setInterval(function () { if (!document.hidden) goTo(cur + 1); }, 7000);
    };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    ["pointerenter", "focusin", "touchstart"].forEach(function (ev) { wrap.addEventListener(ev, stop, { passive: true }); });
    ["pointerleave", "focusout"].forEach(function (ev) { wrap.addEventListener(ev, play); });
    play();
  }

  /* ---------- reviews: share-your-experience form (opens WhatsApp, posts nothing) ---------- */
  var rf = $("[data-review-form]");
  if (rf) {
    var g = $("[data-google]");
    if (g && window.REVIEW_LINK) { g.href = window.REVIEW_LINK; g.hidden = false; }
    var setErr = function (k, msg) {
      var out = $('[data-rerr="' + k + '"]', rf);
      if (out) out.textContent = msg || "";
    };
    rf.addEventListener("submit", function (e) {
      e.preventDefault();
      var picked = $('input[name="rating"]:checked', rf);
      var name = rf.elements.rname.value.trim();
      var msg = rf.elements.rmessage.value.trim();
      var E = R.errors || {};
      setErr("rating", picked ? "" : E.rating);
      setErr("name", name.length >= 2 ? "" : E.name);
      setErr("message", msg.length >= 10 ? "" : E.message);
      rf.elements.rname.toggleAttribute("aria-invalid", name.length < 2);
      rf.elements.rmessage.toggleAttribute("aria-invalid", msg.length < 10);
      if (!picked || name.length < 2 || msg.length < 10) {
        shake(rf);
        var firstBad = !picked ? $('input[name="rating"]', rf) : (name.length < 2 ? rf.elements.rname : rf.elements.rmessage);
        if (firstBad) firstBad.focus();
        return;
      }
      var T = R.tpl || {};
      var lines = [T.hello, T.rating + ": " + picked.value + "/5", T.name + ": " + name, T.review + ": " + msg];
      window.dataLayer.push({ event: "review_submit_whatsapp" });
      showWa($("[data-rstatus]", rf), S.wa + "?text=" + encodeURIComponent(lines.join("\n")));
    });
  }
})();
