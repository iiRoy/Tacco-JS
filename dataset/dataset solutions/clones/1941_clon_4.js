const fileSystemAccess = require('node:fs');

const extractRawData = (sourcePath, dataEncoding) => {
    return fileSystemAccess.readFileSync(sourcePath, dataEncoding).toString();
};

const battleSimulator = (scenarioText) => {
    const numericElements = scenarioText.match(/-?\d+/g).map(Number);

    const firstCombatantHP = numericElements[0];
    const firstCombatantAttack = numericElements[1];
    const secondCombatantHP = numericElements[2];
    const secondCombatantAttack = numericElements[3];

    let roundsForSecondToFall;
    if (firstCombatantAttack <= 0) {
        roundsForSecondToFall = Infinity;
    } else {
        roundsForSecondToFall = Math.ceil(secondCombatantHP / firstCombatantAttack);
    }

    let roundsForFirstToFall;
    if (secondCombatantAttack <= 0) {
        roundsForFirstToFall = Infinity;
    } else {
        roundsForFirstToFall = Math.ceil(firstCombatantHP / secondCombatantAttack);
    }

    return (roundsForSecondToFall <= roundsForFirstToFall) ? 'Yes' : 'No';
};

globalThis.console.log(
    battleSimulator(
        extractRawData('/dev/stdin', 'utf8')
    )
);