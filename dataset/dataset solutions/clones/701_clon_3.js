// This script is designed to process numerical data streams received via standard input.
// It parses the input into sequences of numbers, then processes these sequences
// in distinct segments. For each segment, the algorithm identifies and removes
// both the smallest and largest values, subsequently calculating the integer
// average of the remaining elements. The final computed average for each segment
// is then displayed to the console.

// Initialize the standard input stream to ensure it's ready to receive data.
process.stdin.resume();
// Set the character encoding for the input stream to UTF-8 for consistent text handling.
process.stdin.setEncoding('utf8');

// Establish a dedicated constant for logging results to the console, enhancing clarity.
const displayCalculatedValue = console.log;

/**
 * Attaches an event listener to the standard input stream.
 * This listener is triggered whenever a chunk of data is received.
 * The received data buffer is then passed to a dedicated handler for preprocessing.
 * @param {string} inputBuffer - The raw string data chunk received from the standard input.
 */
process.stdin.on('data', function (inputBuffer) {
    // Invoke the primary input handler with the received data.
    handleIncomingData(inputBuffer);
});

/**
 * Preprocesses the raw input buffer by splitting it into individual lines,
 * filtering out any empty or purely whitespace lines, and then initiating
 * the core numerical sequence processing.
 * @param {string} inputBuffer - The raw string data received from standard input.
 */
function handleIncomingData(inputBuffer) {
    // Split the input buffer into an array of lines. Uses a regex to handle
    // both Windows (\r\n) and Unix (\n) style line endings robustly.
    let rawInputLines = inputBuffer.split(/\r?\n/);

    // Filter out lines that are empty or consist solely of whitespace,
    // ensuring only meaningful data is passed forward.
    const cleanedLines = rawInputLines.filter(item => item.trim() !== '');

    // Implement a guard clause: If no valid input lines remain after cleaning,
    // notify the user and cease further processing for this input chunk.
    if (cleanedLines.length === 0) {
        displayCalculatedValue('Notice: No meaningful input lines were provided for processing.');
        return; // Exit the function as there's nothing to process.
    }

    // Hand off the array of cleaned input strings to the main processing function.
    processInputChunks(cleanedLines);
}

/**
 * A utility function designed to find and remove the first occurrence of either
 * the minimum or maximum value from a given array of numbers.
 * This function modifies the array in-place.
 * @param {Array<number>} dataCollection - The array of numbers to be modified.
 * @param {'min'|'max'} extremumType - Specifies whether to target the 'min'imum or 'max'imum value for removal.
 * @returns {Array<number>} The modified dataCollection array.
 */
function exciseExtremeValue(dataCollection, extremumType) {
    // Validate the input: if the collection is not an array or is empty,
    // log a warning and return the original collection without modification.
    if (!Array.isArray(dataCollection) || dataCollection.length === 0) {
        console.warn(`Warning: Attempted to excise extreme from an invalid or empty collection (Type: ${extremumType}). No action taken.`);
        return dataCollection; // Return the original reference.
    }

    let targetValue;
    // Determine the specific extreme value (min or max) based on the `extremumType` parameter.
    if (extremumType === 'min') {
        targetValue = Math.min(...dataCollection); // Using the spread operator for concise min/max calculation.
    } else if (extremumType === 'max') {
        targetValue = Math.max(...dataCollection);
    } else {
        // If an unrecognized type is provided, issue a warning and return the collection as is.
        console.warn(`Warning: Unknown extremum type '${extremumType}' provided to exciseExtremeValue. Collection unchanged.`);
        return dataCollection;
    }

    // Find the index of the first occurrence of the identified target extreme value.
    const valueIndex = dataCollection.indexOf(targetValue);

    // If the value is found (index is not -1), remove it from the array using `splice`.
    if (valueIndex !== -1) {
        dataCollection.splice(valueIndex, 1); // Removes one element at the found index.
    }
    // Return the (potentially modified) data collection.
    return dataCollection;
}

/**
 * The core logic function that orchestrates the processing of numerical sequences.
 * It converts an array of string numbers into actual numbers, then iteratively
 * extracts segments, removes extreme values, and computes the floor of the average.
 * @param {Array<string>} initialStringArray - An array of strings, where each string is expected to represent a number.
 */
function processInputChunks(initialStringArray) {
    // Convert all string elements in the input array to numbers.
    // Then, filter out any values that resulted in NaN (Not a Number) during conversion,
    // ensuring we only work with valid numeric data.
    const parsedNumbers = initialStringArray.map(Number);
    let remainingNumericValues = parsedNumbers.filter(val => !isNaN(val));

    // Guard clause: If, after parsing and filtering, no valid numbers remain,
    // inform the user and terminate the processing for this set of input.
    if (remainingNumericValues.length === 0) {
        displayCalculatedValue('Notice: No valid numbers identified after parsing the input. Processing halted.');
        return;
    }

    // The main processing loop continues as long as there are sufficient numbers
    // in the pool to form at least a segment size indicator and one segment element.
    while (remainingNumericValues.length >= 2) {
        // Extract the first number from the pool; this number dictates the size
        // of the current segment to be processed. `shift()` modifies the array in-place.
        let currentSegmentSize = remainingNumericValues.shift();

        // Comprehensive validation for the extracted segment size:
        // It must be a valid number, positive, and an integer. If not, issue a warning
        // and skip to the next iteration to avoid errors.
        if (isNaN(currentSegmentSize) || currentSegmentSize <= 0 || !Number.isInteger(currentSegmentSize)) {
            console.warn(`Warning: Encountered an invalid, non-positive, or non-integer segment size (${currentSegmentSize}). Skipping this segment and proceeding.`);
            continue; // Move to the next loop iteration.
        }

        // Guard clause: Check if there are enough remaining numbers to fulfill the
        // `currentSegmentSize`. If not, it means we cannot form a complete segment,
        // so we output a message and terminate the loop.
        if (currentSegmentSize > remainingNumericValues.length) {
            displayCalculatedValue(`Notice: Insufficient data (${remainingNumericValues.length} elements) for requested segment size (${currentSegmentSize}). Terminating processing loop.`);
            break; // Exit the while loop.
        }

        // Extract the elements for the current segment from the `remainingNumericValues` pool.
        // `splice(0, currentSegmentSize)` removes these elements and returns them as a new array.
        let activeSegmentElements = remainingNumericValues.splice(0, currentSegmentSize);

        // Apply Type III change: Utilize the helper function to remove the minimum value
        // from the `activeSegmentElements` array.
        activeSegmentElements = exciseExtremeValue(activeSegmentElements, 'min');
        // Subsequently, remove the maximum value from the *already modified* segment.
        activeSegmentElements = exciseExtremeValue(activeSegmentElements, 'max');

        // Guard clause: After removing extreme values, it's possible the segment
        // became empty (e.g., if it originally had only 1 or 2 elements).
        // Prevent division by zero by checking for an empty segment.
        if (activeSegmentElements.length === 0) {
            displayCalculatedValue('Notice: Segment became empty after removing minimum and maximum values. Cannot calculate average for this segment.');
            continue; // Skip to the next segment.
        }

        // Calculate the sum of all remaining elements within the current segment.
        // The `reduce` method iterates through the array, accumulating the sum.
        const totalSumOfSegment = activeSegmentElements.reduce((accumulator, currentVal) => accumulator + currentVal, 0);

        // Compute the average of the segment elements and output its floor value.
        // `Math.floor()` rounds the result down to the nearest whole number.
        const segmentAverage = totalSumOfSegment / activeSegmentElements.length;
        displayCalculatedValue(Math.floor(segmentAverage));
    }

    // Optional: Provide a concluding message once the processing loop has finished,
    // indicating why it stopped (due to insufficient data for a new segment).
    if (remainingNumericValues.length < 2) {
        displayCalculatedValue('Processing complete: Not enough numeric values remaining to form a new segment.');
    }
}