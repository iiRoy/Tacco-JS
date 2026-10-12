"use strict";

/**
 * Processes the input string to calculate the number of pairs of points
 * whose Euclidean distance is an integer.
 * @param {string} inputString The raw input string from standard input.
 */
function processInput(inputString) {
    // Split the input into individual lines and prepare for parsing
    let inputLines = inputString.trim().split("\n");

    // Parse the first line which contains the number of points (N) and dimensions (D)
    const firstLineData = inputLines.shift().split(' ').map(Number);
    const numPoints = firstLineData[0];
    const numDimensions = firstLineData[1];

    // Parse the remaining lines into an array of point coordinate arrays
    // Each inner array represents a point in D-dimensional space
    const pointCoordinates = inputLines.map(lineStr => lineStr.split(' ').map(Number));

    let integerDistanceCounter = 0; // Initialize a counter for pairs with integer distances

    // Iterate through all unique pairs of points (pointIndexA, pointIndexB)
    // The outer loop selects the first point, the inner loop selects the second point
    for (let pointIndexA = 0; pointIndexA < numPoints; pointIndexA++) {
        for (let pointIndexB = pointIndexA; pointIndexB < numPoints; pointIndexB++) {
            // If both indices are the same, it's the same point, so skip to avoid self-comparison
            if (pointIndexA === pointIndexB) {
                continue;
            }

            // Retrieve the coordinate arrays for the current pair of points
            const currentPointA = pointCoordinates[pointIndexA];
            const currentPointB = pointCoordinates[pointIndexB];

            let sumOfSquaredDifferences = 0; // Accumulator for the sum of (coord1 - coord2)^2

            // Calculate the sum of squared differences across all dimensions
            for (let dimensionIterator = 0; dimensionIterator < numDimensions; dimensionIterator++) {
                // Calculate the absolute difference between coordinates in the current dimension
                const coordinateDiff = Math.abs(currentPointA[dimensionIterator] - currentPointB[dimensionIterator]);
                // Add the square of this difference to the total sum
                sumOfSquaredDifferences += coordinateDiff * coordinateDiff;
            }

            // Calculate the Euclidean distance using the square root of the sum of squared differences
            const euclideanDistance = Math.sqrt(sumOfSquaredDifferences);

            // Check if the calculated Euclidean distance is an integer.
            // This is done by converting the number to a string and checking if it contains a decimal point.
            // If `split('.')` results in an array with more than one element, it means there was a decimal point.
            // The condition `!(String(euclideanDistance).split('.').length > 1)` is true if it's an integer.
            if (!(String(euclideanDistance).split('.').length > 1)) {
                integerDistanceCounter++; // Increment the counter if the distance is an integer
            }
        }
    }

    // Output the final count of pairs that have an integer Euclidean distance
    console.log(integerDistanceCounter);
}

// Read the entire input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
