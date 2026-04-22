const fileSystemHandler = require('node:fs'); // Import Node.js file system module for I/O operations.

let fileBufferContent; // Variable to hold the raw content read from the input source.
try {
    // Attempt to read the entire file synchronously from the standard input path.
    // The content is then converted to a UTF-8 string.
    fileBufferContent = fileSystemHandler.readFileSync('/dev/stdin').toString('utf8');
} catch (inputReadError) {
    // If an error occurs during file access or reading, log the issue and terminate.
    console.error("Error encountered while accessing or reading standard input:", inputReadError.message);
    process.exit(1); // Exit with a non-zero status code to indicate an error.
}

// Perform an initial check for empty or whitespace-only input.
// If no meaningful data is provided, output default scores and exit cleanly.
if (!fileBufferContent.trim()) {
    console.log("0 0");
    process.exit(0); // Exit with a zero status code for successful completion.
}

// Split the entire input content into an array of individual lines.
// Filter out any lines that are empty or contain only whitespace to ensure valid data.
const processedDataLines = fileBufferContent.split('\n').filter(entryLine => entryLine.trim() !== '');

// The very first line is expected to contain the total count of subsequent data entries.
// Parse this line as an integer, ensuring base-10 interpretation.
const expectedEntryCount = parseInt(processedDataLines.shift(), 10);

// Initialize two primary accumulation variables for scoring or tallying purposes.
// These will store the results of processing the data entries.
let primaryScoreAccumulator = 0;
let secondaryScoreAccumulator = 0;

// Define a utility function to parse a string representing two space-separated numbers
// into an array of two integers. Includes basic validation.
const extractNumericPair = (inputLineString) => {
    const stringComponents = inputLineString.trim().split(' ');
    // If the line doesn't contain exactly two components, return an invalid pair.
    if (stringComponents.length !== 2) {
        return [NaN, NaN]; // Not a Number indicates a parsing failure.
    }
    // Parse both components as integers, specifying base 10.
    return [parseInt(stringComponents[0], 10), parseInt(stringComponents[1], 10)];
};

// Loop through the remaining data lines for the specified number of entries.
for (let currentIterationIndex = 0; currentIterationIndex < expectedEntryCount; ++currentIterationIndex) {
    // Retrieve the next line string from the array.
    const currentDataSetLine = processedDataLines.shift();

    // If there are fewer data lines than `expectedEntryCount`, log a warning
    // and break out of the loop to prevent errors from trying to process undefined.
    if (currentDataSetLine === undefined) {
        console.warn(`Warning: Expected ${expectedEntryCount} data entries, but only found ${currentIterationIndex} valid lines.`);
        break;
    }

    // Use the helper function to parse the current line into two numbers.
    const [firstValue, secondValue] = extractNumericPair(currentDataSetLine);

    // Validate that both extracted values are indeed numbers. If not, skip this line
    // and proceed to the next iteration after logging a warning.
    if (isNaN(firstValue) || isNaN(secondValue)) {
        console.warn(`Warning: Skipping malformed data entry: "${currentDataSetLine}" due to invalid numbers.`);
        continue; // Move to the next iteration of the loop.
    }

    // Calculate the sum of the two values for this data entry.
    const combinedValueSum = firstValue + secondValue;

    // Apply the specific scoring logic based on the comparison of the two values.
    if (firstValue > secondValue) {
        // If the first value is greater, add the sum to the primary accumulator.
        primaryScoreAccumulator = primaryScoreAccumulator + combinedValueSum;
    } else if (firstValue < secondValue) {
        // If the second value is greater, add the sum to the secondary accumulator.
        secondaryScoreAccumulator = secondaryScoreAccumulator + combinedValueSum;
    } else { // This condition executes when firstValue === secondValue.
        // In the case of equality, both accumulators are reset to the current values,
        // rather than accumulating. This is a crucial rule.
        primaryScoreAccumulator = firstValue;
        secondaryScoreAccumulator = secondValue;
    }
}

// Finally, output the computed scores of both accumulators, separated by a space.
console.log(`${primaryScoreAccumulator} ${secondaryScoreAccumulator}`);