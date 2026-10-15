"use strict";

/*
 * love-coupons — page logic.
 *
 * "Love Coupons": a little book of promises. Redeem any coupon as many times as
 * you like, or add your own. Everything is kept in localStorage on this device.
 */

(function () {
  var STORE = "mena-coupons";

  var DEFAULT = [
    { id: "d1", title: "Duo queue, one round", note: "You pick the mode. I'll carry, badly." },
    { id: "d2", title: "Movie night, your choice", note: "Anything at all — even if it's sad." },
    { id: "d3", title: "A playlist made for you", note: "Songs that sound like the two of us." },
    { id: "d4", title: "A long call, no clock", note: "We talk until one of us falls asleep." },
    { id: "d5", title: "Breakfast in bed (imagined)", note: "I'll describe it in loving detail." },
    { id: "d6", title: "White flowers, someday", note: "A whole bouquet, handed over in person." },
    { id: "d7", title: "You win the argument", note: "Even when I'm right. Especially then." },
    { id: "d8", title: "A day of my full attention", note: "No phone, no hurry, just you." },
    { id: "d9", title: "One handmade drawing", note: "Drawn slowly, sent the moment it's done." },
    { id: "d10", title: "One wish, granted", note: "You name it — within reason." }
  ];

  var state = { coupons: [] };

  /* ---------------- helpers ---------------- */

  function pad2(n) { return String(n).padStart(2, "0"); }

  function dayISO(date) {
    var d = date || new Date();
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function makeDefault() {
    return DEFAULT.map(function (c) {
      return { id: c.id, title: c.title, note: c.note, custom: false, redeemedAt: null };
    });
  }

  /* ---------------- storage ---------------- */

  function load() {
    state.coupons = [];
    var raw = null;
    try { raw = localStorage.getItem(STORE); } catch (e) { raw = null; }
    var s = null;
    if (raw) { try { s = JSON.parse(raw); } catch (e) { s = null; } }
    if (s && Array.isArray(s.coupons)) {
      s.coupons.forEach(function (c) {
        if (c && typeof c.id === "string" && typeof c.title === "string") {
          state.coupons.push({
            id: c.id,
            title: c.title.slice(0, 80),
            note: typeof c.note === "string" ? c.note.slice(0, 160) : "",
            custom: !!c.custom,
            redeemedAt: typeof c.redeemedAt === "string" ? c.redeemedAt : null
          });
        }
      });
    }
    if (!state.coupons.length) {
      state.coupons = makeDefault();
      save();
    }
  }

  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  /* ---------------- actions ---------------- */

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = String(value);
  }

  function note(id, message) {
    setText(id, message);
  }

  function find(id) {
    for (var i = 0; i < state.coupons.length; i += 1) {
      if (state.coupons[i].id === id) return state.coupons[i];
    }
    return null;
  }

  function redeem(id) {
    var c = find(id);
    if (!c) return;
    c.redeemedAt = c.redeemedAt ? null : dayISO();
    save();
    render();
    note("coupon-note", c.redeemedAt
      ? ("Redeemed \u2014 \u201c" + c.title + "\u201d is yours \u2665")
      : ("\u201c" + c.title + "\u201d is back in the book."));
  }

  function addCoupon(title, text) {
    title = String(title || "").trim();
    if (!title) return false;
    state.coupons.push({
      id: "c" + Date.now() + Math.floor(Math.random() * 1000),
      title: title.slice(0, 80),
      note: String(text || "").trim().slice(0, 160),
      custom: true,
      redeemedAt: null
    });
    save();
    render();
    note("make-note", "Added to the book \u2665");
    return true;
  }

  function removeCoupon(id) {
    for (var i = 0; i < state.coupons.length; i += 1) {
      if (state.coupons[i].id === id) {
        var title = state.coupons[i].title;
        state.coupons.splice(i, 1);
        save();
        render();
        note("coupon-note", "\u201c" + title + "\u201d was removed.");
        return true;
      }
    }
    return false;
  }

  function surprise() {
    var open = state.coupons.filter(function (c) { return !c.redeemedAt; });
    if (!open.length) {
      note("save-note", "Every coupon is already redeemed \u2014 lucky you.");
      return null;
    }
    var pick = open[Math.floor(Math.random() * open.length)];
    note("save-note", "How about: \u201c" + pick.title + "\u201d \u2665");
    highlight(pick.id);
    return pick.id;
  }

  function highlight(id) {
    var grid = document.getElementById("coupon-grid");
    if (!grid || !grid.children) return;
    for (var i = 0; i < grid.children.length; i += 1) {
      var node = grid.children[i];
      if (node.getAttribute && node.getAttribute("data-id") === id) {
        node.className += " is-highlight";
      }
    }
  }

  function reset() {
    state.coupons = makeDefault();
    save();
    render();
    note("save-note", "Back to the first book \u2014 everything is redeemable again.");
  }

  /* ---------------- rendering ---------------- */

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function renderCard(c) {
    var card = el("div", "coupon" + (c.redeemedAt ? " is-redeemed" : ""));
    card.setAttribute("data-id", c.id);

    if (c.redeemedAt) {
      var stamp = el("span", "coupon-stamp");
      stamp.textContent = "Redeemed " + c.redeemedAt;
      card.appendChild(stamp);
    }

    var title = el("h3", "coupon-title");
    title.textContent = c.title;
    card.appendChild(title);

    if (c.note) {
      var noteEl = el("p", "coupon-note");
      noteEl.textContent = c.note;
      card.appendChild(noteEl);
    }

    var foot = el("div", "coupon-foot");
    var btn = el("button", "coupon-redeem");
    btn.type = "button";
    btn.textContent = c.redeemedAt ? "Put it back" : "Redeem \u2665";
    btn.addEventListener("click", function () { redeem(c.id); });
    foot.appendChild(btn);

    if (c.custom) {
      var rm = el("button", "coupon-remove");
      rm.type = "button";
      rm.textContent = "Remove";
      rm.addEventListener("click", function () { removeCoupon(c.id); });
      foot.appendChild(rm);
    }
    card.appendChild(foot);
    return card;
  }

  function render() {
    var grid = document.getElementById("coupon-grid");
    if (grid) {
      grid.textContent = "";
      state.coupons.forEach(function (c) { grid.appendChild(renderCard(c)); });
    }
    var redeemed = state.coupons.filter(function (c) { return c.redeemedAt; }).length;
    setText("coupon-total", state.coupons.length);
    setText("coupon-redeemed", redeemed);
  }

  /* ---------------- events ---------------- */

  function wire() {
    var add = document.getElementById("add-coupon");
    if (add) add.addEventListener("click", function () {
      var t = document.getElementById("new-title");
      var n = document.getElementById("new-note");
      var title = t ? t.value : "";
      if (!String(title).trim()) {
        note("make-note", "Give it a title first \u2665");
        return;
      }
      addCoupon(title, n ? n.value : "");
      if (t) t.value = "";
      if (n) n.value = "";
    });

    var surpriseBtn = document.getElementById("surprise-button");
    if (surpriseBtn) surpriseBtn.addEventListener("click", surprise);

    var resetBtn = document.getElementById("reset-coupons");
    if (resetBtn) resetBtn.addEventListener("click", reset);

    var share = document.getElementById("share-button");
    if (share) share.addEventListener("click", function () {
      var url = window.location.href;
      if (navigator.share) {
        navigator.share({ title: document.title, url: url }).catch(function () {});
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { note("save-note", "Link copied \u2665"); })
          .catch(function () { note("save-note", url); });
        return;
      }
      note("save-note", url);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    load();
    render();
    wire();

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("sw.js").catch(function () {});
      });
    }
  });
})();
