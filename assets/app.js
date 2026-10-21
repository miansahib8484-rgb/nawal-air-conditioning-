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
