function ProcessInputData(rawInputText) {
    // Parse the raw input string into an array of lines.
    const inputLinesArray = rawInputText.split('\n');

    // --- Input Validation and Setup ---
    // Ensure there are at least two lines for N, M and the path string.
    if (inputLinesArray.length < 2) {
        console.log("-1"); // Indicate invalid input structure
        return;
    }

    // Extract N (path length) and M (maximum step size) from the first line.
    const dimensionsStringArray = inputLinesArray[0].split(' ');
    if (dimensionsStringArray.length < 2) {
        console.log("-1"); // Malformed N and M line
        return;
    }

    const totalPathLength = parseInt(dimensionsStringArray[0], 10);
    const maximumStepAllowance = parseInt(dimensionsStringArray[1], 10);

    // Validate the parsed numerical values.
    if (isNaN(totalPathLength) || isNaN(maximumStepAllowance) || totalPathLength <= 0 || maximumStepAllowance <= 0) {
        console.log("-1"); // Invalid numerical dimensions
        return;
    }

    // Get the path map as an array of characters ('0' for safe, '1' for unsafe).
    const pathAvailabilityMap = inputLinesArray[1].split('');

    // Ensure the path map has sufficient length.
    if (pathAvailabilityMap.length < totalPathLength) {
        console.log("-1"); // Path string too short
        return;
    }
    // --- End Input Validation ---


    // --- Phase 1: Determine an initial greedy path by taking the smallest possible valid steps ---
    // We start at position 0 and aim to reach position 'totalPathLength - 1'.
    let currentOccupiedCell = 0;
    const initialSegmentSteps = []; // Stores the sequence of steps taken

    // Continue stepping until the destination is reached or surpassed.
    while (currentOccupiedCell < totalPathLength - 1) {
        let validStepFound = false;
        let smallestValidNextStep = -1;

        // Iterate through all possible step sizes from 1 up to 'maximumStepAllowance'.
        for (let potentialStepDistance = 1; potentialStepDistance <= maximumStepAllowance; potentialStepDistance++) {
            const nextPotentialCell = currentOccupiedCell + potentialStepDistance;

            // Check if the potential next cell is within the path boundaries
            // and is a safe landing spot ('0').
            if (nextPotentialCell < totalPathLength && pathAvailabilityMap[nextPotentialCell] === '0') {
                smallestValidNextStep = potentialStepDistance;
                validStepFound = true;
                break; // Found the smallest possible valid step, so take it.
            }
        }

        // If no valid step could be found within 'maximumStepAllowance', the path is impossible.
        if (!validStepFound) {
            console.log("-1");
            return;
        }

        // Advance the current position by the smallest valid step found.
        currentOccupiedCell += smallestValidNextStep;
        initialSegmentSteps.push(smallestValidNextStep);
    }

    // --- Phase 2: Optimize the initial path by merging consecutive steps where possible ---
    // This optimization is done by iterating backwards and combining steps greedily.
    const optimizedPathSegments = [];

    // Start from the last step in the initial path.
    let reverseIterationPointer = initialSegmentSteps.length - 1;

    // Loop backwards through the initial steps.
    while (reverseIterationPointer >= 0) {
        let currentCombinedSegmentValue = initialSegmentSteps[reverseIterationPointer];
        let lookbackPointer = reverseIterationPointer - 1; // Pointer for preceding segments

        // Try to combine preceding steps into the current combined segment
        // as long as they don't exceed 'maximumStepAllowance' and we're within bounds.
        while (lookbackPointer >= 0 && (currentCombinedSegmentValue + initialSegmentSteps[lookbackPointer]) <= maximumStepAllowance) {
            currentCombinedSegmentValue += initialSegmentSteps[lookbackPointer];
            lookbackPointer--;
        }

        // Add the fully combined segment to the beginning of the optimized path.
        optimizedPathSegments.unshift(currentCombinedSegmentValue);

        // Update the main iteration pointer to the position just before the last merged segment.
        reverseIterationPointer = lookbackPointer;
    }

    // Output the optimized path segments joined together as a single string.
    console.log(optimizedPathSegments.join(''));
}

// Read input from standard input and pass it to the processing function.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));