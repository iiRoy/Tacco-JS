// This JavaScript module orchestrates a simple stack-based operation
// by processing lines read from standard input.
// It either pushes a numeric value onto an internal data structure
// or pops and displays the last element if the input is non-numeric or zero.

// Defining symbolic constants for external resource paths and data formats.
const STANDARD_INPUT_DEVICE_PATH = "/dev/stdin";
const TEXT_ENCODING_STANDARD = "utf8";

// The primary data structure, acting as a Last-In-First-Out (LIFO) stack.
let processingStack = [];

// A helper function to evaluate if an input string represents a "truthy" number.
// This mimics the behavior of the unary plus operator (`+`) in JavaScript,
// where '0' evaluates to 0 (falsy), and non-numeric strings or empty strings
// evaluate to NaN (falsy). Only non-zero, finite numbers are considered truthy.
const isSignificantNumericEntry = (potentialNumericString) => {
    const numericalConversion = Number(potentialNumericString);
    // Check if the conversion resulted in a valid, finite number, and is not zero.
    // This accurately reflects `+someString ? ...` where `0` and `NaN` are falsy.
    return !isNaN(numericalConversion) && Number.isFinite(numericalConversion) && numericalConversion !== 0;
};

// Safely acquire the Node.js 'fs' (file system) module.
// This is a robust check, ensuring the script can only run in an environment
// where file system operations are supported.
let fileSystemUtility;
try {
    fileSystemUtility = require("fs");
} catch (moduleLoadError) {
    // If 'fs' module is unavailable, log an error and terminate execution.
    console.error("Critical Error: The 'fs' module could not be loaded. This script requires a Node.js runtime environment.");
    process.exit(1); // Exit with a non-zero code to indicate failure.
}

// Read the entire content from the designated standard input path.
// The `.trim()` method on the overall content ensures that any leading or
// trailing whitespace or newlines for the *entire file* are removed before splitting.
const rawInputContentBuffer = fileSystemUtility.readFileSync(STANDARD_INPUT_DEVICE_PATH, TEXT_ENCODING_STANDARD);
const allInputLines = rawInputContentBuffer.trim().split('\n');

// Initialize a counter to track the number of lines processed.
let entryCounter = 0;

// Iterate through each line extracted from the input.
for (const currentInputLine of allInputLines) {
    entryCounter++; // Increment the counter for each line encountered.

    // Remove any leading or trailing whitespace from the current line for accurate parsing.
    const sanitizedLineData = currentInputLine.trim();

    // Conditional logic: Check if the sanitized line represents a value to be pushed or an action to pop.
    if (isSignificantNumericEntry(sanitizedLineData)) {
        // If the line is a "truthy" number (non-zero), push its original string form onto the stack.
        processingStack.push(sanitizedLineData);
    } else {
        // If it's a "falsy" number (zero) or non-numeric, attempt a pop operation.
        // Implement a guard clause to prevent attempting to pop from an empty stack.
        if (processingStack.length > 0) {
            const retrievedElement = processingStack.pop();
            // Output the retrieved element to standard console.
            console.log(retrievedElement);
        } else {
            // Log a warning message if a pop operation is attempted on an empty stack.
            // This provides helpful debugging information without altering the primary output stream.
            console.warn(`[Line ${entryCounter}] Notice: Pop operation attempted on an empty stack with input value: '${sanitizedLineData}'.`);
        }
    }
}