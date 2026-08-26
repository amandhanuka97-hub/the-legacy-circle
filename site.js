// The Legacy Circle · shared page script (Library pages)

// Scroll reveal (respects reduced motion)
(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = document.querySelectorAll('.reveal');
  if (prefersReduced || !('IntersectionObserver' in window)) {
    els.forEach(e => e.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(e => io.observe(e));
  }
})();

// Supabase insert helper (config in /config.js; degrades gracefully until keys are pasted)
async function tlcInsert(table, row){
  const c = window.TLC_CONFIG || {};
  if (!c.SUPABASE_URL || !c.SUPABASE_ANON_KEY) return { ok:true, offline:true };
  try{
    const r = await fetch(c.SUPABASE_URL + '/rest/v1/' + table, {
      method:'POST',
      headers:{
        'apikey': c.SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + c.SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(row)
    });
    return { ok: r.ok || r.status === 409 }; // 409 = already subscribed, treat as success
  }catch(e){ return { ok:false }; }
}

// Legacy Letters subscribe (any element carrying data-sub-form)
document.querySelectorAll('[data-sub-form]').forEach(formEl => {
  const input = formEl.querySelector('input');
  const btn = formEl.querySelector('button');
  const msg = formEl.parentElement.querySelector('.sub-msg');
  btn.addEventListener('click', async () => {
    const email = (input.value || '').trim().toLowerCase();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    input.classList.toggle('err', !valid);
    if (!valid) return;
    btn.disabled = true; btn.textContent = 'Joining…';
    const res = await tlcInsert('subscribers', { email, source: 'library' });
    if (!res.ok){
      btn.disabled = false; btn.textContent = 'Subscribe';
      alert('Could not subscribe just now. Please try again, or write to info@thelegacycircle.in.');
      return;
    }
    formEl.style.display = 'none';
    if (msg) msg.hidden = false;
  });
});
