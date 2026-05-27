"use strict";

const processInputData = (sourceText) => {
    const contentLines = sourceText.trim().split("\n");

    const targetValue = Number(contentLines[0].split(" ")[1]);

    const initialNumbers = contentLines[1].split(" ").map(Number);

    const distinctDescendingNumbers = Array.from(new Set(initialNumbers)).sort((valA, valB) => valB - valA);

    const primaryFactor = distinctDescendingNumbers[0];
    const auxiliaryFactors = distinctDescendingNumbers.slice(1);

    return { targetValue, primaryFactor, auxiliaryFactors };
};

const performCalculation = (inputContent) => {
    const { targetValue, primaryFactor, auxiliaryFactors } = processInputData(inputContent);

    const upperIterationBound = Math.floor(targetValue / primaryFactor - 0.5);

    if (upperIterationBound < 1) {
        console.log(0);
        return;
    }

    const finalCount = Array.from({ length: upperIterationBound }, (_, index) => index + 1)
        .filter(currentIteration => {
            const testValue = primaryFactor * (currentIteration + 0.5);

            return auxiliaryFactors.every(divisorCandidate => {
                // Original condition: Number.isInteger(testValue / divisorCandidate - 0.5)
                // This is equivalent to: (2 * testValue) / divisorCandidate must be an odd integer.
                // Which means: (2 * testValue) must be divisible by divisorCandidate, AND
                // (2 * testValue / divisorCandidate) % 2 === 1.
                // A more compact way to express this is:
                // (2 * testValue) % (2 * divisorCandidate) === divisorCandidate
                // This holds true if 2*testValue = K * (2*divisorCandidate) + divisorCandidate
                // => 2*testValue / divisorCandidate = 2K + 1 (an odd integer)
                return (2 * testValue) % (2 * divisorCandidate) === divisorCandidate;
            });
        })
        .length;

    console.log(finalCount);
};

performCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));
