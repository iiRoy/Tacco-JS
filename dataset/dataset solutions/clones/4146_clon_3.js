'use strict'; // Enforces stricter parsing and error handling for better code quality.

// Import the Node.js File System module to interact with the file system.
const fileSystemHandler = require('fs');

// Define a constant for the standard input stream path, common in competitive programming environments.
const standardInputLocation = '/dev/stdin';

// Read the raw content from the standard input, decode it as UTF-8 text,
// remove any leading or trailing whitespace, and then split the resulting string
// into an array of substrings using a space character as the delimiter.
const rawDataLine = fileSystemHandler.readFileSync(standardInputLocation, 'utf8').trim();
const textSegments = rawDataLine.split(' ');

// --- Input Validation Section ---
// Ensure that exactly two numeric values were provided in the input.
if (textSegments.length !== 2) {
    console.error("Input Error: Expecting two numerical arguments, but received " + textSegments.length + " segments.");
    // Terminate the process with an error code (non-zero).
    process.exit(1);
}

// Extract the individual string segments for clarity.
const initialNumberString = textSegments[0];
const thresholdNumberString = textSegments[1];

// Convert the string segments into base-10 integer numbers.
const startingValue = parseInt(initialNumberString, 10);
const maximumThreshold = parseInt(thresholdNumberString, 10);

// Validate that the parsed values are indeed valid numbers.
if (isNaN(startingValue) || isNaN(maximumThreshold)) {
    console.error("Input Error: One or both provided values are not valid numbers.");
    process.exit(1);
}

// --- Core Logic Initialization ---
// This variable will accumulate the count of successful doubling operations.
let numberOfDoublings = 0;

// This variable represents the value that will be progressively doubled in each iteration.
let currentIterativeValue = startingValue;

// A control flag to manage the loop's execution, offering an alternative to a complex `while` condition.
let shouldContinueLooping = true;

// Early exit condition: If the starting value is already greater than the maximum threshold,
// no doubling operations can occur, so we can pre-emptively stop.
if (currentIterativeValue > maximumThreshold) {
    shouldContinueLooping = false; // Prevent the loop from running even once.
}

// --- Doubling Calculation Loop ---
// The loop continues as long as the control flag is true AND the current value
// does not exceed the defined maximum threshold.
while (shouldContinueLooping && currentIterativeValue <= maximumThreshold) {
    // Increment the counter for each completed doubling step.
    // This is an alternative to the shorthand 'numberOfDoublings++'.
    numberOfDoublings = numberOfDoublings + 1;

    // Double the current value. This is an alternative to the shorthand 'currentIterativeValue *= 2'.
    currentIterativeValue = currentIterativeValue + currentIterativeValue;

    // Optional: Add a check for potential numeric overflow if values could become extremely large.
    // While unlikely for typical inputs in this problem, it's a demonstration of added validation.
    if (currentIterativeValue > Number.MAX_SAFE_INTEGER) {
        console.warn("Warning: The current iterative value has exceeded JavaScript's safe integer limit. Calculations beyond this point might lose precision.");
        // For more robust applications, one might switch to BigInt or stop processing here.
    }
}

// --- Output Result ---
// Display the total number of doubling operations performed to the console.
console.log(numberOfDoublings);