let processInputAndCompute = (rawData) => {
    // Check for empty input to prevent errors
    if (!rawData || rawData.trim().length === 0) {
        console.log("");
        return;
    }

    // Helper function to parse a line of space-separated numbers
    // This handles various whitespace separators and filters out empty strings.
    const extractNumericValues = (lineContent) => {
        return lineContent.split(/\s+/).filter(Boolean).map(Number);
    };

    // Implements a modified binary search to find the insertion point for a target value.
    // Similar to lower_bound, but with different variable names and structure.
    const locateInsertionPoint = (sortedNumericArray, searchStart, searchEnd, desiredValue) => {
        let lowPointer = searchStart;
        let highPointer = searchEnd;
        // Continue while there's more than one element in the search range
        while (highPointer - lowPointer > 1) {
            let midPointer = Math.floor((lowPointer + highPointer) / 2);
            // If the middle element is less than the desired value,
            // move the low pointer to the middle. Otherwise, move the high pointer.
            if (sortedNumericArray[midPointer] < desiredValue) {
                lowPointer = midPointer;
            } else {
                highPointer = midPointer;
            }
        }
        // After the loop, lowPointer and highPointer are adjacent.
        // Determine the correct insertion point based on the value at lowPointer.
        return sortedNumericArray[lowPointer] < desiredValue ? highPointer : lowPointer;
    };

    // Split the entire input into individual lines
    let inputLines = rawData.trim().split('\n');

    // Parse the first line to get counts for segments and queries
    let primaryCounts = extractNumericValues(inputLines[0]);

    // Validate that primaryCounts has at least two elements
    if (primaryCounts.length < 2) {
        console.log(""); // Or throw an error, depending on desired behavior
        return;
    }

    let totalSegments = primaryCounts[0];
    let totalQueries = primaryCounts[1];

    // Collect segment data
    // Each segment is an array of [start, end, weight]
    let segmentDetails = [];
    for (let currentSegIdx = 0; currentSegIdx < totalSegments; currentSegIdx++) {
        // Ensure the line exists before attempting to parse
        if (inputLines[currentSegIdx + 1]) {
            segmentDetails.push(extractNumericValues(inputLines[currentSegIdx + 1]));
        }
    }

    // Collect query point data
    let queryValuePoints = [];
    for (let currentQryIdx = 0; currentQryIdx < totalQueries; currentQryIdx++) {
        // Ensure the line exists
        if (inputLines[totalSegments + currentQryIdx + 1]) {
            queryValuePoints.push(Number(inputLines[totalSegments + currentQryIdx + 1]));
        }
    }

    // Sort the segment details based on their third element (weight) in descending order.
    // This prioritizes segments with higher weights.
    segmentDetails.sort((segmentA, segmentB) => {
        // Basic check for malformed segments
        if (segmentA.length < 3 || segmentB.length < 3) return 0;
        return segmentB[2] - segmentA[2];
    });

    // Initialize an array to store the computation results for each query.
    // Default value is -1, indicating no segment covers that point yet.
    let computedResults = [];
    for (let i = 0; i < totalQueries; i++) {
        computedResults.push(-1);
    }

    // Iterate through each sorted segment to determine coverage
    for (let segIteration = 0; segIteration < totalSegments; segIteration++) {
        let currentSegment = segmentDetails[segIteration];

        // Guard clause for malformed segment data
        if (currentSegment.length < 3) {
            continue;
        }

        let segmentStart = currentSegment[0];
        let segmentEnd = currentSegment[1];
        let segmentWeight = currentSegment[2];

        // Calculate thresholds for query points based on segment properties.
        // These thresholds define the range of query points that this segment potentially covers.
        let lowerThreshold = segmentStart - segmentWeight;
        let upperThreshold = segmentEnd - segmentWeight;

        // Find the range of query points that fall within the current segment's coverage.
        // This uses the modified binary search function.
        let startAffectedIndex = locateInsertionPoint(queryValuePoints, 0, totalQueries, lowerThreshold);
        let endAffectedIndex = locateInsertionPoint(queryValuePoints, startAffectedIndex, totalQueries, upperThreshold);

        // If a valid range of query points is found, update their results.
        // A valid range means startAffectedIndex is less than endAffectedIndex.
        if (startAffectedIndex < endAffectedIndex) {
            // Iterate through the affected query points and assign the current segment's weight.
            // Only update if the current result is still -1 (meaning no higher weight segment covered it yet).
            for (let resultIndex = startAffectedIndex; resultIndex < endAffectedIndex; resultIndex++) {
                if (computedResults[resultIndex] === -1) { // Only assign if not already covered by a higher weight
                    computedResults[resultIndex] = segmentWeight;
                }
            }
        }
    }

    // Output the final results, each on a new line.
    console.log(computedResults.join('\n'));
};

// Standard input reading for competitive programming environments.
// This part remains largely functional as it's an external dependency.
processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));