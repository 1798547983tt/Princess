/**
 * 修仙世界书 - 辅助计算脚本
 * 变量映射：
 * variables.人物.等级
 * variables.人物.当前总经验
 * variables.人物.升级阈值
 * variables.人物.属性.属性点
 * variables.人物.SP
 * variables.人物.RP
 * variables.人物.灵力上限
 * variables.人物.当前灵力
 * variables.人物.境界
 * variables.人物.小境界
 */

(function () {
    'use strict';

    // ==========================================
    // 核心公式
    // ==========================================

    function calculateThreshold(targetLevel) {
        if (targetLevel <= 1) return 0;
        let total = 0;
        for (let L = 1; L < targetLevel; L++) {
            total += Math.floor(100 * Math.pow(L, 1.5));
        }
        return total;
    }

    // ==========================================
    // 工具函数
    // ==========================================

    function safeParseInt(value, def = 0) {
        const n = parseInt(value, 10);
        return isNaN(n) ? def : n;
    }

    function safeParseFloat(value, def = 0) {
        const n = parseFloat(value);
        return isNaN(n) ? def : n;
    }

    function getLevelBaseTotalExp(level) {
        const lv = Math.max(1, safeParseInt(level, 1));
        return calculateThreshold(lv);
    }

    function hasChanged(oldVal, newVal) {
        if (oldVal === newVal) return false;
        if (typeof oldVal === 'object' && typeof newVal === 'object') {
            return JSON.stringify(oldVal) !== JSON.stringify(newVal);
        }
        return true;
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    // ==========================================
    // 境界等级映射
    // ==========================================

    const REALM_TABLE = [
        { 境界: '炼气', min: 1, max: 12, subLevels: ['一层','二层','三层','四层','五层','六层','七层','八层','九层','十层','十一层','十二层'] },
        { 境界: '筑基', min: 13, max: 24, subLevels: ['初期','中期','后期','大圆满'] },
        { 境界: '金丹', min: 25, max: 36, subLevels: ['初期','中期','后期','大圆满'] },
        { 境界: '元婴', min: 37, max: 48, subLevels: ['初期','中期','后期','大圆满'] },
        { 境界: '化神', min: 49, max: 60, subLevels: ['初期','中期','后期','大圆满'] },
        { 境界: '炼虚', min: 61, max: 72, subLevels: ['初期','中期','后期','大圆满'] },
        { 境界: '合体', min: 73, max: 84, subLevels: ['初期','中期','后期','大圆满'] },
        { 境界: '大乘', min: 85, max: 90, subLevels: ['初期','中期','后期','大圆满'] },
        { 境界: '渡劫', min: 91, max: 95, subLevels: ['初期','中期','后期','大圆满'] },
        { 境界: '地仙', min: 96, max: 99, subLevels: ['初期','中期','后期','大圆满'] },
        { 境界: '天仙', min: 100, max: 100, subLevels: ['圆满'] },
        { 境界: '金仙', min: 101, max: 999, subLevels: ['圆满'] }
    ];

    function getRealmByLevel(level) {
        const lv = Math.max(1, safeParseInt(level, 1));
        for (const realm of REALM_TABLE) {
            if (lv >= realm.min && lv <= realm.max) {
                const offset = lv - realm.min;
                const subIdx = Math.min(offset, realm.subLevels.length - 1);
                return { 境界: realm.境界, 小境界: realm.subLevels[subIdx] };
            }
        }
        return { 境界: '金仙', 小境界: '圆满' };
    }

    function getRealmIndex(realmName) {
        const idx = REALM_TABLE.findIndex(r => r.境界 === realmName);
        return idx >= 0 ? idx : 0;
    }

    function isMajorBreakthrough(oldLevel, newLevel) {
        const oldRealm = getRealmByLevel(oldLevel);
        const newRealm = getRealmByLevel(newLevel);
        return oldRealm.境界 !== newRealm.境界;
    }

    // ==========================================
    // 法宝品级 → AC/伤害骰映射
    // ==========================================

    const qualityToDefense = {
        '凡器': 1, '灵器': 2, '法器': 3, '宝器': 4,
        '仙器': 5, '圣器': 6, '先天至宝': 7
    };

    const qualityToDamageDice = {
        '凡器': '1d6', '灵器': '1d8', '法器': '2d8', '宝器': '3d10',
        '仙器': '3d12', '圣器': '4d10', '先天至宝': '4d12'
    };

    const qualityMultiplier = {
        '凡器': 1.0, '灵器': 1.5, '法器': 2.0, '宝器': 2.5,
        '仙器': 3.5, '圣器': 4.0, '先天至宝': 5.0
    };

    // ==========================================
    // 灵根对修炼速度的加成
    // ==========================================

    const ROOT_GRADE_BONUS = {
        '杂灵根': 0.5,
        '三灵根': 0.7,
        '双灵根': 0.85,
        '异灵根': 1.0,
        '单灵根': 1.2,
        '天灵根': 1.5,
        '混沌灵根': 2.0
    };

    // ==========================================
    // 六维属性法宝加成收集
    // ==========================================

    const CORE_ATTR_KEYS = ['体魄', '身法', '根骨', '悟性', '神识', '灵力'];
    const CORE_ATTR_KEY_SET = new Set(CORE_ATTR_KEYS);
    const QUALITY_CORE_ATTR_RULES = {
        '凡器': { total: 0, single: 0 },
        '灵器': { total: 1, single: 1 },
        '法器': { total: 1, single: 1 },
        '宝器': { total: 2, single: 1 },
        '仙器': { total: 2, single: 2 },
        '圣器': { total: 3, single: 2 },
        '先天至宝': { total: 4, single: 3 }
    };

    function collectEquippedCoreAttrBonuses(装备列表) {
        const out = {};
        CORE_ATTR_KEYS.forEach(k => { out[k] = 0; });
        Object.values(装备列表 || {}).forEach(item => {
            if (!item || !item.名称 || item.装备箱) return;
            const bonuses = item.属性加成 || {};
            CORE_ATTR_KEYS.forEach(k => {
                out[k] += safeParseInt(bonuses[k], 0);
            });
        });
        return out;
    }

    function syncCoreAttrsOnEquipChange(player, playerBefore) {
        if (!player?.属性 || !playerBefore?.属性) return;
        const prevBonuses = collectEquippedCoreAttrBonuses(playerBefore.装备列表 || {});
        const newBonuses = collectEquippedCoreAttrBonuses(player.装备列表 || {});
        // 灵力不随装备同步（有独立计算）
        const syncAttrs = ['体魄', '身法', '悟性', '神识'];
        syncAttrs.forEach(attrName => {
            const beforeVal = safeParseInt(playerBefore.属性?.[attrName], 10);
            const prevBonus = safeParseInt(prevBonuses[attrName], 0);
            const newBonus = safeParseInt(newBonuses[attrName], 0);
            const baseVal = beforeVal - prevBonus;
            const nextVal = baseVal + newBonus;
            const currentVal = safeParseInt(player.属性?.[attrName], 10);
            if (currentVal !== nextVal) {
                player.属性[attrName] = nextVal;
                console.log(`[属性同步] ${attrName}: ${currentVal} → ${nextVal} (法宝加成 ${prevBonus} → ${newBonus})`);
            }
        });
    }

    // ==========================================
    // 防御(AC)计算
    // ==========================================

    const armorSlotCoef = { '法袍': 1.5, '腿甲': 1.3, '护臂': 1.1, '云靴': 1.1, '腰佩': 1.0 };
    const accessorySlotCoef = { '护身玉佩': 4.0, '护腕': 3.0, '储物戒': 3.0 };

    function calculateDefense(variables) {
        const player = variables.人物;
        if (!player) return;

        // 龙族保底防御
        if (player.种族 === '龙族') {
            const currentDef = safeParseInt(player.防御, 0);
            if (currentDef < 18) {
                player.防御 = 18;
                console.log(`[防御计算] 龙族防御保底: ${currentDef} → 18`);
            }
            return;
        }

        const 装备列表 = player.装备列表 || {};
        let 最高防御加值 = 0;
        Object.values(装备列表).forEach(item => {
            if (!item || !item.名称 || item.装备箱) return;
            if (item.类型 !== '防御法宝') return;
            const bonus = qualityToDefense[item.品质] || 0;
            if (bonus > 最高防御加值) 最高防御加值 = bonus;
        });

        const newDef = 10 + 最高防御加值;
        if (player.防御 !== newDef) {
            console.log(`[防御计算] 更新防御: ${player.防御} → ${newDef}`);
            player.防御 = newDef;
        }
    }

    // ==========================================
    // 战斗属性计算
    // ==========================================

    function calculateCombatStats(player) {
        if (!player.战斗属性) return;
        const combat = player.战斗属性;
        const rate = safeParseFloat(combat.暴击率, 0);
        let offset = Math.floor(rate / 10);
        if (offset > 10) offset = 10;
        const computedThreshold = 10 - offset;

        if (combat.暴击阈值 !== computedThreshold) {
            console.log(`[战斗计算] 暴击阈值: ${combat.暴击阈值} → ${computedThreshold} (暴击率${rate}%)`);
            combat.暴击阈值 = computedThreshold;
        }
    }

    // ==========================================
    // 生命值上限计算（修仙版）
    // ==========================================

    function calculateMaxHP(player) {
        if (!player.属性) return;

        const 等级 = safeParseInt(player.等级, 1);
        const 根骨 = safeParseInt(player.属性.根骨, 10);
        const 种族 = player.种族 || '';

        let equipRootBonus = 0;
        let equipHpBonus = 0;
        const 装备列表 = player.装备列表 || {};
        Object.values(装备列表).forEach(item => {
            if (!item || !item.名称 || item.装备箱) return;
            const bonuses = item.属性加成 || {};
            equipRootBonus += safeParseInt(bonuses['根骨'], 0);
            equipHpBonus += safeParseInt(bonuses['生命值上限'], 0);
        });

        const total根骨 = 根骨 + equipRootBonus;
        let newMaxHP;
        if (种族 === '妖族') {
            // 妖族体魄强横
            newMaxHP = 等级 * total根骨 * 3 + equipHpBonus;
        } else {
            newMaxHP = 等级 * total根骨 * 2 + equipHpBonus;
        }
        newMaxHP = Math.max(newMaxHP, 1);

        if (player.生命值上限 !== newMaxHP) {
            const oldMaxHP = player.生命值上限 || 0;
            const oldCurrentHP = safeParseInt(player.当前生命值, 0);
            player.生命值上限 = newMaxHP;
            console.log(`[HP计算] 生命值上限 ${oldMaxHP} → ${newMaxHP}`);

            if (oldMaxHP > 0 && oldCurrentHP > 0) {
                const hpRatio = oldCurrentHP / oldMaxHP;
                const newCurrentHP = Math.max(1, Math.round(hpRatio * newMaxHP));
                player.当前生命值 = Math.min(newCurrentHP, newMaxHP);
                console.log(`[HP计算] 按比例修正: ${oldCurrentHP} → ${player.当前生命值} (${Math.round(hpRatio * 100)}%)`);
            } else if (oldCurrentHP > newMaxHP) {
                player.当前生命值 = newMaxHP;
            }
        }
    }

    // ==========================================
    // 灵力上限计算（修仙版新增）
    // ==========================================

    function calculateMaxMP(player) {
        if (!player.属性) return;

        const 等级 = safeParseInt(player.等级, 1);
        const 灵力 = safeParseInt(player.属性.灵力, 10);
        const 悟性 = safeParseInt(player.属性.悟性, 10);
        const 种族 = player.种族 || '';
        const 境界 = player.境界 || '炼气';

        let equipMPBonus = 0;
        const 装备列表 = player.装备列表 || {};
        Object.values(装备列表).forEach(item => {
            if (!item || !item.名称 || item.装备箱) return;
            const bonuses = item.属性加成 || {};
            equipMPBonus += safeParseInt(bonuses['灵力上限'], 0);
        });

        // 灵力上限 = 等级 × 灵力属性 × 境界系数 + 悟性加成 + 装备加成
        const realmCoeff = 2 + getRealmIndex(境界) * 0.5;
        let newMaxMP = Math.floor(等级 * 灵力 * realmCoeff + 悟性 * 2 + equipMPBonus);

        // 灵族灵力加成
        if (种族 === '灵族') {
            newMaxMP = Math.floor(newMaxMP * 1.3);
        }

        newMaxMP = Math.max(newMaxMP, 0);

        if (player.灵力上限 !== newMaxMP) {
            const oldMaxMP = player.灵力上限 || 0;
            const oldCurrentMP = safeParseInt(player.当前灵力, 0);
            player.灵力上限 = newMaxMP;
            console.log(`[MP计算] 灵力上限 ${oldMaxMP} → ${newMaxMP}`);

            if (oldMaxMP > 0 && oldCurrentMP > 0) {
                const mpRatio = oldCurrentMP / oldMaxMP;
                const newCurrentMP = Math.max(0, Math.round(mpRatio * newMaxMP));
                player.当前灵力 = Math.min(newCurrentMP, newMaxMP);
            } else if (oldCurrentMP > newMaxMP) {
                player.当前灵力 = newMaxMP;
            }
        }
    }

    // ==========================================
    // 法宝数值自动计算
    // ==========================================

    function generateRandomGrade() {
        return Math.floor(Math.random() * 21) - 10;
    }

    function ensureGrade(item) {
        const currentGrade = safeParseInt(item.品级, null);
        if (currentGrade === null || currentGrade === 0) {
            item.品级 = generateRandomGrade();
            return;
        }
        if (currentGrade < -10) item.品级 = -10;
        else if (currentGrade > 10) item.品级 = 10;
    }

    function calculateWeaponStats(weapon) {
        if (!weapon || !weapon.名称) return false;
        ensureGrade(weapon);

        const 品质 = weapon.品质 || '凡器';
        const 等级 = safeParseInt(weapon.等级, 1);
        const 品级 = safeParseInt(weapon.品级, 0);
        const 炼制等级 = safeParseInt(weapon.炼制等级, 0);

        const newDamageDice = qualityToDamageDice[品质] || '1d6';
        const newLevelCoef = Math.floor(等级 / 10) + 1;
        const gradeMultiplier = 1 + (品级 / 100);
        const enhanceMultiplier = 1 + (炼制等级 * 0.1);
        const newFixedDmg = Math.max(1, Math.floor(等级 * enhanceMultiplier * gradeMultiplier));

        const changed = weapon.伤害骰 !== newDamageDice || weapon.等级系数 !== newLevelCoef || weapon.固定伤害 !== newFixedDmg;
        weapon.伤害骰 = newDamageDice;
        weapon.等级系数 = newLevelCoef;
        weapon.固定伤害 = newFixedDmg;

        if (changed) {
            console.log(`[法宝计算] 攻击法宝 "${weapon.名称}": ${newLevelCoef}×${newDamageDice}+${newFixedDmg}`);
        }
        return changed;
    }

    function getArmorDefenseValue(armor, slotName) {
        if (!armor || !armor.名称) return 0;
        const 品质 = armor.品质 || '凡器';
        const 等级 = safeParseInt(armor.等级, 1);
        const 品级 = safeParseInt(armor.品级, 0);
        const slotCoef = armorSlotCoef[slotName] || 1.0;
        const qualityMult = qualityMultiplier[品质] || 1.0;
        const gradeMultiplier = 1 + (品级 / 100);
        return Math.floor(等级 * slotCoef * qualityMult * gradeMultiplier);
    }

    function getAccessoryDefenseValue(accessory, slotName) {
        if (!accessory || !accessory.名称) return 0;
        const 品质 = accessory.品质 || '凡器';
        const 等级 = safeParseInt(accessory.等级, 1);
        const 品级 = safeParseInt(accessory.品级, 0);
        const slotCoef = accessorySlotCoef[slotName] || 3.0;
        const qualityMult = qualityMultiplier[品质] || 1.0;
        const gradeMultiplier = 1 + (品级 / 100);
        return Math.floor(等级 * slotCoef * qualityMult * gradeMultiplier);
    }

    function calculateArmorStats(armor, slotName) {
        if (!armor || !armor.名称) return false;
        ensureGrade(armor);
        const newDefense = getArmorDefenseValue(armor, slotName);
        if (armor.防御力 !== newDefense) {
            armor.防御力 = newDefense;
            console.log(`[法宝计算] 防御法宝 "${armor.名称}" (${slotName}): 防御力=${newDefense}`);
            return true;
        }
        return false;
    }

    function calculateAccessoryStats(accessory, slotName) {
        if (!accessory || !accessory.名称) return false;
        ensureGrade(accessory);
        const newDefense = getAccessoryDefenseValue(accessory, slotName);
        if (accessory.防御力 !== newDefense) {
            accessory.防御力 = newDefense;
            console.log(`[法宝计算] 辅助法宝 "${accessory.名称}" (${slotName}): 防御力=${newDefense}`);
            return true;
        }
        return false;
    }

    // 无本命法宝时的空手面板
    function buildUnarmedWeaponPanel(player) {
        const level = safeParseInt(player?.等级, 1);
        const levelCoef = Math.floor(level / 10) + 1;
        const baseFixed = Math.max(1, level);
        const attrSnapshot = buildWeaponAttrSnapshot(player);
        const attrFixedDmg = calcAttrFixedDmg(attrSnapshot, level);
        return {
            伤害骰: '1d4',
            等级系数: levelCoef,
            固定伤害: baseFixed + attrFixedDmg
        };
    }

    function buildWeaponAttrSnapshot(player) {
        const raw = player?.属性 || {};
        const equippedBonuses = collectEquippedCoreAttrBonuses(player?.装备列表 || {});
        const snapshot = {};
        CORE_ATTR_KEYS.forEach(attrName => {
            snapshot[attrName] = safeParseInt(raw[attrName], 10);
        });
        snapshot.根骨 += safeParseInt(equippedBonuses['根骨'], 0);
        return snapshot;
    }

    function calcAttrFixedDmg(属性, 人物等级) {
        let maxVal = 0;
        // 修仙：体魄影响近战，灵力影响法术
        ['体魄', '灵力'].forEach(attrName => {
            const v = safeParseInt(属性?.[attrName], 10);
            if (v > maxVal) maxVal = v;
        });
        const capped = Math.min(maxVal, 40);
        const modifier = capped > 10 ? Math.floor((capped - 10) / 2) : 0;
        const levelCoef = Math.floor(safeParseInt(人物等级, 1) / 10) + 1;
        return modifier * levelCoef;
    }

    function calculateAllEquipmentStats(variables) {
        const player = variables.人物;
        if (!player) return;
        const 装备列表 = player.装备列表;
        if (!装备列表) return;

        let mainWeapon = null;

        Object.entries(装备列表).forEach(([key, item]) => {
            if (!item || !item.名称) return;
            if (item.类型 === '攻击法宝') {
                calculateWeaponStats(item);
                if (!item.装备箱 && item.部位 === '本命法宝') mainWeapon = item;
            } else if (item.类型 === '防御法宝') {
                calculateArmorStats(item, item.部位);
            } else if (item.类型 === '辅助法宝') {
                calculateAccessoryStats(item, item.部位);
            }
        });

        // 生成法宝面板
        if (mainWeapon) {
            const attrSnapshot = buildWeaponAttrSnapshot(player);
            const attrFixedDmg = calcAttrFixedDmg(attrSnapshot, player.等级);
            const panelFixedDmg = safeParseInt(mainWeapon.固定伤害, 0) + attrFixedDmg;
            const newPanel = {
                伤害骰: mainWeapon.伤害骰 || '',
                等级系数: mainWeapon.等级系数 || 1,
                固定伤害: panelFixedDmg
            };
            if (!player.战斗属性) player.战斗属性 = {};
            if (!_.isEqual(player.战斗属性.法宝面板, newPanel)) {
                player.战斗属性.法宝面板 = newPanel;
                console.log(`[法宝面板] 已更新: ${newPanel.等级系数}×${newPanel.伤害骰}+${newPanel.固定伤害}`);
            }
        } else {
            if (!player.战斗属性) player.战斗属性 = {};
            const unarmedPanel = buildUnarmedWeaponPanel(player);
            if (!_.isEqual(player.战斗属性.法宝面板, unarmedPanel)) {
                player.战斗属性.法宝面板 = unarmedPanel;
                console.log(`[法宝面板] 无法宝，已写入空手面板: ${unarmedPanel.等级系数}×${unarmedPanel.伤害骰}+${unarmedPanel.固定伤害}`);
            }
        }
    }

    // ==========================================
    // 减伤计算（修仙版：物理减伤 + 法术减伤）
    // ==========================================

    const DAMAGE_REDUCTION_CAP = 75;
    const DAMAGE_REDUCTION_ALPHA = 16;
    const DAMAGE_REDUCTION_LOG_DEN = Math.log(1 + DAMAGE_REDUCTION_ALPHA);
    const PHYS_DEF_FULL_SCALE = 3300;
    const MAG_DEF_FULL_SCALE = 5500;

    function defenseToReductionPercent(totalDefense, fullScaleDefense) {
        const defense = Math.max(0, safeParseFloat(totalDefense, 0));
        const scale = fullScaleDefense > 0 ? (defense / fullScaleDefense) : 0;
        const raw = DAMAGE_REDUCTION_CAP * Math.log(1 + DAMAGE_REDUCTION_ALPHA * scale) / DAMAGE_REDUCTION_LOG_DEN;
        return clamp(Math.round(raw), 0, DAMAGE_REDUCTION_CAP);
    }

    function collectEquippedReductionContrib(player) {
        const 装备列表 = player?.装备列表 || {};
        let physDefense = 0;
        let magDefense = 0;
        let physBonus = 0;
        let magBonus = 0;

        Object.values(装备列表).forEach(item => {
            if (!item || !item.名称 || item.装备箱) return;
            const bonuses = item.属性加成 || {};
            physBonus += safeParseFloat(bonuses['物理减伤'], 0);
            magBonus += safeParseFloat(bonuses['法术减伤'], 0);

            if (item.类型 === '防御法宝') {
                physDefense += getArmorDefenseValue(item, item.部位);
            } else if (item.类型 === '辅助法宝') {
                magDefense += getAccessoryDefenseValue(item, item.部位);
            }
        });

        return {
            physDefense, magDefense, physBonus, magBonus,
            physFromDefense: defenseToReductionPercent(physDefense, PHYS_DEF_FULL_SCALE),
            magFromDefense: defenseToReductionPercent(magDefense, MAG_DEF_FULL_SCALE)
        };
    }

    function calculateDamageReductions(player, playerBefore) {
        if (!player) return;
        if (!player.战斗属性) player.战斗属性 = {};
        const combat = player.战斗属性;

        const curr = collectEquippedReductionContrib(player);
        const currEquipPhys = curr.physBonus + curr.physFromDefense;
        const currEquipMag = curr.magBonus + curr.magFromDefense;

        let basePhys = 0;
        let baseMag = 0;

        if (playerBefore) {
            const prevCombat = playerBefore.战斗属性 || {};
            const prev = collectEquippedReductionContrib(playerBefore);
            const prevEquipPhys = prev.physBonus + prev.physFromDefense;
            const prevEquipMag = prev.magBonus + prev.magFromDefense;
            basePhys = safeParseFloat(prevCombat.物理减伤, 0) - prevEquipPhys;
            baseMag = safeParseFloat(prevCombat.法术减伤, 0) - prevEquipMag;
        } else {
            basePhys = safeParseFloat(combat.物理减伤, 0) - currEquipPhys;
            baseMag = safeParseFloat(combat.法术减伤, 0) - currEquipMag;
        }

        basePhys = clamp(basePhys, 0, DAMAGE_REDUCTION_CAP);
        baseMag = clamp(baseMag, 0, DAMAGE_REDUCTION_CAP);

        const newPhys = clamp(Math.round(basePhys + currEquipPhys), 0, DAMAGE_REDUCTION_CAP);
        const newMag = clamp(Math.round(baseMag + currEquipMag), 0, DAMAGE_REDUCTION_CAP);

        if (safeParseFloat(combat.物理减伤, 0) !== newPhys) {
            console.log(`[减伤计算] 物理减伤: ${combat.物理减伤} → ${newPhys}`);
            combat.物理减伤 = newPhys;
        }
        if (safeParseFloat(combat.法术减伤, 0) !== newMag) {
            console.log(`[减伤计算] 法术减伤: ${combat.法术减伤} → ${newMag}`);
            combat.法术减伤 = newMag;
        }
    }

    // ==========================================
    // 神通冷却管理系统
    // ==========================================

    const tierCooldownMap = {
        '圣阶三': 5, '圣阶二': 4, '圣阶一': 3,
        '仙阶': 3, '天阶': 2, '地阶': 1
    };

    const DEFAULT_SKILL_SYSTEM_MODE = 'classic';
    const COMBO_STATE_DEFAULT = { 当前高级组: 'alpha', 当前显示槽: 'advanced' };
    const COMBO_ADVANCED_GROUP_ORDER = ['alpha', 'beta', 'gamma'];
    const COMBO_GROUP_ORDER = [...COMBO_ADVANCED_GROUP_ORDER, 'ultimate'];
    const COMBO_GROUP_SLOT_RULES = {
        alpha: [['地阶'], ['地阶'], ['天阶']],
        beta: [['地阶'], ['地阶'], ['天阶']],
        gamma: [['地阶'], ['地阶'], ['天阶']],
        ultimate: [['仙阶'], ['仙阶'], ['仙阶']]
    };
    const COMBO_BASE_SLOT_RULES = [['凡阶'], ['凡阶'], ['凡阶']];
    const COMBO_CLASS_SLOT_RULES = [['灵阶'], ['灵阶'], ['灵阶']];
    const SKILL_TIER_KEYS = ['凡阶', '灵阶', '地阶', '天阶', '仙阶', '圣阶一', '圣阶二', '圣阶三'];
    const ALL_SKILL_TIERS = ['凡阶', '灵阶', '地阶', '天阶', '仙阶'];

    function getAllSlotSkills(statData) {
        const 人物 = statData?.人物;
        if (!人物) return {};
        return {
            ...(人物.主动技能槽 || {}),
            ...(人物.觉醒技能槽 || {})
        };
    }

    let _lastRound = -1;

    function handleSkillCooldowns(statData, statDataBefore) {
        const allSlotSkills = getAllSlotSkills(statData);
        const 技能列表 = statData?.人物?.功法树?.技能列表 || {};
        const 当前轮次 = statData?.战斗?.当前轮次 || 0;
        const 上次轮次 = statDataBefore?.战斗?.当前轮次 ?? _lastRound;

        // 轮次推进 → 已有冷却计数的神通递减
        const justExpired = new Set();
        if (当前轮次 > 上次轮次 && 上次轮次 >= 0) {
            const delta = 当前轮次 - 上次轮次;
            for (const [name, skill] of Object.entries(技能列表)) {
                if (skill.冷却计数 > 0) {
                    const before = skill.冷却计数;
                    skill.冷却计数 = Math.max(0, skill.冷却计数 - delta);
                    console.log(`[冷却系统] 轮次推进(+${delta})：「${name}」冷却计数 ${before}→${skill.冷却计数}`);
                    if (skill.冷却计数 <= 0) justExpired.add(name);
                }
            }
        }

        // 新进入冷却检测
        for (const [name, slotSkill] of Object.entries(allSlotSkills)) {
            if (slotSkill.冷却中 !== true) continue;
            if (justExpired.has(name)) continue;

            const treeSkill = 技能列表[name];
            if (!treeSkill) continue;
            if (treeSkill.冷却计数 > 0) continue;

            const tier = slotSkill.阶位 || treeSkill.阶位 || '凡阶';
            const tierCD = tierCooldownMap[tier] || 0;
            if (tierCD <= 0) {
                slotSkill.冷却中 = false;
                treeSkill.冷却计数 = 0;
            } else {
                treeSkill.冷却计数 = tierCD;
                console.log(`[冷却系统] 神通「${name}」进入冷却，阶位=${tier}，等待轮数=${tierCD}`);
            }
        }

        // 冷却计数归零 → 恢复可用
        for (const [name, slotSkill] of Object.entries(allSlotSkills)) {
            const treeSkill = 技能列表[name];
            if (slotSkill.冷却中 === true && treeSkill && treeSkill.冷却计数 <= 0) {
                slotSkill.冷却中 = false;
                treeSkill.冷却计数 = 0;
                console.log(`[冷却系统] 「${name}」冷却结束，已恢复可用`);
            }
        }

        // 战斗结束 → 清空所有冷却
        if (当前轮次 === 0 && !statData?.战斗?.是否战斗中) {
            for (const [, slotSkill] of Object.entries(allSlotSkills)) {
                if (slotSkill.冷却中 === true) slotSkill.冷却中 = false;
            }
            for (const [name, treeSkill] of Object.entries(技能列表)) {
                if (treeSkill.冷却计数 > 0) {
                    treeSkill.冷却计数 = 0;
                    console.log(`[冷却系统] 战斗结束：「${name}」冷却已清空`);
                }
            }
        }

        _lastRound = 当前轮次;
    }

    // ==========================================
    // 变量守卫
    // ==========================================

    const PROTECTED_PATHS = [
        '人物.等级',
        '人物.升级阈值',
    ];

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

    function guardProtectedFields(statData, statDataBefore) {
        if (!statDataBefore) return;
        for (const path of PROTECTED_PATHS) {
            const oldVal = getByPath(statDataBefore, path);
            const newVal = getByPath(statData, path);
            if (oldVal !== undefined && hasChanged(oldVal, newVal)) {
                console.warn(`[变量守卫] ⚠️ 受保护字段被外部修改: ${path}，已回滚`);
                setByPath(statData, path, oldVal);
            }
        }

        // 法宝新增守卫
        const oldEquipList = statDataBefore?.人物?.装备列表 || {};
        const newEquipList = statData?.人物?.装备列表 || {};
        for (const [equipKey, equipVal] of Object.entries(newEquipList)) {
            if (!equipVal || typeof equipVal !== 'object') continue;
            const isNewEquip = oldEquipList[equipKey] === undefined;
            if (isNewEquip) {
                const equipName = (typeof equipVal.名称 === 'string') ? equipVal.名称.trim() : '';
                if (!equipName) {
                    equipVal.名称 = equipKey;
                    console.warn(`[变量守卫] ⚠️ 新增法宝 "${equipKey}" 名称为空，已自动回填为键名`);
                }
            }
            if (isNewEquip && equipVal.装备箱 === false) {
                equipVal.装备箱 = true;
                console.warn(`[变量守卫] ⚠️ 新增法宝 "${equipKey}" 装备箱为 false，已自动修正为 true`);
            }
        }
    }

    // ==========================================
    // 经验分发与升级（修仙版：修为积累 + 境界突破）
    // ==========================================

    function processLevelUp(player) {
        let currentLevel = safeParseInt(player.等级, 1);
        let currentExp = safeParseFloat(player.当前总经验, 0);
        let requiredExp = safeParseFloat(player.升级阈值, 0);

        if (requiredExp <= 0) {
            requiredExp = calculateThreshold(currentLevel + 1);
            player.升级阈值 = requiredExp;
        }

        while (currentExp >= requiredExp && requiredExp > 0) {
            const oldLevel = currentLevel;
            currentLevel++;
            player.等级 = currentLevel;

            // 境界突破检测
            const oldRealm = getRealmByLevel(oldLevel);
            const newRealm = getRealmByLevel(currentLevel);

            if (!player.属性) player.属性 = {};

            // 每10级获得属性点
            if (currentLevel % 10 === 0) {
                player.属性.属性点 = safeParseInt(player.属性.属性点) + 1;
            }

            // 灵根品质影响悟性点获取
            const rootGrade = player?.灵根?.品质 || '三灵根';
            const rootBonus = ROOT_GRADE_BONUS[rootGrade] || 0.7;
            const spPerLevel = Math.floor(25 * rootBonus);

            player.SP = safeParseInt(player.SP) + spPerLevel;
            if (player.功法树) {
                player.功法树.总悟性点 = safeParseInt(player.功法树.总悟性点) + spPerLevel;
            }
            player.RP = safeParseInt(player.RP) + 1;

            // 大境界突破时的特殊处理
            if (oldRealm.境界 !== newRealm.境界) {
                console.log(`[境界突破] ${oldRealm.境界} → ${newRealm.境界}！`);
                // 突破时恢复全部灵力和生命
                player.当前灵力 = player.灵力上限;
                player.当前生命值 = player.生命值上限;
            }

            console.log(`[修为辅助] 突破! ${newRealm.境界}${newRealm.小境界} Lv.${currentLevel} | SP: +${spPerLevel} | RP: +1`);

            requiredExp = calculateThreshold(currentLevel + 1);
            player.升级阈值 = requiredExp;
        }

        // 同步境界
        const realmInfo = getRealmByLevel(currentLevel);
        player.境界 = realmInfo.境界;
        player.小境界 = realmInfo.小境界;
    }

    function processBondLevelUp(bond, bondName) {
        if (!bond) return;

        let currentLevel = safeParseInt(bond.等级, 1);
        const levelBaseExp = getLevelBaseTotalExp(currentLevel);
        const parsedExp = parseFloat(bond.当前总经验);
        if (bond.当前总经验 === undefined || bond.当前总经验 === null || isNaN(parsedExp)) {
            bond.当前总经验 = levelBaseExp;
        } else if (parsedExp < levelBaseExp) {
            bond.当前总经验 = levelBaseExp;
        }

        let currentExp = safeParseFloat(bond.当前总经验, levelBaseExp);
        let requiredExp = safeParseFloat(bond.升级阈值, 0);

        if (requiredExp <= 0) {
            requiredExp = calculateThreshold(currentLevel + 1);
            bond.升级阈值 = requiredExp;
        }

        let levelUps = 0;
        while (currentExp >= requiredExp && requiredExp > 0) {
            currentLevel++;
            levelUps++;
            bond.等级 = currentLevel;
            requiredExp = calculateThreshold(currentLevel + 1);
            bond.升级阈值 = requiredExp;
        }

        if (levelUps > 0) {
            const realmInfo = getRealmByLevel(currentLevel);
            bond.境界 = realmInfo.境界 + realmInfo.小境界;
            console.log(`[羁绊突破] ${bondName} 突破 ${levelUps} 次，当前 ${realmInfo.境界}${realmInfo.小境界}`);
        }

        const needRecalcBondHp = levelUps > 0 ||
            bond.生命值上限 === undefined || bond.生命值上限 === null ||
            safeParseInt(bond.生命值上限, 0) <= 0;
        if (needRecalcBondHp) {
            calculateBondMaxHP(bond, bondName, { initMissingCurrentHp: true });
        }
    }

    function shareExpToEligibleBonds(statData, gainedExp, player) {
        if (!statData || gainedExp <= 0) return;
        const bonds = statData.羁绊列表;
        if (!bonds || typeof bonds !== 'object') return;

        const playerLevel = safeParseInt(player?.等级, 1);
        const playerName = player?.名称 || '';

        Object.entries(bonds).forEach(([name, bond]) => {
            if (!bond || typeof bond !== 'object') return;
            if (name === playerName) return;

            const bondLevel = safeParseInt(bond.等级, 1);
            if (bondLevel >= playerLevel) return;
            if (bond.附近 !== true && bondLevel > 60) return;

            const oldExp = safeParseFloat(bond.当前总经验, 0);
            const newExp = oldExp + gainedExp;
            if (newExp <= oldExp) return;
            bond.当前总经验 = newExp;

            console.log(`[修为分发] ${name} 获得修为 +${gainedExp}`);
            processBondLevelUp(bond, name);
        });
    }

    function calculateBondMaxHP(bond, bondName, options = {}) {
        if (!bond) return;
        const initMissingCurrentHp = options.initMissingCurrentHp === true;

        const 等级 = safeParseInt(bond.等级, 1);
        const 根骨 = safeParseInt(bond.属性?.根骨, 10);
        const 种族 = bond.种族 || '';

        let equipRootBonus = 0;
        let equipHpBonus = 0;
        const 装备列表 = bond.装备列表 || {};
        Object.values(装备列表).forEach(item => {
            if (!item || !item.名称 || item.装备箱) return;
            const bonuses = item.属性加成 || {};
            equipRootBonus += safeParseInt(bonuses['根骨'], 0);
            equipHpBonus += safeParseInt(bonuses['生命值上限'], 0);
        });

        const total根骨 = 根骨 + equipRootBonus;
        let newMaxHP;
        if (种族 === '妖族') {
            newMaxHP = 等级 * total根骨 * 3 + equipHpBonus;
        } else {
            newMaxHP = 等级 * total根骨 * 2 + equipHpBonus;
        }
        newMaxHP = Math.max(newMaxHP, 1);

        const oldMaxHP = safeParseInt(bond.生命值上限, 0);
        const oldCurrentHP = safeParseInt(bond.当前生命值, 0);

        if (oldMaxHP !== newMaxHP) {
            bond.生命值上限 = newMaxHP;
            if (oldMaxHP > 0 && oldCurrentHP > 0) {
                const hpRatio = oldCurrentHP / oldMaxHP;
                bond.当前生命值 = Math.min(Math.max(1, Math.round(hpRatio * newMaxHP)), newMaxHP);
            } else if (initMissingCurrentHp && (bond.当前生命值 === undefined || bond.当前生命值 === null)) {
                bond.当前生命值 = newMaxHP;
            } else if (oldCurrentHP > newMaxHP) {
                bond.当前生命值 = newMaxHP;
            }
            return;
        }

        if (initMissingCurrentHp && (bond.当前生命值 === undefined || bond.当前生命值 === null)) {
            bond.当前生命值 = newMaxHP;
        }
    }

    function ensureAllBondsThresholdCorrect(statData, playerName) {
        const bonds = statData?.羁绊列表;
        if (!bonds || typeof bonds !== 'object') return;

        Object.entries(bonds).forEach(([name, bond]) => {
            if (!bond || typeof bond !== 'object') return;
            if (name === playerName) return;

            const bondLevel = safeParseInt(bond.等级, 1);
            const levelBaseExp = getLevelBaseTotalExp(bondLevel);
            const parsedExp = parseFloat(bond.当前总经验);

            if (bond.当前总经验 === undefined || bond.当前总经验 === null || isNaN(parsedExp)) {
                bond.当前总经验 = levelBaseExp;
            } else if (parsedExp < levelBaseExp) {
                bond.当前总经验 = levelBaseExp;
            }

            const correctThreshold = calculateThreshold(bondLevel + 1);
            const parsedThreshold = safeParseFloat(bond.升级阈值, 0);
            if (bond.升级阈值 === undefined || bond.升级阈值 === null || parsedThreshold !== correctThreshold) {
                bond.升级阈值 = correctThreshold;
            }
        });
    }

    function ensureNearbyBondCompatFields(statData, playerName) {
        const bonds = statData?.羁绊列表;
        if (!bonds || typeof bonds !== 'object') return;

        Object.entries(bonds).forEach(([name, bond]) => {
            if (!bond || typeof bond !== 'object') return;
            if (bond.附近 !== true) return;
            if (name === playerName) return;

            const missingHp = bond.生命值上限 === undefined || bond.生命值上限 === null ||
                safeParseInt(bond.生命值上限, 0) <= 0 ||
                bond.当前生命值 === undefined || bond.当前生命值 === null;
            if (missingHp) {
                calculateBondMaxHP(bond, name, { initMissingCurrentHp: true });
            }
        });
    }

    function ensureNewBondHpInitialized(statData, statDataBefore, playerName) {
        const bonds = statData?.羁绊列表;
        if (!bonds || typeof bonds !== 'object') return;

        const bondsBefore = statDataBefore?.羁绊列表;
        const beforeMap = (bondsBefore && typeof bondsBefore === 'object') ? bondsBefore : {};

        Object.entries(bonds).forEach(([name, bond]) => {
            if (!bond || typeof bond !== 'object') return;
            if (name === playerName) return;

            const existedBefore = beforeMap[name] && typeof beforeMap[name] === 'object';
            if (existedBefore) return;

            calculateBondMaxHP(bond, name, { initMissingCurrentHp: true });
            if (safeParseInt(bond.当前生命值, 0) <= 0) {
                bond.当前生命值 = Math.max(safeParseInt(bond.生命值上限, 1), 1);
            }

            const bondLevel = safeParseInt(bond.等级, 1);
            const levelBaseExp = getLevelBaseTotalExp(bondLevel);
            if (bond.当前总经验 === undefined || bond.当前总经验 === null || safeParseFloat(bond.当前总经验, 0) < levelBaseExp) {
                bond.当前总经验 = levelBaseExp;
            }

            if (bond.升级阈值 === undefined || bond.升级阈值 === null || safeParseFloat(bond.升级阈值, 0) <= 0) {
                bond.升级阈值 = calculateThreshold(bondLevel + 1);
            }

            // 同步境界
            const realmInfo = getRealmByLevel(bondLevel);
            if (!bond.境界) bond.境界 = realmInfo.境界 + realmInfo.小境界;

            console.log(`[羁绊注册] ${name} 新注册，已完成基础初始化`);
        });
    }

    // ==========================================
    // 洞府产出日期检查
    // ==========================================

    const CALENDAR_DATE_REGEX = /^(.*?)(\d+)年(\d+)月(\d+)日$/;
    const DAY_MS = 24 * 60 * 60 * 1000;

    function parseCalendarDate(text) {
        if (typeof text !== 'string') return null;
        const raw = text.trim();
        if (!raw) return null;
        const m = raw.match(CALENDAR_DATE_REGEX);
        if (!m) return null;

        const prefix = (m[1] || '').trim() || '玄元历';
        const year = safeParseInt(m[2], NaN);
        const month = safeParseInt(m[3], NaN);
        const day = safeParseInt(m[4], NaN);
        if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
        if (month < 1 || month > 12 || day < 1 || day > 31) return null;

        const date = new Date(Date.UTC(year, month - 1, day));
        if (date.getUTCFullYear() !== year || date.getUTCMonth() !== (month - 1) || date.getUTCDate() !== day) return null;
        return { prefix, date, year, month, day };
    }

    function formatCalendarDate(prefix, date) {
        const y = date.getUTCFullYear();
        const m = date.getUTCMonth() + 1;
        const d = date.getUTCDate();
        return `${prefix || '玄元历'}${y}年${m}月${d}日`;
    }

    function addDaysToCalendarDate(date, days) {
        const next = new Date(date.getTime());
        next.setUTCDate(next.getUTCDate() + days);
        return next;
    }

    function getCalendarDayDiff(laterDate, earlierDate) {
        const left = Date.UTC(laterDate.getUTCFullYear(), laterDate.getUTCMonth(), laterDate.getUTCDate());
        const right = Date.UTC(earlierDate.getUTCFullYear(), earlierDate.getUTCMonth(), earlierDate.getUTCDate());
        return Math.floor((left - right) / DAY_MS);
    }

    function hasEffectiveProduction(outputText) {
        if (typeof outputText !== 'string') return false;
        const text = outputText.trim();
        if (!text) return false;
        const normalized = text.replace(/\s+/g, '');
        const emptyWords = new Set(['无', '暂无', '无产出', '空', 'none', 'null']);
        return !emptyWords.has(normalized.toLowerCase());
    }

    function detectProductionCycleDays(outputText) {
        const text = (outputText || '').toString();
        if (/每日|每天|日产/i.test(text)) return 1;
        if (/每月|月产/i.test(text)) return 30;
        if (/每周|周产/i.test(text)) return 7;
        return 7;
    }

    function syncAssetProductionSchedules(statData) {
        const assets = statData?.核心资产;
        if (!assets || typeof assets !== 'object') return;

        const worldCalendar = statData?.世界信息?.年历;
        const nowParsed = parseCalendarDate(worldCalendar);
        if (!nowParsed) return;
        const nowDate = nowParsed.date;
        const datePrefix = nowParsed.prefix || '玄元历';

        Object.entries(assets).forEach(([assetName, asset]) => {
            if (!asset || typeof asset !== 'object') return;
            if (!Array.isArray(asset.待办事件)) asset.待办事件 = [];

            const seqMap = asset.建设序列;
            if (!seqMap || typeof seqMap !== 'object') return;

            const overdueLines = [];
            Object.entries(seqMap).forEach(([seqName, seq]) => {
                if (!seq || typeof seq !== 'object') return;

                const outputText = (typeof seq.产出 === 'string') ? seq.产出.trim() : '';
                const hasOutput = hasEffectiveProduction(outputText);
                const cycleDays = detectProductionCycleDays(outputText);
                const nextDateRaw = (typeof seq.下次产出日期 === 'string') ? seq.下次产出日期.trim() : '';
                const nextDateParsed = parseCalendarDate(nextDateRaw);

                if (!nextDateParsed) {
                    if (hasOutput) {
                        seq.下次产出日期 = formatCalendarDate(datePrefix, addDaysToCalendarDate(nowDate, cycleDays));
                    }
                    return;
                }

                const overdueDays = getCalendarDayDiff(nowDate, nextDateParsed.date);
                if (overdueDays < 2 || !hasOutput) return;

                overdueLines.push(`${seqName}→${outputText}`);
                seq.下次产出日期 = formatCalendarDate(datePrefix, addDaysToCalendarDate(nowDate, cycleDays));
            });

            if (overdueLines.length > 0) {
                const location = (typeof asset.所在地 === 'string' && asset.所在地.trim()) ? asset.所在地.trim() : '未知地点';
                const todoText = `【洞府到期结算】${assetName}（${location}）：${overdueLines.join('；')}`;
                const exists = asset.待办事件.some(v => typeof v === 'string' && v === todoText);
                if (!exists) {
                    asset.待办事件.push(todoText);
                    console.log(`[洞府结算] ${assetName} 发现${overdueLines.length}条过期产出`);
                }
            }
        });
    }

    // ==========================================
    // 组合技能系统（简化版，保留框架）
    // ==========================================

    function getSkillSystemMode(statData) {
        return statData?.系统配置?.技能系统模式 === 'combo' ? 'combo' : 'classic';
    }

    // ==========================================
    // 主逻辑
    // ==========================================

    let is_initialized_log = false;
    let isProcessing = false;

    function handleExperienceProcessing(rawVariables, rawVariablesBefore) {
        if (isProcessing) {
            console.log('[辅助脚本] ⚠️ 防重入拦截，跳过本次处理');
            return;
        }
        isProcessing = true;

        try {
            const statData = rawVariables?.stat_data;
            const statDataBefore = rawVariablesBefore?.stat_data;
            if (!statData) return;

            const player = statData.人物;
            if (!player) return;

            // 先回滚受保护字段
            guardProtectedFields(statData, statDataBefore);

            if (!is_initialized_log) {
                console.log('[辅助脚本] 修仙MVU变量连接成功');
                is_initialized_log = true;
            }

            const playerBefore = statDataBefore?.人物;

            // 羁绊修正
            ensureAllBondsThresholdCorrect(statData, player?.名称 || '');
            ensureNewBondHpInitialized(statData, statDataBefore, player?.名称 || '');
            ensureNearbyBondCompatFields(statData, player?.名称 || '');

            // 洞府产出检查
            syncAssetProductionSchedules(statData);

            // 经验变化检测
            const playerExpBefore = safeParseFloat(playerBefore?.当前总经验, 0);
            const playerExpNow = safeParseFloat(player.当前总经验, 0);
            const playerExpDelta = playerExpNow - playerExpBefore;

            // 升级逻辑
            if (!playerBefore ||
                player.当前总经验 !== playerBefore.当前总经验 ||
                player.等级 !== playerBefore.等级) {
                processLevelUp(player);
            }

            // 修为分发给羁绊
            if (playerBefore && playerExpDelta > 0) {
                shareExpToEligibleBonds(statData, playerExpDelta, player);
            }

            // 装备变化检测
            const equipChanged = !playerBefore || hasChanged(player.装备列表, playerBefore.装备列表);
            if (equipChanged && playerBefore) {
                syncCoreAttrsOnEquipChange(player, playerBefore);
            }

            // HP上限重算
            if (!playerBefore ||
                player.等级 !== playerBefore.等级 ||
                player.属性?.根骨 !== playerBefore.属性?.根骨 ||
                equipChanged) {
                calculateMaxHP(player);
            }

            // 灵力上限重算
            if (!playerBefore ||
                player.等级 !== playerBefore.等级 ||
                player.属性?.灵力 !== playerBefore.属性?.灵力 ||
                player.属性?.悟性 !== playerBefore.属性?.悟性 ||
                player.境界 !== playerBefore?.境界 ||
                equipChanged) {
                calculateMaxMP(player);
            }

            // 法宝数值重算
            calculateAllEquipmentStats(statData);

            // 防御重算
            if (!playerBefore || equipChanged || player.种族 !== playerBefore.种族) {
                calculateDefense(statData);
            }

            // 减伤重算
            if (equipChanged) {
                calculateDamageReductions(player, playerBefore);
            }

            // 暴击率变化 → 战斗属性重算
            if (!playerBefore || player.战斗属性?.暴击率 !== playerBefore.战斗属性?.暴击率) {
                calculateCombatStats(player);
            }

            // 神通冷却管理
            handleSkillCooldowns(statData, statDataBefore);

            // 战斗结束时清零临时生命值
            const 战斗 = statData.战斗 || {};
            const 战斗Before = statDataBefore?.战斗 || {};
            if (战斗Before.是否战斗中 === true && 战斗.是否战斗中 === false) {
                if (player.临时生命值 > 0) {
                    player.临时生命值 = 0;
                    console.log('[临时HP] 战斗结束，临时生命值已清零');
                }
            }
        } finally {
            isProcessing = false;
        }
    }

    // ==========================================
    // 事件注册
    // ==========================================

    const init = async () => {
        await waitGlobalInitialized('Mvu');
        eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, handleExperienceProcessing);
        try { (window.parent || window).__辅助计算脚本_loaded__ = true; } catch(e) { window.__辅助计算脚本_loaded__ = true; }
        console.log('[辅助脚本] 修仙辅助脚本已加载');
        toastr.success('[辅助脚本] 修仙辅助脚本已加载');
    };

    $(init);

})();
