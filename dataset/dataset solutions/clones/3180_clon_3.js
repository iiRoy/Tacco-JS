// This module provides utilities for processing spatial queries on two sets of sorted coordinates.
// It determines the minimum travel distance between a query point and a pair of points
// from the two sets of coordinates (shrines and temples).

/**
 * Locates the insertion point for a target element in a sorted list.
 * This function returns the index 'k' such that all elements before 'k' are less than 'soughtValue',
 * and all elements at or after 'k' are greater than or equal to 'soughtValue'.
 * This implementation is functionally equivalent to C++'s std::lower_bound.
 * @param {Array<number>} orderedCollection - The sorted array of numbers where to search.
 * @param {number} soughtValue - The value for which to find the insertion point.
 * @returns {number} The index where 'soughtValue' would be inserted to maintain the sorted order.
 */
const locateBoundary = (orderedCollection, soughtValue) => {
    let lowerBoundIdx = 0;
    let upperBoundIdx = orderedCollection.length; // The upper bound is exclusive (one past the last element)

    // Continue searching while the lower bound is less than the upper bound
    while (lowerBoundIdx < upperBoundIdx) {
        // Calculate the midpoint. This method prevents potential integer overflow
        // that (lowerBoundIdx + upperBoundIdx) / 2 might cause with very large indices.
        const midPoint = lowerBoundIdx + Math.floor((upperBoundIdx - lowerBoundIdx) / 2);

        // If the element at the midpoint is less than our sought value,
        // then the insertion point must be in the right half of the current search range.
        if (orderedCollection[midPoint] < soughtValue) {
            lowerBoundIdx = midPoint + 1;
        } else {
            // Otherwise, the element at the midpoint is greater than or equal to the sought value.
            // The insertion point is in the left half, including the midpoint itself.
            upperBoundIdx = midPoint;
        }
    }
    // When the loop terminates, 'lowerBoundIdx' will be the first index
    // where 'soughtValue' can be inserted without violating the sorted order.
    return lowerBoundIdx;
};

/**
 * Main function to process input data, determine spatial configurations, and calculate
 * minimum distances for a series of query points based on shrine and temple locations.
 * @param {string} rawInputString - The complete input as a single string, typically read from stdin.
 */
const processSpatialQueries = (rawInputString) => {
    // A constant representing a very large number, used as an initial maximum distance.
    const ARBITRARY_LARGE_VALUE = Number.MAX_SAFE_INTEGER;

    // Split the entire input string into an array of individual lines.
    const inputDataLines = rawInputString.split('\n');

    // Parse the first line to extract the counts of shrines, temples, and queries.
    // The .shift() method removes the first element from the array and returns it.
    // .map(Number) converts each string part to a number.
    const [numShrines, numTemples, numQueries] = inputDataLines.shift().split(' ').map(Number);

    // Initialize the array for shrine coordinates.
    // We prepend a negative large value and will append a positive large value
    // to simplify boundary checks in the distance calculation logic.
    const shrineCoordinates = [-ARBITRARY_LARGE_VALUE];
    for (let i = 0; i < numShrines; ++i) {
        shrineCoordinates.push(Number(inputDataLines.shift()));
    }
    shrineCoordinates.push(ARBITRARY_LARGE_VALUE); // Append the sentinel value

    // Initialize the array for temple coordinates, similar to shrines.
    const templeCoordinates = [-ARBITRARY_LARGE_VALUE];
    for (let i = 0; i < numTemples; ++i) {
        templeCoordinates.push(Number(inputDataLines.shift()));
    }
    templeCoordinates.push(ARBITRARY_LARGE_VALUE); // Append the sentinel value

    // Iterate through each of the queries provided in the input.
    for (let currentQueryIndex = 0; currentQueryIndex < numQueries; ++currentQueryIndex) {
        // Extract and convert the current query point from the input lines.
        const queryPosition = Number(inputDataLines.shift());

        // Find the index in the shrine and temple arrays where the query point would be inserted.
        // This index points to the first coordinate that is greater than or equal to `queryPosition`.
        const shrineSearchIndex = locateBoundary(shrineCoordinates, queryPosition);
        const templeSearchIndex = locateBoundary(templeCoordinates, queryPosition);

        // Initialize the minimum distance for this specific query to a very high value.
        let currentMinOverallDistance = ARBITRARY_LARGE_VALUE;

        // Define the candidate shrine coordinates relevant to the query point.
        // These are the shrine immediately before the insertion point and the shrine at the insertion point.
        const candidateShrines = [
            shrineCoordinates[shrineSearchIndex - 1],
            shrineCoordinates[shrineSearchIndex]
        ];

        // Define the candidate temple coordinates relevant to the query point, similarly.
        const candidateTemples = [
            templeCoordinates[templeSearchIndex - 1],
            templeCoordinates[templeSearchIndex]
        ];

        // Iterate through all combinations of candidate shrines and temples (2x2 = 4 pairs).
        for (const selectedShrineCoord of candidateShrines) {
            for (const selectedTempleCoord of candidateTemples) {
                // Calculate the total distance for path 1: query -> shrine -> temple
                // This is |query - shrine| + |shrine - temple|.
                const distancePath1 = Math.abs(selectedShrineCoord - queryPosition) + Math.abs(selectedTempleCoord - selectedShrineCoord);

                // Calculate the total distance for path 2: query -> temple -> shrine
                // This is |query - temple| + |temple - shrine|.
                const distancePath2 = Math.abs(selectedTempleCoord - queryPosition) + Math.abs(selectedShrineCoord - selectedTempleCoord);

                // Update the minimum distance found so far for the current query.
                // We use Math.min directly to compare three values.
                currentMinOverallDistance = Math.min(currentMinOverallDistance, distancePath1, distancePath2);
            }
        }
        // Output the calculated minimum distance for the current query to standard output.
        console.log(currentMinOverallDistance);
    }
};

// This immediately-invoked function expression (IIFE) serves as the entry point
// for executing the spatial query solver when the script is run.
(function executeSolver() {
    try {
        // Read all file content from standard input (file descriptor 0) as a UTF-8 string.
        const fileContent = require("fs").readFileSync(0, "utf8");
        // Pass the read content to the main processing function.
        processSpatialQueries(fileContent);
    } catch (error) {
        // Log any errors that occur during file reading or processing to standard error.
        console.error("An error occurred during input processing:", error.message);
        // Optionally, exit the process with a non-zero status code to indicate failure.
        // process.exit(1);
    }
})();