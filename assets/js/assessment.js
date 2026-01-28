const Assessment = (() => {
  const QKEY = 'stepwise_attempt_v1';
  const RKEY = 'stepwise_last_result_v1';

  async function loadQuestions(){
    const r = await fetch('./assets/data/questions.json', { cache:'no-store' });
    return await r.json();
  }

  function shuffle(a){
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  function pickSet(all){
    // 50 questions total: 15 grammar, 15 reading/listening mix, 10 vocab, 10 from weakest default mixed
    const by = { Grammar:[], Reading:[], Listening:[], Vocabulary:[] };
    all.forEach(q => { if(by[q.section]) by[q.section].push(q); });
    Object.values(by).forEach(shuffle);

    const picked = []
      .concat(by.Vocabulary.slice(0,10))
      .concat(by.Grammar.slice(0,15))
      .concat(by.Reading.slice(0,12))
      .concat(by.Listening.slice(0,13));
    return shuffle(picked).slice(0,50);
  }

  function loadAttempt(){
    try{ return JSON.parse(localStorage.getItem(QKEY)||'null') }catch(e){ return null; }
  }
  function saveAttempt(payload){
    localStorage.setItem(QKEY, JSON.stringify(payload));
  }
  function saveResult(payload){
    localStorage.setItem(RKEY, JSON.stringify(payload));
  }

  function scoreToLevel(pct){
    if(pct >= 80) return {code:'ADV', label:'متقدم'};
    if(pct >= 60) return {code:'INT', label:'متوسط'};
    return {code:'BEG', label:'مبتدئ'};
  }

  function computePlan(profile, result){
    const when = profile?.examWindow || 'unscheduled';
    const weak = result.weakest;
    const plans = [];

    const baseTips = [
      "ثبّت وقت يومي ثابت (حتى لو 45 دقيقة) — الاستمرارية أهم من المدة.",
      "دوّن أخطاءك في قائمة واحدة وراجعها يوميًا (أسرع طريق للتحسن).",
      "طبّق استراتيجية: اقرأ السؤال أولًا ثم ارجع للنص عند القراءة."
    ];

    const focus = (sec) => {
      if(sec === 'Grammar') return [
        "ركز على: الأزمنة + If conditionals + أدوات الربط.",
        "هدفك اليومي: 25 سؤال قواعد + مراجعة الأخطاء."
      ];
      if(sec === 'Reading') return [
        "ركز على: Main idea / Inference / Detail.",
        "هدفك اليومي: 3 قطع مع توقيت + مراجعة أين ضاع وقتك."
      ];
      if(sec === 'Listening') return [
        "ركز على: الفكرة العامة أولًا ثم التفاصيل.",
        "هدفك اليومي: 25 دقيقة استماع + تدوين كلمات مفتاحية."
      ];
      return [
        "ركز على الكلمات المتكررة وكلمات الربط (however/although).",
        "هدفك اليومي: 30 كلمة مع جمل قصيرة + اختبار سريع."
      ];
    };

    // Choose plan based on window
    const addDay = (title, items) => plans.push({title, items});

    if(when === '<24h'){
      addDay("خطة إنقاذ — 24 ساعة", [
        ...focus(weak),
        "حل نموذج مصغّر 25 سؤال (مختلط) ثم راجع الأخطاء فقط.",
        "مراجعة سريعة لكلمات الربط + أخطاء القواعد الشائعة.",
        "نم مبكرًا وادخل الاختبار بهدوء."
      ]);
    } else if(when === '3d'){
      addDay("خطة 3 أيام (مكثفة)", [
        `اليوم 1: ${focus(weak)[0]} + ${focus(weak)[1]}`,
        "اليوم 2: قسم ثاني متوسط الأداء + نموذج قراءة/استماع مصغّر.",
        "اليوم 3: نموذج 50 سؤال + تحليل أخطاء + مراجعة نقاط الضعف."
      ]);
    } else if(when === '7d'){
      addDay("خطة 7 أيام (متوازنة)", [
        "يوم 1–2: تقوية القسم الأضعف + نماذج قصيرة.",
        "يوم 3–4: قراءة + قواعد حسب أخطائك.",
        "يوم 5: استماع مركز + مراجعة مفردات.",
        "يوم 6: نموذج 50 سؤال + تحليل.",
        "يوم 7: مراجعة أخطاء فقط + راحة قبل الاختبار."
      ]);
    } else if(when === '30d'){
      addDay("خطة 30 يوم", [
        "أسبوع 1: أساسيات القواعد + مفردات.",
        "أسبوع 2: قراءة (استراتيجيات + قطع يومية).",
        "أسبوع 3: استماع (تدوين ملاحظات + نماذج قصيرة).",
        "أسبوع 4: نماذج كاملة + تحليل أخطاء + تكرار نقاط الضعف."
      ]);
    } else if(when === '60d' || when === '90d'){
      addDay("خطة 60–90 يوم", [
        "الشهر الأول: بناء أساس قوي (قواعد + مفردات) مع تطبيق يومي.",
        "الشهر الثاني: نماذج كاملة كل 2–3 أيام + تحليل أخطاء.",
        "آخر أسبوع: مراجعة مركزة لنقاط الضعف + إدارة وقت."
      ]);
    } else {
      addDay("ما حجزت موعد؟ (توصية ذكية)", [
        "إذا مستواك مبتدئ: احجز بعد 45–60 يوم.",
        "إذا مستواك متوسط: احجز بعد 21–30 يوم.",
        "إذا مستواك متقدم: قد يكفي 7–14 يوم مع نماذج.",
        ...focus(weak)
      ]);
    }

    return { plans, baseTips };
  }

  function computeResult(picked, answers, profile){
    let correct = 0;
    const by = {};
    picked.forEach((q, i) => {
      const sec = q.section || 'Other';
      if(!by[sec]) by[sec] = { total:0, correct:0 };
      by[sec].total += 1;
      const ok = answers[i] === q.correctIndex;
      if(ok){ correct += 1; by[sec].correct += 1; }
    });
    const pct = Math.round((correct / picked.length) * 100);

    // weakest
    let weakest = null;
    let weakestPct = 101;
    Object.entries(by).forEach(([sec, v]) => {
      const p = Math.round((v.correct / v.total) * 100);
      if(p < weakestPct){ weakestPct = p; weakest = sec; }
    });

    const level = scoreToLevel(pct);
    const plan = computePlan(profile, { weakest });

    return {
      scorePct: pct,
      correct,
      total: picked.length,
      bySection: Object.fromEntries(Object.entries(by).map(([sec,v])=>{
        const p = Math.round((v.correct / v.total) * 100);
        return [sec, { ...v, pct:p }];
      })),
      weakest,
      level,
      plan
    };
  }

  async function start(){
    const all = await loadQuestions();
    const picked = pickSet(all);

    let state = loadAttempt();
    if(!state || !Array.isArray(state.picked) || state.picked.length !== 50){
      state = { picked, answers: new Array(picked.length).fill(null), idx:0 };
      saveAttempt(state);
    } else {
      picked.splice(0, picked.length, ...state.picked);
    }

    const bar = UI.$('#bar');
    const qIndex = UI.$('#qIndex');
    const qTotal = UI.$('#qTotal');
    const secEl = UI.$('#qSection');
    const diffEl = UI.$('#qDiff');
    const promptEl = UI.$('#qPrompt');
    const optsEl = UI.$('#qOptions');
    const explainEl = UI.$('#qExplain');

    const prevBtn = UI.$('#prevQ');
    const nextBtn = UI.$('#nextQ');
    const finishBtn = UI.$('#finishQ');
    const jumpEl = UI.$('#jump');

    qTotal.textContent = String(picked.length);

    function render(){
      const idx = state.idx;
      const q = picked[idx];
      qIndex.textContent = String(idx + 1);
      secEl.textContent = q.section || '';
      diffEl.textContent = q.difficulty ? `صعوبة ${q.difficulty}/5` : '';
      promptEl.textContent = q.prompt || '';
      const pct = Math.round(((idx) / picked.length) * 100);
      bar.style.width = pct + '%';

      optsEl.innerHTML = '';
      explainEl.classList.add('hidden');

      q.options.forEach((t, i) => {
        const div = document.createElement('div');
        div.className = 'opt';
        div.textContent = t;
        if(state.answers[idx] === i) div.classList.add('selected');
        div.addEventListener('click', ()=>{
          state.answers[idx] = i;
          saveAttempt(state);
          render();
          if(q.explanationShort){
            explainEl.textContent = q.explanationShort;
            explainEl.classList.remove('hidden');
          }
        });
        optsEl.appendChild(div);
      });

      prevBtn.disabled = idx === 0;
      nextBtn.disabled = idx === picked.length - 1;
      finishBtn.classList.toggle('hidden', idx !== picked.length - 1);

      jumpEl.innerHTML='';
      for(let i=0;i<picked.length;i++){
        const b=document.createElement('button');
        b.className='btn small ghost';
        const answered = state.answers[i] !== null;
        b.textContent = answered ? `✓ ${i+1}` : String(i+1);
        b.style.opacity = answered ? '1' : '.65';
        b.addEventListener('click', ()=>{
          state.idx=i; saveAttempt(state); render();
          window.scrollTo({top:0, behavior:'smooth'});
        });
        jumpEl.appendChild(b);
      }
    }

    prevBtn.addEventListener('click', ()=>{ if(state.idx>0){ state.idx--; saveAttempt(state); render(); }});
    nextBtn.addEventListener('click', ()=>{ if(state.idx<picked.length-1){ state.idx++; saveAttempt(state); render(); }});

    finishBtn.addEventListener('click', ()=>{
      const unanswered = state.answers.filter(x=>x===null).length;
      if(unanswered>0){
        if(!confirm(`باقي ${unanswered} سؤال بدون إجابة. هل تريد إنهاء الاختبار؟`)) return;
      }
      const profile = (()=>{ try{return JSON.parse(localStorage.getItem('stepwise_profile_v1')||'null')}catch(e){return null} })();
      const result = computeResult(picked, state.answers, profile);
      saveResult(result);
      localStorage.removeItem(QKEY);
      UI.toast('تم', 'تم حفظ نتيجتك ✅');
      setTimeout(()=> location.href='results.html', 350);
    });

    render();
  }

  return { start };
})();

document.addEventListener('DOMContentLoaded', Assessment.start);