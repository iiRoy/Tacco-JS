const FILE_SOURCE_PATH = '/dev/stdin'; // Define a constant for the standard input file path

/**
 * Converts a string of space-separated numerical values into an array of floating-point numbers.
 * Handles potential multiple spaces and trims whitespace.
 * @param {string} inputString - The string containing numbers to parse.
 * @returns {number[]} An array of parsed numerical values. Returns an empty array for invalid input.
 */
function extractNumericSequence(inputString) {
    // Defensive check: ensure input is a non-empty string.
    if (typeof inputString !== 'string' || inputString.trim().length === 0) {
        return [];
    }
    // Use regular expression to split by one or more whitespace characters, then map to numbers.
    return inputString.trim().split(/\s+/).map(strVal => parseFloat(strVal));
}

/**
 * Computes the aggregate sum of all numeric elements within a given array.
 * @param {number[]} numericCollection - An array of numbers to be summed.
 * @returns {number} The total sum. Returns 0 for an empty or invalid array.
 */
function computeTotalSum(numericCollection) {
    if (!Array.isArray(numericCollection) || numericCollection.length === 0) {
        return 0; // Return zero for empty or non-array inputs.
    }
    let cumulativeSum = 0;
    // Iterate through the collection and accumulate the sum.
    for (const currentElement of numericCollection) {
        cumulativeSum += currentElement;
    }
    return cumulativeSum;
}

/**
 * Core function to process the entire input payload and derive the final result.
 * This function orchestrates parsing, calculation, and result output.
 * @param {string} fullInputPayload - The complete raw string content read from the input source.
 */
function processInputPayload(fullInputPayload) {
    // Perform initial validation of the input data.
    if (!fullInputPayload || typeof fullInputPayload !== 'string' || fullInputPayload.trim().length === 0) {
        console.error("Critical Error: Input payload is empty or invalid. Cannot proceed.");
        return;
    }

    // Divide the multi-line input into individual lines for structured access.
    const inputLineSegments = fullInputPayload.split('\n');

    // Extract the target number of partitions from the first line.
    const firstLineDataPoints = extractNumericSequence(inputLineSegments[0]);
    if (firstLineDataPoints.length === 0) {
        console.error("Input Parsing Error: First line did not contain a valid partition count.");
        return;
    }
    const desiredPartitionQuantity = firstLineDataPoints[0]; // Renamed from 'pieceCount'

    // Retrieve and parse the spatial coordinates from the second line.
    const rawCoordinateData = inputLineSegments[1];
    const initialLocationPoints = extractNumericSequence(rawCoordinateData);

    // Validate the number of coordinates for meaningful calculation.
    if (initialLocationPoints.length < 2) {
        // If there are zero or one coordinates, and we desire 1 segment, the length is 0.
        // Otherwise, it's an error for gap calculations.
        if (initialLocationPoints.length <= 1 && desiredPartitionQuantity >= 1) {
            console.log(0);
            return;
        }
        console.error("Input Data Error: Insufficient coordinate points provided (at least 2 required).");
        return;
    }

    // Create a sorted copy of the coordinate points to ensure correct gap calculation.
    const orderedSpatialPoints = [...initialLocationPoints].sort((valA, valB) => valA - valB);

    // Calculate the distances (gaps) between adjacent ordered points.
    const interSegmentDistances = []; // Renamed from 'steps'
    // Using a traditional for loop for calculating differences between consecutive elements.
    for (let currentPointIndex = 1; currentPointIndex < orderedSpatialPoints.length; currentPointIndex++) {
        const calculatedGap = orderedSpatialPoints[currentPointIndex] - orderedSpatialPoints[currentPointIndex - 1];
        // Only add positive gaps; technically guaranteed by sorting, but added for robustness/clarity.
        if (calculatedGap >= 0) {
            interSegmentDistances.push(calculatedGap);
        }
    }

    // Sort the calculated distances in ascending order to easily select the smallest ones.
    interSegmentDistances.sort((distA, distB) => distA - distB);

    // Determine the number of smallest gaps to retain for summation.
    // Original logic: steps.length - pieceCount + 1
    // This implies removing (pieceCount - 1) largest gaps.
    const numberOfGapsToSum = interSegmentDistances.length - desiredPartitionQuantity + 1;

    // Implement a guard clause for scenarios where the number of gaps to sum is non-positive.
    if (numberOfGapsToSum <= 0) {
        // This situation implies either all gaps are removed or an invalid partition quantity was requested.
        // In such cases, the resulting total length of the selected segments is zero.
        console.log(0);
        return;
    }

    // Extract the smallest 'numberOfGapsToSum' distances.
    const selectedMinimalGaps = interSegmentDistances.slice(0, numberOfGapsToSum);

    // Calculate the final aggregate length of the selected segments using the helper function.
    const finalCalculatedResult = computeTotalSum(selectedMinimalGaps);

    // Output the computed result to the console.
    console.log(finalCalculatedResult);
}

// Entry point of the script: Read from standard input and initiate processing.
try {
    const rawSystemInput = require('fs').readFileSync(FILE_SOURCE_PATH, 'utf8');
    processInputPayload(rawSystemInput);
} catch (fileReadError) {
    // Catch and report any errors encountered during file reading.
    console.error(`Failed to retrieve input from ${FILE_SOURCE_PATH}: ${fileReadError.message}`);
    process.exit(1); // Exit with an error code.
}