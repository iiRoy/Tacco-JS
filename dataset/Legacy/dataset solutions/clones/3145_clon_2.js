"use strict";

/**
 * Processes the raw input string to calculate a specific value.
 * This function serves as the primary entry point for computation.
 *
 * @param {string} rawData The complete input string received from the environment.
 */
function ProcessInput(rawData) {
    // Divide the entire input string into an array of individual lines.
    let dataRows = rawData.split("\n");

    // Extract the very first line, then split it by any whitespace characters.
    // Each resulting string segment is then converted into a numerical value.
    let parsedNumbers = dataRows.shift().split(/\s/).map((item) => item - 0);

    // Assign the first and second numerical values from the parsed array
    // to distinct, more descriptive variables for clarity.
    let firstVal = parsedNumbers[0];
    let secondVal = parsedNumbers[1];

    // Initialize a variable to store the computed result.
    let resultValue = 0;

    // Apply conditional logic to determine the final resultValue.
    // Condition 1: If both input values are strictly equal.
    if (firstVal === secondVal) {
        resultValue = firstVal;
    }
    // Condition 2: If the sum of the two values is an even number.
    else if ((firstVal + secondVal) % 2 === 0) {
        // Perform a bitwise XOR operation, then decrement the result.
        resultValue = (firstVal ^ secondVal) - 1;
    }
    // Condition 3: For all other cases not covered by the above conditions.
    else {
        // Simply perform a bitwise XOR operation between the two values.
        resultValue = firstVal ^ secondVal;
    }

    // Output the final calculated result to the standard console.
    console.log(resultValue);
}

// Read the entire content of the standard input stream synchronously,
// using UTF-8 encoding, and then pass this content to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
