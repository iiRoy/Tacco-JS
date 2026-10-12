'use strict';

// Initiate the standard input stream to continue processing.
process.stdin.resume();
// Configure the character encoding for the standard input stream.
process.stdin.setEncoding('utf8');

/**
 * Identifies the largest numerical value within a provided array.
 * @param {Array<number>} valueCollection - The array of numbers to be examined.
 * @returns {number} The maximum value found in the array.
 */
const determineMaximum = (valueCollection) => {
    let indexPosition = valueCollection.length;
    let highestValue = -Infinity; // Initialize with the smallest possible number.
    while (indexPosition--) { // Iterate through the array from the last element to the first.
        if (valueCollection[indexPosition] > highestValue) {
            highestValue = valueCollection[indexPosition]; // Update if a greater value is discovered.
        }
    }
    return highestValue;
};

/**
 * Identifies the smallest numerical value within a provided array.
 * @param {Array<number>} numericSeries - The array of numbers to be examined.
 * @returns {number} The minimum value found in the array.
 */
const determineMinimum = (numericSeries) => {
    let loopCounter = numericSeries.length;
    let lowestValue = Infinity; // Initialize with the largest possible number.
    while (loopCounter--) { // Iterate through the array in reverse order.
        if (numericSeries[loopCounter] < lowestValue) {
            lowestValue = numericSeries[loopCounter]; // Update if a smaller value is encountered.
        }
    }
    return lowestValue;
};

/**
 * The primary function responsible for processing the input data.
 * It calculates the minimum cost to traverse a series of points.
 * @param {string} inputContent - The raw string data received from standard input.
 */
const executePrimaryLogic = (inputContent) => {
    // Divide the input string into individual lines.
    let lines = inputContent.split("\n");

    // Extract the total number of items (N) from the first line.
    let totalItems = parseInt(lines[0], 10);

    // Parse the second line to obtain an array of height values.
    let elevationData = (lines[1].split(" ").map(Number));

    // Create an array to store cumulative costs, initialized with a very large number.
    // The size is chosen to accommodate potential accesses beyond 'totalItems'.
    let cumulativeCosts = new Array(totalItems + 20).fill(Infinity);

    // The cost to reach the starting point (index 0) is always zero.
    cumulativeCosts[0] = 0;

    /**
     * A recursive helper function to compute the minimum costs using dynamic programming.
     * It explores paths by taking steps of 1 or 2.
     * @param {number} currentPoint - The current index in the elevation data.
     */
    const computePathCosts = (currentPoint) => {
        // Base condition: if the current point is beyond the valid range, terminate.
        if (currentPoint >= totalItems) {
            return;
        }

        // Calculate the cost to move to the next point (currentPoint + 1).
        // Update the cost if the new path is cheaper.
        cumulativeCosts[currentPoint + 1] = Math.min(
            cumulativeCosts[currentPoint] + Math.abs(elevationData[currentPoint] - elevationData[currentPoint + 1]),
            cumulativeCosts[currentPoint + 1]
        );

        // Calculate the cost to move two points ahead (currentPoint + 2).
        // Update the cost if this path is more economical.
        cumulativeCosts[currentPoint + 2] = Math.min(
            cumulativeCosts[currentPoint] + Math.abs(elevationData[currentPoint] - elevationData[currentPoint + 2]),
            cumulativeCosts[currentPoint + 2]
        );

        // Recursively call the function for the subsequent points.
        computePathCosts(currentPoint + 1);
        computePathCosts(currentPoint + 2);
    };

    // Begin the cost calculation process from the initial point.
    computePathCosts(0);

    // Output the final minimum cost to reach the (N-1)th element.
    console.log(cumulativeCosts[totalItems - 1]);
};

// The following line should not be altered. It reads input from stdin and invokes the main logic.
executePrimaryLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
