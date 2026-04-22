// This JavaScript module is designed to identify and count structures that stand as local peaks
// within a given topographical dataset. It processes elevation data and connectivity information
// to determine which structures have an elevation strictly greater than all their direct neighbors.

const INPUT_FILE_PATH = '/dev/stdin'; // Constant for the standard input path
const NUMERIC_RADIX = 10; // Constant for the base of number parsing (decimal)

/**
 * Parses a string line containing space-separated numerical values into an array of integers.
 * Handles potential multiple spaces and empty strings gracefully.
 * @param {string} rawLineData - The string line to be parsed.
 * @returns {number[]} An array of parsed integer values. Returns an empty array if the line is empty or invalid.
 */
const extractNumbersFromLine = (rawLineData) => {
    // Early exit for null, undefined, or purely whitespace lines
    if (!rawLineData || rawLineData.trim().length === 0) {
        return [];
    }
    // Split by one or more whitespace characters, filter out any empty strings resulting from split,
    // then map each string to an integer.
    return rawLineData.split(/\s+/).filter(segment => segment.length > 0).map(strVal => Number.parseInt(strVal, NUMERIC_RADIX));
};

let allInputContent;
try {
    // Synchronously read all data from the specified input source, typically standard input.
    // Ensure UTF-8 encoding for proper character handling.
    allInputContent = require('node:fs').readFileSync(INPUT_FILE_PATH, { encoding: 'utf8' }).split('\n');
} catch (dataReadError) {
    // If there's an issue reading the input, log the error and terminate the process.
    console.error("Input data acquisition failed:", dataReadError.message);
    process.exit(1); // Indicate an error exit status.
}

// The first line of input is usually a count or metadata, which we discard as per problem constraints.
// Using splice to remove the element and modify the array in place.
allInputContent.splice(0, 1); 

// The next line contains the actual elevation data for each structure.
// It's processed and removed from the input content array.
const structureElevationValues = extractNumbersFromLine(allInputContent.shift());

// Critical validation: If no elevation data is provided, there are no structures to evaluate.
if (structureElevationValues.length === 0) {
    console.log(0); // Output zero local peaks.
    process.exit(0); // Terminate successfully.
}

// Initialize an adjacency list to represent the network of structures.
// The size of this list corresponds to the total number of structures based on elevation data.
// Each element in this array will itself be an array holding indices of connected structures.
const structureConnectivityMap = Array.from({ length: structureElevationValues.length }, () => []);

// Iterate through the remaining input lines, each describing a connection between two structures.
// Using a for-of loop for cleaner iteration over array elements.
for (const rawConnectionLine of allInputContent) {
    const parsedConnectionPair = extractNumbersFromLine(rawConnectionLine);

    // Validate that each connection line provides exactly two structure indices.
    if (parsedConnectionPair.length !== 2) {
        // Malformed lines are skipped to maintain data integrity. A warning could be logged here.
        continue; 
    }

    // Convert the 1-based indexing from the input to 0-based indexing required for arrays.
    const primaryStructureIdx = parsedConnectionPair[0] - 1;
    const secondaryStructureIdx = parsedConnectionPair[1] - 1;

    // Validate that the parsed indices are within the valid range of structures.
    const isValidPrimary = primaryStructureIdx >= 0 && primaryStructureIdx < structureElevationValues.length;
    const isValidSecondary = secondaryStructureIdx >= 0 && secondaryStructureIdx < structureElevationValues.length;

    if (isValidPrimary && isValidSecondary) {
        // For an undirected graph, add connections in both directions.
        structureConnectivityMap[primaryStructureIdx].push(secondaryStructureIdx);
        structureConnectivityMap[secondaryStructureIdx].push(primaryStructureIdx);
    } else {
        // Optionally, log invalid connections for debugging or data quality assessment.
        // console.warn(`Skipped connection due to invalid indices: [${parsedConnectionPair[0]}, ${parsedConnectionPair[1]}]`);
    }
}

let totalLocalPeaks = 0; // This variable will accumulate the count of local peak structures.

// Iterate through each structure in the `structureConnectivityMap` along with its index.
// Using `entries()` provides both the index and the value (array of neighbors).
for (const [currentStructIndex, connectedNeighbors] of structureConnectivityMap.entries()) {
    let isCurrentStructureAPeak = true; // Assume the current structure is a peak initially.

    // If the structure has no neighbors, it trivially qualifies as a local peak.
    // No explicit check for `connectedNeighbors.length` needed, `for...of` handles empty arrays.

    // Iterate through each neighbor of the current structure.
    // Using a `for...of` loop with a `break` statement for early exit if a condition is met.
    for (const neighborStructureIndex of connectedNeighbors) {
        // Compare the current structure's elevation with its neighbor's elevation.
        // If the current structure is not strictly taller than its neighbor, it's not a peak.
        if (structureElevationValues[currentStructIndex] <= structureElevationValues[neighborStructureIndex]) {
            isCurrentStructureAPeak = false; // Mark as not a peak.
            break; // No need to check other neighbors; it's already disqualified.
        }
    }

    // If, after checking all neighbors (or breaking early), the structure is still considered a peak,
    // increment the total count.
    if (isCurrentStructureAPeak) {
        totalLocalPeaks++; // Using post-increment for counting.
    }
}

// Output the final calculated number of local peak structures.
console.log(totalLocalPeaks);