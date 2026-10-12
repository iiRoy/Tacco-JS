const process = require('process');
const rli = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let acquisitionLines = [];
rli.on('line', (currentLine) => {
    acquisitionLines.push(currentLine);
});

rli.on('close', () => {
    coordinatePerformance(acquisitionLines);
});

function coordinatePerformance(collectionOfLines) {
    let currentLineIndex = 0;
    const advanceAndRetrieve = () => collectionOfLines[currentLineIndex++];
    const advanceAndParseInteger = () => parseInt(advanceAndRetrieve(), 10);
    const advanceAndFormElement = () => {
        const parts = advanceAndRetrieve().split(' ').map(Number);
        return { initialMoment: parts[0], extent: parts[1], reward: parts[2] };
    };

    const numberOfElements = advanceAndParseInteger();
    const compositionElements = Array.from({ length: numberOfElements }, advanceAndFormElement);

    const numberOfMelodies = advanceAndParseInteger();
    const melodyTemporalRanges = Array.from({ length: numberOfMelodies }, advanceAndParseInteger);

    const accumulatedScores = [];
    let zeroResultEncountered = false;

    for (const currentMelodyRange of melodyTemporalRanges) {
        const computedScore = calculateMaximumValue(compositionElements, currentMelodyRange);
        if (computedScore === 0) {
            zeroResultEncountered = true;
            break;
        }
        accumulatedScores.push(computedScore);
    }

    if (zeroResultEncountered) {
        console.log(-1);
    } else {
        accumulatedScores.forEach(s => console.log(s));
    }
}

function calculateMaximumValue(elementsToConsider, maximumAllowedSpan) {
    const memoizationCache = new Map(); // Stores computed results for (elementIndex, currentSpan)

    // Recursive helper function to determine the optimal score
    const obtainCachedOrCompute = (elementIndex, currentSpan) => {
        if (currentSpan < 0) {
            return -Infinity; // Invalid duration, effectively no points
        }
        if (elementIndex < 0) {
            return 0; // No elements left, no points can be added
        }

        const uniqueKey = `${elementIndex}-${currentSpan}`;
        if (memoizationCache.has(uniqueKey)) {
            return memoizationCache.get(uniqueKey);
        }

        const currentElement = elementsToConsider[elementIndex];
        const elementInitialMoment = currentElement.initialMoment;
        const elementExtent = currentElement.extent;
        const elementReward = currentElement.reward;

        // Option 1: Exclude the current element
        let currentHighestScore = obtainCachedOrCompute(elementIndex - 1, currentSpan);

        // Option 2: Include the current element
        // This is only possible if the element's initial moment constraint is met within the current span
        if (elementInitialMoment <= currentSpan) {
            let potentialContributionFromPreviousStates = 0;
            // The original logic involved slicing the *current* DP row (dp[i+1])
            // This translates to finding the maximum value from recursive calls for the *same* elementIndex
            // but with varying previous durations (k) that allow the current element to be placed.
            // k ranges from max(0, currentSpan - elementExtent) to currentSpan - elementInitialMoment.
            for (let k = Math.max(0, currentSpan - elementExtent); k <= currentSpan - elementInitialMoment; k++) {
                potentialContributionFromPreviousStates = Math.max(
                    potentialContributionFromPreviousStates,
                    obtainCachedOrCompute(elementIndex, k)
                );
            }
            currentHighestScore = Math.max(currentHighestScore, potentialContributionFromPreviousStates + elementReward);
        }

        memoizationCache.set(uniqueKey, currentHighestScore);
        return currentHighestScore;
    };

    return obtainCachedOrCompute(elementsToConsider.length - 1, maximumAllowedSpan);
}