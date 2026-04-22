// This module is responsible for handling file system operations, specifically reading.
const dataSource = require("node:fs").readFileSync("/dev/stdin", "utf8");

// An Immediately Invoked Function Expression (IIFE) to encapsulate the processing logic.
// This design choice helps prevent global scope pollution and organizes the workflow.
((sourcePayload) => {
    // Split the entire raw input string into an array of individual lines.
    // Each element in 'contentSegments' will represent one line from the input.
    const contentSegments = sourcePayload.split('\n');

    // Attempt to parse the first line of input as the total count of data items expected.
    // Using Number.parseInt with radix 10 ensures proper numerical conversion.
    const expectedItemCount = Number.parseInt(contentSegments[0], 10);

    // --- Input Validation Section ---
    // Validate the parsed item count to ensure it's a valid, non-negative number.
    if (Number.isNaN(expectedItemCount) || expectedItemCount < 0) {
        // Log an error message to the standard error stream if the count is invalid.
        console.error("Error: The first line of input must specify a valid, non-negative integer for the item count.");
        return; // Terminate execution as input is malformed.
    }

    // Validate that the number of actual content lines matches the declared item count.
    // We expect 'expectedItemCount' data lines plus one line for the count itself.
    if (contentSegments.length < expectedItemCount + 1) {
        console.error("Error: Not enough data lines provided in the input for the declared item count.");
        return; // Terminate execution due to insufficient data.
    }
    // --- End Input Validation Section ---

    // Initialize a Map to store the frequency of each distinct item encountered.
    // A Map is used for its direct key-value mapping and potential performance benefits
    // over a plain object when keys are not strictly strings or can vary widely.
    const itemFrequencies = new Map();

    // Iterate through the data lines, starting from the second line (index 1),
    // up to the 'expectedItemCount' times.
    for (let currentLineIndex = 1; currentLineIndex <= expectedItemCount; ++currentLineIndex) {
        // Retrieve the raw data item for the current line.
        const currentDataItem = contentSegments[currentLineIndex];

        // Clean the data item: trim leading/trailing whitespace and handle potential undefined/null.
        // If 'currentDataItem' is falsy (e.g., undefined), default to an empty string.
        const cleanedDataItem = currentDataItem ? currentDataItem.trim() : '';

        // Skip processing if the cleaned data item is an empty string.
        // This handles blank lines or lines that become empty after trimming.
        if (cleanedDataItem === '') {
            continue; // Move to the next iteration.
        }

        // Get the current frequency of this item. If not seen before, default to 0.
        const existingFrequency = itemFrequencies.get(cleanedDataItem) || 0;

        // Update the frequency for the current item in the map.
        itemFrequencies.set(cleanedDataItem, existingFrequency + 1);
    }

    // Initialize a dedicated counter for items that appear exactly once.
    let singleOccurrenceItems = 0;

    // Iterate over all entries in the frequency map.
    // Destructuring assignment is used to easily access the key (item name) and value (frequency).
    for (const [itemKey, frequencyValue] of itemFrequencies.entries()) {
        // Check if the current item's frequency is exactly 1.
        if (frequencyValue === 1) {
            // If it is, increment our tally for single-occurrence items.
            singleOccurrenceItems++;
        }
    }

    // Output the final computed count of items that appeared only once to the console.
    console.log(singleOccurrenceItems);

})(dataSource); // Pass the raw input data to the IIFE.