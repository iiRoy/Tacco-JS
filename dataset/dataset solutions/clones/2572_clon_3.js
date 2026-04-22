"use strict"; // Enforce stricter parsing and error handling for cleaner, more robust code execution.

/**
 * This script is designed to perform a specific mathematical operation:
 * it reads a single numerical input from the standard input stream,
 * computes the cube of that number, and then outputs the result to
 * the standard output. It incorporates error handling for invalid inputs
 * and issues during file system access.
 */

// --- Core Module Imports and Configuration Definitions ---

// Obtain a reference to the Node.js built-in 'fs' module, which provides
// an API for interacting with the file system.
const fileSystemModuleReference = require('fs');

// Define the canonical path for accessing the standard input stream
// across various Unix-like operating systems.
const standardInputEndpoint = '/dev/stdin';

// Specify the character encoding standard to be used when interpreting
// the bytes read from the input stream into a string. UTF-8 is widely compatible.
const preferredTextEncoding = 'UTF-8';

// --- Input Acquisition and Initial Processing ---

let entireInputContent; // This variable will store the raw string data read from stdin.
try {
    // Attempt to synchronously read all data from the standard input.
    // The 'readFileSync' method will block execution until the entire content
    // is read or an error occurs. The encoding ensures it returns a string.
    entireInputContent = fileSystemModuleReference.readFileSync(standardInputEndpoint, preferredTextEncoding);
} catch (ioOperationError) {
    // If any error occurs during the file read operation (e.g., permissions, non-existent stream),
    // log a detailed error message to the console and terminate the program with an error status.
    console.error(`\n### Runtime Error: Failed to read from standard input. ###\nDetails: ${ioOperationError.message}\n`);
    process.exit(1); // Exit code 1 indicates an unhandled error.
}

// Convert the acquired input content to a string explicitly (though it already is)
// and then split it into an array of individual lines. Each line is separated by a newline character.
const lineSegmentArray = entireInputContent.toString().split('\n');

// --- Data Extraction and Comprehensive Validation ---

// Check for the fundamental condition: ensure that at least one line of input was provided.
if (lineSegmentArray.length === 0) {
    console.error("\n### Input Validation Error: No input lines were detected. ###\nExpected at least one line containing a numeric value.\n");
    process.exit(1); // Terminate due to insufficient input.
}

// Extract the very first line from the array of input segments.
// The '.trim()' method is crucial here to remove any leading or trailing whitespace,
// which could otherwise interfere with numerical conversion.
const significantDataLine = lineSegmentArray[0].trim();

// Perform a preliminary check to see if the extracted line is empty after trimming.
if (significantDataLine.length === 0) {
    console.error("\n### Input Validation Error: The first input line is empty or contains only whitespace. ###\nA numeric value is required.\n");
    process.exit(1); // Exit if the primary input line is effectively blank.
}

// Attempt to convert the cleaned string line into a numerical value.
// The `Number()` constructor is used for a robust conversion, handling both integers and floats.
const baseValueForCalculation = Number(significantDataLine);

// Validate if the conversion was successful. `isNaN()` checks if the result is "Not-a-Number".
if (isNaN(baseValueForCalculation)) {
    console.error(`\n### Input Validation Error: The provided value "${significantDataLine}" is not a valid number. ###\nPlease ensure the first line contains only a numerical value.\n`);
    process.exit(1); // Terminate execution due to invalid numeric input.
}

// --- Core Mathematical Operation ---

// Calculate the cube of the validated numerical base value.
// The exponentiation operator (**) is used for clear and concise cubing.
const finalComputedCube = baseValueForCalculation ** 3;

// --- Result Presentation ---

// Output the final calculated cubic value to the standard output stream.
// This is the primary result expected from the script's execution.
console.log(finalComputedCube);

// An optional, non-essential logging statement that could be used for debugging
// or verbose mode. It's commented out to maintain the original script's output purity.
// console.info(`\n--- Script Execution Summary ---\nOriginal Input: "${significantDataLine}"\nNumeric Base: ${baseValueForCalculation}\nCalculated Cube: ${finalComputedCube}\n-------------------------------\n`);