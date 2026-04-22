// This function serves as the primary entry point for processing raw input data.
// It orchestrates parsing, core calculations, and output formatting.
function ProcessInputData(rawData) {
    // Deconstruct the raw input string into an array of lines.
    // Using a regex split handles various newline conventions (CRLF, LF).
    const inputLines = rawData.split(/\r?\n/);

    // Implement a guard clause to ensure the input contains the minimum required lines.
    // This adds robustness and prevents errors from malformed input.
    if (inputLines.length < 2) {
        console.error("Data processing failed: Insufficient number of input lines.");
        return; // Halt execution if input is critically incomplete.
    }

    // Extract the first line, which is expected to contain the count of data elements.
    const elementCountStr = inputLines[0].trim();
    // Convert the string representation of the count into an integer.
    const expectedElementCount = parseInt(elementCountStr, 10);

    // Validate the parsed count to ensure it's a valid positive number.
    if (isNaN(expectedElementCount) || expectedElementCount <= 0) {
        console.error("Data processing failed: Invalid or non-positive element count provided.");
        return; // Exit if the count is invalid.
    }

    // The second line contains the primary data, space-separated.
    // Split it into parts and filter out any empty strings that might arise from extra spaces.
    const dataStringParts = inputLines[1].split(' ').filter(segment => segment !== '');

    // A validation step to check if the actual number of data points matches the expected count.
    // While not strictly required for functionality, it's good practice for input integrity.
    if (dataStringParts.length !== expectedElementCount) {
        console.warn(`Warning: Expected ${expectedElementCount} data points, but found ${dataStringParts.length}. Proceeding with available data.`);
    }

    // Utilize a helper function to convert the array of string numbers into integers.
    const seriesValues = convertStringsToIntegers(dataStringParts);

    // Another validation to ensure all string parts were successfully converted to numbers.
    if (seriesValues.some(val => isNaN(val))) {
        console.error("Data processing failed: One or more data values could not be parsed as numbers.");
        return;
    }
    
    // --- Begin Core Algorithmic Calculations ---

    // Calculate the cumulative sum of all values in the series.
    let cumulativeSum = 0;
    // Employing a 'for...of' loop for iterating over array elements, a modern JavaScript idiom.
    for (const singleValue of seriesValues) {
        cumulativeSum += singleValue;
    }

    // Determine the sum of elements located at odd indices (1, 3, 5, ...).
    let sumOfOddPositionElements = 0;
    // Introduce a temporary variable for the array's length to optimize loop condition checks.
    const currentSeriesLength = seriesValues.length;
    // Using a distinct loop variable 'j' for clarity.
    for (let j = 1; j < currentSeriesLength; j += 2) {
        sumOfOddPositionElements += seriesValues[j];
    }

    // Compute the initial 'peak' value using a rearranged form of the original calculation.
    // Original: `sumValley - (2*tmpSum)`
    // Rewritten for Type III variation: `totalSum - tmpSum - tmpSum`
    const firstCalculatedPeakValue = cumulativeSum - sumOfOddPositionElements - sumOfOddPositionElements;

    // Initialize an array to store all computed peak values.
    // Pre-allocating the array using `new Array()` can offer minor performance benefits for large arrays.
    const computedPeakValues = new Array(currentSeriesLength);
    computedPeakValues[0] = firstCalculatedPeakValue; // Assign the first peak.

    // Iterate to calculate the subsequent peak values based on a recurrence relation.
    // Original formula: `tmpMountain[i] = (valley[i-1] - (tmpMountain[i-1]/2)) * 2;`
    // Algebraically simplified and rewritten for Type III: `2 * valley[i-1] - tmpMountain[i-1]`
    for (let currentPosition = 1; currentPosition < currentSeriesLength; ++currentPosition) {
        const previousSeriesValue = seriesValues[currentPosition - 1];
        const previousPeakValue = computedPeakValues[currentPosition - 1];
        computedPeakValues[currentPosition] = (2 * previousSeriesValue) - previousPeakValue;
    }

    // --- End Core Algorithmic Calculations ---

    // Format the array of calculated peak values into a space-separated string for output.
    const finalResultString = formatArrayForOutput(computedPeakValues);
    console.log(finalResultString);
}

/**
 * Helper function to parse an array of string numbers into an array of actual integers.
 * Includes basic validation for the input array itself.
 * @param {string[]} stringNumArray - An array where each element is a string representation of a number.
 * @returns {number[]} - An array of integers, or an empty array if input is invalid or empty.
 */
function convertStringsToIntegers(stringNumArray) {
    // Guard clause for non-array or empty inputs to prevent errors.
    if (!Array.isArray(stringNumArray) || stringNumArray.length === 0) {
        return [];
    }

    const integerOutputs = [];
    let iteratorIndex = 0; // Using a 'while' loop for structural variation.

    while (iteratorIndex < stringNumArray.length) {
        const currentNumString = stringNumArray[iteratorIndex];
        const parsedInteger = parseInt(currentNumString, 10);
        integerOutputs.push(parsedInteger); // NaNs are pushed and handled by calling function.
        iteratorIndex++;
    }
    return integerOutputs;
}

/**
 * Helper function to format an array of numbers into a single space-delimited string,
 * appending a newline character at the end for console output.
 * @param {number[]} numberElements - The array of numbers to be formatted.
 * @returns {string} - A string with numbers joined by spaces, followed by a newline.
 */
function formatArrayForOutput(numberElements) {
    // Add a guard clause for empty or invalid input arrays.
    if (!Array.isArray(numberElements) || numberElements.length === 0) {
        return '\n'; // Return just a newline if there's nothing to join.
    }

    // Join the numeric elements with a space and explicitly append a newline character.
    const outputLine = numberElements.join(' ') + '\n';
    return outputLine;
}

// --- Standard Input/Output Handling (DO NOT MODIFY BELOW THIS LINE) ---
// This standard boilerplate code reads all input from stdin and passes it
// to the main processing function. It should not be altered for competitive programming.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));