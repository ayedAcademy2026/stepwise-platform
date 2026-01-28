const Recommender = (() => {
  function loadProfile(){ try{return JSON.parse(localStorage.getItem('stepwise_profile_v1')||'null')}catch(e){return null} }
  function loadResult(){ try{return JSON.parse(localStorage.getItem('stepwise_last_result_v1')||'null')}catch(e){return null} }
  async function loadRules(){
    const cached = localStorage.getItem('stepwise_rules_v1');
    if(cached){ try{return JSON.parse(cached)}catch(e){} }
    const r = await fetch('./assets/data/rules.json', { cache:'no-store' });
    const j = await r.json();
    localStorage.setItem('stepwise_rules_v1', JSON.stringify(j));
    return j;
  }

  function decide(profile, result, rules){
    const when = profile?.examWindow || 'unscheduled';
    const retake = profile?.retake === 'yes';
    if(retake) return rules.courses.find(c=>c.id==='boost') || rules.courses[0];
    // map
    const map = {
      '<24h':'crash','3d':'crash','7d':'intensive','15d':'intensive','30d':'30','60d':'master','90d':'master','unscheduled':'master'
    };
    const id = map[when] || 'master';
    return rules.courses.find(c=>c.id===id) || rules.courses[0];
  }

  async function render(){
    const profile = loadProfile();
    const result = loadResult();
    if(!profile || !result){
      UI.$('#empty')?.classList.remove('hidden');
      UI.$('#content')?.classList.add('hidden');
      return;
    }
    const rules = await loadRules();
    const course = decide(profile, result, rules);

    UI.$('#empty')?.classList.add('hidden');
    UI.$('#content')?.classList.remove('hidden');

    UI.$('[data-course-name]')?.textContent = course.name;
    UI.$('[data-course-reason]')?.textContent = course.reason;

    const why = UI.$('#why');
    const extra = [];
    extra.push(`مستواك الحالي: ${result.level?.label||'-'} (${result.scorePct}%)`);
    extra.push(`أضعف قسم: ${result.weakest||'-'}`);
    extra.push(`موعد الاختبار: ${labelWindow(profile.examWindow)}`);
    why.innerHTML = extra.map(x=>`<div class="chip">✅ ${x}</div>`).join('');

    UI.$('#contactTelegram')?.setAttribute('href', course.url);

    UI.$('#ctaMsg')?.addEventListener('click', (e)=>{
      e.preventDefault();
      const username = (course.url.split('t.me/')[1]||'').trim();
      const msg =
`توصية STEPWISE — طلب اشتراك
الاسم: ${profile.fullName}
المنطقة: ${profile.region || '-'}
موعد الاختبار: ${labelWindow(profile.examWindow)}
الدرجة السابقة: ${profile.prevScore || '-'}
الدرجة المستهدفة: ${profile.targetScore || '-'}
نتيجة المحاكاة: ${result.scorePct}% (${result.level?.label||'-'})
أضعف قسم: ${result.weakest || '-'}

أرغب بالاشتراك في: ${course.name}`;
      const url = `https://t.me/${username}?text=${encodeURIComponent(msg)}`;
      window.open(url,'_blank');
    });
  }

  function labelWindow(v){
    const m={
      '<24h':'أقل من 24 ساعة',
      '3d':'خلال 3 أيام',
      '7d':'خلال 7 أيام',
      '15d':'خلال 15 يوم',
      '30d':'خلال شهر',
      '60d':'خلال شهرين',
      '90d':'خلال 3 شهور',
      'unscheduled':'لم يتم الحجز بعد'
    };
    return m[v] || 'غير محدد';
  }

  return { render };
})();

document.addEventListener('DOMContentLoaded', Recommender.render);