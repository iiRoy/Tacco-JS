let collectedInputLines = [];
let cycleLengthValue;
let itemQuantityValue;
let locationCoordinates = [];

process.stdin.on('data', (dataChunk) => {
    collectedInputLines.push(...dataChunk.toString().split('\n').filter(Boolean));
});

process.stdin.on('end', () => {
    const initialConfiguration = collectedInputLines.shift().split(' ');
    cycleLengthValue = Number(initialConfiguration[0]);
    itemQuantityValue = Number(initialConfiguration[1]);

    locationCoordinates = collectedInputLines.slice(0, itemQuantityValue).map(Number).sort((coordA, coordB) => coordA - coordB);

    const evaluateTraversal = (
        remainingElements,
        currentLeftIndex,
        currentRightIndex,
        currentTotalPath,
        accumulatedLeftwardSegment,
        accumulatedRightwardSegment,
        isFirstMoveLeft
    ) => {
        if (remainingElements === 0) {
            return currentTotalPath;
        }

        let nextAccumulatedLeftwardSegment;
        let nextAccumulatedRightwardSegment;
        let nextLeftIndex;
        let nextRightIndex;
        let nextTotalPath;

        // Determine next move based on accumulated segment lengths, or forced initial direction
        if ((isFirstMoveLeft && remainingElements === itemQuantityValue) || accumulatedRightwardSegment <= accumulatedLeftwardSegment) {
            // Proceed anti-clockwise
            nextTotalPath = currentTotalPath + accumulatedLeftwardSegment;
            nextAccumulatedRightwardSegment = accumulatedRightwardSegment + accumulatedLeftwardSegment;
            nextLeftIndex = currentLeftIndex - 1;
            nextAccumulatedLeftwardSegment = (nextLeftIndex >= currentRightIndex)
                                            ? (locationCoordinates[currentLeftIndex] - locationCoordinates[nextLeftIndex])
                                            : 0;

            return evaluateTraversal(
                remainingElements - 1,
                nextLeftIndex,
                currentRightIndex,
                nextTotalPath,
                nextAccumulatedLeftwardSegment,
                nextAccumulatedRightwardSegment,
                false // Initial decision has been made
            );
        } else {
            // Proceed clockwise
            nextTotalPath = currentTotalPath + accumulatedRightwardSegment;
            nextAccumulatedLeftwardSegment = accumulatedLeftwardSegment + accumulatedRightwardSegment;
            nextRightIndex = currentRightIndex + 1;
            nextAccumulatedRightwardSegment = (nextRightIndex <= currentLeftIndex)
                                            ? (locationCoordinates[nextRightIndex] - locationCoordinates[currentRightIndex])
                                            : 0;

            return evaluateTraversal(
                remainingElements - 1,
                currentLeftIndex,
                nextRightIndex,
                nextTotalPath,
                nextAccumulatedLeftwardSegment,
                nextAccumulatedRightwardSegment,
                false // Initial decision has been made
            );
        }
    };

    // Scenario A: First movement is anti-clockwise
    const initialLeftSpan = cycleLengthValue - locationCoordinates[itemQuantityValue - 1];
    const initialRightSpan = locationCoordinates[0];
    const outcomeA = evaluateTraversal(
        itemQuantityValue,
        itemQuantityValue - 1,
        0,
        0,
        initialLeftSpan,
        initialRightSpan,
        true // Flag to indicate first move must be left
    );

    // Scenario B: First movement is clockwise
    // Re-initialize state for second path calculation
    const initialLeftSpanB = cycleLengthValue - locationCoordinates[itemQuantityValue - 1];
    const initialRightSpanB = locationCoordinates[0];
    const outcomeB = evaluateTraversal(
        itemQuantityValue,
        itemQuantityValue - 1,
        0,
        0,
        initialLeftSpanB,
        initialRightSpanB,
        false // Flag to indicate first move must be right
    );

    process.stdout.write(Math.max(outcomeA, outcomeB).toString());
});