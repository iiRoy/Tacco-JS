"use strict";

/**
 * Orchestrates the processing of input data for sequence queries.
 * This function reads a sequence of characters and a set of query ranges,
 * then calculates the number of "AC" substrings within each specified range.
 *
 * @param {string} rawInputData The entire input as a single string,
 *                              typically read from standard input.
 *                              Expected format:
 *                              Line 1: <sequence_length> <number_of_queries>
 *                              Line 2: <character_sequence>
 *                              Lines 3...: <start_index> <end_index> (for each query)
 */
const processSequenceQueries = (rawInputData) => {
    // Basic validation for the input payload
    if (typeof rawInputData !== 'string' || rawInputData.trim().length === 0) {
        console.error("Input error: No valid data provided for processing.");
        return;
    }

    // Split the input into individual lines and trim whitespace
    const dataLines = rawInputData.trim().split('\n');

    // Ensure there are enough lines for N, Q, S, and at least one query
    if (dataLines.length < 2) {
        console.error("Input error: Not enough lines in the provided data. Expected at least 2.");
        return;
    }

    // Parse the first line to extract sequence length and query count
    const headerTokens = dataLines[0].split(' ');
    const sequenceSize = Number(headerTokens[0]); // N from original code
    const totalQueries = Number(headerTokens[1]); // Q from original code

    // Validate parsed numeric values
    if (isNaN(sequenceSize) || isNaN(totalQueries) || sequenceSize <= 0 || totalQueries < 0) {
        console.error(`Input error: Invalid sequence size (${sequenceSize}) or total queries (${totalQueries}). Both must be positive integers.`);
        return;
    }

    // Extract the main character sequence string and convert to an array of characters
    const mainCharacterSequence = [...dataLines[1]]; // S from original code

    // Perform a sanity check on the sequence length
    if (mainCharacterSequence.length !== sequenceSize) {
        // This is a warning rather than an error, as some problems might tolerate this.
        // For strict adherence, an error could be thrown.
        console.warn(`Data warning: Declared sequence length (${sequenceSize}) does not match actual length (${mainCharacterSequence.length}). Proceeding with actual length.`);
        // Optionally, update sequenceSize to mainCharacterSequence.length here
    }

    // Initialize an array to store cumulative counts of "AC" pairs.
    // `cumulativeAcCounts[k]` will hold the count of "AC" occurrences within `mainCharacterSequence[0...k-1]`.
    // The array is sized `sequenceSize + 1` to facilitate 1-based indexing for queries.
    const cumulativeAcCounts = new Array(sequenceSize + 1).fill(0);
    let currentAcPairSum = 0; // Running total of "AC" pairs found

    // Iterate through the character sequence to build the cumulative sum array.
    // The loop runs from index 0 up to `sequenceSize - 1`.
    for (let charIndex = 0; charIndex < sequenceSize; ++charIndex) {
        // Check if an "A" followed by a "C" exists starting at the current `charIndex`.
        // Ensure that `charIndex + 1` is a valid index within the sequence.
        const nextCharIndex = charIndex + 1;
        if (nextCharIndex < sequenceSize && mainCharacterSequence[charIndex] === 'A' && mainCharacterSequence[nextCharIndex] === 'C') {
            currentAcPairSum++; // Increment the running total
        }
        // Store the cumulative count. `cumulativeAcCounts[charIndex + 1]` corresponds to the
        // count of "AC"s up to and including the character at `charIndex`.
        cumulativeAcCounts[nextCharIndex] = currentAcPairSum;
    }

    // Prepare an array to collect results for all queries
    const collectedQueryOutcomes = [];

    // Extract query lines, starting from the third line (index 2)
    const querySpecificationLines = dataLines.slice(2, 2 + totalQueries);

    // Validate the number of query lines against the declared totalQueries
    if (querySpecificationLines.length !== totalQueries) {
        console.warn(`Data warning: Declared number of queries (${totalQueries}) differs from actual query lines provided (${querySpecificationLines.length}). Processing available queries.`);
    }

    // Process each query
    for (let queryIdx = 0; queryIdx < querySpecificationLines.length; ++queryIdx) {
        const currentQueryLine = querySpecificationLines[queryIdx];
        const [leftBoundStr, rightBoundStr] = currentQueryLine.split(' ');

        const queryLeftOneBased = Number(leftBoundStr); // l from original code
        const queryRightOneBased = Number(rightBoundStr); // r from original code

        // Validate query boundaries for correctness and range
        if (isNaN(queryLeftOneBased) || isNaN(queryRightOneBased) ||
            queryLeftOneBased < 1 || queryRightOneBased > sequenceSize ||
            queryLeftOneBased >= queryRightOneBased) {
            console.error(`Query error: Invalid range [${queryLeftOneBased}, ${queryRightOneBased}] found at query ${queryIdx + 1}. Skipping this query and returning 0.`);
            collectedQueryOutcomes.push(0); // Add a default/error value
            continue; // Move to the next query
        }

        // Calculate the number of "AC" pairs within the specified 1-based range [queryLeftOneBased, queryRightOneBased].
        // This is done by subtracting the cumulative count up to `queryLeftOneBased - 1`
        // from the cumulative count up to `queryRightOneBased`.
        const acCountInCurrentRange = cumulativeAcCounts[queryRightOneBased] - cumulativeAcCounts[queryLeftOneBased - 1];
        collectedQueryOutcomes.push(acCountInCurrentRange);
    }

    // Output all collected query results, each on a new line
    console.log(collectedQueryOutcomes.join('\n'));
};

// Main execution block: Reads input from standard input and calls the processing function.
// This part is generally environment-dependent and often remains consistent.
processSequenceQueries(require('fs').readFileSync('/dev/stdin', 'utf8'));