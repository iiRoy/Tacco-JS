// This module provides file system utilities.
const fileInputSystem = require("fs");

// Define numerical constants used in the primary calculation.
const calculationDivisor = 98;   // The value used for division in the formula.
const calculationOffset = 2;     // The value added to the result of division.

// Read the entire content from standard input, ensuring UTF-8 encoding.
// The path "/dev/stdin" is a common Unix-like convention for standard input.
const rawContentFromStdin = fileInputSystem
    .readFileSync(
        "/dev/stdin", // Specifies the source to read from.
        "utf8"        // Defines the character encoding.
    );

// Split the obtained raw content into an array of strings,
// where each element represents a line, separated by newline characters.
const individualLineStrings = rawContentFromStdin.split('\n');

// Iterate over each string entry in the array.
// For each non-empty string, perform a calculation and output the integer result.
individualLineStrings.map(
    function (currentInputString) { // Anonymous function processes each line.
        // Check if the current string value is truthy (e.g., not an empty string or null).
        return currentInputString
            ? ( // If the string is not empty:
                console.log( // Output the calculated integer to the console.
                    Math.floor( // Convert the final result to an integer by flooring.
                        ( // Begin the mathematical operation.
                            Number(currentInputString) * Number(currentInputString) // Convert string to number and square it.
                        ) / calculationDivisor // Divide the squared value by the predefined divisor.
                        + calculationOffset    // Add the predefined offset to the result.
                    )
                ) || undefined // console.log returns undefined, which becomes the map callback's return value.
            )
            : 0; // If the string is empty/falsy, return 0 for the map callback (mimicking original behavior).
    }
);