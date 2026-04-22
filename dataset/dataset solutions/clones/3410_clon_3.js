// This module is designed to process a stream of raw textual data,
// interpreting it as a sequence of numbers, performing a specific
// mathematical adjustment, and then calculating a final aggregate total.

/**
 * Processes a multi-line string of numerical data, discards an initial
 * count-like value, halves the first occurrence of the maximum remaining
 * value, and then computes the sum of all adjusted numbers.
 *
 * @param {string} rawTextualData - The input string, expected to contain
 *                                  numbers separated by newline characters.
 */
function processNumericDataset(rawTextualData) {
    // Defensive programming: Ensure the input is a valid string and not empty.
    // If the input is invalid or absent, we assume no data and output zero.
    if (typeof rawTextualData !== 'string' || rawTextualData.trim().length === 0) {
        console.log(0);
        return;
    }

    // Step 1: Parse the incoming text stream into an array of numeric values.
    // We first split the string by newline characters.
    // Then, we filter out any lines that are empty or contain only whitespace,
    // as these would not represent valid numbers.
    // Finally, each remaining string entry is converted into its numeric representation.
    const parsedNumericEntries = rawTextualData
        .split('\n')
        .filter(entryLine => entryLine.trim() !== '') // Remove blank lines.
        .map(entryString => Number(entryString));     // Convert to number.

    // Early exit condition: If, after parsing and filtering, no valid numeric
    // entries remain, the final sum is considered zero.
    if (parsedNumericEntries.length === 0) {
        console.log(0);
        return;
    }

    // Step 2: Extract the actual dataset for processing.
    // The problem implies that the very first number in the input stream
    // might be a metadata value (like a count) that should not be part
    // of the core calculation. We create a new array by slicing, effectively
    // discarding the initial element without modifying the original parsed data.
    const coreDataPointsForAnalysis = parsedNumericEntries.slice(1);

    // Another early exit: If discarding the first element leaves us with an
    // empty set of data points, the sum is zero.
    if (coreDataPointsForAnalysis.length === 0) {
        console.log(0);
        return;
    }

    // Step 3: Determine the largest numerical value present within the
    // `coreDataPointsForAnalysis`. We iterate through the array to find this.
    let greatestValueEncountered = -Infinity; // Initialize with a very low number.
    for (const dataPoint of coreDataPointsForAnalysis) {
        if (dataPoint > greatestValueEncountered) {
            greatestValueEncountered = dataPoint;
        }
    }
    // Note: An alternative for finding the maximum could be:
    // const greatestValueEncountered = Math.max(...coreDataPointsForAnalysis);

    // Step 4: Generate a new array where the first instance of the
    // `greatestValueEncountered` is modified (halved).
    // We use a flag to ensure that only the very first occurrence is affected.
    let hasTargetValueBeenAdjusted = false;
    const numericallyAdjustedSet = coreDataPointsForAnalysis.map(currentValue => {
        if (currentValue === greatestValueEncountered && !hasTargetValueBeenAdjusted) {
            hasTargetValueBeenAdjusted = true; // Mark as adjusted.
            return currentValue / 2;           // Halve the value.
        }
        return currentValue;                   // Keep other values as they are.
    });

    // Step 5: Calculate the cumulative sum of all numbers in the
    // `numericallyAdjustedSet`.
    let finalCumulativeTotal = 0;
    for (let i = 0; i < numericallyAdjustedSet.length; i++) {
        finalCumulativeTotal += numericallyAdjustedSet[i];
    }
    // Note: An alternative for summation could be:
    // const finalCumulativeTotal = numericallyAdjustedSet.reduce((acc, val) => acc + val, 0);

    // Step 6: Output the final computed sum to the console.
    console.log(finalCumulativeTotal);
}

// Application Entry Point:
// This block reads data from the standard input stream (commonly a file
// specified during execution, e.g., via pipe or redirection) and passes
// it to our primary processing function.
try {
    // Attempt to read the entire content of '/dev/stdin' synchronously.
    // 'utf8' encoding is specified to correctly interpret text data.
    const systemInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Invoke the core logic with the obtained input.
    processNumericDataset(systemInputContent);
} catch (inputReadError) {
    // If an error occurs during the file reading process (e.g., file not found,
    // permissions issue, malformed path), an error message is logged,
    // and a default output of zero is provided to handle the failure gracefully.
    console.error("An error occurred during standard input processing:", inputReadError.message);
    console.log(0); // Provide a default or error-fallback sum.
}