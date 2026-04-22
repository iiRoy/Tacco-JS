/**
 * Processes raw input data to calculate the minimum number of element replacements
 * required to achieve a specific pattern: all elements at even positions must be
 * one value, and all elements at odd positions must be another value.
 * The two target values (for even and odd positions) can be the same, but if the
 * most frequent choices for both happen to be identical, then one side must
 * pick its second-most frequent element.
 *
 * @param {string[]} rawDataLines - An array of strings representing the input.
 *                                 The first line (rawDataLines[0]) typically contains
 *                                 the total count of elements, but it's not utilized
 *                                 in this specific calculation.
 *                                 The second line (rawDataLines[1]) contains a
 *                                 space-separated sequence of numeric values.
 * @returns {number} The minimum total count of elements that need to be replaced
 *                   to satisfy the pattern. Returns -1 or logs an error for invalid input.
 */
function processData(rawDataLines) {
    // --- Input Validation and Parsing ---
    // Ensure the input array is valid and contains at least two lines for processing.
    if (!Array.isArray(rawDataLines) || rawDataLines.length < 2) {
        console.error("Input error: Expected at least two lines of data. Received insufficient input.");
        return -1; // Indicate an error state
    }

    // Extract the string containing the sequence of numbers from the second line.
    const numericStringSequence = rawDataLines[1];

    // Parse the string into an array of numbers.
    // Robustly convert each string part to a number, handling potential non-numeric entries.
    const parsedNumericValues = numericStringSequence.split(" ").map(strVal => {
        const num = Number(strVal);
        if (isNaN(num)) {
            // For competitive programming, input is usually guaranteed valid.
            // In a real-world scenario, this might throw an error or filter the invalid value.
            console.warn(`Warning: Non-numeric value '${strVal}' encountered and treated as 0.`);
            return 0;
        }
        return num;
    });

    // --- Frequency Counting ---
    // Initialize Map objects to store frequencies of values at even and odd positions.
    // Maps are used for their clear API and potential performance benefits over plain objects
    // when keys might not always be simple strings (though here they are numbers).
    const evenPositionFrequencies = new Map(); // Frequencies for elements at 0, 2, 4... indices
    const oddPositionFrequencies = new Map();  // Frequencies for elements at 1, 3, 5... indices

    let totalElementsAtEvenPositions = 0;
    let totalElementsAtOddPositions = 0;

    // Iterate through the parsed numeric sequence to populate frequency maps.
    parsedNumericValues.forEach((currentValue, elementIndex) => {
        if (elementIndex % 2 === 0) { // If the current index is even
            evenPositionFrequencies.set(currentValue, (evenPositionFrequencies.get(currentValue) || 0) + 1);
            totalElementsAtEvenPositions++;
        } else { // If the current index is odd
            oddPositionFrequencies.set(currentValue, (oddPositionFrequencies.get(currentValue) || 0) + 1);
            totalElementsAtOddPositions++;
        }
    });

    // --- Helper for Sorting Frequencies ---
    /**
     * Converts a frequency Map into an array of [value, frequency] pairs,
     * sorted primarily by frequency in descending order, then by value in ascending order for ties.
     * This ensures the most frequent elements are at the beginning.
     * @param {Map<number, number>} freqMap - The frequency map to process.
     * @returns {Array<[number, number]>} Sorted array of [value, frequency] pairs.
     */
    const getSortedFrequencyEntries = (freqMap) => {
        const entries = Array.from(freqMap.entries());
        entries.sort((entryA, entryB) => {
            // Sort by frequency (descending)
            const frequencyDifference = entryB[1] - entryA[1];
            if (frequencyDifference === 0) {
                // If frequencies are equal, sort by value (ascending) for consistent order.
                return entryA[0] - entryB[0];
            }
            return frequencyDifference;
        });
        return entries;
    };

    // Obtain sorted lists of [value, frequency] pairs for both even and odd positions.
    const sortedEvenFreqs = getSortedFrequencyEntries(evenPositionFrequencies);
    const sortedOddFreqs = getSortedFrequencyEntries(oddPositionFrequencies);

    // --- Pad Sorted Lists to Ensure Access Safety ---
    // Add dummy entries with frequency 0 if a list is empty or has only one element.
    // This prevents errors when trying to access `[0]` or `[1]` later and simplifies logic.
    // The dummy values (-1, -2) are chosen to be distinct and unlikely to conflict with actual data.
    if (sortedEvenFreqs.length === 0) {
        sortedEvenFreqs.push([0, 0]); // Default if no even elements
    }
    if (sortedOddFreqs.length === 0) {
        sortedOddFreqs.push([0, 0]); // Default if no odd elements
    }
    if (sortedEvenFreqs.length === 1) {
        sortedEvenFreqs.push([-1, 0]); // Second most frequent for even (dummy)
    }
    if (sortedOddFreqs.length === 1) {
        sortedOddFreqs.push([-2, 0]); // Second most frequent for odd (dummy)
    }

    // --- Determine Optimal Replacements ---
    // Extract the most frequent values and their counts, plus the second most frequent counts.
    const mostFrequentEvenValue = sortedEvenFreqs[0][0];
    const mostFrequentEvenCount = sortedEvenFreqs[0][1];
    const secondMostFrequentEvenCount = sortedEvenFreqs[1][1]; // Count of 2nd most frequent even value

    const mostFrequentOddValue = sortedOddFreqs[0][0];
    const mostFrequentOddCount = sortedOddFreqs[0][1];
    const secondMostFrequentOddCount = sortedOddFreqs[1][1]; // Count of 2nd most frequent odd value

    let totalMinimumReplacements = 0; // The final answer to be calculated.

    // Case 1: The most frequent value for even positions is different from the most frequent for odd positions.
    // In this ideal scenario, we can simply choose the most frequent for each,
    // and the number of replacements is the total elements minus their respective most frequent counts.
    if (mostFrequentEvenValue !== mostFrequentOddValue) {
        totalMinimumReplacements =
            (totalElementsAtEvenPositions - mostFrequentEvenCount) +
            (totalElementsAtOddPositions - mostFrequentOddCount);
    } else {
        // Case 2: The most frequent values for even and odd positions are the same.
        // We cannot use the same value for both. Therefore, one side must choose its
        // second most frequent value. We calculate the cost for two possible scenarios
        // and pick the one that results in fewer total replacements.

        // Scenario A: Keep the most frequent value for even positions, use the second most frequent for odd.
        const replacementsIfOddChanges =
            (totalElementsAtEvenPositions - mostFrequentEvenCount) + // Changes needed for even positions
            (totalElementsAtOddPositions - secondMostFrequentOddCount); // Changes needed for odd positions

        // Scenario B: Use the second most frequent value for even positions, keep the most frequent for odd.
        const replacementsIfEvenChanges =
            (totalElementsAtEvenPositions - secondMostFrequentEvenCount) + // Changes needed for even positions
            (totalElementsAtOddPositions - mostFrequentOddCount); // Changes needed for odd positions

        // The minimum replacements will be the lesser of these two scenarios.
        totalMinimumReplacements = Math.min(replacementsIfOddChanges, replacementsIfEvenChanges);
    }

    return totalMinimumReplacements;
}

// --- Standard Input/Output Handling for Competitive Programming ---
// This block reads input from /dev/stdin, processes it using the main function,
// and prints the result to standard output. Includes basic error handling.
try {
    // Read the entire file content from standard input (or a specified path).
    const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Trim whitespace and split the content into an array of lines.
    const inputLinesArray = fileContents.trim().split("\n");

    // Call the main processing function with the prepared input.
    const calculatedResult = processData(inputLinesArray);

    // Output the final result.
    console.log(calculatedResult);

} catch (executionError) {
    // Log any errors that occur during file reading or processing.
    console.error("An error occurred during program execution:", executionError.message);
    // Optionally, exit with a non-zero status code to indicate failure.
    // process.exit(1);
}