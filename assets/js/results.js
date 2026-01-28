const Results = (() => {
  const KEY = 'stepwise_last_result_v1';
  function load(){
    try{ return JSON.parse(localStorage.getItem(KEY)||'null') }catch(e){ return null; }
  }
  async function loadRules(){
    const r = await fetch('./assets/data/rules.json', { cache:'no-store' });
    return await r.json();
  }

  function shareText(text){
    if(navigator.share){
      navigator.share({ title:'STEPWISE — خطتي', text, url: location.href }).catch(()=>{});
    }else{
      navigator.clipboard?.writeText(text);
      UI.toast('تم النسخ', 'تم نسخ الخطة — شاركها في مجموعتك ✅');
    }
  }

  async function render(){
    const res = load();
    if(!res){
      UI.$('#emptyState')?.classList.remove('hidden');
      UI.$('#content')?.classList.add('hidden');
      return;
    }
    UI.$('#emptyState')?.classList.add('hidden');
    UI.$('#content')?.classList.remove('hidden');

    UI.$('[data-score]')?.textContent = res.scorePct + '%';
    UI.$('[data-level]')?.textContent = res.level?.label || '';
    UI.$('[data-weak]')?.textContent = res.weakest || '-';
    UI.$('[data-correct]')?.textContent = `${res.correct}/${res.total}`;

    const bars = UI.$('#bars');
    bars.innerHTML='';
    Object.entries(res.bySection||{}).forEach(([sec, v])=>{
      const row=document.createElement('div');
      row.className='card pad';
      row.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
          <div>
            <b>${sec}</b>
            <div style="color:var(--muted2);font-size:13px;margin-top:4px">${v.correct}/${v.total}</div>
          </div>
          <div class="badge">${v.pct}%</div>
        </div>
        <div class="progress" style="margin-top:10px"><i style="width:${v.pct}%"></i></div>
      `;
      bars.appendChild(row);
    });

    const plans = UI.$('#plans');
    plans.innerHTML='';
    (res.plan?.plans||[]).forEach((p, i)=>{
      const div=document.createElement('div');
      div.className='card pad';
      div.innerHTML = `<h3 class="h3">${p.title}</h3><div class="list">${p.items.map(x=>`<div class="chip">• ${x}</div>`).join('')}</div>`;
      plans.appendChild(div);
    });

    const tips = UI.$('#tips');
    tips.innerHTML = (res.plan?.baseTips||[]).map(t=>`<div class="chip">💡 ${t}</div>`).join('');

    // Share buttons
    const shareBtn = UI.$('#sharePlan');
    shareBtn?.addEventListener('click', ()=>{
      const lines = [];
      lines.push(`STEPWISE — نتيجتي: ${res.scorePct}% (${res.level?.label||''})`);
      lines.push(`أضعف قسم: ${res.weakest||'-'}`);
      lines.push('');
      (res.plan?.plans||[]).forEach(p=>{
        lines.push(p.title);
        p.items.forEach(it=> lines.push(`- ${it}`));
        lines.push('');
      });
      shareText(lines.join('\n'));
    });

    const copyBtn = UI.$('#copyLink');
    copyBtn?.addEventListener('click', async ()=>{
      try{
        await navigator.clipboard.writeText(location.href);
        UI.toast('تم', 'تم نسخ رابط هذه الصفحة ✅');
      }catch(e){
        UI.toast('تنبيه', 'لم أستطع النسخ من المتصفح الحالي.');
      }
    });

    // Save recommended course basis for recommender
    const rules = await loadRules();
    localStorage.setItem('stepwise_rules_v1', JSON.stringify(rules));
  }

  return { render };
})();

document.addEventListener('DOMContentLoaded', Results.render);