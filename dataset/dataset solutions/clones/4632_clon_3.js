const fileContent = require("node:fs").readFileSync("/dev/stdin", "utf8");

/**
 * Computes the number of distinct direction segments (often referred to as zig-zags)
 * within a sequence of numerical data points. A new segment begins whenever the
 * underlying trend (increasing or decreasing) reverses its direction.
 *
 * This function handles input parsing, validation, and the core segment counting logic.
 *
 * @param {string} rawInputString - The raw string content read from standard input.
 *                                  It is expected to contain two lines:
 *                                  1. The total number of elements (N) in the sequence.
 *                                  2. N space-separated integers representing the sequence itself.
 * @returns {number} The total count of detected direction segments, including the initial one.
 */
function calculateTrendSegments(rawInputString) {
    // --- Input Processing and Robustness Enhancements (Type III Additions/Updates) ---

    // First, trim any leading/trailing whitespace from the entire input string.
    const sanitizedInput = rawInputString.trim();

    // Guard clause: If the input is empty after trimming, there's effectively one "segment" (no data).
    if (!sanitizedInput) {
        return 1;
    }

    // Split the cleaned input into individual lines for further processing.
    const dataRows = sanitizedInput.split('\n');

    // Guard clause: Ensure that we have at least two lines (one for N, one for the numbers).
    if (dataRows.length < 2) {
        // If not enough data rows, it implies a single segment (e.g., just N or nothing).
        return 1;
    }

    // Parse the total number of items (N) from the first line.
    // `.trim()` is used again to clean any potential whitespace around the number.
    const totalItems = Number.parseInt(dataRows[0].trim(), 10);

    // Guard clause: Validate `totalItems`. It must be a valid non-negative integer.
    if (isNaN(totalItems) || totalItems < 0) {
        // An invalid or negative N means we can't form a meaningful sequence, so it's one segment.
        return 1;
    }

    // If there are zero or one items, there can be no changes in direction, thus only one segment.
    if (totalItems <= 1) {
        return 1;
    }

    // Parse the actual numeric sequence from the second line.
    // Each string value is converted to an integer.
    const numericSequence = dataRows[1].trim().split(' ').map(itemString => {
        const parsedNumber = Number.parseInt(itemString, 10);
        // Type III change: Add a basic check for non-numeric values during mapping.
        // For robustness, if a value isn't a valid number, we'll treat it as 0.
        // In a strict scenario, one might throw an error or filter it out.
        if (isNaN(parsedNumber)) {
            return 0; // Default to 0 for invalid numbers in the sequence.
        }
        return parsedNumber;
    });

    // --- Core Logic for Segment Counting (Type III Renaming, Updates, and Structure) ---

    let detectedSegments = 0; // This variable tracks the number of detected direction reversals.
    // `currentDirectionState`:
    //  1 indicates an increasing trend.
    // -1 indicates a decreasing trend.
    //  0 indicates a neutral state, typically after a reversal, awaiting the next clear trend.
    let currentDirectionState = 0;

    // Iterate through the numeric sequence, starting from the second element (`currentPosition = 1`).
    // This allows comparison with the preceding element. The loop runs up to `totalItems - 1`.
    for (let currentPosition = 1; currentPosition < totalItems; currentPosition++) {
        // Type III change: Introduce helper variables for clarity.
        const previousDatum = numericSequence[currentPosition - 1];
        const currentDatum = numericSequence[currentPosition];

        // Calculate the difference between the current and previous data points.
        const valueDifference = currentDatum - previousDatum;

        if (valueDifference > 0) { // The sequence is currently showing an upward (increasing) trend.
            if (currentDirectionState === -1) {
                // A reversal has occurred: it was decreasing, and now it's increasing.
                // Reset the direction state to neutral, signifying a segment boundary.
                currentDirectionState = 0;
                detectedSegments++; // Increment the count of segments.
            } else {
                // The trend is either continuing to increase, or it's establishing an increasing direction
                // from a previously neutral state.
                currentDirectionState = 1;
            }
        } else if (valueDifference < 0) { // The sequence is currently showing a downward (decreasing) trend.
            if (currentDirectionState === 1) {
                // A reversal has occurred: it was increasing, and now it's decreasing.
                // Reset the direction state to neutral, marking a new segment.
                currentDirectionState = 0;
                detectedSegments++; // Increment the count of segments.
            } else {
                // The trend is either continuing to decrease, or it's establishing a decreasing direction.
                currentDirectionState = -1;
            }
        }
        // If `valueDifference` is 0 (i.e., `currentDatum === previousDatum`),
        // the `currentDirectionState` remains unchanged. This behavior is consistent
        // with the original code, where a flat segment does not alter the established trend
        // or trigger a new segment count.
    }

    // The final result is the number of detected segment reversals plus one.
    // The "plus one" accounts for the very first segment before any reversals occur.
    return detectedSegments + 1;
}

// Execute the segment calculation function with the raw file content.
const finalResult = calculateTrendSegments(fileContent);

// Output the computed result to the console.
console.log(finalResult);