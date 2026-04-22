const fileSystem = require("fs");

/**
 * Determines the frequency of a specific numeric value within a given array.
 * Includes basic validation for the input data structure.
 *
 * @param {Array<number>} dataCollection - The array of numbers to be scanned.
 * @param {number} targetValue - The numeric value whose occurrences are to be counted.
 * @returns {number} The total count of times `targetValue` appears in `dataCollection`.
 */
function calculateNumberFrequency(dataCollection, targetValue) {
    if (!Array.isArray(dataCollection) || dataCollection.length === 0) {
        // If the collection is not an array or is empty, it cannot contain the target.
        return 0;
    }

    let occurrenceCount = 0;
    // Iterate over each element using a modern for...of loop for clarity.
    for (const element of dataCollection) {
        if (element === targetValue) {
            occurrenceCount++;
        }
    }
    return occurrenceCount;
}

/**
 * Orchestrates the processing of raw input text to identify the maximum
 * combined frequency of a number and its immediate neighbors (x-1, x, x+1)
 * within a provided dataset.
 *
 * @param {string} rawInputContent - The complete string content read from the input source.
 */
function analyzeInputSeries(rawInputContent) {
    // Step 1: Validate and sanitize the initial input string.
    if (typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
        console.error("Input processing halted: The provided content is empty or not a valid string.");
        return;
    }

    // Step 2: Split the raw content into individual lines, discarding any blank lines.
    const contentLines = rawInputContent.split("\n").filter(line => line.trim() !== '');

    // Ensure there are at least two lines of meaningful data.
    if (contentLines.length < 2) {
        console.error("Input processing halted: Insufficient data lines found. Expected at least 2 lines.");
        return;
    }

    // Step 3: Parse the first line, which is typically an expected count of items.
    // The original problem structure reads this but doesn't strictly use it for array bounds.
    // We'll parse it and add a warning if it's invalid or inconsistent.
    const expectedSeriesLengthText = contentLines[0];
    const seriesExpectedCount = parseInt(expectedSeriesLengthText, 10);

    if (isNaN(seriesExpectedCount) || seriesExpectedCount <= 0) {
        console.warn(`Warning: The first line ('${expectedSeriesLengthText}') could not be parsed as a positive integer for series length. Proceeding without strict length validation.`);
    }

    // Step 4: Process the second line, which contains the space-separated numeric values.
    const numberStrings = contentLines[1].split(" ");

    // Step 5: Convert string representations to actual numeric values.
    // This includes robust parsing and filtering out non-numeric entries.
    const parsedNumericValues = [];
    for (const strItem of numberStrings) {
        const trimmedStr = strItem.trim();
        if (trimmedStr === '') {
            continue; // Skip empty strings resulting from multiple spaces
        }
        const parsedNum = parseInt(trimmedStr, 10);
        if (!isNaN(parsedNum)) {
            parsedNumericValues.push(parsedNum);
        } else {
            console.warn(`Warning: Encountered non-numeric data ('${trimmedStr}') which will be skipped.`);
        }
    }

    // Step 6: Perform a final check on the parsed data array.
    if (parsedNumericValues.length === 0) {
        console.log("No valid numeric data points were found for analysis.");
        return;
    }

    // Optional: Log a discrepancy if the parsed count doesn't match the expected count.
    if (!isNaN(seriesExpectedCount) && seriesExpectedCount > 0 && parsedNumericValues.length !== seriesExpectedCount) {
        console.warn(`Discrepancy: Expected ${seriesExpectedCount} numeric values based on the first line, but found ${parsedNumericValues.length}.`);
    }

    let overallMaximumFrequency = 0; // This variable will store the highest combined frequency found.

    // Step 7: Iterate through each number in the dataset to calculate the combined frequencies.
    // Using a standard for loop for explicit index control and array element access.
    for (let currentIdx = 0; currentIdx < parsedNumericValues.length; currentIdx++) {
        const currentDataPoint = parsedNumericValues[currentIdx];

        // Calculate the frequency for the current number and its immediate neighbors.
        const frequencyForValueMinusOne = calculateNumberFrequency(parsedNumericValues, currentDataPoint - 1);
        const frequencyForCurrentValue = calculateNumberFrequency(parsedNumericValues, currentDataPoint);
        const frequencyForValuePlusOne = calculateNumberFrequency(parsedNumericValues, currentDataPoint + 1);

        // Sum these three frequencies to get the local combined frequency.
        const combinedAdjacentFrequency = frequencyForValueMinusOne + frequencyForCurrentValue + frequencyForValuePlusOne;

        // Update the overall maximum if the current combined frequency is higher.
        overallMaximumFrequency = Math.max(overallMaximumFrequency, combinedAdjacentFrequency);
    }

    // Step 8: Output the final computed maximum frequency.
    console.log(overallMaximumFrequency);
}

// Main execution entry point: Reads from standard input and delegates to the analysis function.
try {
    // Read all content from standard input synchronously, assuming UTF-8 encoding.
    const streamInputContent = fileSystem.readFileSync("/dev/stdin", "utf-8");
    // Call the primary analysis function with the obtained content.
    analyzeInputSeries(streamInputContent);
} catch (readError) {
    // Catch and report any errors that occur during file system operations.
    console.error("An error occurred while attempting to read from /dev/stdin:", readError.message);
    // Exit the process with an error code to indicate failure.
    process.exit(1);
}