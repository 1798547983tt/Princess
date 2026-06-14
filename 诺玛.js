(function() {
    const parentWin = window.parent ?? window;
    const parentDoc = parentWin.document;
    const scriptId = typeof getScriptId === 'function' ? getScriptId() : 'worldbook-ball-' + Date.now();

    console.log('[悬浮球 JSON版本] 脚本开始加载...');

    const oldRoots = parentDoc.querySelectorAll(`[script_id="${scriptId}"]`);
    oldRoots.forEach(el => el.remove());

    const BOOK_FILE = '肚子疼和乐扣的龙族世界书（长公主';
    const BOOK_SECTIONS = [
        {
            id: 'prequel', label: '龙族前传：冰海王座', icon: '○',
            color: '#94a3b8', accent: 'rgba(148,163,184,',
            overview: { uid: '168', label: '剧情总览' },
            chapters: [
                { uid: '169', label: '序幕：楔子' },
                { uid: '170', label: '第一幕：钦差大臣' },
                { uid: '171', label: '第二幕：末代皇孙' },
                { uid: '172', label: '第三幕：零号' },
                { uid: '173', label: '第四幕：誓言' },
                { uid: '174', label: '第五幕：燃烧的圣诞夜' },
                { uid: '175', label: '第六幕：王的裁决' },
                { uid: '176', label: '第七幕：新约' }
            ]
        },
        {
            id: 'lz1', label: '龙族Ⅰ：火之晨曦', icon: 'Ⅰ',
            color: '#60a5fa', accent: 'rgba(96,165,250,',
            overview: { uid: '9', label: '剧情总览' },
            chapters: [
                { uid: '17', label: '第一幕：卡塞尔之门' },
                { uid: '28', label: '第二幕：黄金瞳' },
                { uid: '29', label: '第三幕：恺撒' },
                { uid: '30', label: '第四幕：青铜城' },
                { uid: '31', label: '第五幕：龙影' },
                { uid: '32', label: '第六幕：星与花' },
                { uid: '34', label: '第七幕：弟弟' },
                { uid: '35', label: '第八幕：哥哥' },
                { uid: '36', label: '第九幕：龙墓' },
                { uid: '37', label: '第十幕：七宗罪' },
                { uid: '38', label: '第十一幕：尾声' }
            ]
        },
        {
            id: 'lz2', label: '龙族Ⅱ：悼亡者之瞳', icon: 'Ⅱ',
            color: '#34d399', accent: 'rgba(52,211,153,',
            overview: { uid: '39', label: '剧情总览' },
            chapters: [
                { uid: '40', label: '序幕：雨落狂流之暗' },
                { uid: '41', label: '第一幕：生日蛋糕就是青春的墓碑' },
                { uid: '42', label: '第二幕：王牌专员' },
                { uid: '43', label: '第三幕：悬赏' },
                { uid: '44', label: '第四幕：炎魔刀舞' },
                { uid: '45', label: '第五幕：蒲公英' },
                { uid: '46', label: '第六幕：防火防盗防师兄' },
                { uid: '47', label: '第七幕：群龙的盛宴' },
                { uid: '48', label: '第八幕：康河上的叹息' },
                { uid: '49', label: '第九幕：中庭坠落' },
                { uid: '50', label: '第十幕：守夜人' },
                { uid: '51', label: '第十一幕：婚约' },
                { uid: '52', label: '第十二幕：龙骨十字' },
                { uid: '53', label: '第十三幕：血统契约' },
                { uid: '54', label: '第十四幕：罪与罚' },
                { uid: '55', label: '第十五幕：幕后的人' },
                { uid: '56', label: "第十六幕：It's a Beautiful Day" },
                { uid: '57', label: '第十七幕：悲剧舞台' },
                { uid: '58', label: '第十八幕：迷宫' },
                { uid: '59', label: '第十九幕：耶梦加得' },
                { uid: '60', label: '第二十幕：凡王之血，必以剑终' },
                { uid: '61', label: '第二十一幕：每个人的心里都有个死小孩' }
            ]
        },
        {
            id: 'lz3u', label: '龙族Ⅲ：黑月之潮（上）', icon: 'Ⅲ',
            color: '#c084fc', accent: 'rgba(192,132,252,',
            overview: { uid: '62', label: '剧情总览' },
            chapters: [
                { uid: '63', label: '第一幕：世纪婚礼' },
                { uid: '64', label: '第二幕：无解之结' },
                { uid: '65', label: '第三幕：战鼓之心' },
                { uid: '66', label: '第四幕：黑海白月' },
                { uid: '67', label: '第五幕：日本分部' },
                { uid: '68', label: '第六幕：王牌组合' },
                { uid: '69', label: '第七幕：黄泉之路' },
                { uid: '70', label: '第八幕：极乐天都' },
                { uid: '71', label: '第九幕：源氏重工' },
                { uid: '72', label: '第十幕：每只象龟心中都有一处温暖的水坑' },
                { uid: '73', label: '第十一幕：格陵兰阴影' },
                { uid: '74', label: '第十二幕：亚种' },
                { uid: '75', label: '第十三幕：葬神之所' },
                { uid: '76', label: '第十四幕：王的血祭' },
                { uid: '77', label: '第十五幕：潜龙升空之海' }
            ]
        },
        {
            id: 'lz3m', label: '龙族Ⅲ：黑月之潮（中）', icon: 'Ⅲ',
            color: '#e879f9', accent: 'rgba(232,121,249,',
            overview: { uid: '78', label: '剧情总览' },
            chapters: [
                { uid: '79', label: '第一幕：风与潮之夜' },
                { uid: '80', label: '第二幕：浩劫的轮回' },
                { uid: '81', label: '第三幕：老板' },
                { uid: '82', label: '第四幕：檀香味头发的女孩' },
                { uid: '83', label: '第五幕：荆棘丛中的男孩' },
                { uid: '84', label: '第六幕：男人的花道' },
                { uid: '85', label: '第七幕：樱花与红莲' },
                { uid: '86', label: '第八幕：进击的老鼠队' },
                { uid: '87', label: '第九幕：神国画卷' },
                { uid: '88', label: '第十幕：正义的朋友' },
                { uid: '89', label: '第十一幕：末代皇帝&最后一个克格勃' }
            ]
        },
        {
            id: 'lz3l', label: '龙族Ⅲ：黑月之潮（下）', icon: 'Ⅲ',
            color: '#fb7185', accent: 'rgba(251,113,133,',
            overview: { uid: '90', label: '剧情总览' },
            chapters: [
                { uid: '91', label: '第一幕：源家次子' },
                { uid: '92', label: '第二幕：东京爱情故事' },
                { uid: '93', label: '第三幕：古事记' },
                { uid: '94', label: '第四幕：黑鸥港的幽灵' },
                { uid: '95', label: '第五幕：井中枯鬼' },
                { uid: '96', label: '第六幕：真红之土' },
                { uid: '97', label: '第七幕：怪兽组合' },
                { uid: '98', label: '第八幕：家庭晚宴' },
                { uid: '99', label: '第九幕：我们都是小怪兽' },
                { uid: '100', label: '第十幕：迎着阳光盛大逃亡' },
                { uid: '101', label: '第十一幕：来自北极的故人' },
                { uid: '102', label: '第十二幕：无天无地之所' },
                { uid: '103', label: '第十三幕：刺王杀驾之夜' },
                { uid: '104', label: '第十四幕：樱之坠' },
                { uid: '105', label: '第十五幕：鬼之路' },
                { uid: '106', label: '第十六幕：神陵' },
                { uid: '107', label: '第十七幕：老板娘' },
                { uid: '108', label: '第十八幕：风与潮之夜Ⅱ' },
                { uid: '109', label: '第十九幕：达摩克利斯之剑' },
                { uid: '110', label: '第二十幕：漆黑之日' },
                { uid: '111', label: '第二十一幕：小丑' },
                { uid: '112', label: '第二十二幕：樱怒之日' },
                { uid: '113', label: '第二十三幕：天谴' },
                { uid: '114', label: '第二十四幕：さよなら，Friends' }
            ]
        },
        {
            id: 'lz4', label: '龙族IV：奥丁之渊', icon: 'Ⅳ',
            color: '#fbbf24', accent: 'rgba(251,191,36,',
            overview: { uid: '150', label: '剧情总览' },
            chapters: [
                { uid: '151', label: '序幕：通往世界尽头的航路' },
                { uid: '152', label: '第一幕：狂欢夜之舞' },
                { uid: '153', label: '第二幕：十五岁少年的葬礼' },
                { uid: '154', label: '第三幕：新娘养成学院' },
                { uid: '155', label: '第四幕：元老' },
                { uid: '156', label: '第五幕：恰同学少年' },
                { uid: '157', label: '第六幕：苏小妍' },
                { uid: '158', label: '第七幕：尼伯龙根之门' },
                { uid: '159', label: '第八幕：奥丁的阴影' },
                { uid: '160', label: '第九幕：无限循环之梦' },
                { uid: '161', label: '第十幕：楚天骄' },
                { uid: '162', label: '第十一幕：邵公子的夏季攻略' },
                { uid: '163', label: '第十二幕：苏晓檨的夏季攻略' },
                { uid: '164', label: '第十三幕：猎人小屋' },
                { uid: '165', label: '第十四幕：亡命之徒无路可退' },
                { uid: '166', label: '第十五幕：王从天降愤怒猞狠' },
                { uid: '167', label: '第十六幕：尾声' }
            ]
        },
        {
            id: 'lz5', label: '龙族V：悼亡者归来', icon: 'Ⅴ',
            color: '#ef4444', accent: 'rgba(239,68,68,',
            overview: { uid: '4', label: '剧情总览' },
            chapters: [
                { uid: '178', label: '第一幕：全民公敌' },
                { uid: '179', label: '第二幕：故人' },
                { uid: '180', label: '第三幕：鲸歌' },
                { uid: '181', label: '第四幕：雷霆与守望者（一）' },
                { uid: '182', label: '第五幕：雷霆与守望者（二）' },
                { uid: '183', label: '第六幕：利维坦之歌' },
                { uid: '184', label: '第七幕：但为君故（一）' },
                { uid: '185', label: '第八幕：但为君故（二）' },
                { uid: '186', label: '第九幕：但为君故（三）' },
                { uid: '187', label: '第十幕：但为君故（四）' },
                { uid: '188', label: '第十一幕：但为君故（五）' },
                { uid: '189', label: '第十二幕：但为君故（六）' },
                { uid: '190', label: '第十三幕：但为君故（七）' }
            ]
        }
    ];

    const DLC_SECTIONS = [
        {
            id: 'cultivation', label: '修仙', icon: '修',
            color: '#a78bfa', accent: 'rgba(167,139,250,',
            overview: { uid: '231', label: '修仙开关' },
            chapters: [
                { uid: '252', label: '修仙世界观总纲' },
                { uid: '244', label: '修仙修炼体系' },
                { uid: '233', label: '修仙境界系统' },
                { uid: '247', label: '修仙功法系统' },
                { uid: '249', label: '修仙本命神通' },
                { uid: '248', label: '修仙丹药系统' },
                { uid: '246', label: '修仙灵气复苏' },
                { uid: '245', label: '修仙灵域体系' },
                { uid: '236', label: '修仙势力总览' },
                { uid: '235', label: '修仙心魔系统' },
                { uid: '234', label: '修仙战力计算公式' },
                { uid: '250', label: '修仙NPC命名规则' },
                { uid: '251', label: '修仙封天大阵' },
                { uid: '232', label: '修仙变量更新规则' }
            ]
        }
    ];

    const CHARACTER_SECTIONS = [
        {
            id: 'feminized', label: '娘化', icon: '娘',
            color: '#f472b6', accent: 'rgba(244,114,182,',
            overview: null,
            chapters: [
                { uid: '229', label: '源紫女（女源稚女）' },
                { uid: '212', label: '路茗子（女路鸣泽）' },
                { uid: '228', label: '源紫笙（女源稚生）' },
                { uid: '206', label: '凯莎（女恺撒）' },
                { uid: '207', label: '赫尔佐歌（女赫尔佐格）' },
                { uid: '204', label: '楚紫涵（女楚子航）' },
                { uid: '205', label: '路明妃（女路明非）' }
            ]
        },
        {
            id: 'normal', label: '正常', icon: '正',
            color: '#60a5fa', accent: 'rgba(96,165,250,',
            overview: null,
            chapters: [
                { uid: '121', label: '源稚女' },
                { uid: '191', label: '路鸣泽' },
                { uid: '120', label: '源稚生' },
                { uid: '12', label: '恺撒' },
                { uid: '119', label: '赫尔佐格' },
                { uid: '13', label: '楚子航' },
                { uid: '1', label: '路明非' }
            ]
        },
        {
            id: 'oc', label: 'oc（可投稿）', icon: 'OC',
            color: '#fb923c', accent: 'rgba(251,146,60,',
            overview: null,
            chapters: [
                { uid: '222', label: '顾清寒大王' }
            ]
        }
    ];

    const STYLES = `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Noto+Serif+SC:wght@400;600;700;900&family=Orbitron:wght@400;500;700;900&family=Rajdhani:wght@300;400;500;600;700&family=ZCOOL+KuaiLe&display=swap');

        /* ===== DRAGON SEAL (floating ball - untouched) ===== */
        .dragon-seal {
            position: fixed !important;
            bottom: 40px !important;
            right: 40px !important;
            width: 72px !important;
            height: 80px !important;
            cursor: pointer !important;
            z-index: 2147483647 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            user-select: none !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            filter: drop-shadow(0 0 12px rgba(212, 175, 55, 0.4)) drop-shadow(0 0 30px rgba(212, 175, 55, 0.15));
            transition: filter 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.3s cubic-bezier(0.22, 1, 0.36, 1) !important;
        }
        .dragon-seal:hover {
            filter: drop-shadow(0 0 18px rgba(212, 175, 55, 0.7)) drop-shadow(0 0 50px rgba(212, 175, 55, 0.3)) !important;
            transform: scale(1.08) !important;
        }
        .dragon-seal:active { transform: scale(0.96) !important; }
        .seal-hex { position: relative; width: 72px; height: 80px; }
        .seal-hex svg { position: absolute; inset: 0; width: 100%; height: 100%; }
        .seal-glyph { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 2; }
        .seal-glyph span {
            font-family: 'Noto Serif SC', 'SimSun', serif;
            font-size: 1.7rem; font-weight: 900;
            background: linear-gradient(180deg, #f5e6a3 0%, #d4af37 40%, #b8860b 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
            filter: drop-shadow(0 0 6px rgba(212, 175, 55, 0.6));
            line-height: 1; transform: translateY(-1px);
        }
        .seal-particles { position: absolute; inset: -12px; z-index: 1; animation: seal-orbit 12s linear infinite; }
        .seal-particles .dot {
            position: absolute; width: 3px; height: 3px; border-radius: 50%;
            background: #d4af37; box-shadow: 0 0 6px #d4af37, 0 0 12px rgba(212, 175, 55, 0.4);
        }
        .seal-particles .dot:nth-child(1) { top: 0; left: 50%; animation: dot-pulse 2s 0s ease-in-out infinite; }
        .seal-particles .dot:nth-child(2) { top: 25%; right: 0; animation: dot-pulse 2s 0.4s ease-in-out infinite; }
        .seal-particles .dot:nth-child(3) { bottom: 25%; right: 0; animation: dot-pulse 2s 0.8s ease-in-out infinite; }
        .seal-particles .dot:nth-child(4) { bottom: 0; left: 50%; animation: dot-pulse 2s 1.2s ease-in-out infinite; }
        .seal-particles .dot:nth-child(5) { bottom: 25%; left: 0; animation: dot-pulse 2s 1.6s ease-in-out infinite; }
        .seal-particles .dot:nth-child(6) { top: 25%; left: 0; animation: dot-pulse 2s 2.0s ease-in-out infinite; }
        @keyframes seal-orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes dot-pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.5); } }
        .seal-ring { position: absolute; inset: -6px; border: 1px solid rgba(212, 175, 55, 0.15); border-radius: 50%; animation: ring-spin 20s linear infinite; }
        .seal-ring::before { content: ''; position: absolute; top: -2px; left: 50%; width: 4px; height: 4px; background: #d4af37; border-radius: 50%; box-shadow: 0 0 8px #d4af37; }
        @keyframes ring-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .dragon-seal.idle { animation: seal-breathe 4s ease-in-out infinite; }
        @keyframes seal-breathe {
            0%, 100% { filter: drop-shadow(0 0 12px rgba(212, 175, 55, 0.4)) drop-shadow(0 0 30px rgba(212, 175, 55, 0.15)); }
            50% { filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.6)) drop-shadow(0 0 40px rgba(212, 175, 55, 0.25)); }
        }

        /* ==============================================
           PANEL - Merged: Gold Dragon + NORMA effects
           ============================================== */
        .dragon-panel {
            position: fixed;
            width: 560px;
            max-height: 84vh;
            background: rgba(6, 12, 24, 0.92);
            backdrop-filter: blur(40px) saturate(1.4);
            border: 1px solid rgba(212, 175, 55, 0.1);
            border-radius: 4px;
            z-index: 2147483646;
            display: none;
            overflow: hidden;
            color: #dce4ee;
            box-shadow:
                0 0 80px rgba(212, 175, 55, 0.04),
                0 8px 40px rgba(0, 0, 0, 0.7),
                inset 0 1px 0 rgba(255, 255, 255, 0.02);
        }
        .dragon-panel.visible {
            display: flex;
            flex-direction: column;
            animation: panel-rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes panel-rise {
            from { opacity: 0; transform: translateY(30px) scale(0.96); filter: blur(8px); }
            to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        /* Hex mesh background */
        .panel-hex-mesh {
            position: absolute; inset: 0; opacity: 0.02; pointer-events: none; z-index: 0;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23d4af37'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        /* Scan overlay */
        .panel-scan {
            position: absolute; inset: 0; pointer-events: none; z-index: 20; overflow: hidden;
        }
        .panel-scan::before {
            content: '';
            position: absolute; left: 0; width: 100%; height: 2px;
            background: linear-gradient(90deg, transparent 5%, rgba(212,175,55,0.04) 30%, rgba(212,175,55,0.08) 50%, rgba(212,175,55,0.04) 70%, transparent 95%);
            box-shadow: 0 0 30px rgba(212,175,55,0.05);
            animation: scan-sweep 7s linear infinite;
        }
        @keyframes scan-sweep {
            0%   { top: -4px; opacity: 0; }
            5%   { opacity: 1; }
            95%  { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }

        /* Corner glyphs */
        .panel-corner { position: absolute; width: 18px; height: 18px; z-index: 10; opacity: 0.25; }
        .panel-corner::before, .panel-corner::after { content: ''; position: absolute; background: #d4af37; }
        .cg-tl { top: 5px; left: 5px; }
        .cg-tl::before { width: 10px; height: 1px; }
        .cg-tl::after  { width: 1px; height: 10px; }
        .cg-tr { top: 5px; right: 5px; }
        .cg-tr::before { width: 10px; height: 1px; right: 0; }
        .cg-tr::after  { width: 1px; height: 10px; right: 0; }
        .cg-bl { bottom: 5px; left: 5px; }
        .cg-bl::before { width: 10px; height: 1px; bottom: 0; }
        .cg-bl::after  { width: 1px; height: 10px; bottom: 0; }
        .cg-br { bottom: 5px; right: 5px; }
        .cg-br::before { width: 10px; height: 1px; right: 0; bottom: 0; }
        .cg-br::after  { width: 1px; height: 10px; right: 0; bottom: 0; }

        /* Noise texture */
        .panel-noise {
            position: absolute; inset: 0; opacity: 0.02; pointer-events: none; z-index: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* Top gradient bar */
        .panel-top-bar {
            height: 2px; flex-shrink: 0;
            background: linear-gradient(90deg, transparent, rgba(212,175,55,0.3) 20%, #d4af37 45%, #f5e6a3 55%, rgba(212,175,55,0.3) 80%, transparent);
            opacity: 0.5;
        }

        /* ===== HEADER ===== */
        .panel-header {
            padding: 20px 24px 16px;
            border-bottom: 1px solid rgba(212, 175, 55, 0.06);
            position: relative; z-index: 1; flex-shrink: 0;
        }

        /* Meta row */
        .header-meta {
            display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;
        }
        .meta-path {
            font-family: 'Rajdhani', monospace;
            font-size: 0.6rem; color: rgba(212,175,55,0.35); letter-spacing: 2px;
        }
        .meta-status {
            display: flex; align-items: center; gap: 6px;
            font-family: 'Rajdhani', monospace;
            font-size: 0.62rem; color: #d4af37; letter-spacing: 1.5px; text-transform: uppercase;
        }
        .status-beacon {
            width: 5px; height: 5px; background: #d4af37; border-radius: 50%;
            box-shadow: 0 0 8px #d4af37, 0 0 16px rgba(212,175,55,0.3);
            animation: beacon-pulse 2s ease-in-out infinite;
        }
        @keyframes beacon-pulse {
            0%, 100% { opacity: 1; box-shadow: 0 0 8px #d4af37; }
            50%      { opacity: 0.3; box-shadow: 0 0 4px #d4af37; }
        }

        /* Header main */
        .header-main { display: flex; align-items: center; gap: 16px; }

        .header-sigil {
            width: 52px; height: 52px; position: relative; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
        }
        .sigil-ring {
            position: absolute; inset: 0;
            border: 1px solid rgba(212,175,55,0.2); border-radius: 50%;
            animation: ring-rotate 12s linear infinite;
        }
        .sigil-ring::before {
            content: ''; position: absolute; top: -2px; left: 50%;
            width: 4px; height: 4px; background: #d4af37; border-radius: 50%;
            box-shadow: 0 0 6px #d4af37;
        }
        @keyframes ring-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .sigil-inner {
            width: 36px; height: 36px;
            border: 1px solid rgba(212,175,55,0.15); border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            background: rgba(212,175,55,0.03);
        }
        .sigil-char {
            font-family: 'Noto Serif SC', serif; font-size: 1.2rem; font-weight: 900;
            background: linear-gradient(180deg, #f5e6a3 0%, #d4af37 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
            filter: drop-shadow(0 0 6px rgba(212,175,55,0.4));
        }

        .header-text { flex: 1; }
        .header-title {
            font-family: 'Noto Serif SC', serif; font-size: 1.05rem; font-weight: 700;
            color: #dce4ee; letter-spacing: 4px;
        }
        .header-subtitle {
            font-family: 'Rajdhani', monospace; font-size: 0.62rem;
            color: rgba(212,175,55,0.35); letter-spacing: 2px; margin-top: 3px;
        }
        .header-author {
            font-family: 'ZCOOL KuaiLe', cursive; font-size: 0.82rem;
            color: #d4af37; letter-spacing: 3px; margin-top: 2px;
            text-shadow: 0 0 10px rgba(212,175,55,0.2);
        }

        .header-divider {
            margin-top: 14px; height: 1px;
            background: linear-gradient(90deg, transparent, #d4af37 30%, #f5e6a3 50%, #d4af37 70%, transparent);
            opacity: 0.2;
        }

        .panel-close {
            position: absolute; top: 18px; right: 20px;
            width: 28px; height: 28px;
            border: 1px solid rgba(212,175,55,0.08); background: rgba(212,175,55,0.02);
            color: rgba(212,175,55,0.35); font-size: 0.85rem;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            border-radius: 4px; transition: all 0.3s; line-height: 1; z-index: 10;
        }
        .panel-close:hover {
            background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.25);
            color: #ef4444; box-shadow: 0 0 12px rgba(239,68,68,0.1);
        }

        /* ===== BODY ===== */
        .panel-body {
            position: relative; padding: 10px 14px 8px;
            overflow-y: auto; flex: 1; z-index: 2;
            scrollbar-width: thin; scrollbar-color: rgba(212,175,55,0.12) transparent;
        }
        .panel-body::-webkit-scrollbar { width: 3px; }
        .panel-body::-webkit-scrollbar-track { background: transparent; }
        .panel-body::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.12); border-radius: 2px; }
        .panel-body::-webkit-scrollbar-thumb:hover { background: rgba(212,175,55,0.25); }

        /* ===== SECTION CARDS ===== */
        .section-card {
            margin-bottom: 6px;
            border: 1px solid rgba(212,175,55,0.04);
            border-radius: 3px;
            background: rgba(10,20,38,0.5);
            overflow: hidden;
            transition: border-color 0.35s, box-shadow 0.35s;
            position: relative;
        }
        .section-card:hover {
            border-color: rgba(212,175,55,0.1);
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .section-card.expanded {
            border-color: rgba(212,175,55,0.1);
            box-shadow: 0 0 24px rgba(212,175,55,0.02);
        }

        /* Left accent rail */
        .section-accent {
            position: absolute; left: 0; top: 0; width: 2px; height: 100%;
            transition: opacity 0.3s, box-shadow 0.3s; opacity: 0.3;
        }
        .section-card:hover .section-accent,
        .section-card.expanded .section-accent {
            opacity: 0.8; box-shadow: 0 0 10px currentColor;
        }

        .section-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 12px 16px; cursor: pointer; transition: background 0.25s; position: relative;
        }
        .section-header:hover { background: rgba(212,175,55,0.02); }

        .section-left { display: flex; align-items: center; gap: 12px; }
        .section-icon {
            width: 30px; height: 30px; display: grid; place-items: center;
            font-family: 'Orbitron', monospace; font-size: 0.65rem; font-weight: 700;
            border: 1px solid; border-radius: 3px; flex-shrink: 0; position: relative;
        }
        .section-icon::after {
            content: ''; position: absolute; inset: -2px; border-radius: 3px;
            box-shadow: 0 0 10px currentColor; opacity: 0.12; transition: opacity 0.3s;
        }
        .section-card:hover .section-icon::after,
        .section-card.expanded .section-icon::after { opacity: 0.3; }

        .section-name {
            font-family: 'Noto Serif SC', serif; font-size: 0.84rem;
            font-weight: 600; letter-spacing: 1px;
        }

        .section-right { display: flex; align-items: center; gap: 10px; }
        .section-count {
            font-family: 'Rajdhani', monospace; font-size: 0.58rem;
            color: rgba(212,175,55,0.35); letter-spacing: 1.5px; white-space: nowrap;
        }
        .section-chevron {
            width: 16px; height: 16px; position: relative;
            transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .section-chevron::before {
            content: ''; position: absolute; left: 50%; top: 50%;
            width: 6px; height: 6px;
            border-right: 1.5px solid rgba(212,175,55,0.3);
            border-bottom: 1.5px solid rgba(212,175,55,0.3);
            transform: translate(-50%, -60%) rotate(45deg);
            transition: border-color 0.3s;
        }
        .section-card.expanded .section-chevron { transform: rotate(180deg); }
        .section-header:hover .section-chevron::before { border-color: #d4af37; }

        /* Section body */
        .section-body {
            max-height: 0; overflow: hidden;
            transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .section-card.expanded .section-body { max-height: 3000px; }
        .section-inner {
            padding: 2px 12px 12px;
            border-top: 1px solid rgba(212,175,55,0.04);
        }

        /* Overview row */
        .overview-row {
            display: flex; align-items: center; justify-content: space-between;
            padding: 10px 12px; margin: 6px 0;
            background: rgba(212,175,55,0.02); border: 1px solid rgba(212,175,55,0.04);
            border-radius: 2px; position: relative;
        }
        .overview-label {
            display: flex; align-items: center; gap: 10px;
            font-family: 'Noto Serif SC', serif; font-size: 0.8rem;
            font-weight: 700; letter-spacing: 1px;
            text-shadow: 0 0 8px currentColor;
        }
        .overview-badge {
            font-family: 'Rajdhani', monospace; font-size: 0.55rem;
            padding: 1px 6px; border-radius: 2px;
            letter-spacing: 1.5px; text-transform: uppercase;
            border: 1px solid; font-weight: 600;
        }

        /* Chapter rows */
        .chapter-row {
            display: flex; align-items: center; justify-content: space-between;
            padding: 7px 12px; border-radius: 2px; transition: background 0.2s;
        }
        .chapter-row:hover { background: rgba(212,175,55,0.02); }
        .chapter-label {
            font-family: 'Noto Serif SC', serif; font-size: 0.76rem;
            color: rgba(212,175,55,0.6); flex: 1; transition: color 0.2s;
            letter-spacing: 0.3px; line-height: 1.5;
        }
        .chapter-row:hover .chapter-label { color: rgba(212,175,55,0.85); }

        /* ===== TOGGLE ===== */
        .toggle {
            position: relative; width: 38px; height: 19px;
            background: rgba(10,20,38,0.8);
            border: 1px solid rgba(212,175,55,0.08);
            border-radius: 2px; cursor: pointer;
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            flex-shrink: 0; box-shadow: inset 0 1px 4px rgba(0,0,0,0.4);
        }
        .toggle.on {
            background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.3));
            border-color: rgba(212,175,55,0.3);
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.2), 0 0 12px rgba(212,175,55,0.1);
        }
        .toggle::after {
            content: ''; position: absolute;
            width: 13px; height: 13px; border-radius: 2px;
            top: 2px; left: 2px;
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(145deg, #2a3040, #1a2030);
            box-shadow: 0 1px 3px rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.04);
        }
        .toggle.on::after {
            transform: translateX(19px);
            background: linear-gradient(145deg, #f5e6a3, #d4af37);
            box-shadow: 0 0 10px rgba(212,175,55,0.5), 0 0 20px rgba(212,175,55,0.2);
            border-color: rgba(255,255,255,0.1);
        }
        .toggle.loading {
            pointer-events: none;
            border-color: rgba(212,175,55,0.2);
            background: rgba(10,20,38,0.8);
        }
        .toggle.loading::after {
            transition: none;
            animation: toggle-knob-pulse 1s ease-in-out infinite;
        }
        @keyframes toggle-knob-pulse {
            0%, 100% { background: #1a2030; box-shadow: 0 1px 3px rgba(0,0,0,0.5); border-color: rgba(255,255,255,0.04); }
            50%      { background: #d4af37; box-shadow: 0 0 10px rgba(212,175,55,0.6); border-color: rgba(212,175,55,0.3); }
        }
        .toggle.unknown { background: rgba(160,110,30,0.12); border-color: rgba(160,110,30,0.25); }
        .toggle.unknown::after { background: #a06e1e; }
        @keyframes toggle-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-3px)} 75%{transform:translateX(3px)} }
        .toggle.error { animation: toggle-shake 0.3s ease; border-color: rgba(239,68,68,0.35); }

        /* ===== BATCH BAR ===== */
        .batch-bar {
            display: flex; align-items: center; gap: 8px;
            padding: 4px 0 8px; margin-bottom: 4px;
            border-bottom: 1px solid rgba(212,175,55,0.03);
        }
        .batch-btn {
            font-family: 'Noto Serif SC', serif; font-size: 0.62rem;
            padding: 4px 12px;
            border: 1px solid rgba(212,175,55,0.08); border-radius: 2px;
            background: rgba(212,175,55,0.02); color: rgba(212,175,55,0.5);
            cursor: pointer; transition: all 0.25s; white-space: nowrap; letter-spacing: 1px;
        }
        .batch-btn:hover {
            background: rgba(212,175,55,0.06); color: rgba(212,175,55,0.7);
            border-color: rgba(212,175,55,0.15);
        }
        .batch-btn:active { transform: scale(0.97); }
        .batch-btn.loading { opacity: 0.5; pointer-events: none; }
        .batch-btn.enable-all:hover {
            background: rgba(212,175,55,0.1); color: #d4af37;
            border-color: rgba(212,175,55,0.25);
        }
        .batch-btn.disable-all:hover {
            background: rgba(100,80,120,0.08); color: rgba(180,160,200,0.7);
            border-color: rgba(140,120,160,0.2);
        }
        .batch-status {
            font-family: 'Rajdhani', monospace; font-size: 0.55rem;
            color: rgba(212,175,55,0.3); margin-left: auto; letter-spacing: 1px;
        }

        /* ===== FOOTER ===== */
        .panel-footer {
            padding: 12px 20px 14px;
            border-top: 1px solid rgba(212,175,55,0.06);
            display: flex; align-items: center; justify-content: space-between;
            position: relative; z-index: 1; flex-shrink: 0;
        }
        .footer-hint {
            font-family: 'Rajdhani', sans-serif; font-size: 0.6rem;
            color: rgba(212,175,55,0.25); letter-spacing: 1.5px;
        }
        .footer-credit { display: flex; align-items: center; gap: 8px; }
        .credit-name {
            font-family: 'ZCOOL KuaiLe', cursive; font-size: 0.85rem;
            color: #d4af37; letter-spacing: 3px;
            text-shadow: 0 0 10px rgba(212,175,55,0.2);
        }
        .credit-ver {
            font-family: 'Rajdhani', monospace; font-size: 0.55rem;
            color: rgba(212,175,55,0.2); letter-spacing: 1px;
        }
        .panel-bottom-glow {
            height: 1px; flex-shrink: 0;
            background: linear-gradient(90deg, transparent, rgba(212,175,55,0.2) 30%, rgba(245,230,163,0.15) 70%, transparent);
        }

        /* ===== INIT MSG ===== */
        .init-msg {
            text-align: center; padding: 40px 0;
            font-family: 'Rajdhani', monospace; font-size: 0.7rem;
            color: rgba(212,175,55,0.2); letter-spacing: 4px; text-transform: uppercase;
        }
        .init-msg .dot-anim::after { content: ''; animation: dots 1.5s steps(4, end) infinite; }
        @keyframes dots { 0%{content:''} 25%{content:'.'} 50%{content:'..'} 75%{content:'...'} }

        /* ===== TAB BAR ===== */
        .panel-tabs {
            display: flex; position: relative; z-index: 1; flex-shrink: 0;
            border-bottom: 1px solid rgba(212,175,55,0.06);
        }
        .panel-tab {
            flex: 1; padding: 10px 20px; text-align: center; cursor: pointer;
            font-family: 'Noto Serif SC', serif; font-size: 0.82rem; font-weight: 600;
            letter-spacing: 2px; position: relative;
            color: rgba(220,228,238,0.3); transition: all 0.35s;
            border-bottom: 2px solid transparent;
        }
        .panel-tab:hover { color: rgba(220,228,238,0.5); background: rgba(255,255,255,0.01); }
        .panel-tab.active { color: #d4af37; border-bottom-color: #d4af37; }
        .panel-tab.active.dlc-tab { color: #a78bfa; border-bottom-color: #a78bfa; }
        .panel-tab.active.char-tab { color: #f472b6; border-bottom-color: #f472b6; }
        .panel-tab .tab-icon { margin-right: 6px; font-size: 0.9rem; }

        @media (max-width: 600px) {
            .dragon-panel { width: calc(100vw - 16px); left: 8px !important; }
            .dragon-seal { transform: scale(0.75) !important; transform-origin: bottom right !important; }
            .dragon-seal:hover { transform: scale(0.8) !important; }
            .dragon-seal:active { transform: scale(0.7) !important; }
        }
    `;

    // Inject CSS
    const styleEl = parentDoc.createElement('style');
    styleEl.setAttribute('script_id', scriptId);
    styleEl.textContent = STYLES;
    parentDoc.head.appendChild(styleEl);

    // Root container
    const root = parentDoc.createElement('div');
    root.setAttribute('script_id', scriptId);
    root.style.cssText = 'position: fixed; z-index: 2147483647; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;';
    parentDoc.body.appendChild(root);

    // ===== Drag logic =====
    function initDrag(ball) {
        let isDragging = false;
        let startX, startY, ballX, ballY;

        function constrainPosition() {
            if (ball.style.right !== 'auto' && ball.style.right !== '') return;
            const rect = ball.getBoundingClientRect();
            let currentLeft = parseFloat(ball.style.left) || rect.left;
            let currentTop = parseFloat(ball.style.top) || rect.top;
            const maxLeft = parentWin.innerWidth - rect.width;
            const maxTop = parentWin.innerHeight - rect.height;
            if (currentLeft > maxLeft) ball.style.left = maxLeft + 'px';
            if (currentLeft < 0) ball.style.left = '0px';
            if (currentTop > maxTop) ball.style.top = maxTop + 'px';
            if (currentTop < 0) ball.style.top = '0px';
        }

        // const savedX = parentWin.localStorage.getItem('floatingBall_x');
        // const savedY = parentWin.localStorage.getItem('floatingBall_y');
        const isMobile = parentWin.innerWidth <= 600;

        // 强制一开始出现在屏幕正中间，暂时忽略以前的缓存位置，确保绝对能看见
        // (球的原始尺寸是 72x80，所以中心点要减去一半的宽高 36 和 40)
        ball.style.left = (parentWin.innerWidth / 2 - 36) + 'px';
        ball.style.top = (parentWin.innerHeight / 2 - 40) + 'px';
        ball.style.right = 'auto';
        ball.style.bottom = 'auto';

        function handleDragStart(e) {
            if (e.type === 'touchstart') {
                if (e.touches.length > 1) return;
            } else {
                e.preventDefault();
            }
            isDragging = false;
            startX = e.touches ? e.touches[0].clientX : e.clientX;
            startY = e.touches ? e.touches[0].clientY : e.clientY;
            const rect = ball.getBoundingClientRect();
            ballX = rect.left; ballY = rect.top;

            const onMove = (me) => {
                const mx = me.touches ? me.touches[0].clientX : me.clientX;
                const my = me.touches ? me.touches[0].clientY : me.clientY;
                const dx = mx - startX, dy = my - startY;
                if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                    if (me.cancelable !== false) me.preventDefault(); // 防止屏幕随之滚动
                    isDragging = true; ball.classList.remove('idle');
                    ball.style.right = 'auto'; ball.style.bottom = 'auto';
                    const maxLeft = parentWin.innerWidth - rect.width;
                    const maxTop = parentWin.innerHeight - rect.height;
                    ball.style.left = Math.max(0, Math.min(maxLeft, ballX + dx)) + 'px';
                    ball.style.top = Math.max(0, Math.min(maxTop, ballY + dy)) + 'px';
                }
            };
            const onUp = () => {
                parentDoc.removeEventListener('mousemove', onMove);
                parentDoc.removeEventListener('mouseup', onUp);
                parentDoc.removeEventListener('touchmove', onMove);
                parentDoc.removeEventListener('touchend', onUp);
                if (isDragging) {
                    const r = ball.getBoundingClientRect();
                    parentWin.localStorage.setItem('floatingBall_x', r.left);
                    parentWin.localStorage.setItem('floatingBall_y', r.top);
                    ball.classList.add('idle');
                }
            };
            parentDoc.addEventListener('mousemove', onMove);
            parentDoc.addEventListener('mouseup', onUp);
            parentDoc.addEventListener('touchmove', onMove, { passive: false });
            parentDoc.addEventListener('touchend', onUp);
        }

        ball.addEventListener('mousedown', handleDragStart);
        ball.addEventListener('touchstart', handleDragStart, { passive: false });
        parentWin.addEventListener('resize', constrainPosition);

        return { isDragging: () => isDragging };
    }

    async function getEntryState(uid) {
        if (typeof triggerSlash !== 'function') return null;
        try { const r = await triggerSlash(`/getentryfield file="${BOOK_FILE}" field=disable ${uid}`); return r.trim() === 'false'; }
        catch (e) { return null; }
    }

    async function setEntryState(uid, enable) {
        if (typeof triggerSlash !== 'function') throw new Error('triggerSlash null');
        await triggerSlash(`/setentryfield file="${BOOK_FILE}" uid=${uid} field=disable ${enable ? 'false' : 'true'}`);
    }

    // ===== Create Dragon Seal (floating ball) =====
    const ball = parentDoc.createElement('div');
    ball.className = 'dragon-seal idle';
    ball.title = '龙族世界书控制面板';
    ball.style.pointerEvents = 'auto';
    const hexPath = 'M36 2 L66 22 L66 58 L36 78 L6 58 L6 22 Z';
    const hexInner = 'M36 8 L60 24 L60 56 L36 72 L12 56 L12 24 Z';
    ball.innerHTML = `
        <div class="seal-hex">
            <svg viewBox="0 0 72 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="sealGrad" x1="36" y1="0" x2="36" y2="80" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#f5e6a3" stop-opacity="0.9"/>
                        <stop offset="50%" stop-color="#d4af37" stop-opacity="0.8"/>
                        <stop offset="100%" stop-color="#8b6914" stop-opacity="0.7"/>
                    </linearGradient>
                    <linearGradient id="sealFill" x1="36" y1="0" x2="36" y2="80" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="rgba(20,16,28,0.95)"/>
                        <stop offset="100%" stop-color="rgba(10,8,18,0.98)"/>
                    </linearGradient>
                    <filter id="sealGlow"><feGaussianBlur stdDeviation="2" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
                </defs>
                <path d="${hexPath}" fill="url(#sealFill)" stroke="url(#sealGrad)" stroke-width="1.5" filter="url(#sealGlow)"/>
                <path d="${hexInner}" fill="none" stroke="rgba(212,175,55,0.15)" stroke-width="0.5"/>
                <line x1="18" y1="28" x2="54" y2="28" stroke="rgba(212,175,55,0.08)" stroke-width="0.5"/>
                <line x1="18" y1="52" x2="54" y2="52" stroke="rgba(212,175,55,0.08)" stroke-width="0.5"/>
                <line x1="22" y1="22" x2="22" y2="58" stroke="rgba(212,175,55,0.06)" stroke-width="0.5"/>
                <line x1="50" y1="22" x2="50" y2="58" stroke="rgba(212,175,55,0.06)" stroke-width="0.5"/>
            </svg>
            <div class="seal-glyph"><span>诺</span></div>
            <div class="seal-particles"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
            <div class="seal-ring"></div>
        </div>
    `;

    // ===== Create Panel (merged NORMA + Dragon) =====
    const panel = parentDoc.createElement('div');
    panel.className = 'dragon-panel';
    panel.style.pointerEvents = 'auto';
    panel.innerHTML = `
        <div class="panel-noise"></div>
        <div class="panel-hex-mesh"></div>
        <div class="panel-scan"></div>
        <div class="panel-corner cg-tl"></div>
        <div class="panel-corner cg-tr"></div>
        <div class="panel-corner cg-bl"></div>
        <div class="panel-corner cg-br"></div>
        <div class="panel-top-bar"></div>

        <div class="panel-header">
            <div class="header-meta">
                <span class="meta-path">SYS://WORLDBOOK_CTRL</span>
                <span class="meta-status"><span class="status-beacon"></span>LINKED</span>
            </div>
            <div class="header-main">
                <div class="header-sigil">
                    <div class="sigil-ring"></div>
                    <div class="sigil-inner"><span class="sigil-char">诺</span></div>
                </div>
                <div class="header-text">
                    <div class="header-title">世界书控制枢纽</div>
                    <div class="header-subtitle">DRAGON RAJA &middot; WORLD BOOK CONTROLLER v3.0</div>
                    <div class="header-author">顾清寒</div>
                </div>
            </div>
            <div class="header-divider"></div>
            <button class="panel-close">&#x2715;</button>
        </div>

        <div class="panel-tabs">
            <div class="panel-tab active" data-page="dragon"><span class="tab-icon">🐉</span>龙族世界书</div>
            <div class="panel-tab dlc-tab" data-page="dlc"><span class="tab-icon">📦</span>DLC</div>
            <div class="panel-tab char-tab" data-page="characters"><span class="tab-icon">📋</span>人物条目</div>
        </div>

        <div class="panel-body"></div>

        <div class="panel-footer">
            <span class="footer-hint">点击书名展开 &middot; 拨动开关控制条目</span>
            <div class="footer-credit">
                <span class="credit-name">顾清寒</span>
                <span class="credit-ver">v3.0</span>
            </div>
        </div>
        <div class="panel-bottom-glow"></div>
    `;

    root.appendChild(ball);
    root.appendChild(panel);
    console.log('[悬浮球 JSON版本] 元素已添加到页面');

    const drag = initDrag(ball);

    function positionPanel() {
        const ballRect = ball.getBoundingClientRect();
        const panelWidth = 560, panelHeight = Math.min(620, parentWin.innerHeight * 0.84);
        const gap = 14;
        let left = ballRect.right + gap, top = ballRect.top;
        if (left + panelWidth > parentWin.innerWidth) left = ballRect.left - panelWidth - gap;
        if (top + panelHeight > parentWin.innerHeight) top = parentWin.innerHeight - panelHeight - 20;
        if (top < 20) top = 20;
        panel.style.left = left + 'px';
        panel.style.top = top + 'px';
    }

    function createToggle(uid) {
        const el = parentDoc.createElement('div');
        el.className = 'toggle loading';
        el.dataset.uid = uid;
        el.onclick = async () => {
            if (el.classList.contains('loading')) return;
            el.classList.add('loading');
            const newState = !el.classList.contains('on');
            try { await setEntryState(uid, newState); el.classList.toggle('on'); }
            catch (e) { el.classList.add('error'); setTimeout(() => el.classList.remove('error'), 300); }
            finally { el.classList.remove('loading'); }
        };
        return el;
    }

    async function batchSetSection(section, enable) {
        const allUids = [...(section.overview ? [section.overview.uid] : []), ...section.chapters.map(c => c.uid)];
        for (const uid of allUids) { try { await setEntryState(uid, enable); } catch (e) {} }
    }

    async function loadToggleStates(card) {
        const toggles = card.querySelectorAll('.toggle');
        await Promise.all(Array.from(toggles).map(async (toggle) => {
            const uid = toggle.dataset.uid;
            const state = await getEntryState(uid);
            toggle.classList.remove('on', 'unknown');
            if (state === true) toggle.classList.add('on');
            else if (state === null) toggle.classList.add('unknown');
            toggle.classList.remove('loading');
        }));
    }

    const renderedPages = new Set();
    let currentPage = 'dragon';
    const panelBody = panel.querySelector('.panel-body');

    async function renderSections(sections, pageKey) {
        if (renderedPages.has(pageKey)) {
            const cards = Array.from(panelBody.querySelectorAll('.section-card'));
            await Promise.all(cards.map(c => loadToggleStates(c)));
            return;
        }

        panelBody.innerHTML = '';
        const cards = [];

        sections.forEach((sec) => {
            const card = parentDoc.createElement('div');
            card.className = 'section-card';
            card.setAttribute('data-sid', sec.id);

            // Accent rail (dynamic color via inline style)
            const accent = parentDoc.createElement('div');
            accent.className = 'section-accent';
            accent.style.background = sec.color;
            accent.style.color = sec.color;

            // Header
            const header = parentDoc.createElement('div');
            header.className = 'section-header';
            header.innerHTML = `
                <div class="section-left">
                    <div class="section-icon" style="color:${sec.color};border-color:${sec.color}">${sec.icon}</div>
                    <span class="section-name" style="color:${sec.color}">${sec.label}</span>
                </div>
                <div class="section-right">
                    <span class="section-count">${sec.chapters.length} ACTS</span>
                    <div class="section-chevron"></div>
                </div>
            `;
            header.onclick = () => card.classList.toggle('expanded');

            // Body
            const body = parentDoc.createElement('div');
            body.className = 'section-body';
            const inner = parentDoc.createElement('div');
            inner.className = 'section-inner';

            // Batch bar
            const batchBar = parentDoc.createElement('div');
            batchBar.className = 'batch-bar';
            const btnEnable = parentDoc.createElement('button');
            btnEnable.className = 'batch-btn enable-all';
            btnEnable.textContent = '全部开启';
            const btnDisable = parentDoc.createElement('button');
            btnDisable.className = 'batch-btn disable-all';
            btnDisable.textContent = '全部关闭';
            const batchStatus = parentDoc.createElement('span');
            batchStatus.className = 'batch-status';

            async function runBatch(enable) {
                btnEnable.classList.add('loading');
                btnDisable.classList.add('loading');
                batchStatus.textContent = '执行中...';
                try {
                    await batchSetSection(sec, enable);
                    await loadToggleStates(card);
                    batchStatus.textContent = '已完成';
                    setTimeout(() => { batchStatus.textContent = ''; }, 1500);
                } catch (e) {
                    batchStatus.textContent = '部分失败';
                    setTimeout(() => { batchStatus.textContent = ''; }, 2000);
                } finally {
                    btnEnable.classList.remove('loading');
                    btnDisable.classList.remove('loading');
                }
            }
            btnEnable.onclick = (e) => { e.stopPropagation(); runBatch(true); };
            btnDisable.onclick = (e) => { e.stopPropagation(); runBatch(false); };
            batchBar.append(btnEnable, btnDisable, batchStatus);
            inner.append(batchBar);

            // Overview row (only if section has overview)
            if (sec.overview) {
                const ovRow = parentDoc.createElement('div');
                ovRow.className = 'overview-row';

                const ovAccentBar = parentDoc.createElement('div');
                ovAccentBar.style.cssText = `position:absolute;left:-1px;top:50%;transform:translateY(-50%);width:3px;height:16px;border-radius:0 2px 2px 0;background:${sec.color}`;

                const ovLabel = parentDoc.createElement('span');
                ovLabel.className = 'overview-label';
                ovLabel.style.color = sec.color;
                ovLabel.textContent = sec.overview.label;

                // MASTER badge
                const ovBadge = parentDoc.createElement('span');
                ovBadge.className = 'overview-badge';
                ovBadge.style.color = sec.color;
                ovBadge.style.borderColor = sec.color;
                ovBadge.style.background = sec.accent + '0.06)';
                ovBadge.textContent = 'MASTER';
                ovLabel.append(ovBadge);

                const ovToggle = createToggle(sec.overview.uid);
                ovRow.append(ovAccentBar, ovLabel, ovToggle);
                inner.append(ovRow);
            }

            // Chapter rows
            for (const ch of sec.chapters) {
                const row = parentDoc.createElement('div');
                row.className = 'chapter-row';
                const label = parentDoc.createElement('span');
                label.className = 'chapter-label';
                label.textContent = ch.label;
                const toggle = createToggle(ch.uid);
                row.append(label, toggle);
                inner.append(row);
            }

            body.append(inner);
            card.append(accent, header, body);
            panelBody.append(card);
            cards.push(card);
        });

        await Promise.all(cards.map(c => loadToggleStates(c)));
        renderedPages.add(pageKey);
    }

    function closePanel() {
        panel.classList.remove('visible');
        setTimeout(() => { panel.style.display = 'none'; }, 600);
    }

    function switchPage(pageKey) {
        if (currentPage === pageKey) return;
        currentPage = pageKey;
        panelBody.innerHTML = '';
        renderedPages.delete(pageKey);

        const tabs = panel.querySelectorAll('.panel-tab');
        tabs.forEach(t => {
            t.classList.remove('active');
            if (t.dataset.page === pageKey) t.classList.add('active');
        });

        let sections;
        if (pageKey === 'dlc') sections = DLC_SECTIONS;
        else if (pageKey === 'characters') sections = CHARACTER_SECTIONS;
        else sections = BOOK_SECTIONS;
        renderSections(sections, pageKey);
    }

    panel.querySelectorAll('.panel-tab').forEach(tab => {
        tab.addEventListener('click', () => switchPage(tab.dataset.page));
    });

    ball.addEventListener('click', async () => {
        if (drag.isDragging()) return;
        if (!panel.classList.contains('visible')) {
            positionPanel();
            panel.style.display = 'flex';
            panel.offsetHeight;
            panel.classList.add('visible');
            let sections;
            if (currentPage === 'dlc') sections = DLC_SECTIONS;
            else if (currentPage === 'characters') sections = CHARACTER_SECTIONS;
            else sections = BOOK_SECTIONS;
            await renderSections(sections, currentPage);
        } else {
            closePanel();
        }
    });

    panel.querySelector('.panel-close').addEventListener('click', closePanel);

    parentDoc.addEventListener('mousedown', (e) => {
        if (panel.classList.contains('visible') && !panel.contains(e.target) && !ball.contains(e.target)) closePanel();
    });
    parentDoc.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel.classList.contains('visible')) closePanel();
    });
    parentWin.addEventListener('resize', () => {
        if (panel.classList.contains('visible')) positionPanel();
    });

})();
