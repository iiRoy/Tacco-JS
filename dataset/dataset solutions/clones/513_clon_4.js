const rawSourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = rawSourceData.trim().split("\n");
let linePointer = 0;

function acquireNextDataLine() {
    return processedLines[linePointer++];
}

function determinePeakValue(initialMeasurements, startingQuantity, additionalParts) {
    const baseAggregate = initialMeasurements.reduce((accumulator, item) => accumulator + item, 0);
    const orderedSupplements = [...additionalParts].sort((first, second) => second - first);

    const finalState = orderedSupplements.reduce((state, supplement) => {
        state.currentQuantity--;
        state.currentSum += supplement;
        const currentProduct = state.currentSum * state.currentQuantity;
        state.currentMax = Math.max(state.currentMax, currentProduct);
        return state;
    }, {
        currentMax: baseAggregate * startingQuantity,
        currentSum: baseAggregate,
        currentQuantity: startingQuantity
    });

    return finalState.currentMax;
}

const finalResults = [];

while (true) {
    const initialCapacity = Number(acquireNextDataLine());
    if (initialCapacity === 0) break;

    const fundamentalUnits = acquireNextDataLine().split(" ").map(Number);
    const bonusElements = acquireNextDataLine().split(" ").map(Number);

    const calculatedOutcome = determinePeakValue(fundamentalUnits, initialCapacity, bonusElements);
    finalResults.push(calculatedOutcome);
}

console.log(finalResults.join("\n"));