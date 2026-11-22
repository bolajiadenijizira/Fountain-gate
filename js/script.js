/* Fountain Gate Montessori School: shared behaviour for every page */
(function () {
  'use strict';

  /* ---- SETTINGS: edit here ----
     formEndpoint: the Formspree form address. Messages are delivered through it.
     Leave empty and forms open the visitor's email app with the message ready to send. */
  var CONFIG = { formEndpoint: 'https://formspree.io/f/mgakpvkk', toEmail: 'fountaingatemontessorijalingo@gmail.com', phone: '+234 803 424 0369' };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---- Mobile menu ---- */
  var btn = $('#menuBtn'), side = $('#sidebar'), ov = $('#overlay');
  function setMenu(open) {
    if (!side) return;
    side.classList.toggle('open', open);
    if (ov) ov.classList.toggle('show', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (btn) { btn.setAttribute('aria-expanded', open); btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
  }
  if (btn) btn.addEventListener('click', function () { setMenu(!side.classList.contains('open')); });
  if (ov) ov.addEventListener('click', function () { setMenu(false); });
  $$('.nav-item').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
    if (a.classList.contains('active')) a.setAttribute('aria-current', 'page');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setMenu(false); closeLB(); }
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 768) setMenu(false); });

  /* ---- Missing images fall back to a labelled placeholder ---- */
  function missing(img) {
    if (img.dataset.m) return;
    img.dataset.m = 1;
    var d = document.createElement('div');
    d.className = 'img-missing';
    d.setAttribute('role', 'img');
    d.setAttribute('aria-label', img.alt || 'Photo');
    d.textContent = 'Photo: ' + (img.alt || 'add image');
    img.replaceWith(d);
  }
  $$('img').forEach(function (i) {
    i.addEventListener('error', function () { missing(i); });
    if (i.complete && i.naturalWidth === 0) missing(i);
  });

  /* ---- Gallery lightbox ---- */
  var lb;
  function closeLB() { if (lb) lb.classList.remove('show'); }
  function openLB(src, alt) {
    if (!lb) {
      lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-modal', 'true');
      lb.setAttribute('aria-label', 'Enlarged photo');
      lb.innerHTML = '<button type="button" aria-label="Close photo">&times;</button><img alt="">';
      lb.addEventListener('click', closeLB);
      document.body.appendChild(lb);
    }
    $('img', lb).src = src;
    $('img', lb).alt = alt;
    lb.classList.add('show');
    $('button', lb).focus();
  }
  $$('.gallery-item').forEach(function (g) {
    g.tabIndex = 0;
    g.setAttribute('role', 'button');
    g.addEventListener('click', function () { var i = $('img', g); if (i) openLB(i.currentSrc || i.src, i.alt); });
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); g.click(); } });
  });

  /* ---- Forms ---- */
  function fieldOk(el) {
    var v = el.value.trim(), ok = v !== '';
    if (ok && el.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    if (ok && el.tagName === 'TEXTAREA') ok = v.length >= 10;
    return ok;
  }
  function mark(el, ok) {
    var g = el.closest('.form-group');
    if (!g) return;
    g.classList.toggle('invalid', !ok);
    el.setAttribute('aria-invalid', !ok);
    var e = $('.err', g);
    if (!e) {
      e = document.createElement('p');
      e.className = 'err';
      e.id = el.id + '-err';
      g.appendChild(e);
      el.setAttribute('aria-describedby', e.id);
    }
    var v = el.value.trim();
    e.textContent = ok ? '' :
      !v ? 'This field is required.' :
      el.type === 'email' ? 'Enter a valid email address, like name@example.com.' :
      'Please write at least 10 characters.';
  }

  $$('form[data-form]').forEach(function (f) {
    var st = document.createElement('div');
    st.className = 'form-status';
    st.setAttribute('role', 'status');
    st.setAttribute('aria-live', 'polite');
    st.hidden = true;
    f.appendChild(st);
    function say(type, msg) { st.hidden = false; st.className = 'form-status ' + type; st.textContent = msg; }

    f.addEventListener('input', function (e) {
      if (e.target.required && e.target.closest('.invalid')) mark(e.target, fieldOk(e.target));
    });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      $$('[required]', f).forEach(function (el) {
        var ok = fieldOk(el);
        mark(el, ok);
        if (!ok && !bad) bad = el;
      });
      if (bad) { say('bad', 'Please correct the highlighted fields and try again.'); bad.focus(); return; }

      var submit = $('[type=submit]', f);
      var body = $$('input,select,textarea', f).filter(function (el) { return el.name.charAt(0) !== '_'; }).map(function (el) {
        var l = $('label[for="' + el.id + '"]', f);
        var name = l ? l.textContent.replace('*', '').replace(/\s+/g, ' ').trim() : el.name;
        return name + ': ' + el.value.trim();
      }).join('\n');
      var mailHref = 'mailto:' + CONFIG.toEmail + '?subject=' + encodeURIComponent(f.dataset.subject || 'Website enquiry') + '&body=' + encodeURIComponent(body);
      function viaEmailApp(note) {
        location.href = mailHref;
        say('info', note + ' Your email app should now open with your message ready. Press send there to deliver it. If nothing opens, email ' + CONFIG.toEmail + ' or call ' + CONFIG.phone + '.');
      }
      /* Opened as a local file (file://): the form service cannot receive it, so use the email app. */
      if (CONFIG.formEndpoint && location.protocol !== 'file:') {
        submit.disabled = true;
        var hp = $('[name="_honey"]', f);
        if (hp && hp.value) { say('ok', 'Thank you!'); submit.disabled = false; return; }
        var data = new FormData(f);
        data.delete('_honey');
        data.append('_subject', (f.dataset.subject || 'Website enquiry') + ' - Fountain Gate website');
        fetch(CONFIG.formEndpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: data })
          .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
          .then(function (x) {
            if (!x.ok || x.d.errors) throw new Error('rejected');
            f.reset();
            say('ok', 'Thank you! Your message has been sent to the school. We will reply as soon as we can.');
          })
          .catch(function () { viaEmailApp('We could not send your message directly.'); })
          .then(function () { submit.disabled = false; });
        return;
      }
      viaEmailApp(location.protocol === 'file:' ? 'This page is open from a file on your computer, so direct sending is switched off.' : '');
    });
  });
})();
