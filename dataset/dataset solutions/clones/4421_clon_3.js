"use strict"; // Enforce strict parsing and error handling for cleaner code.

/**
 * Establishes an input stream handler to process data from standard input.
 * This function reads all available input and prepares it for sequential access.
 * @returns {object} An object containing methods to navigate and retrieve input data.
 */
const initializeInputStream = () => {
    // Utilize Node.js 'fs' module to synchronously read the entire content of stdin.
    // The input is expected to be UTF-8 encoded.
    // .trim() removes any leading/trailing whitespace from the whole input block.
    // .split(/\r?\n/) divides the input into an array of lines, handling both Windows and Unix line endings.
    const rawInputLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\r?\n/);

    // Construct the input stream object with its internal state and methods.
    const inputStreamObject = {
        dataEntries: rawInputLines, // The array holding all processed input lines.
        currentEntryIndex: 0,       // Tracks the position of the next line to be read.
        totalEntryCount: rawInputLines.length, // The total number of input lines available.

        /**
         * Determines if there are more unread input lines in the stream.
         * @returns {boolean} True if further input is available, false otherwise.
         */
        hasMoreEntries: function () {
            return this.currentEntryIndex < this.totalEntryCount;
        },

        /**
         * Retrieves the subsequent line from the input stream and advances the internal pointer.
         * Throws an error if an attempt is made to read beyond the end of the input.
         * @returns {string} The next available input line.
         * @throws {Error} Signals that the input stream has been fully consumed.
         */
        retrieveNextEntry: function () {
            if (!this.hasMoreEntries()) {
                // Providing a custom, descriptive error for better debugging.
                throw new Error("InputBufferDepletion: All input lines have been processed.");
            }
            // Fetch the line at the current index and then increment the index for the next call.
            const nextDataLine = this.dataEntries[this.currentEntryIndex];
            this.currentEntryIndex++;
            return nextDataLine;
        }
    };
    return inputStreamObject; // Return the fully configured input stream handler.
};

// Create a global instance of the input stream handler for easy access throughout the application.
const globalInputProcessor = initializeInputStream();

// --- Specialized Input Retrieval Functions ---

/**
 * Obtains the next raw string line from the input stream.
 * @returns {string} The next complete input line as a string.
 */
const acquireNextString = () => globalInputProcessor.retrieveNextEntry();

/**
 * Parses the next input line and converts it into an integer.
 * @returns {number} The integer representation of the next input line.
 */
const acquireNextInteger = () => parseInt(globalInputProcessor.retrieveNextEntry(), 10);

/**
 * A convenience function to acquire the next input line and convert it directly to a BigInt.
 * This helps avoid repetitive BigInt conversions in the main logic.
 * @returns {BigInt} The BigInt representation of the next input line.
 */
const acquireNextBigInt = () => BigInt(acquireNextInteger());

/**
 * Reads the next input line and splits it into an array of strings, using space as a delimiter.
 * @returns {string[]} An array of substrings.
 */
const acquireNextStringArray = () => globalInputProcessor.retrieveNextEntry().split(" ");

/**
 * Reads the next input line, splits it by spaces, and maps each part to an integer.
 * @returns {number[]} An array of integers parsed from the line.
 */
const acquireNextIntegerArray = () => globalInputProcessor.retrieveNextEntry().split(" ").map(item => parseInt(item, 10));

/**
 * Reads the next input line and converts it into an array of individual characters.
 * @returns {string[]} An array where each element is a single character.
 */
const acquireNextCharacterArray = () => globalInputProcessor.retrieveNextEntry().split("");

/**
 * Checks the status of the input stream to determine if more data is available.
 * @returns {boolean} True if there are more entries to read, false otherwise.
 */
const checkStreamForMoreInput = () => globalInputProcessor.hasMoreEntries();

/**
 * A standardized function for printing output to the console.
 * This abstraction allows for potential future enhancements like logging levels or custom formatting.
 * @param {...any} outputData - Any data to be logged to the console.
 */
const presentOutput = (...outputData) => {
    console.log(...outputData);
};

// --- Core Mathematical Helper Functions ---

/**
 * Computes the Greatest Common Divisor (GCD) of two BigInt numbers
 * using the optimized Euclidean algorithm.
 * @param {BigInt} valueX - The first BigInt operand.
 * @param {BigInt} valueY - The second BigInt operand.
 * @returns {BigInt} The GCD of valueX and valueY.
 */
function computeGreatestCommonDivisor(valueX, valueY) {
    // Ensure valueX is always greater than or equal to valueY for consistent algorithm application.
    if (valueX < valueY) {
        let temporaryStorage = valueX; // Use a temporary variable for swapping, a Type III change.
        valueX = valueY;
        valueY = temporaryStorage;
    }

    let currentRemainder; // Variable to hold the remainder at each step of the algorithm.
    // The algorithm continues until valueY becomes zero.
    while (valueY !== 0n) {
        currentRemainder = valueX % valueY; // Calculate the remainder.
        valueX = valueY;                   // Update valueX with the previous value of valueY.
        valueY = currentRemainder;         // Update valueY with the calculated remainder.
    }
    return valueX; // When valueY is 0, valueX holds the GCD.
}

/**
 * Calculates the Least Common Multiple (LCM) of two BigInt numbers.
 * The formula used is: LCM(a, b) = |a * b| / GCD(a, b).
 * Assumes positive inputs as is common in competitive programming contexts.
 * @param {BigInt} numberA - The first BigInt number.
 * @param {BigInt} numberB - The second BigInt number.
 * @returns {BigInt} The LCM of numberA and numberB.
 */
const calculateLeastCommonMultiple = (numberA, numberB) => {
    // Compute GCD first. This helps prevent potential intermediate overflow if numberA * numberB is
    // extremely large, although BigInt handles arbitrary precision, it's good practice.
    const gcdResult = computeGreatestCommonDivisor(numberA, numberB);
    // Apply the LCM formula.
    return (numberA * numberB) / gcdResult;
};

// --- Main Program Execution Logic ---

/**
 * This function encapsulates the primary business logic of the application.
 * It reads a sequence of numbers from input and computes their cumulative Least Common Multiple.
 */
const executeMainAlgorithm = () => {
    // --- Type III: Added a guard clause for empty input ---
    if (!checkStreamForMoreInput()) {
        presentOutput("No input data detected. The program will terminate without processing.");
        return; // Exit early if no input is available.
    }

    // --- Type III: Removed unused variable ---
    // The original code had a variable `n` that was assigned an input value but never utilized.
    // This dead code has been removed to improve clarity and efficiency.

    // Initialize the accumulator for the cumulative LCM with the first number from the input.
    // Using the 'acquireNextBigInt' helper for direct BigInt conversion.
    let currentCumulativeLCM = acquireNextBigInt();

    // Loop through the remaining input lines, continuously updating the cumulative LCM.
    while (checkStreamForMoreInput()) {
        // --- Type III: Introduced an intermediate variable for clarity ---
        const nextValueForLCM = acquireNextBigInt(); // Fetch the next number as a BigInt.
        currentCumulativeLCM = calculateLeastCommonMultiple(currentCumulativeLCM, nextValueForLCM);
    }

    // Output the final calculated cumulative LCM, ensuring it's presented as a string.
    presentOutput(currentCumulativeLCM.toString());
};

// Initiate the execution of the main algorithm.
executeMainAlgorithm();