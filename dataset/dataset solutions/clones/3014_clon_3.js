// This module is designed to compute an optimized value from a numeric sequence
// by applying dynamic programming principles. It addresses a problem where
// segments of a sequence can be "reversed" (values negated) to maximize a sum.

/**
 * A sentinel value representing an extremely small number.
 * Used to initialize states that are not yet reachable or are invalid
 * in dynamic programming calculations, ensuring they don't incorrectly
 * influence maximum value computations. This value is derived to be
 * significantly negative but within safe integer limits.
 */
const EXTREMELY_LOW_VALUE = Math.floor(Number.MIN_SAFE_INTEGER / 2);

/**
 * Orchestrates the processing of raw input data to perform the
 * sequence optimization calculation.
 *
 * @param {string} rawInputPayload - The complete string of input data,
 *                                   typically read from a standard input stream.
 *                                   Expected format:
 *                                   Line 1: An integer representing the length of the sequence (N).
 *                                   Line 2: N space-separated integers forming the sequence.
 */
function processSequenceData(rawInputPayload) {
    // Step 1: Normalize and parse the input string into individual data lines.
    const inputLines = rawInputPayload.trim().split('\n');

    // Step 2: Extract and validate the declared length of the sequence.
    // The sequence length is expected to be the first line of input.
    const declaredSequenceLength = Number(inputLines[0]);

    // Input validation: Ensure the sequence length is a positive integer.
    if (isNaN(declaredSequenceLength) || declaredSequenceLength <= 0) {
        console.error("Input Error: The provided sequence length is invalid or non-positive.");
        return; // Abort processing if critical input is malformed.
    }

    // Step 3: Parse the numeric sequence from the second line of input.
    // A conceptual '0' is prepended to the sequence. This often simplifies
    // 1-based indexing in dynamic programming problems, allowing `memoizationTable[0]`
    // to represent a base or initial state without directly corresponding to an input element.
    const rawNumberStrings = inputLines[1].split(' ');
    const numericalElements = Array.from({ length: declaredSequenceLength + 1 }, (_, idx) => {
        if (idx === 0) {
            return 0; // The conceptual zero at index 0.
        }
        // Convert string representations to actual numbers.
        return Number(rawNumberStrings[idx - 1]);
    });

    // Optional Validation: Check if the number of parsed elements matches the declared length.
    if (numericalElements.length - 1 !== declaredSequenceLength) {
        console.warn("Data Warning: Actual number of parsed elements does not match the declared sequence length.");
        // Depending on requirements, this might warrant an error or an adjustment to declaredSequenceLength.
    }

    // Step 4: Initialize the dynamic programming table (memoizationTable).
    // This 2D array will store the maximum achievable sums.
    // `memoizationTable[i][0]` represents the max sum ending at index `i` without the current segment being reversed.
    // `memoizationTable[i][1]` represents the max sum ending at index `i` with the current segment being reversed.
    const memoizationTable = Array.from({ length: declaredSequenceLength + 1 }, () =>
        Array.from({ length: 2 }, () => 0) // Initialize all entries to 0 initially.
    );

    // Step 5: Set the base cases for the dynamic programming calculation.
    // For the initial, conceptual state (index 0):
    // - State 0 (no reversal): Sum is 0.
    // - State 1 (reversal): Impossible or not applicable, so assign a very low value.
    memoizationTable[0][0] = 0;
    memoizationTable[0][1] = EXTREMELY_LOW_VALUE;

    // Step 6: Populate the memoization table using a bottom-up approach.
    // Iterate from the first actual element up to the last element of the sequence.
    for (let currentIdx = 1; currentIdx <= declaredSequenceLength; currentIdx++) {
        const valueAtCurrentIdx = numericalElements[currentIdx];

        // --- Calculate memoizationTable[currentIdx][0] (Max sum ending here, NO reversal) ---
        // Two possibilities to reach this state:
        // 1. Continue from previous state 0 (no reversal) and add the current value.
        //    (e.g., ... A, B, C -> ... A, B, C)
        const previousState0_addCurrent = memoizationTable[currentIdx - 1][0] + valueAtCurrentIdx;
        // 2. End a reversal from previous state 1 (reversal active) and subtract the current value.
        //    (e.g., ... A, -B, -C -> ... A, -B, C) - the 'reversal' ends at C, so C is added to the non-reversed part.
        const previousState1_endReversal = memoizationTable[currentIdx - 1][1] - valueAtCurrentIdx;

        // Take the maximum of these two paths for the current state 0.
        memoizationTable[currentIdx][0] = Math.max(previousState0_addCurrent, previousState1_endReversal);

        // --- Calculate memoizationTable[currentIdx][1] (Max sum ending here, WITH reversal) ---
        // Two possibilities to reach this state:
        // 1. Start a reversal from previous state 0 (no reversal) and subtract the current value.
        //    (e.g., ... A, B, C -> ... A, B, -C)
        const previousState0_startReversal = memoizationTable[currentIdx - 1][0] - valueAtCurrentIdx;
        // 2. Continue a reversal from previous state 1 (reversal active) and add the current value.
        //    (e.g., ... A, -B, -C -> ... A, -B, -C)
        const previousState1_continueReversal = memoizationTable[currentIdx - 1][1] + valueAtCurrentIdx;

        // Take the maximum of these two paths for the current state 1.
        memoizationTable[currentIdx][1] = Math.max(previousState0_startReversal, previousState1_continueReversal);
    }

    // Step 7: Output the final result.
    // The problem asks for the maximum sum of the sequence. This corresponds
    // to the value in `memoizationTable[declaredSequenceLength][0]`,
    // which signifies the maximum sum ending at the last element with no
    // active reversal.
    console.log(memoizationTable[declaredSequenceLength][0]);
}

// Entry point for execution:
// Reads the input from standard input (e.g., a file named /dev/stdin in a Unix-like environment)
// and then passes it to the main processing function.
processSequenceData(require("fs").readFileSync("/dev/stdin", "utf8"));