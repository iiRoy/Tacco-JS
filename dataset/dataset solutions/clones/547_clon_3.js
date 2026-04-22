const fileSystemModule = require('fs');

const standardInputSourcePath = '/dev/stdin';

// --- Input Acquisition ---
// Retrieve all content from the standard input as a UTF-8 encoded string.
let rawStreamData = fileSystemModule.readFileSync(standardInputSourcePath, 'utf8');

// --- Initial Data Preparation ---
// Trim leading/trailing whitespace from the raw input and split it into an array of lines.
// Filter out any completely empty lines that might have resulted from the split operation.
let documentLines = rawStreamData
    .trim()
    .split('\n')
    .filter(lineContent => lineContent.length > 0);

// --- Configuration Parsing ---
// The very first line of the input is expected to specify the total number of data records to process.
let recordsCountText = documentLines.shift(); // Remove the first line and store its content.

let maximumProcessingIterations = 0; // Initialize a variable to hold the parsed iteration limit.

// Attempt to parse the number of records, including validation for malformed or missing input.
if (recordsCountText) {
    let parsedNumericLimit = parseInt(recordsCountText, 10);
    if (!isNaN(parsedNumericLimit) && parsedNumericLimit >= 0) {
        maximumProcessingIterations = parsedNumericLimit;
    } else {
        // Report a warning if the record count is invalid (e.g., non-numeric, negative).
        console.warn("Input Warning: Invalid or negative number of data entries specified. Proceeding with zero entries.");
    }
} else {
    // Report a warning if the line specifying the record count is missing.
    console.warn("Input Warning: No data entry count line found in the provided input. Proceeding with zero entries.");
}

// --- Score Accumulation Setup ---
// Initialize an object to maintain the running totals for two distinct score categories.
const accumulatedScores = {
    firstCategoryTotal: 0, // Accumulator for the first score category.
    secondCategoryTotal: 0  // Accumulator for the second score category.
};

// --- Helper Function for Line Parsing ---
// Encapsulates the logic for parsing a single line of data into a pair of numbers, with validation.
const extractNumericPair = (lineStr) => {
    // Split the line by spaces and attempt to convert each part to a number.
    const partsAsNumbers = lineStr.split(' ').map(Number);

    // Validate that exactly two valid numbers were extracted.
    if (partsAsNumbers.length === 2 && !isNaN(partsAsNumbers[0]) && !isNaN(partsAsNumbers[1])) {
        return partsAsNumbers;
    }
    return null; // Return null if the line cannot be parsed into a valid pair.
};

// --- Main Data Processing Loop ---
// Iterate through the remaining lines, processing up to the defined maximum iterations.
let iterationCounter = 0;
while (iterationCounter < maximumProcessingIterations && documentLines.length > 0) {
    const currentDataLine = documentLines.shift(); // Obtain the next line from the document.

    // Attempt to parse the current data line using the helper function.
    const numericDataPair = extractNumericPair(currentDataLine);

    if (numericDataPair === null) {
        // If parsing failed, log a warning and skip this particular data entry.
        console.warn(`Processing Warning: Skipping malformed or invalid data entry: "${currentDataLine}"`);
        iterationCounter++; // Still count this towards the iteration limit.
        continue;
    }

    const primaryValue = numericDataPair[0];
    const secondaryValue = numericDataPair[1];

    // Calculate the sum of the two values for potential use in scoring.
    const currentValuesSum = primaryValue + secondaryValue;

    // Apply the specific scoring logic based on the comparison of the two values.
    if (primaryValue > secondaryValue) {
        // If the primary value is greater, add the sum of both values to the first category.
        accumulatedScores.firstCategoryTotal += currentValuesSum;
    } else if (secondaryValue > primaryValue) {
        // If the secondary value is greater, add the sum of both values to the second category.
        accumulatedScores.secondCategoryTotal += currentValuesSum;
    } else { // primaryValue === secondaryValue (It's a tie)
        // In case of a tie, add each value to its respective category.
        accumulatedScores.firstCategoryTotal += primaryValue;
        accumulatedScores.secondCategoryTotal += secondaryValue; // Equivalent to primaryValue here.
    }

    iterationCounter++; // Increment the count of processed iterations.
}

// --- Final Output Generation ---
// Construct the final output string, joining the two accumulated scores with a space.
const finalComputedResult = `${accumulatedScores.firstCategoryTotal} ${accumulatedScores.secondCategoryTotal}`;

// Display the final aggregated scores to the standard output.
console.log(finalComputedResult);