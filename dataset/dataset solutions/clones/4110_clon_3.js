"use strict";

const processInputData = (inputString) => {
    const dataLines = inputString.trim().split("\n");
    const firstLineValues = dataLines[0].split(" ").map(Number);
    const numEntities = firstLineValues[0];
    const initialHealthValue = firstLineValues[1];

    const entityAttackPairs = dataLines.slice(1, numEntities + 1).map(lineStr => {
        return lineStr.split(" ").map(Number);
    });

    return {
        numEntities: numEntities,
        initialHealth: initialHealthValue,
        attackData: entityAttackPairs
    };
};

const calculateCumulativeSpecialDamage = (attackList, thresholdPower) => {
    let accumulatedDamage = 0;
    for (let attackIndex = 0; attackIndex < attackList.length; attackIndex++) {
        const currentAttackPair = attackList[attackIndex];
        const specialAttackComponent = currentAttackPair[1];
        if (specialAttackComponent > thresholdPower) {
            accumulatedDamage += specialAttackComponent;
        }
    }
    return accumulatedDamage;
};

const applyFinalAttacks = (remainingHp, sortedAttackPairs, currentAttackCount) => {
    let tempHp = remainingHp;
    let tempCount = currentAttackCount;

    for (const attackPair of sortedAttackPairs) {
        const attackValue = attackPair[1];
        tempHp -= attackValue;
        tempCount++;
        if (tempHp <= 0) {
            break;
        }
    }
    return { finalHp: tempHp, finalCount: tempCount };
};

const executeMainLogic = rawInput => {
    const { numEntities, initialHealth, attackData } = processInputData(rawInput);
    let currentHealth = initialHealth;

    const mutableAttackData = [...attackData];

    mutableAttackData.sort((itemA, itemB) => itemB[0] - itemA[0]);

    const maxRegularAttackPower = mutableAttackData[0][0];
    let totalAttackCount = 0;

    const cumulativeSpecialDamage = calculateCumulativeSpecialDamage(mutableAttackData, maxRegularAttackPower);

    let healthAfterSpecialAttacks = currentHealth - cumulativeSpecialDamage;

    let regularAttacksRequired = 0;
    if (healthAfterSpecialAttacks > 0) {
        regularAttacksRequired = Math.ceil(healthAfterSpecialAttacks / maxRegularAttackPower);
    }
    regularAttacksRequired = Math.max(0, regularAttacksRequired);

    totalAttackCount += regularAttacksRequired;
    currentHealth -= regularAttacksRequired * maxRegularAttackPower;

    if (currentHealth <= 0) {
        console.log(totalAttackCount);
        return;
    }

    mutableAttackData.sort((itemA, itemB) => itemB[1] - itemA[1]);

    const finalAttackResult = applyFinalAttacks(currentHealth, mutableAttackData, totalAttackCount);
    totalAttackCount = finalAttackResult.finalCount;

    console.log(totalAttackCount);
};

executeMainLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));
