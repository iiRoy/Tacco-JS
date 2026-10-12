"use strict";

// Entry point: Read input from stdin, process it, and pass to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8").replace(/\r?\n$/, "").split(/\r?\n/));

/**
 * Main function to handle the input data and perform distance calculations.
 * @param {string[]} inputData - An array of strings, where each string is a line from the input.
 */
function processInput(inputData) {
    // Parse the first vector (x-coordinates) from the second line of input.
    let vecA = inputData[1].split(" ").map(Number);

    // Parse the second vector (y-coordinates) from the third line of input.
    let vecB = inputData[2].split(" ").map(Number);

    /**
     * Calculates the Minkowski distance between two vectors.
     * @param {number[]} vector1 - The first vector.
     * @param {number[]} vector2 - The second vector.
     * @param {number} powerVal - The 'p' value for the Minkowski distance formula.
     * @returns {number} The calculated Minkowski distance.
     */
    const calcMinkowskiDistance = (vector1, vector2, powerVal) => {
        // Calculate the sum of the absolute differences raised to the powerVal.
        let totalSum = vector1.map((valA, idx) => {
            return Math.pow(Math.abs(valA - vector2[idx]), powerVal);
        }).reduce((accumulator, currentValue) => accumulator + currentValue);

        // Return the total sum raised to the power of (1 / powerVal).
        return Math.pow(totalSum, 1 / powerVal);
    };

    // Output the Manhattan distance (Minkowski distance with p=1).
    console.log(calcMinkowskiDistance(vecA, vecB, 1));

    // Output the Euclidean distance (Minkowski distance with p=2).
    console.log(calcMinkowskiDistance(vecA, vecB, 2));

    // Output the Minkowski distance with p=3.
    console.log(calcMinkowskiDistance(vecA, vecB, 3));

    // Calculate and output the Chebyshev distance (L-infinity norm).
    // This is the maximum absolute difference between corresponding elements.
    console.log(Math.max.apply(null, vecA.map((elementA, index) => Math.abs(elementA - vecB[index]))));
}
