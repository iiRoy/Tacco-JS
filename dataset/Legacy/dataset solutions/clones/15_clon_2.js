// This script processes numerical inputs from standard input.
const fileSystem = require("fs"); // Using const for module imports

/**
 * Determines if three numbers form a right-angled triangle based on the Pythagorean theorem.
 * @param {number} sideA - The length of the first side.
 * @param {number} sideB - The length of the second side.
 * @param {number} hypotenuseC - The length of the third side (hypotenuse).
 * @returns {boolean} True if a^2 + b^2 = c^2, false otherwise.
 */
function checkPythagorean(sideA, sideB, hypotenuseC) {
    // Calculate squares and compare their sum.
    return sideA * sideA + sideB * sideB === hypotenuseC * hypotenuseC;
}

// Read all incoming data from the standard input stream.
let rawData = fileSystem.readFileSync('/dev/stdin').toString();

// Split the raw data into individual lines.
let inputLines = rawData.split("\n");

// The first line contains the total number of test cases to process.
let numCases = parseInt(inputLines.shift(), 10); // Added radix for parseInt

// Iterate through each test case provided in the input.
for (let idx = 0; idx < numCases; idx++) {
    // Split the current line into its constituent parts (numbers).
    let currentParts = inputLines[idx].split(" ");

    // Parse the three numbers for the current test case.
    let valA = parseInt(currentParts.shift(), 10);
    let valB = parseInt(currentParts.shift(), 10);
    let valC = parseInt(currentParts.shift(), 10);

    // Check if all parsed values are valid numbers before proceeding.
    if (!isNaN(valA + valB + valC)) {
        // Output "YES" if it's a right triangle, "NO" otherwise.
        console.log(checkPythagorean(valA, valB, valC) ? "YES" : "NO");
    }
}
