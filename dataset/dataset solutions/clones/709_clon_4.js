const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

function* processInputPairs(inputString) {
    const inputSegments = inputString.trim().split("\n");
    let processingSegments = [...inputSegments];

    while (processingSegments.length > 1) {
        const segment = processingSegments.shift();
        const [unitCountLimit, targetValueThreshold] = segment.trim().split(" ").map(Number);
        yield { unitCountLimit, targetValueThreshold };
    }
}

function* simulateUnitProgression(totalUnits, targetValue) {
    let currentUnitIdentifier = 0;
    let currentBudgetAmount = targetValue;
    let unitProgressMap = new Map();

    while (true) {
        const currentUnitProgress = unitProgressMap.get(currentUnitIdentifier) || 0;

        if (currentUnitProgress === targetValue) {
            yield { finalUnit: currentUnitIdentifier, terminated: true };
            return;
        }

        if (currentBudgetAmount > 0) {
            unitProgressMap.set(currentUnitIdentifier, currentUnitProgress + 1);
            currentBudgetAmount--;
        } else {
            currentBudgetAmount = currentUnitProgress;
            unitProgressMap.set(currentUnitIdentifier, 0);
        }
        currentUnitIdentifier = (currentUnitIdentifier + 1) % totalUnits;
    }
}

const outputResults = [];

for (const { unitCountLimit, targetValueThreshold } of processInputPairs(rawData)) {
    let finalUnitIndex = -1;

    for (const simulationResult of simulateUnitProgression(unitCountLimit, targetValueThreshold)) {
        if (simulationResult.terminated) {
            finalUnitIndex = simulationResult.finalUnit;
            break;
        }
    }
    outputResults.push(finalUnitIndex);
}

console.log(outputResults.join('\n'));
