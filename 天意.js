(async function () {
    'use strict';

    let mvuReady = false;

    async function initMvu() {
        try {
            if (typeof waitGlobalInitialized === 'function') await waitGlobalInitialized('Mvu');
            if (typeof Mvu !== 'undefined') { mvuReady = true; }
        } catch (e) { console.error('[天意] 初始化失败', e); }
    }

    function getLatestState() {
        if (!mvuReady) return null;
        try {
            const lastMsgId = typeof getLastMessageId === 'function' ? getLastMessageId() : null;
            if (!lastMsgId) return null;
            const messages = typeof getChatMessages === 'function'
                ? getChatMessages('0-' + lastMsgId, { role: 'assistant' }) : null;
            if (!messages || messages.length === 0) return null;
            for (let i = messages.length - 1; i >= 0; i--) {
                const mid = messages[i].message_id;
                const fullData = Mvu.getMvuData({ type: 'message', message_id: mid });
                if (fullData?.stat_data && Object.keys(fullData.stat_data).length > 0) return { fullData, mid };
            }
        } catch (e) { console.error('[天意] 读取失败', e); }
        return null;
    }

    async function commitUpdate(modifyFn) {
        const state = getLatestState();
        if (!state) { toastr.error('未找到数据源，请先让 AI 回复一次'); return false; }
        try {
            const { fullData, mid } = state;
            modifyFn(fullData.stat_data);
            await Mvu.replaceMvuData(fullData, { type: 'message', message_id: mid });
            if (typeof eventEmit === 'function' && Mvu?.events?.VARIABLE_UPDATE_ENDED) eventEmit(Mvu.events.VARIABLE_UPDATE_ENDED);
            toastr.success('修改成功');
            return true;
        } catch (e) { console.error('[天意] 写入失败', e); toastr.error('写入失败'); return false; }
    }

    function calcDelta(cur, input) {
        if (input === '' || input === null || input === undefined) return null;
        const n = Number(cur) || 0, s = String(input).trim();
        if (s.startsWith('+')) return n + Number(s.slice(1));
        if (s.startsWith('-')) return n - Number(s.slice(1));
        return Number(s);
    }

    const p = window.parent || window;
    const doc = p.document;
    const scriptId = typeof getScriptId === 'function' ? getScriptId() : 'ty-destiny-' + Date.now();
    doc.querySelectorAll(`[data-ty-id="${scriptId}"]`).forEach(el => el.remove());

    const CSS = `<style>
    @import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;600;700&family=ZCOOL+XiaoWei&display=swap');

    :root{--jade:#5a9e7e;--jade-light:#7ec8a0;--jade-deep:#3a6e56;--ink:#d4c5b2;--ink-dim:#8a7e6b;--ink-deep:#3d3428;--gold:#c9a84c;--gold-light:#e8c97a;--vermillion:#c0553a;--parchment:rgba(25,20,15,0.92);--parchment-card:rgba(30,24,18,0.7);--star:rgba(200,200,210,0.15);}
    #ty-bubble{
      position:fixed;width:56px;height:56px;border-radius:50%;cursor:pointer;z-index:9999999;
      background:radial-gradient(circle at 35% 35%,#c8f0d8 0%,#7ec8a0 30%,#3a7e5a 65%,#1a4a30 100%);
      border:1.5px solid rgba(200,240,216,0.5);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 0 30px rgba(126,200,160,0.6),0 0 60px rgba(126,200,160,0.2),0 0 90px rgba(100,180,140,0.08),0 4px 16px rgba(0,0,0,0.6),inset 0 2px 4px rgba(255,255,255,0.25),inset 0 -2px 6px rgba(0,0,0,0.3);
      touch-action:none;user-select:none;
      transition:transform .4s cubic-bezier(.25,.8,.25,1),box-shadow .4s ease;
      animation:orbFloat 4s ease-in-out infinite;
    }
    #ty-bubble::before{
      content:'';position:absolute;width:14px;height:14px;border-radius:50%;
      background:radial-gradient(circle,#fff,#e0fff0 40%,transparent 70%);
      top:10px;left:14px;opacity:.9;filter:blur(1px);
      animation:orbGlint 3s ease-in-out infinite;
    }
    #ty-bubble::after{
      content:'';position:absolute;inset:-8px;border-radius:50%;
      border:1.5px solid rgba(168,230,207,0.2);
      animation:orbRing 5s linear infinite;
    }
    @keyframes orbFloat{
      0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}
    }
    @keyframes orbGlint{
      0%,100%{opacity:.9;transform:scale(1);}50%{opacity:.4;transform:scale(1.3);}
    }
    @keyframes orbRing{
      0%{transform:rotate(0deg) scale(1);}50%{transform:rotate(180deg) scale(1.08);}100%{transform:rotate(360deg) scale(1);}
    }
    #ty-bubble:hover{
      transform:scale(1.12) translateY(-4px);animation:none;
      box-shadow:0 0 45px rgba(160,240,200,0.8),0 0 80px rgba(126,200,160,0.35),0 0 120px rgba(100,180,140,0.15),0 6px 20px rgba(0,0,0,0.6),inset 0 2px 4px rgba(255,255,255,0.3),inset 0 -2px 6px rgba(0,0,0,0.3);
    }
    #ty-panel{
      position:fixed;z-index:9999998;display:none;flex-direction:column;
      width:400px;max-height:85vh;border-radius:8px;overflow:hidden;
      background:linear-gradient(175deg,rgba(18,14,10,0.98),rgba(12,8,6,0.99));
      border:1px solid rgba(90,158,126,0.2);
      box-shadow:0 24px 64px rgba(0,0,0,0.8),0 0 0 1px rgba(90,158,126,0.06) inset;
      font-family:'Noto Serif SC','STSong','SimSun',serif;color:var(--ink);
    }
    #ty-panel::before{
      content:'';position:absolute;top:0;left:0;right:0;height:1px;
      background:linear-gradient(90deg,transparent 10%,var(--jade-light),var(--gold-light),var(--jade-light),transparent 90%);
      opacity:.6;z-index:1;
    }
    #ty-panel::after{
      content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
      background:radial-gradient(ellipse at 80% 0%,rgba(90,158,126,0.06) 0%,transparent 50%),
                 radial-gradient(ellipse at 20% 100%,rgba(201,168,76,0.04) 0%,transparent 40%);
    }
    .ty-h{
      position:relative;z-index:2;padding:14px 18px 10px;
      background:linear-gradient(180deg,rgba(25,20,15,0.6),rgba(18,14,10,0.3));
      border-bottom:1px solid rgba(90,158,126,0.1);
      cursor:move;user-select:none;touch-action:none;
      display:flex;justify-content:space-between;align-items:flex-start;
    }
    .ty-h-left{display:flex;flex-direction:column;}
    .ty-h-t{
      font-family:'Ma Shan Zheng','STKaiti','KaiTi',serif;font-size:24px;font-weight:400;color:var(--jade-light);
      text-shadow:0 0 12px rgba(126,200,160,0.3);line-height:1;letter-spacing:4px;
    }
    .ty-h-author{font-family:'Noto Serif SC',serif;font-size:11px;color:rgba(200,220,210,0.6);letter-spacing:2px;margin-top:2px;}
    .ty-x{
      width:26px;height:26px;border-radius:50%;cursor:pointer;
      border:1px solid rgba(192,85,58,0.2);background:rgba(192,85,58,0.05);
      color:#888;font-size:13px;display:flex;align-items:center;justify-content:center;
      transition:all .3s;flex-shrink:0;
    }
    .ty-x:hover{border-color:var(--vermillion);color:var(--vermillion);}
    .ty-nav{
      position:relative;z-index:2;display:flex;flex-wrap:wrap;gap:0;padding:0 8px;
      border-bottom:1px solid rgba(90,158,126,0.06);
      background:linear-gradient(180deg,rgba(90,158,126,0.04),rgba(0,0,0,0.15));
    }
    .ty-nav-btn{
      flex:0 0 auto;padding:5px 10px;font-size:11px;color:var(--ink-dim);
      background:none;border:none;cursor:pointer;border-bottom:2px solid transparent;
      transition:all .3s;font-family:'Noto Serif SC',serif;letter-spacing:1px;
    }
    .ty-nav-btn:hover{color:var(--jade-light);}
    .ty-nav-btn.active{color:var(--jade-light);border-bottom-color:var(--jade);}
    .ty-body{
      position:relative;z-index:2;padding:10px 14px;overflow-y:auto;flex:1;max-height:58vh;
    }
    .ty-body::-webkit-scrollbar{width:3px;}
    .ty-body::-webkit-scrollbar-thumb{background:rgba(90,158,126,0.2);border-radius:2px;}
    .ty-body::-webkit-scrollbar-track{background:rgba(0,0,0,0.3);}
    .ty-page{display:none;animation:pageFade .3s ease;}
    .ty-page.active{display:block;}
    @keyframes pageFade{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:translateY(0);}}
    .ty-sec{
      margin-bottom:10px;border:1px solid rgba(90,158,126,0.08);border-radius:6px;
      padding:10px 12px;background:var(--parchment-card);
      position:relative;
    }
    .ty-sec::before{
      content:'';position:absolute;top:0;left:10px;right:10px;height:1px;
      background:linear-gradient(90deg,transparent,rgba(90,158,126,0.15),transparent);
    }
    .ty-sec-t{
      font-size:11px;color:var(--jade-light);margin-bottom:8px;
      border-bottom:1px dashed rgba(90,158,126,0.1);padding-bottom:4px;
      font-weight:600;letter-spacing:1.5px;font-family:'Noto Serif SC',serif;
    }
    .ty-r{display:flex;align-items:center;gap:8px;margin-bottom:5px;}
    .ty-r label{
      min-width:66px;color:var(--ink-dim);font-size:11px;text-align:right;
      font-family:'Noto Serif SC',serif;
    }
    .ty-r .val{flex:1;font-size:12px;color:var(--ink);word-break:break-all;}
    .ty-in{
      flex:1;background:rgba(0,0,0,0.35);border:1px solid rgba(90,158,126,0.12);
      border-radius:4px;padding:5px 10px;color:#e0d8c8;font-size:11px;
      outline:none;transition:all .3s;font-family:'Noto Serif SC',serif;
    }
    .ty-in:focus{
      border-color:rgba(126,200,160,0.4);background:rgba(0,0,0,0.45);
      box-shadow:0 0 10px rgba(126,200,160,0.08);
    }
    .ty-in::placeholder{color:rgba(180,170,155,0.25);}
    .ty-sel{
      flex:1;background:rgba(0,0,0,0.4);border:1px solid rgba(90,158,126,0.12);
      border-radius:4px;padding:5px 10px;color:#e0d8c8;font-size:11px;
      outline:none;cursor:pointer;font-family:'Noto Serif SC',serif;
    }
    .ty-sel option{background:#1a1610;color:var(--ink);}
    .ty-btn{
      width:100%;padding:7px 0;border-radius:4px;border:none;cursor:pointer;
      font-size:11px;font-weight:600;letter-spacing:2px;margin-top:5px;
      transition:all .3s;font-family:'Noto Serif SC',serif;
    }
    .ty-btn:active{transform:scale(.97);}
    .ty-btn.p{
      background:linear-gradient(135deg,var(--jade-deep),var(--jade),var(--jade-light));
      color:#f0fff0;box-shadow:0 2px 10px rgba(90,158,126,0.2);
    }
    .ty-btn.p:hover{box-shadow:0 4px 20px rgba(126,200,160,0.35);}
    .ty-btn.d{
      background:linear-gradient(135deg,rgba(192,85,58,0.3),rgba(192,85,58,0.5));
      color:#ffe0d8;border:1px solid rgba(192,85,58,0.25);
    }
    .ty-btn.d:hover{box-shadow:0 4px 16px rgba(192,85,58,0.3);}
    .ty-btn.e{
      background:linear-gradient(135deg,rgba(90,158,126,0.3),rgba(90,158,126,0.5));
      color:#d8ffe8;border:1px solid rgba(126,200,160,0.25);
    }
    .ty-btn.e:hover{box-shadow:0 4px 16px rgba(126,200,160,0.3);}
    .ty-btn.s{
      background:linear-gradient(135deg,rgba(126,160,200,0.2),rgba(126,160,200,0.4));
      color:#d8e0ff;border:1px solid rgba(126,160,200,0.2);
    }
    .ty-arr{
      margin-bottom:8px;padding:8px 10px;border:1px solid rgba(90,158,126,0.06);
      border-radius:4px;background:rgba(0,0,0,0.15);
    }
    .ty-arr-t{font-size:10px;color:var(--ink-dim);margin-bottom:5px;display:flex;justify-content:space-between;align-items:center;}
    .ty-arr-t .del{color:var(--vermillion);cursor:pointer;font-size:9px;}
    .ty-arr-t .del:hover{text-decoration:underline;}
    .ty-arr .ty-r{margin-bottom:3px;}
    .ty-arr .ty-r label{min-width:52px;font-size:10px;}
    .ty-arr .ty-in{padding:3px 7px;font-size:10px;}
    @media(max-width:768px){
      #ty-bubble{width:48px;height:48px;}
      #ty-panel{width:94vw!important;max-width:420px!important;max-height:90vh!important;border-radius:6px;}
      .ty-h{padding:10px 12px 8px;}
      .ty-h-t{font-size:20px;}
      .ty-h-author{font-size:10px;}
      .ty-nav{gap:0;padding:0 4px;}
      .ty-nav-btn{flex:1 1 auto;padding:6px 6px;font-size:10px;text-align:center;min-width:0;}
      .ty-body{padding:8px 10px;max-height:55vh;}
      .ty-sec{padding:8px 10px;margin-bottom:8px;}
      .ty-sec-t{font-size:10px;margin-bottom:5px;}
      .ty-r{gap:6px;margin-bottom:4px;}
      .ty-r label{min-width:56px;font-size:10px;}
      .ty-in{padding:6px 8px;font-size:13px;min-height:36px;}
      .ty-sel{padding:6px 8px;font-size:13px;min-height:36px;}
      .ty-btn{padding:9px 0;font-size:12px;letter-spacing:2px;min-height:42px;border-radius:5px;}
      .ty-arr{padding:6px 8px;}
      .ty-arr-t{font-size:9px;}
      .ty-arr .ty-r label{min-width:44px;font-size:9px;}
      .ty-arr .ty-in{padding:5px 7px;font-size:11px;min-height:32px;}
      .ty-x{width:30px;height:30px;font-size:16px;}
    }
    </style>`;

    const HTML = `
    <div id="ty-bubble" style="top:50%;left:50%;transform:translate(-50%,-50%);"></div>
    <div id="ty-panel" style="top:12vh;left:3vw;">
        <div class="ty-h" id="ty-drag">
            <div class="ty-h-left">
                <div class="ty-h-t">天 意</div>
                <div class="ty-h-author">顾清寒</div>
            </div>
            <div class="ty-x" id="ty-close">&times;</div>
        </div>
        <div class="ty-nav" id="ty-nav"></div>
        <div class="ty-body" id="ty-body"></div>
    </div>`;

    const styleEl = doc.createElement('style');
    styleEl.setAttribute('data-ty-id', scriptId);
    styleEl.textContent = CSS.replace(/<style>/, '').replace(/<\/style>/, '');
    doc.head.appendChild(styleEl);

    const wrapper = doc.createElement('div');
    wrapper.setAttribute('data-ty-id', scriptId);
    wrapper.innerHTML = HTML;
    doc.body.appendChild(wrapper);

    const bubble = doc.getElementById('ty-bubble');
    const panel = doc.getElementById('ty-panel');
    const closeBtn = doc.getElementById('ty-close');
    const dragHandle = doc.getElementById('ty-drag');
    let activeDragEl = null, startX = 0, startY = 0, startLeft = 0, startTop = 0, isDragging = false;

    const onDown = (e) => {
        const el = e.currentTarget._dragEl;
        if (!el || e.target === closeBtn) return;
        activeDragEl = el; isDragging = false;
        if (el.style.transform) {
            const r = el.getBoundingClientRect();
            el.style.left = r.left + 'px'; el.style.top = r.top + 'px'; el.style.transform = 'none';
        }
        startX = e.clientX; startY = e.clientY; startLeft = el.offsetLeft; startTop = el.offsetTop;
        e.preventDefault();
    };
    const movePanelToBubble = () => {
        if (panel.style.display !== 'flex') return;
        if (window.innerWidth < 769) {
            panel.style.left = '3vw';
            panel.style.top = '12vh';
            panel.style.transform = 'none';
            return;
        }
        var br = bubble.getBoundingClientRect(), pw = panel.offsetWidth || 400;
        panel.style.left = Math.max(0, Math.min(window.innerWidth - pw, br.right - pw / 2)) + 'px';
        panel.style.top = Math.min(window.innerHeight - (panel.offsetHeight || 500) - 20, Math.max(0, br.bottom + 8)) + 'px';
        panel.style.transform = 'none';
    };
    const onMove = (e) => {
        if (!activeDragEl) return;
        const dx = e.clientX - startX, dy = e.clientY - startY;
        if (!isDragging && Math.hypot(dx, dy) > 5) isDragging = true;
        if (!isDragging) return;
        activeDragEl.style.left = Math.max(0, startLeft + dx) + 'px';
        activeDragEl.style.top = Math.max(0, startTop + dy) + 'px';
        if (activeDragEl === bubble) movePanelToBubble();
    };
    const onUp = () => {
        if (!activeDragEl) return;
        if (activeDragEl === bubble && !isDragging) {
            if (panel.style.display === 'flex') { closePanel(); }
            else { movePanelToBubble(); panel.style.display = 'flex'; refreshAll(); }
        }
        activeDragEl = null; isDragging = false;
    };
    doc.addEventListener('pointermove', onMove);
    doc.addEventListener('pointerup', onUp);
    doc.addEventListener('pointercancel', onUp);
    let longPressTimer;
    bubble._dragEl = bubble; bubble.addEventListener('pointerdown', (e) => {
        longPressTimer = setTimeout(() => {
            doc.querySelectorAll(`[data-ty-id="${scriptId}"]`).forEach(el => el.remove());
            toastr.info('天意已移除，重新加载脚本或刷新页面可恢复');
        }, 500);
        onDown(e);
    });
    bubble.addEventListener('pointerup', () => clearTimeout(longPressTimer));
    bubble.addEventListener('pointerleave', () => clearTimeout(longPressTimer));
    dragHandle._dragEl = panel; dragHandle.addEventListener('pointerdown', onDown);
    function closePanel() {
        panel.style.opacity = '0'; panel.style.transform = 'scale(0.95)';
        setTimeout(() => { panel.style.display = 'none'; panel.style.opacity = ''; panel.style.transform = ''; }, 300);
    }
    closeBtn.addEventListener('click', closePanel);
    doc.addEventListener('mousedown', (e) => {
        if (panel.style.display === 'flex' && !panel.contains(e.target) && !bubble.contains(e.target)) closePanel();
    });
    doc.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel.style.display === 'flex') closePanel();
    });

    let curPage = 0;
    const pages = [
        { id: 'world',   icon: '🌍', label: '世界' },
        { id: 'hero',    icon: '👤', label: '主角' },
        { id: 'combat',  icon: '⚡', label: '战力' },
        { id: 'res',     icon: '💎', label: '资源' },
        { id: 'chars',   icon: '👥', label: '角色' },
        { id: 'faction', icon: '🏴', label: '阵营' },
    ];

    function buildNav() {
        doc.getElementById('ty-nav').innerHTML = pages.map((pg, i) =>
            `<button class="ty-nav-btn${i===0?' active':''}" data-pg="${i}">${pg.icon} ${pg.label}</button>`
        ).join('');
        doc.getElementById('ty-nav').onclick = (e) => {
            const btn = e.target.closest('.ty-nav-btn'); if (!btn) return;
            curPage = Number(btn.dataset.pg);
            doc.querySelectorAll('.ty-nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            doc.querySelectorAll('.ty-page').forEach(p => p.classList.remove('active'));
            doc.getElementById('pg-' + pages[curPage].id)?.classList.add('active');
        };
    }

    function refreshAll() {
        const state = getLatestState();
        if (!state) { doc.getElementById('ty-body').innerHTML = '<p style="color:#555;text-align:center;padding:40px;">未找到数据源</p>'; return; }
        const sd = state.fullData.stat_data;
        const w = sd.世界 || {}, h = sd.主角 || {}, chars = sd.角色 || {}, facs = sd.阵营 || {};

        doc.getElementById('ty-body').innerHTML =
            buildWorldPage(w) +
            buildHeroPage(h) +
            buildCombatPage(h) +
            buildResPage(h) +
            buildCharsPage(chars) +
            buildFactionPage(facs);

        bindAllEvents(sd);
        doc.querySelectorAll('.ty-page').forEach((el, i) => el.classList.toggle('active', i === curPage));
    }

    function field(label, id, val, placeholder) {
        return `<div class="ty-r"><label>${label}</label><input type="text" class="ty-in" id="${id}" value="${String(val ?? '').replace(/"/g,'&quot;')}" placeholder="${placeholder || ''}"></div>`;
    }
    function fieldRO(label, val) {
        return `<div class="ty-r"><label>${label}</label><span class="val">${val ?? '---'}</span></div>`;
    }
    function fieldSel(label, id, val, opts) {
        return `<div class="ty-r"><label>${label}</label><select class="ty-sel" id="${id}">${opts.map(o => `<option value="${o}"${o===val?' selected':''}>${o}</option>`).join('')}</select></div>`;
    }

    function buildWorldPage(w) {
        var gm = _.get(getLatestState()?.fullData?.stat_data || {}, '元信息.设定.游戏模式', '普通模式');
        return `<div class="ty-page" id="pg-world">
            <div class="ty-sec">
                <div class="ty-sec-t">🌍 世界参数</div>
                ${field('当前时间', 'w-time', w.当前时间, 'YYYY-MM-DD HH:mm')}
                ${field('当前地点', 'w-loc', w.当前地点, '地点名')}
                ${fieldSel('当前季节', 'w-season', w.当前季节 || '秋', ['春','夏','秋','冬'])}
                ${field('当前天气', 'w-weather', w.当前天气, '晴朗')}
                ${fieldSel('当前书卷', 'w-book', w.当前书卷 || '第一部', ['前传 冰海王座','第一部','第二部','第三部','第四部','第五部'])}
                ${field('当前幕', 'w-act', w.当前幕, '序幕')}
                ${field('金钱', 'w-money', w.金钱, '数值')}
                ${fieldSel('游戏模式', 'w-gamemode', gm, ['普通模式','困难模式','撕咬模式'])}
                <button class="ty-btn p" id="ty-save-world">保存世界</button>
            </div>
        </div>`;
    }

    function buildHeroPage(h) {
        const a = h.档案 || {}, st = h.状态 || {};
        return `<div class="ty-page" id="pg-hero">
            <div class="ty-sec">
                <div class="ty-sec-t">🪪 档案</div>
                ${field('姓名', 'h-name', a.姓名, '姓名')}
                ${fieldSel('性别', 'h-gender', a.性别 || '男', ['男','女'])}
                ${field('年龄', 'h-age', a.年龄, '数字')}
                ${field('外貌', 'h-appear', a.外貌, '描述')}
                ${field('所属势力', 'h-faction', a.所属势力, '势力名')}
                ${fieldSel('血统评级', 'h-bloodline', a.血统评级 || 'D级', ['D级','C级','B级','A级','超A级','S级','皇级'])}
                <button class="ty-btn p" id="ty-save-hero-arch">保存档案</button>
            </div>
            <div class="ty-sec">
                <div class="ty-sec-t">💓 数值</div>
                ${field('生命值', 'h-hp', h.数值?.生命值, '0~100')}
                ${field('体力', 'h-stamina', h.数值?.体力, '0~100')}
                ${field('血统稳定度', 'h-purity', h.数值?.血统稳定度, '0~100')}
                ${field('精神阈值', 'h-sanity', h.数值?.精神阈值, '0~100')}
                ${field('龙血侵蚀度', 'h-erosion', h.数值?.龙血侵蚀度, '0~100')}
                ${field('基础战斗力', 'h-basecp', h.数值?.基础战斗力, '数值')}
                ${field('当前战斗力', 'h-curcp', h.数值?.当前战斗力, '数值')}
                <button class="ty-btn p" id="ty-save-hero-num">保存数值</button>
                <button class="ty-btn e" id="ty-full-recover" style="margin-top:3px;">全部恢复满值</button>
            </div>
            <div class="ty-sec">
                <div class="ty-sec-t">👁️ 状态</div>
                ${field('生理状态', 'h-status', st.生理状态, '正常/受伤/昏迷')}
                ${field('当前服饰', 'h-clothing', st.当前服饰, '描述')}
                ${field('战术姿势', 'h-pose', st.战术姿势, '描述')}
                ${field('身体特征', 'h-body', st.身体特征, '描述')}
                <button class="ty-btn p" id="ty-save-hero-status">保存状态</button>
            </div>
        </div>`;
    }

    function buildCombatPage(h) {
        const d = h.战力详情 || {};
        return `<div class="ty-page" id="pg-combat">
            <div class="ty-sec">
                <div class="ty-sec-t">⚡ 战力详情</div>
                ${fieldRO('战力等级', d.战力等级 || '未评级')}
                ${fieldSel('暴血状态', 'c-rage', d.暴血状态 || '未开启', ['未开启','一度暴血','二度暴血','三度暴血','四度暴血'])}
                ${field('暴血倍率', 'c-ragemult', d.暴血倍率, '数值')}
                ${field('侵蚀修正', 'c-erosionmod', d.侵蚀修正, '数值')}
                ${field('言灵加成总值', 'c-yanbonus', d.言灵加成总值, '数值')}
                ${field('权柄加成总值', 'c-authbonus', d.权柄加成总值, '数值')}
                ${field('炼金武装加成总值', 'c-equipbonus', d.炼金武装加成总值, '数值')}
                ${field('场景修正', 'c-scene', d.场景修正, '数值')}
                <button class="ty-btn p" id="ty-save-combat">保存战力</button>
            </div>
        </div>`;
    }

    function buildResPage(h) {
        const r = h.资源 || {};
        const yanlings = (r.言灵 || []).map((y, i) => `
            <div class="ty-arr">
                <div class="ty-arr-t"><span>言灵 #${i+1}: ${y.名称 || '---'}</span><span class="del" data-type="言灵" data-idx="${i}">删除</span></div>
                ${field('名称', `r-y${i}-name`, y.名称, '名称')}
                ${fieldSel('掌握程度', `r-y${i}-level`, y.掌握程度 || '初阶', ['初阶','中阶','高阶','完美'])}
                ${field('效果', `r-y${i}-effect`, y.效果, '效果描述')}
                ${field('冷却状态', `r-y${i}-cd`, y.冷却状态, '可用/冷却中')}
                ${field('代价', `r-y${i}-cost`, y.代价, '代价描述')}
                <button class="ty-btn s" data-save-yan="${i}" style="margin-top:3px;">保存</button>
            </div>`).join('');

        const auths = (r.龙王权柄 || []).map((a, i) => `
            <div class="ty-arr">
                <div class="ty-arr-t"><span>权柄 #${i+1}: ${a.名称 || '---'}</span><span class="del" data-type="龙王权柄" data-idx="${i}">删除</span></div>
                ${field('名称', `r-a${i}-name`, a.名称, '名称')}
                ${fieldSel('阶位', `r-a${i}-stage`, a.阶位 || '初觉', ['初觉','半觉','完全觉醒'])}
                ${field('效果', `r-a${i}-effect`, a.效果, '效果描述')}
                ${field('代价', `r-a${i}-cost`, a.代价, '代价描述')}
                ${field('状态', `r-a${i}-status`, a.状态, '可用/封印中')}
                ${field('侵蚀系数', `r-a${i}-erosion`, a.侵蚀系数, '0~20')}
                <button class="ty-btn s" data-save-auth="${i}" style="margin-top:3px;">保存</button>
            </div>`).join('');

        const equips = (r.炼金武装 || []).map((e, i) => `
            <div class="ty-arr">
                <div class="ty-arr-t"><span>武装 #${i+1}: ${e.名称 || '---'}</span><span class="del" data-type="炼金武装" data-idx="${i}">删除</span></div>
                ${field('部位', `r-e${i}-slot`, e.部位, '双手/单手/身体')}
                ${field('名称', `r-e${i}-name`, e.名称, '名称')}
                ${fieldSel('品质', `r-e${i}-quality`, e.品质 || '普通', ['普通','卓越','史诗','神器','传说'])}
                ${field('特效', `r-e${i}-effect`, e.特效, '特效描述')}
                <button class="ty-btn s" data-save-equip="${i}" style="margin-top:3px;">保存</button>
            </div>`).join('');

        const items = (r.战术背包 || []).map((it, i) => `
            <div class="ty-arr">
                <div class="ty-arr-t"><span>物品 #${i+1}: ${it.名称 || '---'} x${it.数量 || 0}</span><span class="del" data-type="战术背包" data-idx="${i}">删除</span></div>
                ${field('名称', `r-i${i}-name`, it.名称, '名称')}
                ${field('数量', `r-i${i}-qty`, it.数量, '数字')}
                ${field('描述', `r-i${i}-desc`, it.描述, '描述')}
                ${field('分类', `r-i${i}-cat`, it.分类, '文件/道具/消耗品')}
                <button class="ty-btn s" data-save-item="${i}" style="margin-top:3px;">保存</button>
            </div>`).join('');

        return `<div class="ty-page" id="pg-res">
            <div class="ty-sec">
                <div class="ty-sec-t">🔥 言灵 (${(r.言灵||[]).length})</div>
                ${yanlings || '<div style="color:#555;font-size:10px;">无</div>'}
                <div class="ty-arr" style="border-style:dashed;">
                    <div class="ty-arr-t"><span style="color:#c9a84c;">新增言灵</span></div>
                    ${field('名称', 'add-y-name', '', '言灵名称')}
                    ${fieldSel('掌握程度', 'add-y-level', '初阶', ['初阶','中阶','高阶','完美'])}
                    ${field('效果', 'add-y-effect', '', '效果描述')}
                    ${field('代价', 'add-y-cost', '', '代价描述')}
                    <button class="ty-btn d" id="ty-add-yan" style="margin-top:4px;">+ 添加</button>
                </div>
            </div>
            <div class="ty-sec">
                <div class="ty-sec-t">👑 龙王权柄 (${(r.龙王权柄||[]).length})</div>
                ${auths || '<div style="color:#555;font-size:10px;">无</div>'}
                <div class="ty-arr" style="border-style:dashed;">
                    <div class="ty-arr-t"><span style="color:#c9a84c;">新增权柄</span></div>
                    ${field('名称', 'add-a-name', '', '权柄名称')}
                    ${fieldSel('阶位', 'add-a-stage', '初觉', ['初觉','半觉','完全觉醒'])}
                    ${field('效果', 'add-a-effect', '', '效果描述')}
                    ${field('代价', 'add-a-cost', '', '代价描述')}
                    <button class="ty-btn d" id="ty-add-auth" style="margin-top:4px;">+ 添加</button>
                </div>
            </div>
            <div class="ty-sec">
                <div class="ty-sec-t">🛡️ 炼金武装 (${(r.炼金武装||[]).length})</div>
                ${equips || '<div style="color:#555;font-size:10px;">无</div>'}
                <div class="ty-arr" style="border-style:dashed;">
                    <div class="ty-arr-t"><span style="color:#c9a84c;">新增武装</span></div>
                    ${field('部位', 'add-e-slot', '', '双手/单手/身体')}
                    ${field('名称', 'add-e-name', '', '武器名称')}
                    ${fieldSel('品质', 'add-e-quality', '普通', ['普通','卓越','史诗','神器','传说'])}
                    ${field('特效', 'add-e-effect', '', '特效描述')}
                    <button class="ty-btn d" id="ty-add-equip" style="margin-top:4px;">+ 添加</button>
                </div>
            </div>
            <div class="ty-sec">
                <div class="ty-sec-t">🎒 战术背包 (${(r.战术背包||[]).length})</div>
                ${items || '<div style="color:#555;font-size:10px;">无</div>'}
                <div class="ty-arr" style="border-style:dashed;">
                    <div class="ty-arr-t"><span style="color:#c9a84c;">新增物品</span></div>
                    ${field('名称', 'add-i-name', '', '物品名称')}
                    ${field('数量', 'add-i-qty', '1', '数字')}
                    ${field('描述', 'add-i-desc', '', '描述')}
                    ${field('分类', 'add-i-cat', '', '文件/道具/消耗品')}
                    <button class="ty-btn d" id="ty-add-item" style="margin-top:4px;">+ 添加</button>
                </div>
            </div>
        </div>`;
    }

    function buildCharsPage(chars) {
        const entries = Object.entries(chars);
        if (entries.length === 0) return '<div class="ty-page" id="pg-chars"><div class="ty-sec"><div style="color:#555;text-align:center;padding:20px;">暂无角色数据</div></div></div>';

        const charHtml = entries.map(([name, c]) => {
            const arch = c.档案 || {}, rel = c.关系 || {}, st = c.状态 || {}, cp = c.战力 || {};
            return `<div class="ty-sec">
                <div class="ty-sec-t">👤 ${name} <span style="color:#556;font-weight:normal;">${arch.血统与言灵 || ''}</span></div>
                ${field('好感度', `ch-${name}-aff`, rel.好感度, '-100~100')}
                ${field('当前关系', `ch-${name}-rel`, rel.当前关系, '关系描述')}
                ${field('是否在场', `ch-${name}-away`, st.是否在场 ? 'true' : 'false', 'true/false')}
                ${field('服饰', `ch-${name}-cloth`, st.服饰, '描述')}
                ${field('姿势', `ch-${name}-pose`, st.姿势, '描述')}
                ${field('身体细节', `ch-${name}-body`, st.身体细节, '描述')}
                ${field('基础战斗力', `ch-${name}-basecp`, cp.基础战斗力, '数值')}
                ${field('当前战斗力', `ch-${name}-curcp`, cp.当前战斗力, '数值')}
                ${field('血统评级', `ch-${name}-bloodline`, cp.血统评级, '评级')}
                <button class="ty-btn p" data-save-char="${name}" style="margin-top:3px;">保存 ${name}</button>
            </div>`;
        }).join('');

        return `<div class="ty-page" id="pg-chars">${charHtml}</div>`;
    }

    function buildFactionPage(facs) {
        const entries = Object.entries(facs);
        const facHtml = entries.map(([name, val]) =>
            `<div class="ty-sec">
                <div class="ty-sec-t">🏴 ${name}</div>
                ${field('声望值', `fac-${name}`, val, '-100~100')}
                <button class="ty-btn p" data-save-fac="${name}" style="margin-top:3px;">保存</button>
            </div>`
        ).join('');
        return `<div class="ty-page" id="pg-faction">
            ${facHtml || '<div class="ty-sec"><div style="color:#555;text-align:center;padding:20px;">暂无阵营数据</div></div>'}
        </div>`;
    }

    function getVal(id) { const el = doc.getElementById(id); return el ? el.value : ''; }
    function getSel(id) { const el = doc.getElementById(id); return el ? el.value : ''; }
    function numVal(id, fallback) { const v = getVal(id); return v === '' ? fallback : Number(v); }
    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    function bindAllEvents() {
        const body = doc.getElementById('ty-body');

        // 世界
        body.querySelector('#ty-save-world')?.addEventListener('click', () => {
            commitUpdate(sd => {
                const w = sd.世界 || {};
                const t = getVal('w-time'); if (t) w.当前时间 = t;
                const l = getVal('w-loc'); if (l) w.当前地点 = l;
                w.当前季节 = getSel('w-season');
                const we = getVal('w-weather'); if (we) w.当前天气 = we;
                w.当前书卷 = getSel('w-book');
                const act = getVal('w-act'); if (act) w.当前幕 = act;
                const m = getVal('w-money'); if (m !== '') w.金钱 = calcDelta(w.金钱, m);
                const gm = getSel('w-gamemode');
                if (gm && sd.元信息) { if (!sd.元信息.设定) sd.元信息.设定 = {}; sd.元信息.设定.游戏模式 = gm; }
            });
        });

        // 主角档案
        body.querySelector('#ty-save-hero-arch')?.addEventListener('click', () => {
            commitUpdate(sd => {
                const a = sd.主角?.档案; if (!a) return;
                const n = getVal('h-name'); if (n) a.姓名 = n;
                a.性别 = getSel('h-gender');
                const age = getVal('h-age'); if (age) a.年龄 = Number(age);
                const ap = getVal('h-appear'); if (ap) a.外貌 = ap;
                const f = getVal('h-faction'); if (f) a.所属势力 = f;
                a.血统评级 = getSel('h-bloodline');
            });
        });

        // 主角数值
        body.querySelector('#ty-save-hero-num')?.addEventListener('click', () => {
            commitUpdate(sd => {
                const n = sd.主角?.数值; if (!n) return;
                const hp = getVal('h-hp'); if (hp !== '') n.生命值 = clamp(calcDelta(n.生命值, hp), 0, 100);
                const st = getVal('h-stamina'); if (st !== '') n.体力 = clamp(calcDelta(n.体力, st), 0, 100);
                const pu = getVal('h-purity'); if (pu !== '') n.血统稳定度 = clamp(calcDelta(n.血统稳定度, pu), 0, 100);
                const sa = getVal('h-sanity'); if (sa !== '') n.精神阈值 = clamp(calcDelta(n.精神阈值, sa), 0, 100);
                const er = getVal('h-erosion'); if (er !== '') n.龙血侵蚀度 = clamp(calcDelta(n.龙血侵蚀度, er), 0, 100);
                const bc = getVal('h-basecp'); if (bc !== '') n.基础战斗力 = Math.max(0, calcDelta(n.基础战斗力, bc));
                const cc = getVal('h-curcp'); if (cc !== '') n.当前战斗力 = Math.max(0, calcDelta(n.当前战斗力, cc));
            });
        });

        // 满值恢复
        body.querySelector('#ty-full-recover')?.addEventListener('click', () => {
            commitUpdate(sd => {
                const n = sd.主角?.数值; if (!n) return;
                n.生命值 = 100; n.体力 = 100; n.血统稳定度 = 100; n.精神阈值 = 100; n.龙血侵蚀度 = 0;
            });
        });

        // 主角状态
        body.querySelector('#ty-save-hero-status')?.addEventListener('click', () => {
            commitUpdate(sd => {
                const st = sd.主角?.状态; if (!st) return;
                const s = getVal('h-status'); if (s) st.生理状态 = s;
                const c = getVal('h-clothing'); if (c) st.当前服饰 = c;
                const po = getVal('h-pose'); if (po) st.战术姿势 = po;
                const b = getVal('h-body'); if (b) st.身体特征 = b;
            });
        });

        // 战力详情
        body.querySelector('#ty-save-combat')?.addEventListener('click', () => {
            commitUpdate(sd => {
                const d = sd.主角?.战力详情; if (!d) return;
                d.暴血状态 = getSel('c-rage');
                const rm = getVal('c-ragemult'); if (rm !== '') d.暴血倍率 = Number(rm);
                const em = getVal('c-erosionmod'); if (em !== '') d.侵蚀修正 = Number(em);
                const yb = getVal('c-yanbonus'); if (yb !== '') d.言灵加成总值 = Math.max(0, Number(yb));
                const ab = getVal('c-authbonus'); if (ab !== '') d.权柄加成总值 = Math.max(0, Number(ab));
                const eb = getVal('c-equipbonus'); if (eb !== '') d.炼金武装加成总值 = Math.max(0, Number(eb));
                const sc = getVal('c-scene'); if (sc !== '') d.场景修正 = Number(sc);
            });
        });

        // 资源：保存单个言灵
        body.querySelectorAll('[data-save-yan]').forEach(btn => {
            btn.addEventListener('click', () => {
                const i = Number(btn.dataset.saveYan);
                commitUpdate(sd => {
                    const y = sd.主角?.资源?.言灵?.[i]; if (!y) return;
                    y.名称 = getVal(`r-y${i}-name`) || y.名称;
                    y.掌握程度 = getSel(`r-y${i}-level`) || y.掌握程度;
                    y.效果 = getVal(`r-y${i}-effect`) || y.效果;
                    y.冷却状态 = getVal(`r-y${i}-cd`) || y.冷却状态;
                    y.代价 = getVal(`r-y${i}-cost`) || y.代价;
                });
            });
        });

        // 资源：保存单个权柄
        body.querySelectorAll('[data-save-auth]').forEach(btn => {
            btn.addEventListener('click', () => {
                const i = Number(btn.dataset.saveAuth);
                commitUpdate(sd => {
                    const a = sd.主角?.资源?.龙王权柄?.[i]; if (!a) return;
                    a.名称 = getVal(`r-a${i}-name`) || a.名称;
                    a.阶位 = getSel(`r-a${i}-stage`) || a.阶位;
                    a.效果 = getVal(`r-a${i}-effect`) || a.效果;
                    a.代价 = getVal(`r-a${i}-cost`) || a.代价;
                    a.状态 = getVal(`r-a${i}-status`) || a.状态;
                    const er = getVal(`r-a${i}-erosion`); if (er !== '') a.侵蚀系数 = clamp(Number(er), 0, 20);
                });
            });
        });

        // 资源：保存单个武装
        body.querySelectorAll('[data-save-equip]').forEach(btn => {
            btn.addEventListener('click', () => {
                const i = Number(btn.dataset.saveEquip);
                commitUpdate(sd => {
                    const e = sd.主角?.资源?.炼金武装?.[i]; if (!e) return;
                    e.部位 = getVal(`r-e${i}-slot`) || e.部位;
                    e.名称 = getVal(`r-e${i}-name`) || e.名称;
                    e.品质 = getSel(`r-e${i}-quality`) || e.品质;
                    e.特效 = getVal(`r-e${i}-effect`) || e.特效;
                });
            });
        });

        // 资源：保存单个物品
        body.querySelectorAll('[data-save-item]').forEach(btn => {
            btn.addEventListener('click', () => {
                const i = Number(btn.dataset.saveItem);
                commitUpdate(sd => {
                    const it = sd.主角?.资源?.战术背包?.[i]; if (!it) return;
                    it.名称 = getVal(`r-i${i}-name`) || it.名称;
                    const q = getVal(`r-i${i}-qty`); if (q !== '') it.数量 = Number(q);
                    it.描述 = getVal(`r-i${i}-desc`) || it.描述;
                    it.分类 = getVal(`r-i${i}-cat`) || it.分类;
                });
            });
        });

        // 资源：删除
        body.querySelectorAll('.del[data-type]').forEach(el => {
            el.addEventListener('click', () => {
                const type = el.dataset.type, idx = Number(el.dataset.idx);
                commitUpdate(sd => {
                    const arr = sd.主角?.资源?.[type];
                    if (arr && arr[idx]) { arr.splice(idx, 1); toastr.success(`已删除 ${type} #${idx+1}`); }
                });
            });
        });

        // 资源：添加
        body.querySelector('#ty-add-yan')?.addEventListener('click', () => {
            const name = getVal('add-y-name');
            if (!name) { toastr.error('请输入言灵名称'); return; }
            commitUpdate(sd => {
                if (!sd.主角) sd.主角 = {}; if (!sd.主角.资源) sd.主角.资源 = {};
                if (!sd.主角.资源.言灵) sd.主角.资源.言灵 = [];
                sd.主角.资源.言灵.push({
                    名称: name,
                    掌握程度: getSel('add-y-level') || '初阶',
                    效果: getVal('add-y-effect') || '',
                    冷却状态: '可用',
                    代价: getVal('add-y-cost') || ''
                });
            });
        });
        body.querySelector('#ty-add-auth')?.addEventListener('click', () => {
            const name = getVal('add-a-name');
            if (!name) { toastr.error('请输入权柄名称'); return; }
            commitUpdate(sd => {
                if (!sd.主角) sd.主角 = {}; if (!sd.主角.资源) sd.主角.资源 = {};
                if (!sd.主角.资源.龙王权柄) sd.主角.资源.龙王权柄 = [];
                sd.主角.资源.龙王权柄.push({
                    名称: name,
                    阶位: getSel('add-a-stage') || '初觉',
                    效果: getVal('add-a-effect') || '',
                    代价: getVal('add-a-cost') || '',
                    状态: '可用',
                    侵蚀系数: 0
                });
            });
        });
        body.querySelector('#ty-add-equip')?.addEventListener('click', () => {
            const name = getVal('add-e-name');
            if (!name) { toastr.error('请输入武装名称'); return; }
            commitUpdate(sd => {
                if (!sd.主角) sd.主角 = {}; if (!sd.主角.资源) sd.主角.资源 = {};
                if (!sd.主角.资源.炼金武装) sd.主角.资源.炼金武装 = [];
                sd.主角.资源.炼金武装.push({
                    部位: getVal('add-e-slot') || '双手',
                    名称: name,
                    品质: getSel('add-e-quality') || '普通',
                    特效: getVal('add-e-effect') || ''
                });
            });
        });
        body.querySelector('#ty-add-item')?.addEventListener('click', () => {
            const name = getVal('add-i-name');
            if (!name) { toastr.error('请输入物品名称'); return; }
            commitUpdate(sd => {
                if (!sd.主角) sd.主角 = {}; if (!sd.主角.资源) sd.主角.资源 = {};
                if (!sd.主角.资源.战术背包) sd.主角.资源.战术背包 = [];
                sd.主角.资源.战术背包.push({
                    名称: name,
                    数量: Number(getVal('add-i-qty')) || 1,
                    描述: getVal('add-i-desc') || '',
                    分类: getVal('add-i-cat') || '道具'
                });
            });
        });

        // 角色保存
        body.querySelectorAll('[data-save-char]').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.dataset.saveChar;
                commitUpdate(sd => {
                    const c = sd.角色?.[name]; if (!c) return;
                    const aff = getVal(`ch-${name}-aff`); if (aff !== '') c.关系.好感度 = clamp(calcDelta(c.关系.好感度, aff), -100, 100);
                    const rel = getVal(`ch-${name}-rel`); if (rel) c.关系.当前关系 = rel;
                    const away = getVal(`ch-${name}-away`); c.状态.是否在场 = away === 'true';
                    const cl = getVal(`ch-${name}-cloth`); if (cl) c.状态.服饰 = cl;
                    const po = getVal(`ch-${name}-pose`); if (po) c.状态.姿势 = po;
                    const bd = getVal(`ch-${name}-body`); if (bd) c.状态.身体细节 = bd;
                    const bc = getVal(`ch-${name}-basecp`); if (bc !== '') c.战力.基础战斗力 = Math.max(0, Number(bc));
                    const cc = getVal(`ch-${name}-curcp`); if (cc !== '') c.战力.当前战斗力 = Math.max(0, Number(cc));
                    const bl = getVal(`ch-${name}-bloodline`); if (bl) c.战力.血统评级 = bl;
                });
            });
        });

        // 阵营保存
        body.querySelectorAll('[data-save-fac]').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.dataset.saveFac;
                commitUpdate(sd => {
                    const v = getVal(`fac-${name}`);
                    if (v !== '') sd.阵营[name] = clamp(calcDelta(sd.阵营[name], v), -100, 100);
                });
            });
        });
    }

    buildNav();
    await initMvu();
    console.log('[天意] 已加载');
})();
