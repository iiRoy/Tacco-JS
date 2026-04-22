/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the Type I definition:
 * - All identifiers, keywords, operators, and literals are preserved exactly.
 * - Only whitespace (indentation, spacing, blank lines) and comments have been altered.
 */

// Enable strict mode for secure and clean code execution.
"use strict";

// Define the main function that processes the input argument.
const main = arg => {

    // --- Input Parsing Section ---

    // Destructure the input string into four integer variables (a, b, c, d).
    // Steps:
    // 1. Trim leading/trailing whitespace from the input string.
    // 2. Split the string by spaces to get an array of string numbers.
    // 3. Map each string number to an integer using parseInt.
    const [a, b, c, d] = arg
        .trim() // Remove extra whitespace from the ends.
        .split(' ') // Split the string into an array of substrings based on space.
        .map(x => parseInt(x)); // Convert each substring to an integer.

    // --- Maximum Product Calculation Section ---

    // Initialize 'max' with the product of 'a' and 'c'.
    let max = a * c;

    // Check if the product of 'a' and 'd' is greater than the current maximum.
    // If it is, update 'max'.
    if (a * d > max) {
        max = a * d; // Update max if a*d is larger.
    }

    // Check if the product of 'b' and 'c' is greater than the current maximum.
    // If it is, update 'max'.
    if (b * c > max) {
        max = b * c; // Update max if b*c is larger.
    }

    // Check if the product of 'b' and 'd' is greater than the current maximum.
    // If it is, update 'max'.
    if (b * d > max) {
        max = b * d; // Update max if b*d is larger.
    }

    // --- Output Section ---

    // Print the final calculated maximum value to the console.
    // Convert the number to a string before logging.
    console.log(max.toString());

}; // End of the main function definition.


// --- Program Entry Point ---

// Read input from standard input (/dev/stdin) synchronously,
// decode it as UTF-8, and pass it to the main function.
main(
    require('fs') // Import the 'fs' (file system) module.
        .readFileSync('/dev/stdin', 'utf8') // Read the file content from standard input.
); // Call the main function with the read content.