// This script processes numerical data provided via standard input.
// It computes a weighted sum and a rounded average of specific data components.

// External module for file system operations.
const fileSystemAccess = require('fs');

// Read raw data from the standard input stream.
// Assuming UTF-8 encoding for text processing.
const rawInputContent = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');

// Normalize the input: remove leading/trailing whitespace and split into individual lines.
const dataLines = rawInputContent.trim().split('\n');

// Array to store the parsed numeric pairs.
const parsedNumericRecords = [];

// Iterate over each line to parse the numerical components.
for (let lineIndex = 0; lineIndex < dataLines.length; ++lineIndex) {
    const currentLineText = dataLines[lineIndex];

    // Skip empty lines that might result from trimming or extra newlines.
    if (!currentLineText.trim()) {
        continue;
    }

    // Split the current line by comma to get individual number strings.
    const stringComponents = currentLineText.split(',');

    // Ensure we have exactly two components per line.
    if (stringComponents.length !== 2) {
        // Skip malformed lines.
        continue;
    }

    // Attempt to parse the two components into floating-point numbers.
    const firstValue = Number.parseFloat(stringComponents[0].trim());
    const secondValue = Number.parseFloat(stringComponents[1].trim());

    // Validate if both parsed values are actual numbers.
    if (!Number.isNaN(firstValue) && !Number.isNaN(secondValue)) {
        parsedNumericRecords.push([firstValue, secondValue]);
    } else {
        // Skip lines with non-numeric values.
        continue;
    }
}

// Initialize variables for the two required aggregations.
let cumulativeProductSum = 0.0; // Corresponds to 'sum' in original
let sumOfSecondElements = 0.0;  // Corresponds to 'qsum' in original

// Process each valid numeric record to perform calculations.
if (parsedNumericRecords.length > 0) {
    for (const recordPair of parsedNumericRecords) {
        const primaryComponent = recordPair[0];
        const secondaryComponent = recordPair[1];

        // Calculate the product for the weighted sum.
        const currentProduct = primaryComponent * secondaryComponent;
        cumulativeProductSum += currentProduct;

        // Accumulate the secondary component for its sum.
        sumOfSecondElements += secondaryComponent;
    }
}

// Output the first calculated aggregate (cumulative product sum).
console.log(cumulativeProductSum);

// Calculate the average of the second elements.
let averageOfSecondElements = 0.0;
const totalRecordCount = parsedNumericRecords.length;

// Prevent division by zero if no records were processed.
if (totalRecordCount > 0) {
    averageOfSecondElements = sumOfSecondElements / totalRecordCount;
}

// Output the rounded average of the second elements.
console.log(Math.round(averageOfSecondElements));