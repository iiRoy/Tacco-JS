const fileSystemModule = require('fs'); // Core module for file system operations

// --- Input Processing Configuration ---
const standardInputFileDescriptor = process.stdin.fd; // File descriptor for standard input.

// --- Step 1: Determine Input Data Size ---
// Synchronously queries the file system for the size of the standard input stream.
const inputDataSize = fileSystemModule.fstatSync(standardInputFileDescriptor).size;

// --- Step 2: Handle Empty Input Scenario ---
// If no data is available from stdin, terminate the process.
if (inputDataSize === 0) {
    // In a real application, this might log an error or return a default.
    process.exit(1); // Indicate an error state.
}

// --- Step 3: Allocate Buffer and Read Data ---
// Creates a buffer of the determined size to hold the incoming data.
const dataBuffer = Buffer.alloc(inputDataSize);

// Reads data synchronously from standard input into the allocated buffer.
// 'null' for position means read from the current file position.
const actualBytesRead = fileSystemModule.readSync(
    standardInputFileDescriptor,
    dataBuffer,
    0,               // Offset within the buffer where writing starts.
    inputDataSize,   // Number of bytes to read.
    null             // Position in the file to begin reading from (null for current position).
);

// --- Step 4: Convert Buffer to String and Split into Lines ---
// Decodes the buffer content into a UTF-8 string, considering only the actually read bytes.
const rawInputStringContent = dataBuffer.toString('utf8', 0, actualBytesRead);
// Splits the multi-line input string into an array of individual lines.
const parsedInputLines = rawInputStringContent.split('\n');

// --- Utility Functions for Robust Parsing ---

/**
 * Safely parses a string into an integer, including validation for NaN.
 * @param {string} stringValue - The string to parse.
 * @returns {number} The parsed integer.
 * @throws {Error} If the string cannot be parsed into a valid integer.
 */
const ensureInteger = (stringValue) => {
    const numericValue = parseInt(stringValue.trim(), 10);
    if (isNaN(numericValue)) {
        throw new Error(`Input parsing error: Expected a valid integer but received "${stringValue}".`);
    }
    return numericValue;
};

/**
 * Parses a line containing two space-separated integer coordinates.
 * @param {string} lineContent - The line string, e.g., "10 20".
 * @returns {{x: number, y: number}} An object with 0-indexed x and y coordinates.
 * @throws {Error} If the line does not contain two valid numbers.
 */
const parseZeroIndexedCoordinates = (lineContent) => {
    const parts = lineContent.trim().split(' ');
    if (parts.length < 2) {
        throw new Error(`Input parsing error: Coordinate line "${lineContent}" is incomplete.`);
    }
    // Subtract 1 to convert from 1-based (problem statement often implies) to 0-based indexing.
    return {
        x: ensureInteger(parts[0]) - 1,
        y: ensureInteger(parts[1]) - 1
    };
};

// --- Step 5: Extract and Validate Input Parameters ---

// The first line provides the upper bound for the divisor iteration.
const maxDivisorIterationLimit = ensureInteger(parsedInputLines[0]);
if (maxDivisorIterationLimit < 1) {
    // The problem implies 'w' starts from 1, so the limit must be at least 1.
    process.exit(1);
}

// The second line provides the first pair of coordinates (a, b).
const firstCoordinatePoint = parseZeroIndexedCoordinates(parsedInputLines[1]);
const firstPointX = firstCoordinatePoint.x;
const firstPointY = firstCoordinatePoint.y;

// The third line provides the second pair of coordinates (c, d).
const secondCoordinatePoint = parseZeroIndexedCoordinates(parsedInputLines[2]);
const secondPointX = secondCoordinatePoint.x;
const secondPointY = secondCoordinatePoint.y;

// --- Core Logic: Custom Distance Calculation ---

/**
 * Calculates a specific "Manhattan-like" distance metric between two values
 * based on a given divisor. This involves differences in modulo and floor division results.
 * @param {number} valueA - The first value.
 * @param {number} valueB - The second value.
 * @param {number} currentDivisor - The divisor to use for calculations. Must be non-zero.
 * @returns {number} The calculated custom distance.
 * @throws {Error} If currentDivisor is zero.
 */
const calculateManhattanLikeDistance = (valueA, valueB, currentDivisor) => {
    if (currentDivisor === 0) {
        // This guard is mostly for defensive programming; the main loop prevents 0.
        throw new Error("Cannot calculate distance with a zero divisor.");
    }
    const moduloDifference = Math.abs((valueA % currentDivisor) - (valueB % currentDivisor));
    const floorDivisionDifference = Math.abs(Math.floor(valueA / currentDivisor) - Math.floor(valueB / currentDivisor));
    return moduloDifference + floorDivisionDifference;
};

// --- Step 6: Iterate and Find Minimum Combined Distance ---

// Initialize the variable to track the smallest sum found so far.
// Using Number.MAX_VALUE ensures any valid sum will be smaller.
let overallMinimumSumOfDistances = Number.MAX_VALUE;

// Loop through all possible divisors from 1 up to the specified limit.
for (let currentDivisor = 1; currentDivisor <= maxDivisorIterationLimit; currentDivisor++) {
    // Calculate the custom distance for the first pair of points (a, b).
    const distanceForFirstPair = calculateManhattanLikeDistance(firstPointX, firstPointY, currentDivisor);

    // Calculate the custom distance for the second pair of points (c, d).
    const distanceForSecondPair = calculateManhattanLikeDistance(secondPointX, secondPointY, currentDivisor);

    // Sum the distances for both pairs for the current divisor.
    const currentIterationTotalDistance = distanceForFirstPair + distanceForSecondPair;

    // Update the overall minimum if the current sum is smaller.
    if (currentIterationTotalDistance < overallMinimumSumOfDistances) {
        overallMinimumSumOfDistances = currentIterationTotalDistance;
    }
}

// --- Step 7: Output the Result ---

// Print the final minimum sum of distances to standard output.
console.log(overallMinimumSumOfDistances);