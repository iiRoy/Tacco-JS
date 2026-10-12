'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Processes the provided raw input string to calculate a specific value.
 * This function takes a string, parses it into numbers, and performs a calculation.
 * @param {string} rawData - The raw input string, typically from standard input.
 */
function ProcessInput(rawData) {
    // Split the raw data by newline, take the first line, then split by space.
    // Finally, convert each resulting string part into a number.
    const parsedNumbers = rawData.split("\n")[0].split(" ").map(currentValue => Number(currentValue));

    // Perform the calculation: (first number - 1) * (second number - 1)
    // And output the result to the console.
    console.log((parsedNumbers[0] - 1) * (parsedNumbers[1] - 1));
}

// Read the entire content from standard input synchronously using Node.js 'fs' module.
// Then, pass the read content to our processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
