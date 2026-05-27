"use strict"; // Enforce strict mode for cleaner code.

// Function to set up an input reader from standard input.
const makeInputReader = () => {
    // Read all data from stdin, decode as UTF-8, remove leading/trailing whitespace, and split into an array of lines.
    const rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

    // Create an object to manage reading lines sequentially.
    const readerInstance = {
        "dataLines": rawData, // Array holding all input lines.
        "currentLineIdx": 0,  // Current position in the input array.
        "totalLines": rawData.length, // Total number of lines available.

        // Method to check if there are more lines to read.
        "hasMoreLines": function () {
            return this.currentLineIdx < this.totalLines;
        },

        // Method to retrieve the next line from the input.
        "retrieveNextLine": function () {
            if (!this.hasMoreLines()) {
                // If no more lines, throw an error indicating out-of-bounds access.
                throw "ArrayIndexOutOfBoundsException";
            } else {
                // Return the current line and then increment the index for the next call.
                return this.dataLines[this.currentLineIdx++];
            }
        }
    };
    return readerInstance; // Return the configured reader object.
};

// Initialize the global input handler using the factory function.
const inputHandler = makeInputReader();

// Helper function to get the next line as a string.
const getNextLine = () => inputHandler.retrieveNextLine();

// Helper function to get the next line and parse it as an integer.
const getNextInt = () => parseInt(inputHandler.retrieveNextLine());

// Helper function to get the next line, split by space, returning a string array.
const getNextStringArray = () => inputHandler.retrieveNextLine().split(" ");

// Helper function to get the next line, split by space, and parse each part as an integer.
const getNextIntArray = () => inputHandler.retrieveNextLine().split(" ").map(elementValue => parseInt(elementValue));

// Helper function to get the next line and split it into an array of characters.
const getNextCharArr = () => inputHandler.retrieveNextLine().split("");

// Helper function to check if there are more lines available in the input.
const checkHasMore = () => inputHandler.hasMoreLines();

// Custom output function for convenience, mirroring console.log.
const printOutput = (...outputArgs) => console.log(...outputArgs);

/**
 * Calculates the greatest common divisor (GCD) of two BigInt numbers using the Euclidean algorithm.
 * @param {BigInt} valA - The first number.
 * @param {BigInt} valB - The second number.
 * @returns {BigInt} The greatest common divisor.
 */
function calculateGreatestCommonDivisor(valA, valB) {
    // Ensure valA is greater than or equal to valB for consistent algorithm application.
    if (valA < valB) {
        [valA, valB] = [valB, valA]; // Swap values if valA is smaller.
    }

    let remainderVal; // Variable to store the remainder in each step.

    // Continue the algorithm as long as valB is positive.
    while (valB > 0n) {
        remainderVal = valA % valB; // Calculate the remainder.
        valA = valB;             // Update valA to the previous valB.
        valB = remainderVal;     // Update valB to the remainder.
    }
    return valA; // When valB becomes 0, valA holds the GCD.
}

/**
 * Calculates the least common multiple (LCM) of two BigInt numbers.
 * LCM(a, b) = |a * b| / GCD(a, b)
 * @param {BigInt} valA - The first number.
 * @param {BigInt} valB - The second number.
 * @returns {BigInt} The least common multiple.
 */
function calculateLeastCommonMultiple(valA, valB) {
    // Calculate LCM using the formula: (valA * valB) / GCD(valA, valB).
    // Note: This assumes positive numbers for simplicity, as per typical competitive programming context.
    return (valA * valB) / calculateGreatestCommonDivisor(valA, valB);
}

// The primary execution function of the program.
const executePrimaryLogic = () => {
    // Read the first line, which might be 'n' (though not used in the current logic, it's consumed).
    const unusedLineCount = getNextLine();

    // Initialize the answer with the BigInt conversion of the second line of input.
    let currentLcmResult = BigInt(getNextLine());

    // Loop through the remaining input lines.
    while (checkHasMore()) {
        // For each subsequent line, calculate the LCM with the current result and the new integer.
        currentLcmResult = calculateLeastCommonMultiple(currentLcmResult, BigInt(getNextInt()));
    }

    // Output the final calculated LCM as a string to the console.
    console.log(currentLcmResult.toString());
};

// Invoke the main execution function to start the program.
executePrimaryLogic();
