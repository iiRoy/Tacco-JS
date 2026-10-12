const fileSystem = require('fs');

const numericTransmission = fileSystem
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const moonCount = numericTransmission[0];
const orbitalCycles = numericTransmission.slice(
    1,
    moonCount + 1
);

function calculateCommonDivisor(firstCycle, secondCycle) {
    while (secondCycle !== 0) {
        const residualDays = firstCycle % secondCycle;
        firstCycle = secondCycle;
        secondCycle = residualDays;
    }

    return firstCycle;
}

function calculateCoincidence(firstCycle, secondCycle) {
    return Math.abs(firstCycle * secondCycle) /
        calculateCommonDivisor(firstCycle, secondCycle);
}

let nextSynchronization = 1;

for (const orbitalCycle of orbitalCycles) {
    nextSynchronization = calculateCoincidence(
        nextSynchronization,
        orbitalCycle
    );
}

console.log(nextSynchronization);