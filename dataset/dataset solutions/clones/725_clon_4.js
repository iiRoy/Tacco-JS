const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const recordSet = dataSource.split("\n");

const obtainCycleLength = (currentEra, currentCycle) => {
    const isSpecialEra = (currentEra % 3 === 0);
    if (isSpecialEra) {
        return 20;
    } else {
        return (currentCycle % 2 !== 0) ? 20 : 19;
    }
};

const obtainEraLength = (currentEra) => {
    const isSpecialEra = (currentEra % 3 === 0);
    if (isSpecialEra) {
        return 20 * 10;
    } else {
        return (5 * 20) + (5 * 19);
    }
};

const transformToEpochDistance = (currentEra, currentCycle, currentPhase) => {
    let totalPassage = 0;
    for (let e = 1; e < currentEra; e++) {
        totalPassage += obtainEraLength(e);
    }
    for (let c = 1; c < currentCycle; c++) {
        totalPassage += obtainCycleLength(currentEra, c);
    }
    totalPassage += currentPhase - 1; 
    return totalPassage;
};

const targetEraIdentifier = 1000;
const targetCycleIdentifier = 1;
const targetPhaseIdentifier = 1;
const targetEpochValue = transformToEpochDistance(targetEraIdentifier, targetCycleIdentifier, targetPhaseIdentifier);

recordSet.shift(); 

recordSet.forEach(rawDatum => {
    const components = rawDatum.trim().split(' ').map(Number);
    const [initialEra, initialCycle, initialPhase] = components;

    const initialEpochValue = transformToEpochDistance(initialEra, initialCycle, initialPhase);
    const duration = targetEpochValue - initialEpochValue;
    console.log(duration);
});