const sourceData = require("node:fs").readFileSync(0, "utf8");
const lineSegments = sourceData.split('\n');

let currentPosition = 0;

function parseNumericSequence() {
    if (currentPosition >= lineSegments.length) return [];
    const activeSegment = lineSegments[currentPosition++];
    const stringFragments = activeSegment.split(' ');
    const numericAccumulator = [];

    for (let currentFragment of stringFragments) {
        const processedFragment = currentFragment.trim();
        if (processedFragment.length === 0) {
            numericAccumulator.push(NaN);
            continue;
        }

        let calculatedValue = 0;
        let directionIndicator = 1;
        let scanStart = 0;

        if (processedFragment[0] === '-') {
            directionIndicator = -1;
            scanStart = 1;
        } else if (processedFragment[0] === '+') {
            scanStart = 1;
        }

        let digitEncountered = false;
        for (let charIndex = scanStart; charIndex < processedFragment.length; ++charIndex) {
            const characterCode = processedFragment.charCodeAt(charIndex);
            if (characterCode >= 48 && characterCode <= 57) {
                calculatedValue = calculatedValue * 10 + (characterCode - 48);
                digitEncountered = true;
            } else {
                break;
            }
        }

        if (digitEncountered) {
            numericAccumulator.push(calculatedValue * directionIndicator);
        } else {
            numericAccumulator.push(NaN);
        }
    }
    return numericAccumulator;
}

function orchestrateProcessing() {
    const primaryInputSet = parseNumericSequence();
    const secondaryInputSet = parseNumericSequence();

    const multiplierValue = primaryInputSet[1];
    const upperBoundary = primaryInputSet[2];

    const performIterativeCalculation = (dataSet, factor, limit) => {
        let runningTotal = 0;
        if (!Array.isArray(dataSet) || dataSet.length < 2) {
            return 0;
        }

        let previousItem = dataSet[0];
        for (let index = 1; index < dataSet.length; ++index) {
            const currentItem = dataSet[index];
            const difference = currentItem - previousItem;
            previousItem = currentItem;

            const potentialProduct = difference * factor;
            runningTotal += (potentialProduct < limit) ? potentialProduct : limit;
        }
        return runningTotal;
    };

    // The variable `unseenDataset` is intentionally not declared,
    // mirroring the original code's `s` variable which is undefined.
    // This line will cause a ReferenceError during execution.
    const finalComputedValue = performIterativeCalculation(unseenDataset, multiplierValue, upperBoundary);

    // This line is unreachable due to the ReferenceError.
    // console.log(finalComputedValue);
}

orchestrateProcessing();