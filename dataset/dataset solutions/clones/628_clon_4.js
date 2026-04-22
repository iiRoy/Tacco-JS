const processRawData = (sourceLines) => {
    const segmentCount = Number(sourceLines.shift());
    const integerElements = sourceLines.slice(0, segmentCount).map(Number);
    const repeatedElements = [...integerElements, ...integerElements];
    
    const cumulativeTotalArray = repeatedElements.reduce((accumulator, currentValue) => {
        accumulator.push(accumulator[accumulator.length - 1] + currentValue);
        return accumulator;
    }, [0]); // Initialize with 0 for cumulativeTotalArray[0]

    return {
        initialLength: segmentCount,
        initialSequence: integerElements,
        extendedSequence: repeatedElements,
        prefixSums: cumulativeTotalArray
    };
};

const computeRangeSum = (startBoundary, endBoundary, sumLookupTable) => {
    // endBoundary is exclusive, so sum of elements from startBoundary to endBoundary - 1
    if (startBoundary >= endBoundary) return 0; // Handle empty or invalid ranges
    return sumLookupTable[endBoundary] - sumLookupTable[startBoundary];
};

const determineBestPartitionSegmentA = (basisIndex, arrayLength, sumTable) => {
    let currentCut1 = basisIndex; // Corresponds to original 'y'
    let currentCut2 = basisIndex; // Corresponds to original 'z'
    
    let highestSegmentAValue = 0; // Stores the result from the 'y-1' state before a break

    // Recursive function to simulate the `while(1)` loop for `y`
    const exploreCut1Positions = (attemptedCut1, previousCut2ForAttemptedCut1) => {
        // Base case: if attemptedCut1 exceeds its maximum logical boundary (pivotIndex + len)
        // Original `y` can go up to `x+n`. So `basisIndex + arrayLength`.
        if (attemptedCut1 > basisIndex + arrayLength) {
            return highestSegmentAValue;
        }

        let currentCut2ForThisAttempt = previousCut2ForAttemptedCut1;
        // Ensure currentCut2ForThisAttempt is at least attemptedCut1, as segmentB can be empty.
        if (currentCut2ForThisAttempt < attemptedCut1) {
            currentCut2ForThisAttempt = attemptedCut1;
        }

        // Simulate the inner `while (++z)` loop for `currentCut2ForThisAttempt`
        while (true) {
            const segmentAlpha = computeRangeSum(basisIndex, attemptedCut1, sumTable);
            const segmentBeta = computeRangeSum(attemptedCut1, currentCut2ForThisAttempt, sumTable);
            const segmentGamma = computeRangeSum(currentCut2ForThisAttempt, basisIndex + arrayLength, sumTable);

            if (segmentAlpha > segmentBeta && segmentGamma >= segmentAlpha) {
                currentCut2ForThisAttempt++;
                // Cap currentCut2ForThisAttempt at its maximum logical boundary (x+n)
                if (currentCut2ForThisAttempt > basisIndex + arrayLength) {
                    currentCut2ForThisAttempt = basisIndex + arrayLength;
                    break;
                }
            } else {
                break; // Inner loop condition no longer met
            }
        }

        const finalSegmentAlpha = computeRangeSum(basisIndex, attemptedCut1, sumTable);
        const finalSegmentGamma = computeRangeSum(currentCut2ForThisAttempt, basisIndex + arrayLength, sumTable);

        if (finalSegmentGamma < finalSegmentAlpha) {
            // This is the `if (part(2) < part(0))` break condition.
            // The optimal value was from the *previous* `y` state, which is already stored in `highestSegmentAValue`.
            return highestSegmentAValue;
        } else {
            // Current `attemptedCut1` is valid. Store its Segment Alpha value.
            highestSegmentAValue = finalSegmentAlpha;
            // Recurse for the next `y` value, passing the current `z` as the starting point for the next `z` adjustment.
            return exploreCut1Positions(attemptedCut1 + 1, currentCut2ForThisAttempt);
        }
    };
    
    // Initial call for `y` (attemptedCut1) starting at `x+1` (basisIndex + 1).
    // `z` (previousCut2ForAttemptedCut1) starts at `x` (basisIndex).
    return exploreCut1Positions(basisIndex + 1, basisIndex);
};


const performCalculation = (rawDataLines) => {
    const { initialLength, prefixSums } = processRawData(rawDataLines);

    // Use Array.from().map() to process each 'x' (basisIndex)
    const allSegmentAOutcomes = Array.from({ length: initialLength }, (_, pIdx) =>
        determineBestPartitionSegmentA(pIdx, initialLength, prefixSums)
    );

    // Use reduce to find the maximum value among all calculated 'Segment A' results
    return allSegmentAOutcomes.reduce((maximumOverall, currentOutcome) => Math.max(maximumOverall, currentOutcome), 0);
};

// Assuming 'input' is an array of strings available in the scope where this code runs.
// The structure below mimics the original's call to main(input).
(function(sourceData) {
    const finalAnswerValue = performCalculation(sourceData);
    console.log(finalAnswerValue);
})(input);