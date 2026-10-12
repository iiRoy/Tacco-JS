'use strict';

/**
 * Main processing function for the input data.
 * This function reads numerical data, calculates the maximum possible GCD
 * by conceptually removing one element at a time, and then prints the result.
 * @param {string} rawData - The raw input string, typically from standard input.
 */
function ProcessInput(rawData) {
    // Split the entire input string into an array of lines.
    let processedLines = rawData.split("\n");

    // Parse the first line to determine the total count of elements.
    const countElements = parseInt(processedLines[0], 10);

    // Parse the second line, splitting it by spaces and converting each part to an integer.
    const numericValues = processedLines[1].split(' ').map(stringRep => parseInt(stringRep, 10));

    /**
     * Computes the greatest common divisor (GCD) of two non-negative integers
     * using the efficient Euclidean algorithm.
     * @param {number} valA - The first integer for GCD calculation.
     * @param {number} valB - The second integer for GCD calculation.
     * @returns {number} The greatest common divisor of the two input values.
     */
    const calculateGreatestCommonDivisor = (valA, valB) => {
        // Continue the algorithm as long as the second value is not zero.
        while (valB) {
            let tempVal = valB; // Temporarily store the current second value.
            valB = valA % valB; // Update the second value to the remainder of valA divided by valB.
            valA = tempVal;     // Update the first value to the previously stored second value.
        }
        return valA; // When valB becomes 0, valA holds the GCD.
    };

    // Initialize a variable to keep track of the largest GCD found across all subsets.
    let maximumGCD = 1;

    // Iterate through each element in the array, treating 'outerIndex' as the element to be excluded.
    for (let outerIndex = 0; outerIndex < countElements; outerIndex++) {
        // Initialize the current GCD for the subset of numbers (excluding numericValues[outerIndex]).
        // The initial value is chosen from an adjacent element to ensure it's a valid number.
        let currentGCD = numericValues[outerIndex + 1] || numericValues[outerIndex - 1];

        // Iterate through all numbers in the original array to calculate the GCD of the current subset.
        for (let innerIndex = 0; innerIndex < countElements; innerIndex++) {
            // If the inner index matches the outer index, this element is "removed" for this iteration, so skip it.
            if (innerIndex === outerIndex) {
                continue;
            }
            // Update the current GCD by calculating it with the next number in the subset.
            currentGCD = calculateGreatestCommonDivisor(currentGCD, numericValues[innerIndex]);

            // Optimization: If the current GCD is already less than or equal to the overall maximum found,
            // it's impossible for this subset to yield a larger GCD, so we can stop early.
            if (currentGCD <= maximumGCD) {
                break; // Exit the inner loop.
            }
        }
        // After processing a subset, update the overall maximum GCD if the current subset's GCD is greater.
        maximumGCD = Math.max(maximumGCD, currentGCD);
    }

    // Output the final calculated maximum GCD to the console.
    console.log(maximumGCD);
}

// Call the main processing function, reading input from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
