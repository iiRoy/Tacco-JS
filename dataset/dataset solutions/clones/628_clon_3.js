const fs = require('fs');

function readOrbitalPeriods() {
    const input = fs
        .readFileSync(0, 'utf8')
        .trim()
        .split(/\s+/)
        .map(Number);

    const declaredMoons = input.shift();

    return input.slice(0, declaredMoons);
}

function findGreatestDivisor(firstValue, secondValue) {
    if (secondValue === 0) {
        return firstValue;
    }

    return findGreatestDivisor(
        secondValue,
        firstValue % secondValue
    );
}

function mergeOrbitalCycles(accumulatedCycle, newCycle) {
    const divisor = findGreatestDivisor(
        accumulatedCycle,
        newCycle
    );

    const reducedCycle = accumulatedCycle / divisor;

    return Math.abs(reducedCycle * newCycle);
}

const moonPeriods = readOrbitalPeriods();

const synchronizedOrbit = moonPeriods.reduce(
    (currentAlignment, moonPeriod) =>
        mergeOrbitalCycles(currentAlignment, moonPeriod),
    1
);

process.stdout.write(`${synchronizedOrbit}\n`);