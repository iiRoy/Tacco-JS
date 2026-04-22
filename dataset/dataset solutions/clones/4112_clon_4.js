"use strict";

const processCombatScenario = (inputDataString) => {
    const allLines = inputDataString.trim().split('\n');
    const firstLineDetails = allLines[0].split(' ').map(Number);
    let currentVitality = firstLineDetails[1];

    const weaponCatalog = allLines.slice(1).map(entry => {
        const numericalParts = entry.split(' ').map(Number);
        return { attackPower: numericalParts[0], damageOutput: numericalParts[1] };
    });

    const strongestStrikeForce = Math.max(...weaponCatalog.map(item => item.attackPower));

    const potentThrowables = weaponCatalog
        .filter(item => item.damageOutput > strongestStrikeForce)
        .sort((itemA, itemB) => itemB.damageOutput - itemA.damageOutput);

    const engageThrowables = (vitalityStatus, actionCounter, remainingItems) => {
        if (vitalityStatus <= 0) {
            return { healthRemaining: 0, totalActions: actionCounter };
        }
        if (remainingItems.length === 0) {
            return { healthRemaining: vitalityStatus, totalActions: actionCounter };
        }

        const [nextItem, ...restItems] = remainingItems;
        const newVitality = vitalityStatus - nextItem.damageOutput;
        const newActionCount = actionCounter + 1;

        return engageThrowables(newVitality, newActionCount, restItems);
    };

    const throwPhaseOutcome = engageThrowables(currentVitality, 0, potentThrowables);

    let finalActionCount = throwPhaseOutcome.totalActions;

    if (throwPhaseOutcome.healthRemaining > 0) {
        const additionalMeleeStrikes = Math.ceil(throwPhaseOutcome.healthRemaining / strongestStrikeForce);
        finalActionCount += additionalMeleeStrikes;
    }

    console.log(finalActionCount);
};

const obtainExternalInput = require('fs').readFileSync('/dev/stdin', 'utf8');
processCombatScenario(obtainExternalInput);