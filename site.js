// Shared parts of every page: top bar, menu, footer and the Data Privacy Notice window.
// Change the school name, phone, email or address HERE and it updates on all pages.
(() => {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const PHONE = '0917-144-5973', TEL = '09171445973', EMAIL = 'valencianationalshs@gmail.com',
  ADDRESS = 'Lapu-Lapu St., Poblacion, Valencia City, Bukidnon, 8709', SCHOOL = 'Valencia National High School - Senior High School';
document.documentElement.classList.add('js');

const TOP = `<div class="top"><div>
  <span><a href="tel:${TEL}">${PHONE}</a> &nbsp;|&nbsp; <a href="mailto:${EMAIL}">${EMAIL}</a></span>
  <span>${SCHOOL}</span>
</div></div>
<nav><div>
  <a class="brand" href="./"><img src="logo.png" alt="" width="42" height="42" decoding="async" onerror="this.remove()"><span>VNHS-SHS REGISTRAR</span></a>
  <ul>
    <li><a href="./">Home</a></li>
    <li><a href="request.html">Request a Form</a></li>
    <li><a href="track.html">Track Request</a></li>
    <li><a href="request.html#requirements">Requirements</a></li>
    <li><a href="./#faq">FAQs</a></li>
    <li><a href="#contact">Contact Us</a></li>
  </ul>
  <button class="burger" type="button" aria-label="Menu" aria-expanded="false"><span></span></button>
</div></nav>`;

const FOOT = `<footer class="foot" id="contact">
  <div class="fgrid">
    <div><strong>VNHS-SHS REGISTRAR</strong><p>${SCHOOL}<br>${ADDRESS}</p></div>
    <div><h4>Get in touch</h4><p><a href="tel:${TEL}">${PHONE}</a><br><a href="mailto:${EMAIL}">${EMAIL}</a></p></div>
    <div><h4>Quick links</h4>
      <ul><li><a href="request.html">Request a Form</a></li><li><a href="track.html">Track a Request</a></li><li><a href="request.html#requirements">Requirements</a></li><li><a href="./#faq">FAQs</a></li></ul></div>
  </div>
  <div class="copy">&copy; <span id="yr"></span> ${SCHOOL}. All rights reserved. &nbsp;&middot;&nbsp; <a class="pread" href="#">Data Privacy Notice</a></div>
</footer>`;

const PRIVACY = `<div class="ov" id="pov"><div class="dlg pdlg" role="dialog" aria-modal="true" aria-labelledby="pt">
  <button class="x" type="button" id="px" aria-label="Close">&times;</button>
  <small>Valencia National High School - Senior High School</small>
  <h3 id="pt">Data Privacy Notice</h3>
  <p class="phint">Please read the notice below. The I Agree button turns on when you reach the end.</p>
  <div id="pbody" tabindex="0">
    <h4>1. Who we are</h4>
    <p>This notice is issued by Valencia National High School - Senior High School, through the VNHS-SHS Registrar (&ldquo;the School&rdquo;), which operates this online request form.</p>
    <h4>2. What information we collect</h4>
    <p>To process your request, we collect the learner&rsquo;s full name; Learner Reference Number (LRN); track or cluster, grade level, section, adviser, and school year; your mobile number and email address; whether the learner or a representative is making the request, and the representative&rsquo;s name and relationship with the learner, if any; and the document requested, its purpose, and how it will be claimed. The system also records the date and time of the request and gives it a reference number.</p>
    <h4>3. Why we collect it</h4>
    <ul><li>To process the request for an SF10/Form 137A, a certification, or a second issuance of diploma.</li><li>To check the learner&rsquo;s identity against school records.</li><li>To contact you about the request.</li><li>To let you track the status of the request.</li><li>To prepare the document for claiming.</li></ul>
    <h4>4. Legal basis</h4>
    <p>We process your information based on your consent, which you give by ticking the box on the form, and because the School needs it to carry out its work of keeping and releasing learner records.</p>
    <h4>5. Who can see it</h4>
    <p>Only authorized staff of the VNHS-SHS Registrar can see the full request details. Anyone who has your reference number can see only the status, the type of request, and any note posted for you. This form uses Google services (Google Sheets, Gmail, and Google Apps Script) to store the request and send notifications, so the information is processed on Google&rsquo;s systems on behalf of the School. We do not sell your information or use it for marketing. We share it with others only when required by law or by DepEd regulations.</p>
    <h4>6. How long we keep it</h4>
    <p>The personal details in the request record are erased or made anonymous about 30 days after the document is released, or after 180 days if the request is never completed. When a document is released, the VNHS-SHS Registrar keeps a short release record (the learner&rsquo;s name, LRN, grade level, track or cluster, school year, the document released, its purpose, the date it was released, and who claimed it) as proof that the document was issued. This release record is kept in line with the School&rsquo;s records policy. Anonymous information, such as the number of requests received, may be kept for reports. Emails sent to you or to the VNHS-SHS Registrar may remain in those mailboxes until their owners delete them.</p>
    <h4>7. How we protect it</h4>
    <p>We take reasonable steps to protect your information, such as limiting access to authorized staff and showing only limited information on the tracking page. No online system is completely risk-free, so please keep your reference number private.</p>
    <h4>8. Your rights</h4>
    <p>Under the Data Privacy Act of 2012 (RA 10173), you have the right to be informed about how your data is used; to access your data; to object to its processing; to correct inaccurate data; to request that it be erased or blocked; to data portability; to be compensated for damages; and to file a complaint with the National Privacy Commission (privacy.gov.ph).</p>
    <h4>9. Withdrawing consent and inquiries</h4>
    <p>You may withdraw your consent or ask about your information by contacting the VNHS-SHS Registrar at 0917-144-5973 or valencianationalshs@gmail.com. If you withdraw your consent, we may no longer be able to process your request.</p>
    <h4>10. Your certification</h4>
    <p>By ticking the box and clicking &ldquo;I Agree,&rdquo; you certify that the information you provided is true and correct, and you consent to its collection and use for processing this request as described in this notice.</p>
  </div>
  <div class="dact"><button class="btn ghost" type="button" id="pdecline">Decline</button><button class="btn" type="button" id="pagree" disabled>I Agree</button></div>
</div></div>`;

// The top bar and menu are written exactly where this script sits, so the page never jumps
document.currentScript.insertAdjacentHTML('beforebegin', TOP);

// Data Privacy Notice window. Other pages call Site.privacy(true) to ask for agreement; the footer link opens it read-only.
const privacy = (on, read) => {
  const pov = $('#pov'), pb = $('#pbody'); if (!pov) return;
  pov.classList.toggle('open', on); document.body.style.overflow = on ? 'hidden' : '';
  if (!on) return;
  $('#pagree').hidden = $('#pov .phint').hidden = !!read; $('#pdecline').textContent = read ? 'Close' : 'Decline';
  pb.scrollTop = 0; atEnd(); pb.focus();
};
const atEnd = () => { const pb = $('#pbody'); $('#pagree').disabled = pb.scrollHeight - pb.scrollTop - pb.clientHeight > 12; };
window.Site = {privacy};

document.addEventListener('DOMContentLoaded', () => {
  document.body.insertAdjacentHTML('beforeend', FOOT + PRIVACY);
  $('#yr').textContent = new Date().getFullYear();

  // highlight the current page in the menu
  const mark = () => {
    const here = (location.pathname.split('/').pop() || 'index').replace('.html', ''), h = location.hash.slice(1);
    $$('nav li a').forEach(a => {
      const [file, hash] = a.getAttribute('href').split('#'), f = file.replace('.html', '').replace(/^\.\/?$/, 'index');
      a.classList.toggle('on', hash ? h == hash && (!f || f == here) : f == here && !['faq', 'requirements'].includes(h));
    });
  };
  mark(); addEventListener('hashchange', mark);

  // phone menu
  const nav = $('nav'), burger = $('.burger');
  const menu = o => { nav.classList.toggle('menu-open', o); burger.setAttribute('aria-expanded', o); };
  burger.addEventListener('click', () => menu(!nav.classList.contains('menu-open')));
  $$('nav li a').forEach(a => a.addEventListener('click', () => menu(false)));
  document.addEventListener('click', e => { if (!e.target.closest('nav')) menu(false); });

  // scroll reveal
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } }), {threshold: .1});
  $$('.rv').forEach(el => io.observe(el));

  // privacy window buttons
  const pov = $('#pov');
  $('#pbody').addEventListener('scroll', atEnd);
  $('#pagree').onclick = () => { privacy(false); document.dispatchEvent(new Event('privacy-agree')); };
  $('#pdecline').onclick = $('#px').onclick = () => privacy(false);
  pov.addEventListener('click', e => { if (e.target == pov) privacy(false); });
  document.addEventListener('keydown', e => { if (e.key == 'Escape') privacy(false); });
  $$('.pread').forEach(a => a.addEventListener('click', e => { e.preventDefault(); privacy(true, true); }));
});
})();
