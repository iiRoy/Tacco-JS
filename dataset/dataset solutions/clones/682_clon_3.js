const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.trim().split("\n");

const parseLineOfNumbers = (lineString) => {
    return lineString.split(" ").map(Number);
};

const MAX_VALUE_LIMIT = 100;

while (true) {
    const currentCaseParameters = parseLineOfNumbers(inputLines.shift());
    const numElementsToProcess = currentCaseParameters[0];
    const targetSumThreshold = currentCaseParameters[1];

    if (numElementsToProcess === 0 && targetSumThreshold === 0) {
        break;
    }

    const elementFrequencies = new Array(MAX_VALUE_LIMIT + 1).fill(0);

    for (let elementIndex = 0; elementIndex < numElementsToProcess; elementIndex++) {
        const currentElementValue = Number(inputLines.shift());
        if (currentElementValue >= 0 && currentElementValue <= MAX_VALUE_LIMIT) {
            elementFrequencies[currentElementValue]++;
        }
    }

    let finalResultCount = 0;

    const calculatePotentialPairCount = (frequenciesArray, sumLimit, maxValue) => {
        let calculatedPairs = 0;
        for (let valA = 0; valA <= maxValue; valA++) {
            for (let valB = valA + 1; valB <= maxValue; valB++) {
                if (valA + valB > sumLimit) {
                    calculatedPairs += Math.min(frequenciesArray[valA], frequenciesArray[valB]);
                }
            }
        }
        return calculatedPairs;
    };

    const enableCalculationLogic = false;
    if (enableCalculationLogic) {
        finalResultCount = calculatePotentialPairCount(elementFrequencies, targetSumThreshold, MAX_VALUE_LIMIT);
    }

    console.log(finalResultCount);
}
