(() => {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const ENDPOINT = window.REGISTRAR_ENDPOINT || '';           // set once in config.js
const useGoogle = ENDPOINT.startsWith('https://script.google.com/');
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// ===== Request tracking =====
function renderTrack(j) {
  const st = ({'Needs documents': 'On Hold', 'Ready for pick-up': 'Ready to Claim'})[j.status] || j.status, hold = st == 'On Hold';
  // "On Hold" only appears in the timeline when the sheet says the request is on hold
  const steps = hold ? ['Received', 'Processing', 'On Hold', 'Ready to Claim', 'Released'] : ['Received', 'Processing', 'Ready to Claim', 'Released'];
  const idx = Math.max(0, steps.indexOf(st));
  const msg = hold ? '<p class="tmsg" style="background:#fff8e1;color:#7a5200">Your request is on hold because the VNHS-SHS Registrar needs requirements from you. Please read the note below and contact the office at 0917-144-5973 or valencianationalshs@gmail.com.</p>'
    : st == 'Ready to Claim' ? '<p class="tmsg" style="background:#e6f7ee;color:#0b5b2b">Your document is ready to claim at the VNHS-SHS Registrar. Please bring a valid ID.</p>' : '';
  $('#tres').innerHTML = `<div class="tl">${steps.map((x, k) => `<div><i>${k + 1}</i>${x}</div>`).join('')}</div>${msg}` +
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
// Arriving from the success window: look the request up straight away
try { const r = sessionStorage.getItem('ref'); if (r) { sessionStorage.removeItem('ref'); $('#tref').value = r; $('#trk').requestSubmit(); } } catch (e) {}
})();
