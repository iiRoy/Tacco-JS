"use strict";

const processChallenge = (inputSource) => {
    const contentLines = inputSource.trim().split('\n');

    const [entityQuantity, initialLifePoints] = contentLines.shift().split(' ').map(Number);

    const combatActions = contentLines.map(line => line.split(' ').map(Number));

    let highestAttackPower = 0;
    for (const [attackValue] of combatActions) {
        if (attackValue > highestAttackPower) {
            highestAttackPower = attackValue;
        }
    }

    const effectiveThrowAttacks = combatActions
        .filter(([, throwDamageValue]) => throwDamageValue > highestAttackPower)
        .sort(([, throwDamageA], [, throwDamageB]) => throwDamageB - throwDamageA);

    let currentLifePointsRemaining = initialLifePoints;
    let throwActionCount = 0;

    for (const [, currentThrowDamage] of effectiveThrowAttacks) {
        if (currentLifePointsRemaining <= 0) {
            break;
        }
        currentLifePointsRemaining -= currentThrowDamage;
        throwActionCount++;
    }

    if (currentLifePointsRemaining <= 0) {
        console.log(throwActionCount);
        return;
    }

    const requiredDirectStrikes = Math.ceil(currentLifePointsRemaining / highestAttackPower);

    console.log(throwActionCount + requiredDirectStrikes);
};

processChallenge(require('fs').readFileSync('/dev/stdin', 'utf8'));
