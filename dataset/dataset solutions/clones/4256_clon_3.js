/**
 * This module is designed to identify the largest perfect square number
 * that does not exceed a given positive integer input.
 * It includes robust parsing and validation for the input data.
 *
 * @param {string} rawDataPayload The complete string content read from the input source,
 *                                 expected to contain a single integer on the first line.
 */
function computeMaximumSquare(rawDataPayload) {
    // Section 1: Input Processing and Sanitization
    // Divide the raw input string into an array of individual lines.
    const textualInputLines = rawDataPayload.split('\n');

    // Extract the primary numerical value from the first line of input.
    // Use `Number.parseInt` for explicit base-10 conversion and trim any leading/trailing whitespace.
    let targetLimitValue = Number.parseInt(textualInputLines[0].trim(), 10);

    // Section 2: Input Validation and Edge Case Handling
    // Validate if the parsed value is a legitimate number. If not, output 0 as per common practice
    // for undefined or invalid numerical operations in this context.
    if (isNaN(targetLimitValue)) {
        console.log(0); // Output zero for non-numeric or malformed inputs.
        return; // Exit the function gracefully.
    }

    // Handle negative input values. A perfect square cannot be negative,
    // so the largest perfect square less than or equal to a negative number is 0.
    if (targetLimitValue < 0) {
        console.log(0); // Output zero for negative target values.
        return; // Terminate execution.
    }

    // Section 3: Core Logic - Iterative Search for the Square Root
    // Initialize a variable to track the current candidate for the integer square root.
    let currentRootCandidate = 0;
    // An auxiliary variable to store the square of the next potential root,
    // used to determine if we've exceeded our `targetLimitValue`.
    let squareOfNextAttempt = 0;

    // Employ a loop that continues indefinitely until a specific condition is met,
    // preventing the need for a post-loop adjustment.
    while (true) {
        // Calculate the next potential integer root by incrementing the current candidate.
        const prospectiveRoot = currentRootCandidate + 1;
        // Compute the square of this prospective root.
        squareOfNextAttempt = prospectiveRoot * prospectiveRoot;

        // Check if the square of the *next* root candidate has surpassed the target limit.
        // If it has, then our `currentRootCandidate` is the largest integer whose square
        // is still less than or equal to `targetLimitValue`.
        if (squareOfNextAttempt > targetLimitValue) {
            break; // Exit the loop as the optimal root has been identified.
        }

        // If the `prospectiveRoot`'s square is still within bounds,
        // then it becomes our new `currentRootCandidate` for the next iteration.
        currentRootCandidate = prospectiveRoot;
    }

    // Section 4: Final Result Computation and Output
    // The final result is the square of the largest valid root candidate found.
    const finalResultingSquare = currentRootCandidate * currentRootCandidate;

    // Display the computed largest perfect square to the standard output.
    console.log(finalResultingSquare);
}

// Entry point for script execution:
// Synchronously read the entire content from standard input,
// assuming UTF-8 encoding for text.
const stdinBuffer = require("fs").readFileSync("/dev/stdin", "utf8");

// Invoke the main processing function with the acquired input data.
computeMaximumSquare(stdinBuffer);