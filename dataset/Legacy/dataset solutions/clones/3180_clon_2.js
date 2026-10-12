"use strict";

// Function to find the insertion point for a target value in a sorted array.
// This is a modified binary search that returns the index where the value
// would be inserted to maintain sorted order, or its existing index if found.
function locateElement(dataCollection, targetValue) {
    // Initialize search boundaries for the array.
    let lowIndex = 0;
    let highIndex = dataCollection.length - 1;
    // Calculate the initial midpoint of the search range.
    let midPoint = Math.floor((lowIndex + highIndex) / 2);

    // Continue the search as long as the target is not at the midpoint
    // and the search boundaries have not crossed.
    while (dataCollection[midPoint] !== targetValue && lowIndex < highIndex) {
        // If the target value is less than the element at the midpoint,
        // narrow the search to the lower half.
        if (targetValue < dataCollection[midPoint]) {
            highIndex = midPoint - 1;
        } else {
            // Otherwise, narrow the search to the upper half.
            lowIndex = midPoint + 1;
        }
        // Recalculate the midpoint for the new search range.
        midPoint = Math.floor((lowIndex + highIndex) / 2);
    }

    // After the loop, determine the final index.
    // If the element at midPoint is greater than the target,
    // the target should be inserted at midPoint.
    if (dataCollection[midPoint] > targetValue) {
        return midPoint;
    }
    // If the element at midPoint is less than the target,
    // the target should be inserted after midPoint.
    if (dataCollection[midPoint] < targetValue) {
        return midPoint + 1;
    }
    // If dataCollection[midPoint] is equal to targetValue, or if it's not found
    // and we need the insertion point, this ternary handles both cases.
    // If not equal, it's the insertion point; otherwise, it's the found index.
    return (dataCollection[midPoint] !== targetValue) ? midPoint + 1 : midPoint;
}

// Main function to process the input data and solve the problem.
function processInputData(rawData) {
    // Define a constant for a very large number, used for padding and initial minimums.
    const MAX_VAL = Number.MAX_SAFE_INTEGER;

    // Split the entire input string into an array of individual lines.
    let inputLines = rawData.split("\n");

    // Parse the first line to get the counts of shrines, temples, and queries.
    // `shift()` removes the first element from the array and returns it.
    // `split(/\s/)` splits by any whitespace.
    // `map(Number)` converts string elements to numbers.
    let paramsArray = inputLines.shift().split(/\s/).map((valStr) => Number(valStr));
    let countA = paramsArray[0]; // Number of shrine locations.
    let countB = paramsArray[1]; // Number of temple locations.
    let numQueries = paramsArray[2]; // Total number of queries to process.

    // Initialize an array to store shrine locations.
    // It's padded with -MAX_VAL at the beginning to handle edge cases in binary search.
    let shrineLocations = [-MAX_VAL];
    // Populate the shrine locations array from the input lines.
    for (let idxA = 0; idxA < countA; idxA++) {
        shrineLocations.push(Number(inputLines.shift()));
    }
    // Pad with MAX_VAL at the end for binary search edge cases.
    shrineLocations.push(MAX_VAL);

    // Initialize an array to store temple locations, similarly padded.
    let templeLocations = [-MAX_VAL];
    // Populate the temple locations array from the input lines.
    for (let idxB = 0; idxB < countB; idxB++) {
        templeLocations.push(Number(inputLines.shift()));
    }
    // Pad with MAX_VAL at the end.
    templeLocations.push(MAX_VAL);

    // Define a small helper function to find the minimum of three numbers.
    const getMinOfThree = (val1, val2, val3) => {
        return Math.min(val1, Math.min(val2, val3));
    };

    // Process each query one by one.
    for (let queryIdx = 0; queryIdx < numQueries; queryIdx++) {
        // Get the current query point (location).
        let queryPoint = Number(inputLines.shift());

        // Find the potential insertion index for the query point in the shrine locations.
        let shrinePos = locateElement(shrineLocations, queryPoint);
        // Find the potential insertion index for the query point in the temple locations.
        let templePos = locateElement(templeLocations, queryPoint);

        // Initialize the minimum distance for the current query to a very large value.
        let minDistance = MAX_VAL;

        // Iterate through the two closest shrine locations to the query point.
        // These are the one immediately before and the one immediately at/after the insertion point.
        for (let currentShrine of [shrineLocations[shrinePos - 1], shrineLocations[shrinePos]]) {
            // For each chosen shrine, iterate through the two closest temple locations.
            for (let currentTemple of [templeLocations[templePos - 1], templeLocations[templePos]]) {
                // Calculate the total distance for path 1: Query -> Shrine -> Temple.
                const distOption1 = Math.abs(currentShrine - queryPoint) + Math.abs(currentTemple - currentShrine);
                // Calculate the total distance for path 2: Query -> Temple -> Shrine.
                const distOption2 = Math.abs(currentTemple - queryPoint) + Math.abs(currentShrine - currentTemple);

                // Update the overall minimum distance found for this query.
                minDistance = getMinOfThree(minDistance, distOption1, distOption2);
            }
        }
        // Output the calculated minimum distance for the current query.
        console.log(minDistance);
    }
}

// Read input from standard input and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
