const SW = {
  async register(){
    if (!('serviceWorker' in navigator)) return;
    try{ await navigator.serviceWorker.register('./sw.js'); }catch(e){}
  }
};

const UI = {
  $(sel, root=document){ return root.querySelector(sel); },
  $all(sel, root=document){ return [...root.querySelectorAll(sel)]; },

  toast(title, message){
    const wrap = UI.$('#toast');
    if(!wrap) return;
    wrap.innerHTML = `
      <div class="bubble">
        <div>
          <b>${title}</b>
          <p>${message}</p>
        </div>
        <button class="btn small x" id="toastClose">إغلاق</button>
      </div>
    `;
    wrap.classList.remove('hidden');
    UI.$('#toastClose')?.addEventListener('click', ()=> wrap.classList.add('hidden'));
    setTimeout(()=> wrap.classList.add('hidden'), 6000);
  },

  openDrawer(){ UI.$('#drawer')?.classList.add('open'); },
  closeDrawer(){ UI.$('#drawer')?.classList.remove('open'); },

  openModal(){ UI.$('#assistantModal')?.classList.add('open'); },
  closeModal(){ UI.$('#assistantModal')?.classList.remove('open'); },

  setActiveNav(){
    const path = location.pathname.split('/').pop() || 'index.html';
    UI.$all('a[data-nav]').forEach(a=>{
      if(a.getAttribute('href') === path){
        a.style.borderColor = 'rgba(245,197,66,.35)';
        a.style.background = 'rgba(245,197,66,.10)';
        a.style.color = 'rgba(255,255,255,.95)';
      }
    });
  }
};

const Install = (() => {
  let deferred = null;

  function showBar(){
    const bar = UI.$('#installBar');
    if(!bar) return;
    bar.classList.remove('hidden');
    UI.$('#installBtn')?.addEventListener('click', async () => {
      if(!deferred){
        UI.toast('التثبيت', 'إذا ما ظهر زر التثبيت: من المتصفح اختر (إضافة إلى الشاشة الرئيسية).');
        return;
      }
      deferred.prompt();
      const choice = await deferred.userChoice;
      if(choice && choice.outcome === 'accepted'){
        UI.toast('تم', 'تمت إضافة STEPWISE إلى جهازك ✅');
      }
      deferred = null;
      bar.classList.add('hidden');
    });
    UI.$('#installClose')?.addEventListener('click', ()=> bar.classList.add('hidden'));
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    showBar();
  });

  window.addEventListener('appinstalled', () => {
    UI.toast('رائع', 'تم تثبيت STEPWISE كتطبيق ✅');
  });

  return { showBar };
})();

function bootCommon(){
  document.documentElement.lang = 'ar';
  document.documentElement.dir = 'rtl';

  UI.setActiveNav();

  // Drawer
  UI.$('#openDrawer')?.addEventListener('click', UI.openDrawer);
  UI.$('#closeDrawer')?.addEventListener('click', UI.closeDrawer);
  UI.$('#drawer')?.addEventListener('click', (e)=>{ if(e.target.id==='drawer') UI.closeDrawer(); });

  // Assistant
  UI.$('#assistantFab')?.addEventListener('click', UI.openModal);
  UI.$('#assistantClose')?.addEventListener('click', UI.closeModal);
  UI.$('#assistantModal')?.addEventListener('click', (e)=>{ if(e.target.id==='assistantModal') UI.closeModal(); });

  UI.$all('[data-go]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const href = btn.getAttribute('data-go');
      if(href) location.href = href;
    });
  });

  // Register SW
  SW.register();
}

document.addEventListener('DOMContentLoaded', bootCommon);