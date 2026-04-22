'use strict'

/**
 * Safely parses a string into an integer. If parsing fails, returns 0.
 * This helper ensures that numerical conversions are explicit and robust.
 * @param {string} numericString - The string representation of a number.
 * @returns {number} The parsed integer, or 0 if parsing fails.
 */
const parseIntegerOrDefault = (numericString) => {
    const val = parseInt(numericString, 10);
    // Return 0 if NaN, otherwise the parsed value.
    return isNaN(val) ? 0 : val;
};

/**
 * Transforms a space-separated coordinate string (e.g., "10 20") into a structured object.
 * It expects exactly two numeric components.
 * @param {string} coordinatePairString - A string containing two space-separated integers.
 * @returns {{coordX: number, coordY: number}} An object representing the 2D point.
 */
const createPointObject = (coordinatePairString) => {
    // Basic validation for the input string.
    if (typeof coordinatePairString !== 'string' || !coordinatePairString.includes(' ')) {
        // Return a default or throw an error for malformed input.
        return { coordX: 0, coordY: 0 };
    }
    const components = coordinatePairString.split(" ");
    // Ensure there are at least two components before attempting to parse.
    if (components.length < 2) {
        return { coordX: parseIntegerOrDefault(components[0]), coordY: 0 };
    }
    return {
        coordX: parseIntegerOrDefault(components[0]),
        coordY: parseIntegerOrDefault(components[1])
    };
};

/**
 * Computes the Manhattan distance (L1 norm) between two given 2D points.
 * Manhattan distance is the sum of the absolute differences of their Cartesian coordinates.
 * @param {{coordX: number, coordY: number}} pointOne - The first point.
 * @param {{coordX: number, coordY: number}} pointTwo - The second point.
 * @returns {number} The calculated Manhattan distance.
 */
const calculateL1Distance = (pointOne, pointTwo) => {
    return Math.abs(pointOne.coordX - pointTwo.coordX) + Math.abs(pointOne.coordY - pointTwo.coordY);
};

/**
 * Orchestrates the entire process: reading input, parsing data, performing calculations, and outputting results.
 * This function determines for each point in the first set, which point in the second set is closest
 * using Manhattan distance.
 * @param {string} entireInputContent - The raw input string, typically from stdin.
 */
const processInputAndFindClosestPoints = (entireInputContent) => {
    // Guard clause for empty or invalid input.
    if (!entireInputContent || entireInputContent.trim().length === 0) {
        console.error("Error: Input content is empty or invalid.");
        return;
    }

    const inputLines = entireInputContent.trim().split("\n");

    // Extract the counts for the two sets of points from the first line.
    const countsLineParts = inputLines[0].split(" ");
    if (countsLineParts.length < 2) {
        console.error("Error: Insufficient data on the first line for point set counts.");
        return;
    }

    const setACount = parseIntegerOrDefault(countsLineParts[0]);
    const setBCount = parseIntegerOrDefault(countsLineParts[1]);

    // Validate extracted counts.
    if (setACount <= 0 || setBCount <= 0) {
        console.error("Error: Both point sets must contain at least one element.");
        return;
    }

    // Divide the input lines into two distinct sets of raw coordinate strings.
    const rawSetAStrings = inputLines.slice(1, setACount + 1);
    const rawSetBStrings = inputLines.slice(setACount + 1, setACount + setBCount + 1);

    // Transform raw strings into structured point objects for easier manipulation.
    const pointCollectionA = rawSetAStrings.map(createPointObject);
    const pointCollectionB = rawSetBStrings.map(createPointObject);

    // This array will store the 1-based index of the closest point in B for each point in A.
    const assignedIndicesForA = [];

    // Iterate over each point in the first collection.
    // Using `for...of` with `entries()` provides both the index and the value.
    for (const [indexA, currentPointFromA] of pointCollectionA.entries()) {
        let minimumAchievedDistance = Number.MAX_SAFE_INTEGER; // Initialize with a very large value.
        let bestMatchIndex = -1; // Default to an invalid index.

        // Iterate over each point in the second collection to find the closest.
        for (const [indexB, currentPointFromB] of pointCollectionB.entries()) {
            const calculatedCurrentDistance = calculateL1Distance(currentPointFromA, currentPointFromB);

            // If a shorter distance is found, update the minimum and the corresponding index.
            if (calculatedCurrentDistance < minimumAchievedDistance) {
                minimumAchievedDistance = calculatedCurrentDistance;
                bestMatchIndex = indexB;
            }
            // Note: If multiple points have the same minimum distance, this logic picks the one
            // with the smallest index, which is typically the expected behavior.
        }

        // Store the 0-based index of the closest point found in set B.
        assignedIndicesForA.push(bestMatchIndex);
    }

    // Format the final output: convert 0-based indices to 1-based and join with newlines.
    const formattedOutput = assignedIndicesForA
        .map(zeroBasedIndex => zeroBasedIndex + 1)
        .join('\n');

    console.log(formattedOutput);
};

// Entry point: Read input from standard input and pass it to the processing function.
// Encapsulated in an IIFE to avoid polluting the global scope.
(function executeProcessing() {
    try {
        // Node.js specific: read synchronous file content from stdin.
        const inputContent = require('fs').readFileSync('/dev/stdin', 'utf-8');
        processInputAndFindClosestPoints(inputContent);
    } catch (ioError) {
        console.error("Failed to read input or encountered a file system error:", ioError.message);
        // Optionally, exit the process with an error code.
        // process.exit(1);
    }
})();