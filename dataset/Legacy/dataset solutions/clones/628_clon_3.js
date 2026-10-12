function processInputData(dataLines) {
    const arraySize = Number(dataLines.shift());
    const originalArray = [];
    for (let idx = 0; idx < arraySize; ++idx) {
        originalArray.push(Number(dataLines.shift()));
    }

    let currentCumulativeSum = 0;
    const cumulativeSums = [0];
    const extendedArrayLength = arraySize * 2;

    for (let idx = 0; idx < extendedArrayLength; ++idx) {
        const elementToAdd = originalArray[idx % arraySize];
        currentCumulativeSum += elementToAdd;
        cumulativeSums.push(currentCumulativeSum);
    }

    let primaryPointer = 0;
    let secondaryPointer = 0;
    let tertiaryPointer = 0;

    const SEGMENT_ONE_IDENTIFIER = 0;
    const SEGMENT_TWO_IDENTIFIER = 1;
    const SEGMENT_THREE_IDENTIFIER = 2;

    const computeSegmentSum = (segmentIdentifier) => {
        if (segmentIdentifier === SEGMENT_ONE_IDENTIFIER) {
            return cumulativeSums[secondaryPointer] - cumulativeSums[primaryPointer];
        } else if (segmentIdentifier === SEGMENT_TWO_IDENTIFIER) {
            return cumulativeSums[tertiaryPointer] - cumulativeSums[secondaryPointer];
        } else if (segmentIdentifier === SEGMENT_THREE_IDENTIFIER) {
            return cumulativeSums[primaryPointer + arraySize] - cumulativeSums[tertiaryPointer];
        }
        // The original logic ensures segmentIdentifier is always 0, 1, or 2.
        // No other return path is strictly necessary for behavioral equivalence.
    };

    let overallMaxSegmentSum = 0;

    while (primaryPointer < arraySize) {
        let innerLoopActive = true;
        while (innerLoopActive) {
            secondaryPointer++;
            const savedTertiaryPointer = tertiaryPointer;

            // Extracting conditions into variables for clarity and re-evaluation
            let conditionForTertiaryLoopOne = computeSegmentSum(SEGMENT_ONE_IDENTIFIER) > computeSegmentSum(SEGMENT_TWO_IDENTIFIER);
            let conditionForTertiaryLoopTwo = computeSegmentSum(SEGMENT_THREE_IDENTIFIER) >= computeSegmentSum(SEGMENT_ONE_IDENTIFIER);

            while (conditionForTertiaryLoopOne && conditionForTertiaryLoopTwo) {
                tertiaryPointer++;
                // Re-evaluate conditions after incrementing tertiaryPointer
                conditionForTertiaryLoopOne = computeSegmentSum(SEGMENT_ONE_IDENTIFIER) > computeSegmentSum(SEGMENT_TWO_IDENTIFIER);
                conditionForTertiaryLoopTwo = computeSegmentSum(SEGMENT_THREE_IDENTIFIER) >= computeSegmentSum(SEGMENT_ONE_IDENTIFIER);
            }

            // Check the break condition for the outer inner loop
            if (computeSegmentSum(SEGMENT_THREE_IDENTIFIER) < computeSegmentSum(SEGMENT_ONE_IDENTIFIER)) {
                secondaryPointer--;
                tertiaryPointer = savedTertiaryPointer;
                innerLoopActive = false; // Exit the current inner while loop
            }
        }
        overallMaxSegmentSum = Math.max(computeSegmentSum(SEGMENT_ONE_IDENTIFIER), overallMaxSegmentSum);
        primaryPointer++;
    }

    console.log(overallMaxSegmentSum);
}
