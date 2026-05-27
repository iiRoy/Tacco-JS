function processInput(rawData) {
    const inputLines = rawData.split("\n");
    const sourceString = inputLines[0];
    const targetString = inputLines[1];

    const sourceLength = sourceString.length;
    const targetLength = targetString.length;

    // Pre-calculate potential matches.
    // The original code uses (s+t).slice, which means if the segment to check
    // extends beyond s.length, it uses characters from t itself.
    const extendedSourceForMatchCheck = sourceString + targetString;
    const isMatchAtPosition = [];

    for (let currentSourceIndex = 0; currentSourceIndex < sourceLength; currentSourceIndex++) {
        const segmentFromExtendedSource = extendedSourceForMatchCheck.slice(currentSourceIndex, currentSourceIndex + targetLength);
        isMatchAtPosition.push(segmentFromExtendedSource === targetString);
    }

    // Helper function to determine the length of a match chain starting from a given position,
    // and to detect if it forms an infinite loop.
    const evaluateMatchChain = (startingIndex) => {
        let currentChainPosition = startingIndex;
        const visitedIndicesInCurrentChain = [];
        let chainLength = 0;
        let hasDetectedCycle = false;

        // Special handling for targetString.length === 0, which creates an immediate cycle
        // if a match is found (which it always is for empty string).
        if (targetLength === 0) {
            if (isMatchAtPosition[startingIndex]) {
                // Original behavior: if targetLength is 0 and a match exists, it's an infinite loop.
                // This results in max = -1.
                return { length: -1, isInfinite: true };
            } else {
                return { length: 0, isInfinite: false };
            }
        }

        while (isMatchAtPosition[currentChainPosition]) {
            visitedIndicesInCurrentChain.push(currentChainPosition);
            chainLength++;

            // Move to the next potential match position, wrapping around the source string.
            currentChainPosition = (currentChainPosition + targetLength) % sourceLength;

            // Check if the new position has already been visited in this chain, indicating a cycle.
            if (visitedIndicesInCurrentChain.includes(currentChainPosition)) {
                hasDetectedCycle = true;
                break;
            }
        }
        return { length: chainLength, isInfinite: hasDetectedCycle };
    };

    let maximumChainLength = 0;
    let overallInfiniteLoopFound = false;

    // Iterate through all possible starting positions in the source string.
    for (let startPoint = 0; startPoint < sourceLength; startPoint++) {
        const chainEvaluationResult = evaluateMatchChain(startPoint);

        if (chainEvaluationResult.isInfinite) {
            overallInfiniteLoopFound = true;
            break; // An infinite loop anywhere means the final result is -1.
        } else {
            // Update the maximum chain length found so far.
            if (chainEvaluationResult.length > maximumChainLength) {
                maximumChainLength = chainEvaluationResult.length;
            }
        }
    }

    // Output the final result based on whether an infinite loop was detected.
    if (overallInfiniteLoopFound) {
        console.log(-1);
    } else {
        console.log(maximumChainLength);
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
