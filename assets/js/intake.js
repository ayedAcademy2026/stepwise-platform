const Intake = (() => {
  const KEY = 'stepwise_profile_v1';

  function load(){
    try{ return JSON.parse(localStorage.getItem(KEY)||'null') }catch(e){ return null; }
  }
  function save(p){
    localStorage.setItem(KEY, JSON.stringify(p));
  }

  function bind(){
    const form = UI.$('#intakeForm');
    if(!form) return;
    const prev = load();
    if(prev){
      for(const [k,v] of Object.entries(prev)){
        const el = UI.$(`[name="${k}"]`);
        if(el){
          if(el.type==='radio'){
            UI.$(`[name="${k}"][value="${v}"]`)?.setAttribute('checked','checked');
          } else {
            el.value = v ?? '';
          }
        }
      }
      toggleRetake(prev.retake === 'yes');
    }

    const retakeYes = UI.$('input[name="retake"][value="yes"]');
    const retakeNo  = UI.$('input[name="retake"][value="no"]');
    retakeYes?.addEventListener('change', ()=> toggleRetake(true));
    retakeNo?.addEventListener('change', ()=> toggleRetake(false));

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if(!data.fullName || data.fullName.trim().length < 2){
        UI.toast('تنبيه', 'اكتب اسمك (حرفين على الأقل).');
        return;
      }
      // normalize
      data.fullName = data.fullName.trim();
      data.targetScore = Number(data.targetScore||'') || '';
      data.prevScore = Number(data.prevScore||'') || '';
      save(data);
      UI.toast('تم', 'تم حفظ بياناتك ✅');
      setTimeout(()=> location.href='assessment.html', 350);
    });
  }

  function toggleRetake(isYes){
    const wrap = UI.$('#retakeWrap');
    if(!wrap) return;
    wrap.classList.toggle('hidden', !isYes);
  }

  return { bind, load, save };
})();

document.addEventListener('DOMContentLoaded', Intake.bind);