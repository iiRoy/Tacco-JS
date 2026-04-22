const processInputData = (rawData) => {
    // Normalize the input string by removing any leading or trailing blank spaces.
    rawData = rawData.trim();

    // Parse the total number of available steps and the count of blocked positions from the first line.
    const overallSteps = parseInt(rawData.split(" ")[0], 10);
    const restrictedCount = parseInt(rawData.split(" ")[1], 10);

    // Create an array to hold the specific step numbers that are considered forbidden.
    let restrictedPositions = [];
    for (let lineIndex = 0; lineIndex < restrictedCount; lineIndex++) {
        // Populate the array by parsing each subsequent line as a forbidden step number.
        restrictedPositions.push(parseInt(rawData.split("\n")[lineIndex + 1], 10));
    }

    /*
     * This counter tracks instances where two forbidden steps are immediately adjacent.
     * If this happens, no valid path can exist, resulting in zero possible ways.
     */
    let adjacentRestrictions = 0;

    // Initialize an array to store the calculated lengths of the navigable gaps between forbidden steps.
    let pathSegmentLengths = [];

    // The first path segment is from the starting point (step 1) up to the step just before the first forbidden position.
    pathSegmentLengths.push(restrictedPositions[0] - 1);

    // Iterate through the array of forbidden positions to determine the lengths of intermediate segments.
    for (let segmentIndex = 1; segmentIndex < restrictedCount; segmentIndex++) {
        // An intermediate segment's length is calculated as the difference between two consecutive forbidden steps,
        // minus two (accounting for the forbidden steps themselves).
        pathSegmentLengths.push(restrictedPositions[segmentIndex] - restrictedPositions[segmentIndex - 1] - 2);
    }

    // The final segment extends from the step immediately after the last forbidden position to the very last step.
    pathSegmentLengths.push(overallSteps - restrictedPositions[restrictedCount - 1] - 1);

    // Perform a check across all forbidden positions to identify any directly adjacent ones.
    for (let blockCheckIndex = 0; blockCheckIndex < restrictedPositions.length - 1; blockCheckIndex++) {
        if (restrictedPositions[blockCheckIndex + 1] - restrictedPositions[blockCheckIndex] === 1) {
            adjacentRestrictions++; // Increment the counter if adjacent restrictions are found.
        }
    }

    // This array will store the number of distinct ways to traverse each individual path segment.
    let segmentPathways = [];

    // Process each calculated path segment length to determine the number of possible pathways.
    for (let currentGapIndex = 0; currentGapIndex < pathSegmentLengths.length; currentGapIndex++) {
        let waysForCurrentGap = 0;
        const currentSegmentSize = pathSegmentLengths[currentGapIndex];

        if (currentSegmentSize === 1 || currentSegmentSize === 0) {
            // A gap of 0 or 1 step has only one way to traverse (either do nothing or take a single step).
            waysForCurrentGap = 1;
        } else if (currentSegmentSize === 2) {
            // A gap of 2 steps has two distinct ways (e.g., two single steps, or one double step).
            waysForCurrentGap = 2;
        } else {
            // For segments longer than 2 steps, the number of ways corresponds to the Fibonacci sequence.
            let fibonacciValues = [1, 2];
            for (let fibCalculationIndex = 2; fibCalculationIndex < currentSegmentSize; fibCalculationIndex++) {
                let nextFibNumber = fibonacciValues[fibCalculationIndex - 1] + fibonacciValues[fibCalculationIndex - 2];
                fibonacciValues.push(nextFibNumber);
            }
            waysForCurrentGap = fibonacciValues[currentSegmentSize - 1];
        }

        // Store the computed number of ways for the current segment, applying a modulo operation to prevent overflow.
        segmentPathways.push(waysForCurrentGap % 1000000007);
    }


    // Compute the total number of pathways by multiplying the possibilities for each individual segment.
    let totalCumulativePathways = 1;
    for (let pathwayResultIndex = 0; pathwayResultIndex < segmentPathways.length; pathwayResultIndex++) {
        totalCumulativePathways = (totalCumulativePathways * segmentPathways[pathwayResultIndex]) % 1000000007;
    }

    // If any adjacent forbidden steps were detected, it means no path is traversable.
    if (adjacentRestrictions !== 0) {
        console.log(0);
    } else {
        // Otherwise, output the final calculated total number of distinct pathways.
        console.log(totalCumulativePathways % 1000000007);
    }
};

// Invoke the primary data processing function, feeding it content read from standard input.
processInputData(
    require('fs').readFileSync('/dev/stdin', 'utf8')
);