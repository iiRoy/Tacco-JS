"use strict";

// Define positions for extracting specific values from the input array.
const ALPHA_POSITION = 0; // Index for the first numeric operand.
const BETA_POSITION = 1;  // Index for the second numeric operand.
const MODIFIER_POSITION = 3; // Index for the string containing the modifier digit.

// Define a very large numerical boundary to check against.
const MAXIMUM_DIFFERENCE_THRESHOLD = Math.pow(10, 18);

/**
 * Orchestrates the primary computational logic based on provided input data.
 * This function processes raw text, performs arithmetic, and outputs a result.
 * @param {string} rawInputString - The complete string received from standard input.
 */
const performCalculations = (rawInputString) => {

    // Split the input string into an array of individual lines after trimming
    // any leading/trailing whitespace from the whole input.
    const inputLineSegments = rawInputString.trim().split("\n");

    // Calculate the difference between the numbers at the specified alpha and beta positions.
    const computedDifference = parseInt(inputLineSegments[ALPHA_POSITION]) - parseInt(inputLineSegments[BETA_POSITION]);

    // Extract the string that contains the final controlling digit.
    const modifierStringSegment = inputLineSegments[MODIFIER_POSITION];

    // Parse the last character of the modifier string into an integer.
    const finalModifierDigit = parseInt(modifierStringSegment.charAt(modifierStringSegment.length - 1));

    // Check if the absolute value of the computed difference exceeds the predefined maximum threshold.
    if (Math.abs(computedDifference) > MAXIMUM_DIFFERENCE_THRESHOLD) {
        // If it exceeds, print a specific failure message.
        console.log("Unfair");
    }
    else {
        // Otherwise, determine the final output based on the modifier digit's parity
        // or if the difference itself is zero.
        // If modifier is even or difference is zero, output difference as is.
        // If modifier is odd, output the negative of the difference.
        console.log(finalModifierDigit % 2 === 0 || computedDifference === 0 ? computedDifference : -computedDifference);
    }
};

// Initiate the entire process by reading input from standard input,
// trimming it, and then passing it to the main processing function.
performCalculations( require("fs").readFileSync("/dev/stdin", "utf8").trim() );