(() => {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
document.documentElement.classList.add('js');
const ENDPOINT = window.REGISTRAR_ENDPOINT || '';           // set once in config.js
const useGoogle = ENDPOINT.startsWith('https://script.google.com/');
const form = $('#f'), esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// "JUAN" or "dela cruz" becomes "Juan" / "Dela Cruz"; mixed capitals are left alone
const tidy = t => { t = (t || '').trim().replace(/\s+/g, ' '); return (t === t.toUpperCase() || t === t.toLowerCase()) ? t.toLowerCase().replace(/(^|[\s-])([a-z])/g, (m, a, c) => a + c.toUpperCase()) : t; };
$('#yr').textContent = new Date().getFullYear();
$$('[inputmode=numeric]').forEach(i => i.addEventListener('input', () => { if (i.name != 'School Year') i.value = i.value.replace(/\D/g, ''); }));

// Scroll reveal
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } }), {threshold: .1});
$$('.rv').forEach(el => io.observe(el));

// ===== Pages (Home, Request a Form, Track a Request) =====
const V = {home: $('#v-home'), request: $('#v-request'), track: $('#v-track')};
let cur = 'home';
function route() {
  const id = (location.hash || '#home').slice(1);
  const view = id == 'request' || id == 'requirements' ? 'request' : id == 'track' ? 'track' : id == 'contact' ? cur : 'home';
  const changed = view != cur; cur = view;
  Object.keys(V).forEach(k => V[k].hidden = k != view);          // showing a page replays its fade-in
  $$('nav li a').forEach(a => a.classList.toggle('on', a.hash == '#' + id));
  const target = ['requirements', 'faq', 'contact'].includes(id) ? document.getElementById(id) : null;
  requestAnimationFrame(() => target ? target.scrollIntoView({behavior: changed ? 'instant' : 'smooth', block: 'start'}) : scrollTo({top: 0, behavior: changed ? 'instant' : 'smooth'}));
}
addEventListener('hashchange', route); route();

// Document cards on the home page pre-select the document
$$('[data-doc]').forEach(a => a.addEventListener('click', () => {
  const r = $$('input[name="Request For"]').find(i => i.value == a.dataset.doc);
  if (r) { r.checked = true; r.dispatchEvent(new Event('change', {bubbles: true})); }
}));

// Phone menu
const nav = $('nav'), burger = $('.burger');
const menu = o => { nav.classList.toggle('menu-open', o); burger.setAttribute('aria-expanded', o); };
burger.addEventListener('click', () => menu(!nav.classList.contains('menu-open')));
$$('nav li a').forEach(a => a.addEventListener('click', () => menu(false)));
document.addEventListener('click', e => { if (!e.target.closest('nav')) menu(false); });

// ===== School year: free typing, with a prompt when only one year is entered =====
const sy = form.elements['School Year'], syh = $('#syh');
const note = (html, bad) => { syh.className = 'syh' + (bad ? ' bad' : ''); syh.innerHTML = html; };
function checkSY(final) {
  const v = sy.value.trim(); sy.setCustomValidity('');
  if (!v) return note('');
  let m = v.match(/^(\d{4})\s*[-\u2013\/ ]\s*(\d{4})$/);
  if (m) {
    const a = +m[1], b = +m[2];
    if (b == a + 1 && a >= 1990 && a <= 2100) { sy.value = a + '-' + b; return note(''); }
    sy.setCustomValidity('Use two consecutive years.'); return note('The two years must be consecutive, for example 2025-2026.', true);
  }
  m = v.match(/^(\d{4})$/);
  if (m) {
    sy.setCustomValidity('Choose a school year.');
    if (!final) return;
    const y = +m[1];
    return note(`Only one year entered. Did you mean:<div class="chips"><button type="button" class="chip" data-v="${y - 1}-${y}">${y - 1}-${y}</button><button type="button" class="chip" data-v="${y}-${y + 1}">${y}-${y + 1}</button></div>`);
  }
  if (final) { sy.setCustomValidity('Enter a school year like 2025-2026.'); note('Enter a school year like 2025-2026.', true); }
}
sy.addEventListener('input', () => { sy.value = sy.value.replace(/[^\d\-\u2013\/ ]/g, ''); note(''); checkSY(false); });
sy.addEventListener('change', () => checkSY(true));
syh.addEventListener('click', e => {
  const c = e.target.closest('.chip'); if (!c) return;
  sy.value = c.dataset.v; checkSY(true); sy.dispatchEvent(new Event('input', {bubbles: true}));
});

// ===== Progress bar + conditional fields =====
const toggle = (box, on) => { box.classList.toggle('show', on); box.querySelectorAll('input,select').forEach(i => { i.disabled = !on; i.required = on; }); };
function sync() {
  const v = n => form.elements[n].value;
  toggle($('#m-cert'), v('Request For') == 'Certification');
  toggle($('#m-dip'), v('Request For') == 'Second Issuance of Diploma');
  toggle($('#m-oth'), v('Purpose') == 'Others');
  toggle($('#m-rep'), v('Requester') == 'A Representative');
  toggle($('#m-claim'), !!v('Claim Method') && v('Claim Method') != 'Pick up in person');
  const names = [...new Set($$('#f [required]').filter(e => !e.disabled).map(e => e.name))];
  const done = names.filter(n => { const e = form.elements[n]; return e.type == 'checkbox' ? e.checked : !!e.value; }).length;
  const p = Math.round(done / names.length * 100);
  $('#bar').style.width = p + '%'; $('#pc').textContent = p + '% complete';
}
form.addEventListener('input', sync); form.addEventListener('change', sync);

// ===== FAQ pop-out window =====
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

// ===== Data privacy notice window (opens when the box is ticked, or read-only from the footer) =====
const pov = $('#pov'), pb = $('#pbody'), cb = form.elements['Privacy Consent'];
let consent = false;
const atEnd = () => { $('#pagree').disabled = pb.scrollHeight - pb.scrollTop - pb.clientHeight > 12; };
const privacy = (on, read) => {
  pov.classList.toggle('open', on); document.body.style.overflow = on ? 'hidden' : '';
  if (!on) return;
  $('#pagree').hidden = $('#pov .phint').hidden = !!read; $('#pdecline').textContent = read ? 'Close' : 'Decline';
  pb.scrollTop = 0; atEnd(); pb.focus();
};
pb.addEventListener('scroll', atEnd);
cb.addEventListener('change', () => { if (cb.checked && !consent) { cb.checked = false; privacy(true); } else if (!cb.checked) consent = false; });
$$('.plink').forEach(a => a.addEventListener('click', e => { e.preventDefault(); privacy(true); }));
$$('.pread').forEach(a => a.addEventListener('click', e => { e.preventDefault(); privacy(true, true); }));
$('#pagree').onclick = () => { consent = true; cb.checked = true; privacy(false); cb.dispatchEvent(new Event('input', {bubbles: true})); };
$('#pdecline').onclick = $('#px').onclick = () => privacy(false);
pov.addEventListener('click', e => { if (e.target == pov) privacy(false); });

// ===== Review window =====
const ov = $('#ov');
const show = on => { ov.classList.toggle('open', on); document.body.style.overflow = on ? 'hidden' : ''; if (on) $('#ok').focus(); };
form.addEventListener('submit', e => {
  e.preventDefault(); form.classList.add('tried'); checkSY(true);
  if (!form.reportValidity()) return;
  $('#rl').innerHTML = [...new FormData(form)].filter(([k, v]) => k != 'Website' && v !== '')
    .map(([k, v]) => `<div><dt>${k == 'email' ? 'Email' : esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  $('#em').textContent = ''; $('#rv').hidden = false; $('#done').hidden = true; show(true);
});
$('#back').onclick = () => show(false);
ov.addEventListener('click', e => { if (e.target == ov && !$('#rv').hidden) show(false); });
document.addEventListener('keydown', e => { if (e.key == 'Escape') { faq(false); privacy(false); if (!$('#rv').hidden) show(false); } });

// ===== Send =====
$('#ok').onclick = async () => {
  const b = $('#ok'); $('#em').textContent = '';
  if (!useGoogle) { $('#em').textContent = "The registrar's system is not connected yet. Please try again later."; return; }
  const data = Object.fromEntries(new FormData(form));
  const fn = tidy(data['First Name']), mn = tidy(data['Middle Name']), ln = tidy(data['Last Name']);
  data['Learner Name'] = ln + ', ' + fn + (mn ? ' ' + mn : '');       // one column in the sheet: "Dela Cruz, Juan Santos"
  ['First Name', 'Middle Name', 'Last Name'].forEach(k => delete data[k]);
  Object.keys(data).forEach(k => data[k] === '' && delete data[k]);
  b.disabled = true; b.classList.add('load');
  try {
    const j = await (await fetch(ENDPOINT, {method: 'POST', body: JSON.stringify(data)})).json();
    if (!j.success || !j.ref) throw new Error(j.message || 'Submission failed');
    $('#ref').textContent = j.ref; $('#rv').hidden = true; $('#done').hidden = false;
  } catch (err) { $('#em').textContent = 'Could not send your request: ' + err.message + '. Please try again.'; }
  b.disabled = false; b.classList.remove('load');
};
const finish = () => { show(false); form.reset(); form.classList.remove('tried'); $('#copy').textContent = 'Copy reference no.'; };
$('#copy').onclick = () => { navigator.clipboard && navigator.clipboard.writeText($('#ref').textContent); $('#copy').textContent = 'Copied!'; };
$('#fin').onclick = () => { finish(); location.hash = '#home'; };
$('#gotrack').onclick = () => { $('#tref').value = $('#ref').textContent; finish(); location.hash = '#track'; };
form.addEventListener('reset', () => { consent = false; note(''); sy.setCustomValidity(''); setTimeout(sync); });

// ===== Request tracking =====
function renderTrack(j) {
  const st = j.status == 'Needs documents' ? 'On Hold' : j.status, hold = st == 'On Hold';
  // "On Hold" only appears in the timeline when the sheet says the request is on hold
  const steps = hold ? ['Received', 'Processing', 'On Hold', 'Ready for pick-up', 'Released'] : ['Received', 'Processing', 'Ready for pick-up', 'Released'];
  const idx = Math.max(0, steps.indexOf(st));
  $('#tres').innerHTML = `<div class="tl">${steps.map((s, k) => `<div><i>${k + 1}</i>${s}</div>`).join('')}</div>` +
    (hold ? '<p class="tmsg" style="background:#fff8e1;color:#7a5200">Your request is on hold because the VNHS-SHS Registrar needs requirements from you. Please read the note below and contact the office at 0917-144-5973 or valencianationalshs@gmail.com.</p>' : '') +
    `<div class="tinfo"><div><small>Request</small><b>${esc(j.type || '-')}</b></div><div><small>Status</small><b>${esc(st)}</b></div>
    <div><small>Last updated</small><b>${esc(j.updated || '-')}</b></div>${j.note ? `<div><small>Note from the registrar</small><b>${esc(j.note)}</b></div>` : ''}</div>`;
  $$('#tres .tl div').forEach((el, k) => { if (k <= idx) setTimeout(() => { el.classList.add('on'); if (k == idx) el.classList.add(hold ? 'warn' : 'now'); }, 250 * k + 150); });
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
$('#tref').addEventListener('input', e => { const t = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8); e.target.value = t.length > 4 ? t.slice(0, 4) + '-' + t.slice(4) : t; });
sync();
})();
