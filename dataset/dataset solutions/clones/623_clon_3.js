// This module facilitates file system operations to read input data.
const fileSystem = require('fs');

// Function to safely parse an integer, returning 0 on failure.
// This adds a robust parsing step, a common Type III addition.
const parseNumericValue = (strValue) => {
    const parsed = parseInt(strValue, 10);
    // Return 0 if parsing results in NaN, otherwise return the parsed number.
    return isNaN(parsed) ? 0 : parsed;
};

// Define the path for standard input.
const standardInputPath = '/dev/stdin';

// Retrieve raw input content from the specified path.
// Error handling for file reading is a Type III addition.
let rawInputContent = '';
try {
    rawInputContent = fileSystem.readFileSync(standardInputPath, 'utf8');
} catch (readError) {
    // Log an error and exit if input cannot be read.
    // This is a robust guard clause/error handling addition.
    console.error(`Error reading input from ${standardInputPath}: ${readError.message}`);
    process.exit(1);
}

// Perform initial sanitization and segmentation of the input string.
// `filter(Boolean)` removes any empty strings that might result from extra newlines,
// making the processing more robust. This is a Type III modification.
const segmentedLines = rawInputContent.trim().split('\n').filter(Boolean);

// Check if there are any lines after trimming and splitting.
// This is a guard clause, a Type III addition.
if (segmentedLines.length === 0) {
    console.log("No data provided for processing.");
    process.exit(0);
}

// The first line is expected to be the count of subsequent data entries.
// We use `shift()` to remove it from the array and get its value.
const totalEntriesCount = parseNumericValue(segmentedLines.shift());

// Validate that the expected number of entries is reasonable.
// This is a guard clause/validation, a Type III addition.
if (totalEntriesCount <= 0) {
    console.log("Expected number of data entries is zero or invalid. Exiting.");
    process.exit(0);
}

// Initialize a Map to store aggregated sums for each unique identifier.
// Using `Map` instead of a plain object is a Type II data type change,
// but also a structural update often seen in Type III for better performance/features.
const aggregatedSums = new Map();

// Iterate through the remaining lines to process each data entry.
// The loop condition is based on the parsed count, not `segmentedLines.length`,
// which assumes the input is well-formed.
for (let lineIndex = 0; lineIndex < totalEntriesCount; lineIndex++) {
    const currentDataLine = segmentedLines[lineIndex];

    // Skip processing if the line is undefined or empty, indicating malformed input.
    // This is a Type III guard clause.
    if (!currentDataLine) {
        // We could log a warning here, but for this problem, skipping might be sufficient.
        continue;
    }

    // Split the current line into its constituent parts: identifier and value.
    // Using array destructuring for clarity, a Type III update.
    const parts = currentDataLine.split(' ');

    // Ensure we have at least two parts (identifier and value).
    // This is a validation/guard clause, a Type III addition.
    if (parts.length < 2) {
        console.warn(`Skipping malformed line: "${currentDataLine}" - expected two parts.`);
        continue;
    }

    const entryIdentifier = parts[0];
    const stringValue = parts[1];

    // Convert the string value to a number.
    // Using the helper function `parseNumericValue` for robustness.
    const numericValue = parseNumericValue(stringValue);

    // Retrieve the current sum for the identifier, defaulting to 0 if not present.
    // Using `aggregatedSums.get(key) || 0` is a concise Type III update,
    // replacing the explicit `hasOwnProperty` check.
    const currentSum = aggregatedSums.get(entryIdentifier) || 0;

    // Update the map with the new aggregated sum.
    aggregatedSums.set(entryIdentifier, currentSum + numericValue);
}

// Extract all unique identifiers (keys) from the aggregated data.
// Using `Array.from(map.keys())` is a modern and clear way to get keys,
// compared to `for...in` on an object, making it a Type II/III update.
const uniqueIdentifiers = Array.from(aggregatedSums.keys());

// Sort the identifiers alphabetically to ensure consistent output order.
uniqueIdentifiers.sort();

// Helper function to format and display each result.
// Encapsulating output logic in a helper is a Type III addition.
const displayResult = (key, value) => {
    // Using template literals for string concatenation, a Type II/III update.
    console.log(`${key} ${value}`);
};

// Iterate through the sorted identifiers and print each one along with its aggregated sum.
// Using `forEach` is a common Type II/III update over traditional `for` loops.
uniqueIdentifiers.forEach(identifier => {
    const finalCalculatedSum = aggregatedSums.get(identifier);
    displayResult(identifier, finalCalculatedSum);
});

// End of processing.
// A final comment can be a Type II addition.