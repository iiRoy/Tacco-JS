// This JavaScript module is designed to process numerical input from a standard source
// and subsequently generate a structured sequence of paired integer values.

// Import the core Node.js file system utilities to handle input operations.
const fileSystemHandler = require("fs");

// Declare a mutable variable to hold the entirety of the raw textual content
// obtained from the designated input stream.
let rawInputContent = '';

// Employ a defensive programming strategy to safely acquire data from the standard input.
// This typically targets `/dev/stdin` on POSIX-compliant systems.
try {
    rawInputContent = fileSystemHandler.readFileSync("/dev/stdin", "utf8");
} catch (dataReadError) {
    // Should an error occur during the file reading process, log the critical issue
    // and terminate the application gracefully with a non-zero exit code.
    console.error("CRITICAL: Failed to retrieve data from standard input. Reason:", dataReadError.message);
    process.exit(1);
}

// Conduct an initial validation check to ensure the input content is not merely empty
// or composed solely of whitespace characters.
if (!rawInputContent.trim()) {
    console.error("ERROR: The provided input stream contains no discernible data. Please populate `/dev/stdin`.");
    process.exit(1);
}

// Deconstruct the monolithic input string into an array of individual lines,
// utilizing the newline character as the primary delimiter.
const processedInputLines = rawInputContent.split('\n');

// Verify that at least one meaningful line of data is present for subsequent parsing.
if (processedInputLines.length === 0 || !processedInputLines[0].trim()) {
    console.error("ERROR: The input data does not contain any valid initial line for parameter extraction.");
    process.exit(1);
}

// Isolate the very first line of the input, which is expected to contain the
// primary operational parameters.
const firstParameterLine = processedInputLines[0];

// Further subdivide the parameter line into discrete textual tokens,
// using a space character as the separator.
const parameterTokens = firstParameterLine.split(' ');

// Define variables to store the two essential numerical parameters:
// 'initialMagnitude' corresponds to the original 'N'.
// 'iterationCount' corresponds to the original 'M'.
let initialMagnitude = 0;
let iterationCount = 0;

// Perform a structural validation on the parameter tokens to ensure
// the expected number of arguments is available.
if (parameterTokens.length < 2) {
    console.error("ERROR: Insufficient numerical parameters detected on the first line. Expected two values (N and M).");
    process.exit(1);
}

// Attempt to convert the first two string tokens into base-10 integers.
const firstNumericValue = parseInt(parameterTokens[0], 10);
const secondNumericValue = parseInt(parameterTokens[1], 10);

// Validate the success of the numerical parsing operations.
if (isNaN(firstNumericValue) || isNaN(secondNumericValue)) {
    console.error("ERROR: Failed to convert one or both of the initial parameters into valid integers.");
    process.exit(1);
}

// Assign the successfully parsed numerical values to their respective variables.
initialMagnitude = firstNumericValue;
iterationCount = secondNumericValue;

// Enforce a business logic rule: both primary input values must be strictly positive.
if (initialMagnitude <= 0 || iterationCount <= 0) {
    console.error("VALIDATION FAILED: Both 'N' (initialMagnitude) and 'M' (iterationCount) must be positive integers.");
    process.exit(1);
}

// Calculate an adjusted baseline value. This value represents the largest even integer
// that is less than or equal to 'initialMagnitude'. This is equivalent to `N - N % 2`.
let evenAdjustedBase;
const parityCheckResult = initialMagnitude % 2; // Determine if 'initialMagnitude' is odd or even.

if (parityCheckResult !== 0) {
    // If 'initialMagnitude' is odd, decrement it by one to make it even.
    evenAdjustedBase = initialMagnitude - 1;
} else {
    // If 'initialMagnitude' is already even, retain its original value.
    evenAdjustedBase = initialMagnitude;
}

// Initialize a counter for the iterative process, beginning from zero.
let currentLoopIndex = 0;

// Commence the primary processing loop, which will execute 'iterationCount' times.
while (currentLoopIndex < iterationCount) {
    // Calculate the first component of the output pair for the current iteration.
    // This value is simply the current loop index incremented by one.
    const outputComponentOne = currentLoopIndex + 1;

    // Calculate the second component of the output pair. This involves subtracting
    // the current loop index from the previously computed 'evenAdjustedBase'.
    const outputComponentTwo = evenAdjustedBase - currentLoopIndex;

    // Display the two calculated components to the standard output,
    // separated by a single space character.
    console.log(outputComponentOne + ' ' + outputComponentTwo);

    // Advance the loop counter to prepare for the subsequent iteration.
    currentLoopIndex++;
}

// The script has successfully completed its intended operations.
// No explicit return or exit is needed here as it's the end of the script execution.