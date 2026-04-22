"use strict";

/**
 * Primary processing function to calculate a specific sum of cubic values.
 * This function reads input, parses numerical parameters, and computes a result
 * based on whether a step value is even or odd.
 * @param {string} incomingText The complete raw string data received from the input source.
 */
function computeSolution(incomingText) {
    // Divide the entire input string into an array, with each element representing a line.
    const parsedLines = incomingText.split("\n");

    // Retrieve the first line and break it down into an array of string elements using space as a delimiter.
    const firstLineElements = parsedLines[0].split(" ");

    // Convert the first string element from the first line into an integer, representing the maximum value.
    const topVal = parseInt(firstLineElements[0]);

    // Convert the second string element from the first line into an integer, representing the incrementing step.
    const incrementor = parseInt(firstLineElements[1]);

    /**
     * A utility function designed to compute the cube of any given numerical input.
     * @param {number} baseNumber The number for which the cube needs to be calculated.
     * @returns {number} The result of cubing the base number (baseNumber * baseNumber * baseNumber).
     */
    function cubicValue(baseNumber) {
        return baseNumber * baseNumber * baseNumber;
    }

    // Evaluate the parity of the incrementor to determine the appropriate calculation path.
    if (incrementor % 2 === 0) {
        // If the incrementor is an even number, calculate the sum of two distinct cubic terms.
        console.log(
            cubicValue(Math.floor(topVal / incrementor))
            + cubicValue(Math.floor((topVal + incrementor / 2) / incrementor))
        );
    } else {
        // Should the incrementor be an odd number, compute and output only a single cubic term.
        console.log(cubicValue(Math.floor(topVal / incrementor)));
    }
}

// Invoke the main solution computation function by providing content read from standard input.
computeSolution(
    require("fs")
        .readFileSync("/dev/stdin", "utf8")
);