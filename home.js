(() => {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
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

document.addEventListener('keydown', e => { if (e.key == 'Escape') faq(false); });
})();
