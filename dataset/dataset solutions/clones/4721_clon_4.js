'use strict';

const processInput = (rawInput) => {
    const lines = rawInput.trim().split('\n');
    const configParts = lines[0].split(' ').map(Number);
    const entryCount = configParts[0];
    const targetRatioString = `${configParts[1]} ${configParts[2]}`;

    const allEntries = lines.slice(1, entryCount + 1).map(line => {
        const [valA, valB, costValue] = line.split(' ').map(Number);
        return { valA, valB, costValue };
    });

    let minimumAchievedCost = Infinity;

    for (let startIdx = 0; startIdx < entryCount; startIdx++) {
        let currentSumA = 0;
        let currentSumB = 0;
        let currentAccumulatedCost = 0;

        for (let endIdx = startIdx; endIdx < entryCount; endIdx++) {
            const currentItem = allEntries[endIdx];

            currentSumA += currentItem.valA;
            currentSumB += currentItem.valB;
            currentAccumulatedCost += currentItem.costValue;

            if (currentAccumulatedCost >= minimumAchievedCost) {
                break;
            }

            const calculatedRatio = determineRatioString(currentSumA, currentSumB);

            if (calculatedRatio === targetRatioString) {
                if (currentAccumulatedCost < minimumAchievedCost) {
                    minimumAchievedCost = currentAccumulatedCost;
                }
            }
        }
    }

    console.log(minimumAchievedCost === Infinity ? -1 : minimumAchievedCost);
};

function determineRatioString(numerator, denominator) {
    const smallerValue = Math.min(numerator, denominator);
    let finalNumerator = numerator;
    let finalDenominator = denominator;

    if (smallerValue === 0) {
        return `${numerator} ${denominator}`;
    }

    const possibleDivisors = Array.from({ length: smallerValue }, (_, k) => k + 1);

    const result = possibleDivisors.reduce((accumulator, currentDivisor) => {
        const dividedNumerator = numerator / currentDivisor;
        const dividedDenominator = denominator / currentDivisor;
        if (Number.isInteger(dividedNumerator) && Number.isInteger(dividedDenominator)) {
            return { num: dividedNumerator, den: dividedDenominator };
        }
        return accumulator;
    }, { num: numerator, den: denominator });

    return `${result.num} ${result.den}`;
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
