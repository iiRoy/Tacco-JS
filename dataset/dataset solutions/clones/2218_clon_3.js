'use strict';

// Utility function to robustly convert a string to an integer.
// It includes error handling and a fallback mechanism.
const parseNumericValue = (textualData, fallbackValue = 0) => {
    const numericResult = parseInt(textualData, 10);
    // If parsing fails, log a warning and return the specified fallback value.
    if (isNaN(numericResult)) {
        console.warn(`[InputParser] Unable to convert "${textualData}" to a number. Using default: ${fallbackValue}.`);
        return fallbackValue;
    }
    return numericResult;
};

/**
 * Orchestrates the processing of raw textual input to identify and count
 * specific "preceding-maximal" elements within a sequence.
 * An element qualifies if it is not strictly greater than any element that comes before it in the sequence.
 *
 * @param {string[]} rawInputLines - An array of strings where:
 *                                 - The first line (`rawInputLines[0]`) specifies the expected number of elements.
 *                                 - The second line (`rawInputLines[1]`) contains space-separated integer values.
 */
const analyzeSequenceForMaximalElements = (rawInputLines) => {

    // Preliminary validation: Ensure essential input lines are present.
    if (!rawInputLines || rawInputLines.length < 2) {
        console.error("[InitializationError] Not enough input lines provided. Expected at least two.");
        // Output 0 as a sensible default for invalid input.
        console.log(0);
        return;
    }

    // Parse the declared size of the sequence from the first input line.
    const declaredSequenceSize = parseNumericValue(rawInputLines[0]);

    // If the declared size is invalid (e.g., zero or negative), there's nothing to process.
    if (declaredSequenceSize <= 0) {
        console.log(0); // No elements to count, so the result is zero.
        return;
    }

    // Process the second line to obtain the actual numeric data sequence.
    // We filter out any empty strings that might result from multiple spaces.
    const dataSequence = rawInputLines[1]
                           .split(' ')
                           .filter(segment => segment.trim() !== '') // Remove empty string segments
                           .map(strItem => parseNumericValue(strItem)); // Convert each segment to a number

    // Additional validation: Check for consistency between declared size and actual parsed data.
    const actualParsedLength = dataSequence.length;
    if (actualParsedLength === 0) {
        console.log(0); // If no data was parsed, result is 0.
        return;
    }
    if (actualParsedLength !== declaredSequenceSize) {
        console.warn(`[DataIntegrityWarning] Declared sequence size (${declaredSequenceSize}) does not match actual parsed elements (${actualParsedLength}). Processing with actual available data.`);
        // For robust operation, we'll proceed using the actual length of the data.
    }

    // This array will hold boolean flags. A 'true' at index 'k' means dataSequence[k]
    // is not strictly greater than any element dataSequence[j] where j < k.
    // Initialize all elements to 'true' as a starting assumption.
    const isCandidateForMaximal = new Array(actualParsedLength).fill(true);

    // Iterate through the data sequence to evaluate each element's "maximal" status.
    // The loop starts from the first element (index 0).
    for (let currentItemIndex = 0; currentItemIndex < actualParsedLength; currentItemIndex++) {

        const currentElementRef = dataSequence[currentItemIndex]; // The element we are currently examining.

        // For the current element, check all preceding elements.
        for (let previousItemIndex = 0; previousItemIndex < currentItemIndex; previousItemIndex++) {

            const previousElementRef = dataSequence[previousItemIndex]; // An element prior to the current one.

            // If the current element is found to be strictly greater than ANY preceding element,
            // it fails the "preceding-maximal" condition.
            if (currentElementRef > previousElementRef) {
                isCandidateForMaximal[currentItemIndex] = false; // Mark it as not maximal.
                break; // No need to check further preceding elements for this currentItemIndex.
            }
        }
    }

    // Count how many elements successfully maintained their 'true' status.
    // This is achieved by filtering the boolean array for 'true' values and getting the count.
    const finalCountOfQualifyingElements = isCandidateForMaximal.filter(statusFlag => statusFlag === true).length;

    // Output the final computed result.
    console.log(finalCountOfQualifyingElements);
};

// Entry point for the script: Reads input from standard I/O and initiates processing.
// The `require("fs").readFileSync("/dev/stdin", "utf8")` part is standard boilerplate
// for competitive programming environments in Node.js.
analyzeSequenceForMaximalElements(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));