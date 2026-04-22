// Configuration object to manage external resource paths and delimiters.
const ioSettings = {
    sourcePath: '/dev/stdin', // This constant defines the file path for input data.
    lineSeparator: '\n'        // This constant specifies the character used to separate lines in the input.
};

// Obtain a reference to the Node.js file system module for synchronous operations.
const fileSystemModule = require('fs');

// --- Data Acquisition and Initial Processing ---

// Variable to hold the raw content read from the input source.
let rawInputContent;
try {
    // Attempt to read the entire file content from the specified source path.
    // The content is decoded as UTF-8 text.
    rawInputContent = fileSystemModule.readFileSync(ioSettings.sourcePath, { encoding: 'utf-8' });
} catch (readingError) {
    // If an error occurs during file reading (e.g., file not found, permission issues),
    // log the error and terminate the process gracefully.
    console.error("Failed to retrieve input data:", readingError.message);
    process.exit(1); // Exit with a non-zero status code to indicate an error.
}

// Split the raw content into an array of individual lines using the defined separator.
// Filter out any lines that are empty or contain only whitespace after trimming.
const processedDataLines = rawInputContent
    .split(ioSettings.lineSeparator)
    .filter(segment => segment.trim() !== '');

// --- Input Validation and Numerical Conversion ---

// Validate that there are sufficient lines to perform the required calculations.
// We need at least two effective data points: one for the initial reference and one for comparison.
if (processedDataLines.length < 2) {
    console.error("Insufficient meaningful data lines provided. Expected at least two non-empty lines.");
    process.exit(1);
}

// Declare an array to store the successfully parsed numerical measurements.
let numericalMeasurements = [];

// Iterate through the processed data lines, excluding the very first and very last ones,
// as per the original problem's implicit range handling (e.g., header/footer lines).
// The loop starts from the second line (index 1) and goes up to, but not including, the last line.
for (let idx = 1; idx < processedDataLines.length - 1; idx++) {
    const stringValue = processedDataLines[idx].trim(); // Get and trim the current line.
    const numericForm = parseInt(stringValue, 10);      // Attempt to parse it as an integer (base 10).

    // Check if the parsed value is a valid number.
    if (!isNaN(numericForm)) {
        numericalMeasurements.push(numericForm); // Add valid numbers to our collection.
    } else {
        // Log a warning for any lines that cannot be converted into a valid number.
        console.warn(`Skipping invalid numeric entry on line ${idx + 1}: '${stringValue}'`);
    }
}

// After parsing, ensure that we still have valid numerical data points to work with.
if (numericalMeasurements.length === 0) {
    console.error("No valid numeric measurements could be extracted for analysis.");
    process.exit(1);
}

// --- Core Algorithm: Maximum Difference Calculation ---

// The first valid numeric measurement serves as the initial reference point.
const initialReferencePoint = numericalMeasurements[0];

// The remaining measurements, from the second element onwards, are used for comparison.
const subsequentMeasurementPoints = numericalMeasurements.slice(1);

// Initialize a variable to track the maximum difference found.
// It is set to negative infinity because we are looking for the largest possible positive difference.
let maximumObservedDifference = -Infinity;

// Initialize a variable to keep track of the minimum value encountered so far during iteration.
// This is crucial for calculating potential differences.
let currentLowestValueEncountered = initialReferencePoint;

// If there are no subsequent measurement points, no differences can be computed.
// In such a case, the maximum observed difference remains -Infinity as initialized.
if (subsequentMeasurementPoints.length === 0) {
    console.log(maximumObservedDifference);
    process.exit(0);
}

// Iterate over each measurement point in the subsequent array.
for (const individualValue of subsequentMeasurementPoints) {
    // Calculate the difference between the current individual value and the lowest value seen so far.
    // This represents a potential "profit" if buying at `currentLowestValueEncountered` and selling at `individualValue`.
    const computedDifference = individualValue - currentLowestValueEncountered;

    // Update the overall maximum observed difference if the current computed difference is greater.
    if (computedDifference > maximumObservedDifference) {
        maximumObservedDifference = computedDifference;
    }

    // Update the `currentLowestValueEncountered` if the `individualValue` is lower than the current minimum.
    // This ensures we always track the absolute minimum value up to the current point in the sequence.
    if (individualValue < currentLowestValueEncountered) {
        currentLowestValueEncountered = individualValue;
    }
}

// --- Output Final Result ---

// Display the final maximum difference calculated by the algorithm.
console.log(maximumObservedDifference);