(() => {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
document.documentElement.classList.add('js');
// Paste your Google Apps Script Web app URL here to turn on the styled emails and request tracking
const ENDPOINT = 'PASTE_YOUR_WEB_APP_URL_HERE';
const useGoogle = !ENDPOINT.includes('PASTE_');
const form = $('#f'), esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today = new Date(); today.setHours(0, 0, 0, 0); const Y = today.getFullYear();

// Dropdown years: school year 2026-2027 to 2034-2035 (change 2034 to extend)
for (let y = 2026; y <= 2034; y++) $('#sy').add(new Option(`${y}-${y + 1}`, `${y}-${y + 1}`));
for (let y = Y + 2; y >= Y - 15; y--) $('#gy').add(new Option(y, y));
$('#yr').textContent = Y;

$$('[inputmode=numeric]').forEach(i => i.addEventListener('input', () => i.value = i.value.replace(/\D/g, '')));
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold: .1});
$$('.rv').forEach(el => io.observe(el));

// Copies stepper (1 to 5)
$$('.stepper button').forEach(b => b.addEventListener('click', () => {
  const i = b.parentElement.querySelector('input'); i.value = Math.min(5, Math.max(1, +i.value + +b.dataset.s));
}));

// Progress bar + conditional fields
const toggle = (box, on) => { box.classList.toggle('show', on); box.querySelectorAll('input,select').forEach(i => { i.disabled = !on; i.required = on; }); };
function sync() {
  const v = n => form.elements[n].value;
  toggle($('#m-cert'), v('Request For') === 'Certification');
  toggle($('#m-oth'), v('Purpose') === 'Others');
  toggle($('#m-rep'), v('Requester') === 'A representative');
  toggle($('#m-claim'), !!v('Claim Method') && v('Claim Method') !== 'Pick up in person');
  const names = [...new Set($$('#f [required]').filter(e => !e.disabled).map(e => e.name))];
  const done = names.filter(n => { const e = form.elements[n]; return e.type === 'checkbox' ? e.checked : !!e.value; }).length;
  const p = Math.round(done / names.length * 100);
  $('#bar').style.width = p + '%'; $('#pc').textContent = p + '% complete';
}
form.addEventListener('input', sync); form.addEventListener('change', sync);

// Calendars (request date, birthdate, claim date)
const MS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CFG = {
  request: {from: Y, to: Y + 1, min: today, start: Y},
  claim: {from: Y, to: Y + 1, min: today, start: Y},
  birth: {from: Y - 40, to: Y - 10, max: today, start: Y - 17, desc: true, noToday: true}
};
const pickers = [];
function picker(root, o) {
  const i = root.querySelector('input'), c = root.querySelector('.cal'), er = root.querySelector('.err');
  const p = {i, c, er, v: null, y: o.start, m: today.getMonth(), req: root.hasAttribute('data-req')};
  const draw = () => {
    const {y, m} = p, first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate(), ys = [];
    for (let t = o.from; t <= o.to; t++) ys.push(t); if (o.desc) ys.reverse();
    let h = `<div class="ch"><button type="button" data-n="-1" aria-label="Previous month">&lsaquo;</button>
    <select data-k="m" aria-label="Month">${MS.map((n, k) => `<option value="${k}"${k == m ? ' selected' : ''}>${n}</option>`).join('')}</select>
    <select data-k="y" aria-label="Year">${ys.map(t => `<option${t == y ? ' selected' : ''}>${t}</option>`).join('')}</select>
    <button type="button" data-n="1" aria-label="Next month">&rsaquo;</button></div><div class="cg">` +
      ['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => `<span class="w">${d}</span>`).join('') + '<span></span>'.repeat(first);
    for (let d = 1; d <= days; d++) {
      const dt = new Date(y, m, d), k = ['d'], off = (o.min && dt < o.min) || (o.max && dt > o.max);
      if (+dt == +today) k.push('today'); if (p.v && +dt == +p.v) k.push('sel');
      h += `<button type="button" class="${k.join(' ')}" data-d="${d}"${off ? ' disabled' : ''}>${d}</button>`;
    }
    c.innerHTML = h + `</div><div class="cf">${o.noToday ? '<span></span>' : '<button type="button" data-a="today">Today</button>'}<button type="button" data-a="clear">Clear</button></div>`;
  };
  const pick = d => {
    p.v = d; i.value = d ? d.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'}) : '';
    er.textContent = ''; c.classList.remove('open'); i.dispatchEvent(new Event('input', {bubbles: true}));
  };
  const open = () => {
    $$('.cal.open').forEach(x => x.classList.remove('open'));
    const b = p.v || new Date(o.start, today.getMonth(), 1); p.y = b.getFullYear(); p.m = b.getMonth(); draw(); c.classList.add('open');
  };
  i.addEventListener('click', open);
  i.addEventListener('keydown', e => { if (e.key == 'Enter' || e.key == ' ') { e.preventDefault(); open(); } });
  c.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.n) {
      p.m += +t.dataset.n; if (p.m < 0) { p.m = 11; p.y--; } if (p.m > 11) { p.m = 0; p.y++; }
      p.y = Math.min(Math.max(p.y, o.from), o.to); draw();
    } else if (t.dataset.d) pick(new Date(p.y, p.m, +t.dataset.d));
    else if (t.dataset.a == 'today') pick(new Date(today));
    else if (t.dataset.a == 'clear') pick(null);
  });
  c.addEventListener('change', () => { p.m = +c.querySelector('[data-k=m]').value; p.y = +c.querySelector('[data-k=y]').value; draw(); });
  pickers.push(p);
}
$$('.dp').forEach(r => picker(r, CFG[r.dataset.dp]));
document.addEventListener('click', e => {
  const path = e.composedPath(); // keeps the calendar open when a button inside it re-draws the grid
  $$('.cal.open').forEach(c => { if (!path.includes(c.parentElement)) c.classList.remove('open'); });
});

// FAQ pop-out window
const fov = $('#fov');
const faq = on => { fov.classList.toggle('open', on); document.body.style.overflow = on ? 'hidden' : ''; if (on) $('#fclose').focus(); };
$$('.fq').forEach((b, i, all) => b.addEventListener('click', () => {
  $('#fqn').textContent = `Question ${i + 1} of ${all.length}`;
  $('#fqt').textContent = b.querySelector('span').textContent;
  $('#fqa').innerHTML = b.nextElementSibling.innerHTML;
  faq(true);
}));
$('#fclose').onclick = $('#fx').onclick = () => faq(false);
fov.addEventListener('click', e => { if (e.target == fov) faq(false); });

// Review window
const ov = $('#ov');
const show = on => { ov.classList.toggle('open', on); document.body.style.overflow = on ? 'hidden' : ''; if (on) $('#ok').focus(); };
form.addEventListener('submit', e => {
  e.preventDefault(); form.classList.add('tried');
  if (!form.reportValidity()) return;
  const miss = pickers.filter(p => p.req && !p.i.value);
  if (miss.length) { miss.forEach(p => p.er.textContent = 'Please select a date.'); miss[0].i.scrollIntoView({block: 'center'}); return; }
  $('#rl').innerHTML = [...new FormData(form)].filter(([k, v]) => k != 'access_key' && k != 'subject' && v !== '')
    .map(([k, v]) => `<div><dt>${k == 'email' ? 'Email' : esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  $('#em').textContent = ''; $('#rv').hidden = false; $('#done').hidden = true; show(true);
});
$('#back').onclick = () => show(false);
ov.addEventListener('click', e => { if (e.target == ov && !$('#rv').hidden) show(false); });
document.addEventListener('keydown', e => { if (e.key == 'Escape') { $$('.cal.open').forEach(c => c.classList.remove('open')); faq(false); if (!$('#rv').hidden) show(false); } });

$('#ok').onclick = async () => {
  const b = $('#ok'), fd = new FormData(form);
  const rnd = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
  const ref = 'VNHS-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + rnd;
  fd.append('Reference No', ref); b.disabled = true; b.classList.add('load'); $('#em').textContent = '';
  try {
    let r;
    if (!useGoogle) r = await fetch(form.action, {method: 'POST', body: fd, headers: {Accept: 'application/json'}});
    else {
      const data = Object.fromEntries(fd); ['access_key', 'subject'].forEach(k => delete data[k]);
      Object.keys(data).forEach(k => data[k] === '' && delete data[k]);
      r = await fetch(ENDPOINT, {method: 'POST', body: JSON.stringify(data)});
    }
    const j = await r.json(); if (!j.success) throw new Error(j.message || 'Submission failed');
    $('#ref').textContent = ref; $('#rv').hidden = true; $('#done').hidden = false;
  } catch (err) { $('#em').textContent = 'Could not send your request: ' + err.message + '. Please try again.'; }
  b.disabled = false; b.classList.remove('load');
};
const finish = () => { show(false); form.reset(); form.classList.remove('tried'); $('#copy').textContent = 'Copy reference no.'; };
$('#copy').onclick = () => { navigator.clipboard && navigator.clipboard.writeText($('#ref').textContent); $('#copy').textContent = 'Copied!'; };
$('#fin').onclick = () => { finish(); scrollTo({top: 0, behavior: 'smooth'}); };
$('#gotrack').onclick = () => { $('#tref').value = $('#ref').textContent; finish(); $('#track').scrollIntoView({behavior: 'smooth'}); };
form.addEventListener('reset', () => { pickers.forEach(p => p.v = null); setTimeout(sync); });

// Request tracking
const STEPS = ['Received', 'Processing', 'Ready for pick-up', 'Released'];
function renderTrack(j) {
  const idx = {'Received': 0, 'Processing': 1, 'Needs documents': 1, 'Ready for pick-up': 2, 'Released': 3}[j.status] ?? 0, warn = j.status == 'Needs documents';
  $('#tres').innerHTML = `<div class="tl">${STEPS.map((s, k) => `<div><i>${k + 1}</i>${s}</div>`).join('')}</div>` +
    (warn ? '<p class="tmsg" style="background:#fff8e1;color:#7a5200">Additional documents are needed. Please read the note from the registrar below.</p>' : '') +
    `<div class="tinfo"><div><small>Request</small><b>${esc(j.type || '-')}</b></div><div><small>Status</small><b>${esc(j.status)}</b></div>
    <div><small>Last updated</small><b>${esc(j.updated || '-')}</b></div>${j.note ? `<div><small>Note from the registrar</small><b>${esc(j.note)}</b></div>` : ''}</div>`;
  $$('#tres .tl div').forEach((el, k) => { if (k <= idx) setTimeout(() => { el.classList.add('on'); if (k == idx) el.classList.add(warn ? 'warn' : 'now'); }, 250 * k + 150); });
}
$('#trk').addEventListener('submit', async e => {
  e.preventDefault();
  const ref = $('#tref').value.trim().toUpperCase(), out = $('#tres'), b = $('#trk button');
  if (!useGoogle) { out.innerHTML = '<p class="tmsg">Tracking is not available yet. It turns on once the registrar connects the Google Sheet.</p>'; return; }
  b.disabled = true; b.classList.add('load');
  try {
    const j = await (await fetch(ENDPOINT + '?ref=' + encodeURIComponent(ref))).json();
    if (j.found) renderTrack(j); else out.innerHTML = `<p class="tmsg">No request found for <b>${esc(ref)}</b>. Please check the reference number.</p>`;
  } catch (err) { out.innerHTML = '<p class="tmsg bad">Could not check the status. Please try again.</p>'; }
  b.disabled = false; b.classList.remove('load');
});
sync();
})();
