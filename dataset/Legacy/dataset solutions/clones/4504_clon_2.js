/*
 * This module defines a function to process incoming data
 * and determine a specific status based on numerical comparisons.
 * The primary goal is to categorize an event or situation.
 */
function processInputData(rawData) {
    // First, split the entire raw string by spaces to get individual string components.
    // These components are expected to represent numerical values.
    const tokens = rawData.split(' ');

    // Convert the string tokens into integer numbers for arithmetic operations.
    // The base-10 radix is explicitly specified for robust parsing.
    const thresholdValue = parseInt(tokens[0], 10);
    const initialPoint = parseInt(tokens[1], 10);
    const finalPoint = parseInt(tokens[2], 10);

    // Evaluate the difference between the final and initial points.
    // This difference is crucial for determining the outcome.
    if (finalPoint - initialPoint <= 0) {
        // If the calculated difference is zero or negative,
        // a specific positive outcome is indicated.
        console.log("delicious");
        // Immediately terminate the function execution here,
        // as no further processing is required for this condition.
        return;
    }
    else {
        // If the difference is positive, further evaluation is necessary
        // against the predefined threshold.
        if (finalPoint - initialPoint < thresholdValue + 1) {
            // If the positive difference is within a certain safe range (less than threshold plus one),
            // a 'safe' status is reported.
            console.log("safe");
        }
        else {
            // Otherwise, if the difference exceeds the safe range,
            // a 'dangerous' status is indicated.
            console.log("dangerous");
        }
    }
}

// This is the primary execution block for the script.
// It reads content from standard input, typically used in competitive programming
// environments or command-line utilities. The input is expected to be UTF-8 encoded.
// The read content is then passed to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf-8'));