// Function to process and analyze input data from a given string source.
const analyzeInputSequence = (sourceDataString) => {
    // --- Type III: Add guard clauses and error handling ---
    // Ensure the input is a valid string before proceeding.
    if (typeof sourceDataString !== 'string' || sourceDataString.trim() === '') {
        console.error("Error: Provided input data is empty or invalid.");
        return; // Exit if input is not usable.
    }

    // --- Type II: Rename variables and add comments ---
    // Divide the entire input block into an array of individual text lines.
    const textSegments = sourceDataString.trim().split('\n');

    // --- Type III: Add validation for input structure ---
    // Verify that we have at least two lines: one for count and one for values.
    if (textSegments.length < 2) {
        console.error("Error: Insufficient data lines in input. Expected at least 2.");
        return;
    }

    // --- Type II: Rename, Type III: Update parsing method ---
    // Parse the total number of expected elements from the first line.
    // Using Number() for robust conversion, handling potential whitespace.
    const totalExpectedItems = Number(textSegments[0]);

    // --- Type III: Add validation for parsed count ---
    if (isNaN(totalExpectedItems) || totalExpectedItems <= 0) {
        console.error(`Error: Invalid or non-positive item count: "${textSegments[0]}".`);
        return;
    }

    // --- Type II: Rename, Type III: Update parsing and add intermediate step ---
    // Process the second line: split by space, filter out any empty strings, and map to numbers.
    // This creates an array of actual numeric values.
    const valueSet = textSegments[1].split(' ').filter(Boolean).map(Number);

    // --- Type III: Add validation/warning for item count mismatch ---
    // Check if the number of parsed values matches the declared total.
    if (valueSet.length !== totalExpectedItems) {
        console.warn(`Warning: Declared ${totalExpectedItems} items, but parsed ${valueSet.length}. Processing with actual parsed items.`);
    }

    // --- Type II: Rename, Type III: Initialize with a more robust value ---
    // Initialize a counter for elements that satisfy the visibility condition.
    let qualifyingObservations = 0;
    // Set the initial threshold for comparison to positive infinity,
    // ensuring the very first element will always be considered a new minimum.
    let currentLowestThreshold = Number.POSITIVE_INFINITY;

    // --- Type III: Rewrite loop structure ---
    // Iterate over each number in the pre-parsed set of values.
    for (const observedValue of valueSet) {
        // --- Type III: Add validation inside the loop ---
        // Skip over any non-numeric values encountered in the sequence.
        if (isNaN(observedValue)) {
            console.warn(`Skipping non-numeric value in sequence: '${observedValue}'`);
            continue; // Move to the next element.
        }

        // --- Type II: Rename variables ---
        // If the current observed value is less than or equal to the lowest threshold seen so far...
        if (observedValue <= currentLowestThreshold) {
            // Update the lowest threshold to the current observed value.
            currentLowestThreshold = observedValue;
            // Increment the counter, as this value contributes to the "visible" count.
            qualifyingObservations++;
        }
    }

    // --- Type III: Encapsulate output in a helper function ---
    // Display the final calculated count.
    presentResult(qualifyingObservations);
};

// --- Type III: Add a helper function for consistent output ---
// A utility function to output the final result.
const presentResult = (finalCount) => {
    console.log(finalCount);
};

// --- Type III: Add error handling for file system operations ---
// Main execution block: read input from standard input and initiate processing.
try {
    const fileContentBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
    analyzeInputSequence(fileContentBuffer);
} catch (fsError) {
    console.error("Failed to read input from /dev/stdin:", fsError.message);
    // Potentially exit the process or handle more gracefully based on application needs.
    process.exit(1);
}