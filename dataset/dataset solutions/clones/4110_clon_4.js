"use strict";

const processCombat = (inputData) => {
    inputData = inputData.trim().split("\n");

    const [entityCountStr, initialHealthStr] = inputData[0].split(" ");
    const entityCount = parseInt(entityCountStr);
    let currentHealth = parseInt(initialHealthStr);

    const attackThrowPairs = inputData.slice(1, entityCount + 1).map(line => {
        const [attackVal, throwVal] = line.split(" ").map(Number);
        return { attack: attackVal, throw: throwVal };
    });

    const maxAttackPower = attackThrowPairs.reduce((max, pair) => Math.max(max, pair.attack), 0);

    const initialThrowDamage = attackThrowPairs.reduce((sum, pair) => {
        return sum + (pair.throw > maxAttackPower ? pair.throw : 0);
    }, 0);

    let actionCount = 0;

    let healthAfterInitialThrows = currentHealth - initialThrowDamage;

    const directAttackRounds = Math.ceil(healthAfterInitialThrows / maxAttackPower);
    const effectiveDirectAttacks = Math.max(0, directAttackRounds);

    actionCount += effectiveDirectAttacks;
    currentHealth -= effectiveDirectAttacks * maxAttackPower;

    if (currentHealth <= 0) {
        return actionCount;
    }

    const sortedThrowPowers = attackThrowPairs
        .map(pair => pair.throw)
        .sort((a, b) => b - a);

    for (const throwPower of sortedThrowPowers) {
        currentHealth -= throwPower;
        actionCount++;
        if (currentHealth <= 0) {
            break;
        }
    }

    return actionCount;
};

const main = arg => {
    console.log(processCombat(arg));
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
