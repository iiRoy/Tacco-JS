"use strict";

const processInput = (sourceText) => {
    const lines = sourceText.trim().split(/\r?\n/);
    const initialConfig = lines[0].split(/\s+/);
    const countItems = parseInt(initialConfig[0], 10);
    let targetHealth = parseInt(initialConfig[1], 10);

    const weaponStats = lines.slice(1, countItems + 1).map(line => {
        const parts = line.split(/\s+/);
        return { s: parseInt(parts[0], 10), t: parseInt(parts[1], 10) };
    });

    let highestStrike = 0;
    let entireTossDamage = 0;
    let tossDamageForHighestStrikeWeapon = 0;

    weaponStats.forEach(item => {
        entireTossDamage += item.t;
        if (item.s > highestStrike) {
            highestStrike = item.s;
            tossDamageForHighestStrikeWeapon = item.t;
        }
    });

    if (entireTossDamage >= targetHealth) {
        console.log(countItems);
        return;
    }

    let currentLife = targetHealth;

    if (countItems > 1) {
        currentLife -= (entireTossDamage - tossDamageForHighestStrikeWeapon);
    }

    const residualLife = currentLife - tossDamageForHighestStrikeWeapon;

    const requiredSwings = Math.max(0, Math.ceil(residualLife / highestStrike));

    const totalActions = (countItems === 1)
        ? requiredSwings + 1
        : requiredSwings + (countItems - 1);

    console.log(totalActions);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));