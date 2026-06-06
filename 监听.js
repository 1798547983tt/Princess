/**
 * 龙族 RPG 辅助计算脚本
 * 监听 MVU 变量变化，自动计算战斗力、暴血状态、侵蚀修正等
 */
(function () {
    'use strict';

    // ==========================================
    // 血统基值表
    // ==========================================
    const BLOODLINE_BASE_CP = {
        'E': 0, 'D': 300, 'C': 1000, 'B': 3000, 'A': 12500,
        '超A': 18000, 'S': 50000,
        '次代种': 100000, '皇级': 100000,
        '龙王': 300000, '龙王级': 300000,
        '白王': 600000, '白王级': 600000,
        '黑王': 1500000, '黑王级': 1500000
    };

    // CP 天花板（外部加成衰减阈值）
    const CP_CEILING = {
        'E': 100, 'D': 500, 'C': 1500, 'B': 5000, 'A': 20000,
        '超A': 80000, 'S': 80000,
        '次代种': 200000, '皇级': 200000,
        '龙王': 500000, '龙王级': 500000,
        '白王': 1000000, '白王级': 1000000,
        '黑王': Infinity, '黑王级': Infinity
    };

    // CP 等级显示阈值
    const CP_RANK_THRESHOLDS = [
        [1000000, '黑王级'], [500000, '白王级'], [200000, '次代种/皇级'],
        [80000, 'S级'], [20000, 'A级'], [5000, 'B级'],
        [1500, 'C级'], [500, 'D级'], [100, 'E级'], [0, '未评级']
    ];

    // 纯血龙类血统（不能暴血）
    const PURE_DRAGON_BLOODLINES = new Set(['龙王', '龙王级', '白王', '白王级', '黑王', '黑王级']);

    // ==========================================
    // 暴血配置
    // ==========================================
    const BLOOD_RAGE_CONFIG = {
        '一度暴血': { multiplier: 1.5, erosion: 3, stamina: -10, purity: -5, sanity: -5, staminaPerTurn: -3 },
        '二度暴血': { multiplier: 2.0, erosion: 5, stamina: -15, purity: -10, sanity: -10, staminaPerTurn: -5 },
        '三度暴血': { multiplier: 3.0, erosion: 8, stamina: -20, purity: -15, sanity: -15, staminaPerTurn: -8 },
        '四度暴血': { multiplier: 4.0, erosion: 15, stamina: 0, purity: -25, sanity: -20, staminaPerTurn: 0 }
    };

    const RAGE_ORDER = ['未开启', '一度暴血', '二度暴血', '三度暴血', '四度暴血'];

    // ==========================================
    // 侵蚀修正表
    // ==========================================
    function getErosionModifier(erosion) {
        const e = Math.max(0, Math.min(100, erosion));
        if (e <= 20) return 1.00;
        if (e <= 40) return 1.10;
        if (e <= 60) return 1.25;
        if (e <= 80) return 1.50;
        return 2.00;
    }

    // ==========================================
    // 言灵加成表
    // ==========================================
    const YANLING_BONUS_BY_MASTERY = {
        '初阶': 0.075, '中阶': 0.20, '高阶': 0.40, '完美': 0.70
    };

    // ==========================================
    // 权柄加成表
    // ==========================================
    const AUTHORITY_BONUS_BY_STAGE = {
        '初觉': 0.20, '半觉': 0.50, '完全觉醒': 1.00
    };

    // ==========================================
    // 炼金武装品质中位加成
    // ==========================================
    const EQUIP_QUALITY_BONUS = {
        '普通': 0.075, '卓越': 0.225, '史诗': 0.475, '神器': 0.775, '传说': 1.50
    };

    // 七宗罪武器名
    const SEVEN_SINS = new Set(['傲慢', '嫉妒', '暴怒', '懒惰', '贪婪', '暴食', '色欲']);

    // ==========================================
    // 工具函数
    // ==========================================
    function safeNum(val, def = 0) {
        const n = Number(val);
        return Number.isFinite(n) ? n : def;
    }

    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    function hasChanged(oldVal, newVal) {
        if (oldVal === newVal) return false;
        if (typeof oldVal === 'object' && typeof newVal === 'object') {
            return JSON.stringify(oldVal) !== JSON.stringify(newVal);
        }
        return true;
    }

    function getByPath(obj, path) {
        return path.split('.').reduce((o, k) => o?.[k], obj);
    }

    function setByPath(obj, path, value) {
        const keys = path.split('.');
        let cur = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            if (cur[keys[i]] === undefined) return;
            cur = cur[keys[i]];
        }
        cur[keys[keys.length - 1]] = value;
    }

    // ==========================================
    // 变量守卫：保护只读字段
    // ==========================================
    const PROTECTED_PATHS = [
        '主角.战力详情.战力等级',
        '主角.战力详情.侵蚀修正',
        '主角.战力详情.言灵加成总值',
        '主角.战力详情.权柄加成总值',
        '主角.战力详情.炼金武装加成总值',
    ];

    function guardProtectedFields(data, dataBefore) {
        if (!dataBefore) return;
        for (const path of PROTECTED_PATHS) {
            const oldVal = getByPath(dataBefore, path);
            const newVal = getByPath(data, path);
            if (oldVal !== undefined && hasChanged(oldVal, newVal)) {
                console.warn(`[变量守卫] 受保护字段被修改: ${path} (${JSON.stringify(oldVal)} → ${JSON.stringify(newVal)})，已回滚`);
                setByPath(data, path, oldVal);
            }
        }
    }

    // ==========================================
    // 战力等级反推
    // ==========================================
    function deriveCPRank(cp) {
        for (const [threshold, rank] of CP_RANK_THRESHOLDS) {
            if (cp >= threshold) return rank;
        }
        return '未评级';
    }

    // ==========================================
    // 基础战斗力计算
    // ==========================================
    function calcConditionCoefficient(stats) {
        const hp = clamp(safeNum(stats.生命值, 100), 0, 100);
        const stamina = clamp(safeNum(stats.体力, 100), 0, 100);
        const purity = clamp(safeNum(stats.血统稳定度, 100), 0, 100);
        const sanity = clamp(safeNum(stats.精神阈值, 100), 0, 100);
        return (hp * 0.25 + stamina * 0.15 + purity * 0.35 + sanity * 0.25) / 100;
    }

    function calcBaseCP(bloodlineRating, stats, isBaseLocked) {
        if (isBaseLocked) return null; // 锁定时不重算
        const base = safeNum(BLOODLINE_BASE_CP[bloodlineRating], 300);
        const condition = calcConditionCoefficient(stats);
        return Math.floor(base * condition);
    }

    // ==========================================
    // 言灵加成计算
    // ==========================================
    function calcYanlingBonus(baseCP, yanlingList) {
        if (!Array.isArray(yanlingList) || yanlingList.length === 0) return 0;
        // 取最高加成（非叠加）
        let maxRatio = 0;
        for (const y of yanlingList) {
            if (!y) continue;
            const cd = String(y.冷却状态 || '').trim();
            if (cd === '封印' || cd === '已封印') continue;
            const mastery = String(y.掌握程度 || '').trim();
            let ratio = safeNum(YANLING_BONUS_BY_MASTERY[mastery], 0);
            if (cd === '冷却中' || cd === '冷却') ratio *= 0.5;
            if (ratio > maxRatio) maxRatio = ratio;
        }
        return Math.floor(baseCP * maxRatio);
    }

    // ==========================================
    // 权柄加成计算
    // ==========================================
    function calcAuthorityBonus(baseCP, authorityList) {
        if (!Array.isArray(authorityList) || authorityList.length === 0) return 0;
        // 多权柄叠加
        let totalRatio = 0;
        for (const a of authorityList) {
            if (!a) continue;
            const status = String(a.状态 || '').trim();
            if (status !== '可用') continue;
            const stage = String(a.阶位 || '').trim();
            totalRatio += safeNum(AUTHORITY_BONUS_BY_STAGE[stage], 0);
        }
        return Math.floor(baseCP * totalRatio);
    }

    // ==========================================
    // 炼金武装加成计算
    // ==========================================
    function calcEquipmentBonus(baseCP, equipList) {
        if (!Array.isArray(equipList) || equipList.length === 0) return 0;

        let sevenSinCount = 0;
        let totalBonus = 0;

        for (const item of equipList) {
            if (!item) continue;
            const quality = String(item.品质 || '普通').trim();
            const ratio = safeNum(EQUIP_QUALITY_BONUS[quality], 0.075);

            const name = String(item.名称 || '').trim();
            if (SEVEN_SINS.has(name)) sevenSinCount++;

            totalBonus += Math.floor(baseCP * ratio);
        }

        // 七宗罪套装共鸣（额外加成，不乘件数）
        if (sevenSinCount >= 7) {
            totalBonus += Math.floor(baseCP * 1.0); // 额外+100%
        } else if (sevenSinCount >= 5) {
            totalBonus += Math.floor(baseCP * 0.5); // 额外+50%
        } else if (sevenSinCount >= 3) {
            totalBonus += Math.floor(baseCP * 0.2); // 额外+20%
        }

        return totalBonus;
    }

    // ==========================================
    // 外部加成衰减
    // ==========================================
    function attenuateExternalBonus(baseCP, externalTotal, bloodlineRating) {
        const ceiling = safeNum(CP_CEILING[bloodlineRating], Infinity);
        if (ceiling === Infinity) return externalTotal;
        const headroom = Math.max(0, ceiling - baseCP);
        const withinCeiling = Math.min(externalTotal, headroom);
        const beyondCeiling = Math.max(0, externalTotal - headroom);
        return withinCeiling + Math.floor(beyondCeiling * 0.5);
    }

    // ==========================================
    // 当前战斗力计算
    // ==========================================
    function calcCurrentCP(baseCP, rageName, erosion, externalAttenuated, sceneMod) {
        const rageConfig = BLOOD_RAGE_CONFIG[rageName];
        const rageMultiplier = rageConfig ? rageConfig.multiplier : 1.0;
        const erosionMod = getErosionModifier(erosion);
        return Math.floor((baseCP * rageMultiplier * erosionMod + externalAttenuated) * sceneMod);
    }

    // ==========================================
    // 主计算流程
    // ==========================================
    let isProcessing = false;

    function handleVariableUpdate(rawVars, rawVarsBefore) {
        if (isProcessing) return;
        isProcessing = true;

        try {
            // 直接用事件传入的引用（和创世回廊一样，原地修改即持久化）
            const data = rawVars?.stat_data;
            const dataBefore = rawVarsBefore?.stat_data;
            if (!data || !data.主角) return;

            // 守卫只读字段
            guardProtectedFields(data, dataBefore);

            const protagonist = data.主角;
            const stats = protagonist.数值 || {};
            const details = protagonist.战力详情 || {};
            const bloodline = String(protagonist.档案?.血统评级 || 'D').trim();
            const rageName = String(details.暴血状态 || '未开启').trim();
            const erosion = clamp(safeNum(stats.龙血侵蚀度, 0), 0, 100);
            const sceneMod = safeNum(details.场景修正, 1.0);

            // ---- 侵蚀修正 ----
            const erosionMod = getErosionModifier(erosion);
            if (safeNum(details.侵蚀修正, 1.0) !== erosionMod) {
                details.侵蚀修正 = erosionMod;
                console.log(`[龙族计算] 侵蚀修正: ${details.侵蚀修正} → ${erosionMod} (侵蚀度${erosion}%)`);
            }

            // ---- 暴血倍率同步 ----
            const rageConfig = BLOOD_RAGE_CONFIG[rageName];
            const expectedRageMult = rageConfig ? rageConfig.multiplier : 1.0;
            if (safeNum(details.暴血倍率, 1.0) !== expectedRageMult) {
                details.暴血倍率 = expectedRageMult;
                console.log(`[龙族计算] 暴血倍率: ${rageName} → ×${expectedRageMult}`);
            }

            // ---- 基础战斗力 ----
            // 三度/四度暴血时锁定基础CP
            const isLocked = (rageName === '三度暴血' || rageName === '四度暴血');
            const newBaseCP = calcBaseCP(bloodline, stats, isLocked);
            if (newBaseCP !== null) {
                const oldBase = safeNum(stats.基础战斗力, 0);
                // 无条件重算：血统评级变化后必须同步，不能跳过
                stats.基础战斗力 = newBaseCP;
                if (oldBase !== newBaseCP) {
                    console.log(`[龙族计算] 基础战斗力: ${oldBase} → ${newBaseCP} (${bloodline})`);
                }
            }

            const currentBaseCP = safeNum(stats.基础战斗力, 0);

            // ---- 外部加成 ----
            const yanlingBonus = calcYanlingBonus(currentBaseCP, protagonist.资源?.言灵);
            const authorityBonus = calcAuthorityBonus(currentBaseCP, protagonist.资源?.龙王权柄);
            const equipBonus = calcEquipmentBonus(currentBaseCP, protagonist.资源?.炼金武装);
            const totalExternal = yanlingBonus + authorityBonus + equipBonus;

            // 同步加成总值到战力详情
            if (safeNum(details.言灵加成总值, 0) !== yanlingBonus) details.言灵加成总值 = yanlingBonus;
            if (safeNum(details.权柄加成总值, 0) !== authorityBonus) details.权柄加成总值 = authorityBonus;
            if (safeNum(details.炼金武装加成总值, 0) !== equipBonus) details.炼金武装加成总值 = equipBonus;

            // ---- 衰减后外部加成 ----
            const attenuated = attenuateExternalBonus(currentBaseCP, totalExternal, bloodline);

            // ---- 当前战斗力（无条件重算） ----
            const newCurrentCP = calcCurrentCP(currentBaseCP, rageName, erosion, attenuated, sceneMod);
            const oldCurrentCP = safeNum(stats.当前战斗力, 0);
            stats.当前战斗力 = newCurrentCP;
            if (oldCurrentCP !== newCurrentCP) {
                console.log(`[龙族计算] 当前战斗力: ${oldCurrentCP} → ${newCurrentCP}`);
            }

            // ---- 战力等级自动反推（无条件重算） ----
            const newRank = deriveCPRank(newCurrentCP);
            const oldRank = details.战力等级;
            details.战力等级 = newRank;
            if (oldRank !== newRank) {
                console.log(`[龙族计算] 战力等级: ${oldRank} → ${newRank}`);
            }

            // ---- 数值钳制 ----
            stats.生命值 = clamp(safeNum(stats.生命值, 100), 0, 100);
            stats.体力 = clamp(safeNum(stats.体力, 100), 0, 100);
            stats.血统稳定度 = clamp(safeNum(stats.血统稳定度, 100), 0, 100);
            stats.精神阈值 = clamp(safeNum(stats.精神阈值, 100), 0, 100);

            // 原地修改 rawVars.stat_data 即自动持久化（和创世回廊脚本同理）
            stats.龙血侵蚀度 = clamp(safeNum(stats.龙血侵蚀度, 0), 0, 100);

        } finally {
            isProcessing = false;
        }
    }

    // ==========================================
    // 事件注册
    // ==========================================
    const init = async () => {
        await waitGlobalInitialized('Mvu');
        eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, handleVariableUpdate);
        try { (window.parent || window).__龙族辅助计算_loaded__ = true; } catch (e) { window.__龙族辅助计算_loaded__ = true; }
        console.log('[龙族辅助计算] 脚本已加载');
        toastr.success('[龙族辅助计算] 脚本已加载');
    };

    $(init);
})();
