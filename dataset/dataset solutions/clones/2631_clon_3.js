/**
 * This module defines a primary function to process raw textual input,
 * extracting numerical data and performing a specific mathematical calculation.
 * It's designed to read two lines of input: a count, and a sequence of numbers.
 * The core logic involves summing the reciprocals of the provided numbers
 * and then outputting the reciprocal of that sum.
 *
 * @param {string} rawInputPayload The complete multi-line string received from an input source.
 */
function computeDerivedValueFromPayload(rawInputPayload) {
    // Break down the incoming input string into an array of individual lines.
    // Each line represents a distinct piece of information.
    const inputLines = rawInputPayload.split('\n');

    // Introduce a basic validation step: ensure the input contains at least two lines.
    // This adds a minor robustness feature not present in the original.
    if (inputLines.length < 2) {
        // Log an error to standard error stream if input is malformed.
        console.error("Error: Insufficient data lines provided in the input payload.");
        // In a production system, one might throw an exception or return a specific error code.
        // For this cloning exercise, we'll simply terminate processing.
        return;
    }

    // The first line of input is expected to be a string representing the total number of elements to process.
    // We parse it explicitly into an integer, using base 10 for clarity.
    const numericalElementCount = parseInt(inputLines[0].trim(), 10);

    // The second line contains a sequence of numbers, separated by spaces.
    const spaceDelimitedNumbersString = inputLines[1].trim();

    // Split the string of numbers into an array of stringified numeric tokens.
    const individualNumericTokens = spaceDelimitedNumbersString.split(' ');

    // Convert the array of string tokens into an array of actual floating-point numbers.
    // We use `slice` to ensure we only process up to `numericalElementCount` elements,
    // mirroring the original loop's behavior even if more numbers are present.
    const actualNumbersArray = individualNumericTokens
                                .slice(0, numericalElementCount)
                                .map(token => parseFloat(token));

    // Initialize an accumulator for the sum of reciprocals.
    // Using `let` as this variable's value will be updated iteratively.
    let runningReciprocalSummation = 0.0; // Explicitly using a float literal.

    // Iterate through the array of actual numbers for the calculation.
    // The loop runs precisely `numericalElementCount` times, as determined by the first input line.
    for (let indexPosition = 0; indexPosition < numericalElementCount; ++indexPosition) {
        // Retrieve the current numeric value from the processed array.
        const currentDataPoint = actualNumbersArray[indexPosition];

        // Add the reciprocal of the current number to the running total.
        // JavaScript handles division by zero by producing `Infinity`,
        // and subsequently `1/Infinity` results in `0`, which matches the original logic.
        runningReciprocalSummation += (1.0 / currentDataPoint);
    }

    // Compute the final desired value: the reciprocal of the accumulated sum of reciprocals.
    const finalCalculatedOutput = 1.0 / runningReciprocalSummation;

    // Display the final result to the standard output stream.
    console.log(finalCalculatedOutput);
}

// --- Primary Script Execution Block ---
// This section is responsible for reading input from the standard input stream
// and initiating the data processing workflow.

// Acquire a reference to the Node.js built-in 'fs' (file system) module.
const fileSystemUtility = require("fs");

// Define the conventional path for reading standard input on Unix-like systems.
const standardInputDevicePath = "/dev/stdin";

// Specify the character encoding to be used when reading the input file.
const inputContentEncoding = "utf8";

// Synchronously read the entire content from the standard input device.
// The result is expected to be a string containing all input data.
const rawContentFromSystemInput = fileSystemUtility.readFileSync(standardInputDevicePath, inputContentEncoding);

// Invoke the main processing function with the content obtained from stdin.
computeDerivedValueFromPayload(rawContentFromSystemInput);