/* ==========================================================
   JASON BUSINESS — micro-interactions premium (SaaS néo)
   Aucune dépendance. Désactivé si l'appareil demande moins de mouvement.
   ========================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CARDS = '.card,.jb-card,.param-card,.app-card,.game-card,.type-card,.jb-service-card,' +
              '.jb-payment-card,.jb-method,.jb-system-item,.panel,.hero,.jb-points-card,.jb-money-box';
  var PRESS = '.btn,.jb-action,.tbtn,.btn-install,.jb-btn,.btn-primary';

  function ready(fn) {
    if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    /* ---------- ambiance : deux halos qui dérivent lentement ---------- */
    if (!reduce && !document.querySelector('.fx-ambient')) {
      var amb = document.createElement('div');
      amb.className = 'fx-ambient';
      amb.setAttribute('aria-hidden', 'true');
      amb.innerHTML = '<i></i><i></i>';
      document.body.insertBefore(amb, document.body.firstChild);
    }

    /* ---------- apparition progressive, en cascade ---------- */
    if (!reduce && 'IntersectionObserver' in window) {
      var seen = new WeakSet();
      var io = new IntersectionObserver(function (entries) {
        var i = 0;
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          io.unobserve(el);
          var d = Math.min(i++ * 70, 420);
          el.style.setProperty('--d', d + 'ms');
          el.classList.add('fx-in');
          setTimeout(function () {
            el.classList.remove('fx-reveal', 'fx-in');
            el.style.removeProperty('--d');
          }, 900 + d);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });

      var register = function (root) {
        var list = [];
        if (root.nodeType !== 1) return;
        if (root.matches && root.matches(CARDS)) list.push(root);
        if (root.querySelectorAll) list.push.apply(list, root.querySelectorAll(CARDS));
        list.forEach(function (el) {
          if (seen.has(el)) return;
          seen.add(el);
          /* les fenêtres modales ont leur propre animation */
          if (el.closest('.overlay,.jb-overlay,[class*="modal"],[class*="loader"]')) return;
          el.classList.add('fx-reveal');
          io.observe(el);
        });
      };
      register(document.body);
      new MutationObserver(function (list) {
        list.forEach(function (r) { r.addedNodes.forEach(register); });
      }).observe(document.body, { childList: true, subtree: true });

      /* filet de sécurité : rien ne reste invisible */
      setTimeout(function () {
        document.querySelectorAll('.fx-reveal:not(.fx-in)').forEach(function (el) {
          el.classList.add('fx-in');
          setTimeout(function () { el.classList.remove('fx-reveal', 'fx-in'); }, 900);
        });
      }, 3500);
    }
  });

  /* ---------- spotlight : la lumière suit le doigt / la souris ---------- */
  if (!reduce) {
    var raf = 0, last = null;
    document.addEventListener('pointermove', function (e) {
      last = e;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var t = last.target && last.target.closest && last.target.closest(CARDS);
        if (!t) return;
        var r = t.getBoundingClientRect();
        t.style.setProperty('--mx', (last.clientX - r.left) + 'px');
        t.style.setProperty('--my', (last.clientY - r.top) + 'px');
      });
    }, { passive: true });

    /* ---------- ondulation au toucher des boutons ---------- */
    document.addEventListener('pointerdown', function (e) {
      var b = e.target.closest && e.target.closest(PRESS);
      if (!b || b.disabled) return;
      var r = b.getBoundingClientRect();
      var size = Math.max(r.width, r.height) * 1.6;
      var s = document.createElement('span');
      s.className = 'fx-ripple';
      s.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (e.clientX - r.left - size / 2) +
                        'px;top:' + (e.clientY - r.top - size / 2) + 'px';
      b.appendChild(s);
      setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 650);
    }, { passive: true });
  }
})();
