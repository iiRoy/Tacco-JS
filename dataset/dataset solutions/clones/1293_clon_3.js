/*
 * This module provides functionality to analyze input data
 * and determine the count of unique ascending triplets (a, b, c)
 * such that 1 <= a < b < c <= N and a + b + c = X.
 *
 * It processes multiple problem sets, each defined by a line
 * containing N and X, until a "0 0" sentinel is encountered.
 */

/**
 * Converts an array of string segments into an array of numbers.
 * Each string segment is expected to represent a base-10 integer.
 *
 * @param {string[]} stringSegments - An array of strings, each representing a number.
 * @returns {number[]} An array of parsed numeric values.
 */
function parseLineToNumbers(stringSegments) {
    // Utilizing the `Number` constructor for type conversion,
    // which is a robust alternative to `parseInt` for base-10 integers
    // and handles leading/trailing whitespace automatically.
    return stringSegments.map(segmentStr => Number(segmentStr));
}

/**
 * The primary entry point for processing the raw problem data.
 * It iterates through problem definitions, calculates triplet counts,
 * and collects the results for final output.
 *
 * @param {string} rawProblemData - The entire input string containing multiple problem lines.
 */
function analyzeTriplets(rawProblemData) {
    // Ensure the input is clean by trimming any leading/trailing whitespace
    // and then splitting into individual records based on newline characters.
    const dataRecords = rawProblemData.trim().split('\n');

    // A buffer to store the computed triplet counts for each problem set.
    // These will be joined and printed at the very end.
    const computedResults = [];

    // Initialize an index to track the current line being processed.
    let currentRecordPointer = 0;

    // Loop through the data records until the termination signal "0 0" is found.
    // This `while(true)` with an internal `break` provides flexible loop control.
    while (true) {
        const currentRecord = dataRecords[currentRecordPointer];

        // Check for the sentinel value "0 0" to stop processing further records.
        if (currentRecord === "0 0") {
            break;
        }

        // Parse the current line to extract the problem-specific constraints (N and X).
        // N represents the maximum value for a number in the triplet.
        // X represents the target sum for the triplet.
        const problemConstraints = parseLineToNumbers(currentRecord.split(' '));
        const [maxValN, targetSumX] = problemConstraints;

        // Initialize a counter for valid triplets for the current problem set.
        let validTripletCount = 0;

        // Optimization: If N is too small (less than 3) to form a distinct triplet (1, 2, 3),
        // or if X is too small (less than 6) to sum three distinct positive integers (1+2+3=6),
        // we can quickly determine that no triplets are possible for this set.
        if (maxValN < 3 || targetSumX < 6) {
            computedResults.push("0");
            currentRecordPointer++; // Advance to the next problem record.
            continue; // Skip the triplet calculation for this problem.
        }

        /*
         * Core logic: Iterate through possible combinations to find unique triplets (a, b, c)
         * such that 1 <= a < b < c <= N and a + b + c = X.
         * The nested loops are structured to naturally enforce the 'a < b < c' condition
         * and ensure numbers are distinct without explicit equality checks within the loops.
         */

        // First element 'a' (renamed to firstElementInTriplet for clarity).
        // It can range from 1 up to N-2. This upper bound ensures there's room
        // for at least two larger distinct numbers (b and c).
        for (let firstElementInTriplet = 1; firstElementInTriplet <= maxValN - 2; firstElementInTriplet++) {

            // Second element 'b' (renamed to secondElementInTriplet).
            // It must be strictly greater than 'a', so it starts from `firstElementInTriplet + 1`.
            // It can range up to N-1. This upper bound ensures there's room
            // for at least one larger distinct number (c).
            for (let secondElementInTriplet = firstElementInTriplet + 1; secondElementInTriplet <= maxValN - 1; secondElementInTriplet++) {

                // Calculate the potential third element 'c' (renamed to candidateThirdElement).
                // This value is derived directly from the target sum X and the chosen 'a' and 'b'.
                const candidateThirdElement = targetSumX - firstElementInTriplet - secondElementInTriplet;

                /*
                 * Check conditions for the candidate third element:
                 * 1. `candidateThirdElement > secondElementInTriplet`: This ensures 'c' is strictly greater than 'b',
                 *    maintaining the `a < b < c` order and guaranteeing distinctness.
                 * 2. `candidateThirdElement <= maxValN`: This ensures 'c' is within the allowed range [1, N].
                 *    (We don't need to check `candidateThirdElement >= 1` explicitly because if it's
                 *    greater than `secondElementInTriplet` (which is >= 2), it must be >= 3).
                 */
                if (candidateThirdElement > secondElementInTriplet && candidateThirdElement <= maxValN) {
                    // If all conditions are met, we have found a valid triplet.
                    validTripletCount++;
                }

                // An implicit optimization: if `candidateThirdElement` becomes too small (e.g., less than or equal to `secondElementInTriplet`),
                // further increases in `secondElementInTriplet` would only make `candidateThirdElement` even smaller,
                // meaning no more valid triplets could be formed with the current `firstElementInTriplet` and increasing `secondElementInTriplet`.
                // The loop bounds already manage this effectively, so no explicit `break` is strictly needed here.
            }
        }

        // Store the calculated triplet count for the current problem set.
        computedResults.push(validTripletCount.toString());

        // Move the pointer to the next record in the input data for the next iteration.
        currentRecordPointer++;
    }

    // After processing all records, output all collected results, each on a new line.
    console.log(computedResults.join('\n'));
}

/**
 * Helper function to retrieve the raw input data from an external source.
 * This typically involves reading from standard input in a Node.js environment.
 *
 * @returns {string} The complete raw input string.
 */
function retrieveExternalInput() {
    // Node.js specific: synchronously reads the entire file content.
    // `/dev/stdin` is a common path for standard input on Unix-like systems.
    // For other environments or testing, this might need to be mocked or adjusted.
    return require("fs").readFileSync("/dev/stdin", "utf-8");
}

// Execute the main processing logic with the retrieved input data.
analyzeTriplets(retrieveExternalInput());