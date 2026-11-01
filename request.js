(() => {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const ENDPOINT = window.REGISTRAR_ENDPOINT || '';           // set once in config.js
const useGoogle = ENDPOINT.startsWith('https://script.google.com/');
const form = $('#f'), esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// "JUAN" or "dela cruz" becomes "Juan" / "Dela Cruz"; mixed capitals are left alone
const tidy = t => { t = (t || '').trim().replace(/\s+/g, ' '); return (t === t.toUpperCase() || t === t.toLowerCase()) ? t.toLowerCase().replace(/(^|[\s-])([a-z])/g, (m, a, c) => a + c.toUpperCase()) : t; };
$$('[inputmode=numeric]').forEach(i => i.addEventListener('input', () => { if (i.name != 'School Year') i.value = i.value.replace(/\D/g, ''); }));

// A document chosen on the home page arrives as ?doc=sf10, ?doc=cert or ?doc=diploma
const DOCS = {sf10: 'SF10/Form 137A (Permanent Record)', cert: 'Certification', diploma: 'Second Issuance of Diploma'};
const pick = DOCS[new URLSearchParams(location.search).get('doc')];
const chosen = pick && $$('input[name="Request For"]').find(i => i.value == pick);
if (chosen) chosen.checked = true;

// ===== School year: free typing, with a prompt when only one year is entered =====
const sy = form.elements['School Year'], syh = $('#syh');
const note = (html, bad) => { syh.className = 'syh' + (bad ? ' bad' : ''); syh.innerHTML = html; };
const SHS_START = 2016, startMsg = 'Senior High School started in 2016, so the earliest school year is 2016-2017.';
function checkSY(final) {
  const v = sy.value.trim(); sy.setCustomValidity('');
  if (!v) return note('');
  let m = v.match(/^(\d{4})\s*[-\u2013\/ ]\s*(\d{4})$/);
  if (m) {
    const a = +m[1], b = +m[2];
    if (b == a + 1 && a < SHS_START) { sy.setCustomValidity(startMsg); return note(startMsg, true); }
    if (b == a + 1 && a <= 2100) { sy.value = a + '-' + b; return note(''); }
    sy.setCustomValidity('Use two consecutive years.'); return note('The two years must be consecutive, for example 2025-2026.', true);
  }
  m = v.match(/^(\d{4})$/);
  if (m) {
    sy.setCustomValidity('Choose a school year.');
    if (!final) return;
    const y = +m[1], opts = [[y - 1, y], [y, y + 1]].filter(p => p[0] >= SHS_START);
    if (!opts.length) { sy.setCustomValidity(startMsg); return note(startMsg, true); }
    return note(`Only one year entered. Did you mean:<div class="chips">${opts.map(p => `<button type="button" class="chip" data-v="${p[0]}-${p[1]}">${p[0]}-${p[1]}</button>`).join('')}</div>`);
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

// ===== Data privacy: ticking the box opens the notice (site.js); the box stays ticked only after "I Agree" =====
const cb = form.elements['Privacy Consent'];
let consent = false;
cb.addEventListener('change', () => { if (cb.checked && !consent) { cb.checked = false; Site.privacy(true); } else if (!cb.checked) consent = false; });
$$('.plink').forEach(a => a.addEventListener('click', e => { e.preventDefault(); Site.privacy(true); }));
document.addEventListener('privacy-agree', () => { consent = true; cb.checked = true; cb.dispatchEvent(new Event('input', {bubbles: true})); });

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
document.addEventListener('keydown', e => { if (e.key == 'Escape' && !$('#rv').hidden) show(false); });

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
$('#fin').onclick = () => { finish(); location.href = './'; };
$('#gotrack').onclick = () => { try { sessionStorage.setItem('ref', $('#ref').textContent); } catch (e) {} finish(); location.href = 'track.html'; };
form.addEventListener('reset', () => { consent = false; note(''); sy.setCustomValidity(''); setTimeout(sync); });

sync();
})();
