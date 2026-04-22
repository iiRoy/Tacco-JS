const calculateNextTerm = (previousTermValue, modulusBaseValue) => {
    // Helper function to compute the next element in the sequence: X_n = (X_{n-1})^2 % M
    if (modulusBaseValue <= 0) {
        // Defensive check: Modulus must be a positive integer to prevent division by zero or invalid behavior.
        throw new Error("Invalid modulus base: must be a positive number.");
    }
    return (previousTermValue * previousTermValue) % modulusBaseValue;
};

const executeSequenceSummation = (rawInputLine) => {
    // This function processes the input and computes the sum of the first N terms
    // of a sequence defined by X_i = (X_{i-1})^2 % M, leveraging cycle detection.

    // --- Input Parsing and Validation ---
    // Split the input string by spaces and convert parts to integers.
    const inputNumericParts = rawInputLine.split(" ").map(s => parseInt(s.trim(), 10));

    // Ensure exactly three valid numbers are provided: N, X, M
    if (inputNumericParts.length !== 3 || inputNumericParts.some(isNaN)) {
        console.error("Input Error: Expected three numeric values (N X M). Please check your input format.");
        return; // Abort execution for invalid input
    }

    // Destructure the parsed values into meaningful variable names
    const [targetTermCount, startingValue, modulusBase] = inputNumericParts;

    // --- Constraint Checks and Early Exits ---
    // N (targetTermCount) and X (startingValue) must be non-negative. M (modulusBase) must be positive.
    if (targetTermCount < 0 || startingValue < 0 || modulusBase <= 0) {
        console.error("Input Error: N and X must be non-negative, and M must be a positive integer.");
        return; // Abort for out-of-bounds input values
    }

    // If N is 0, the sum is trivially 0.
    if (targetTermCount === 0) {
        console.log(0);
        return; // Early exit
    }

    // --- Data Structures for Sequence Generation and Cycle Detection ---
    // `generatedSequence` stores the terms of the sequence in the order they are generated.
    const generatedSequence = [];
    // `valueToFirstIndexMap` maps each unique term value to the first index at which it appeared in `generatedSequence`.
    // This is crucial for efficient cycle detection.
    const valueToFirstIndexMap = new Map();

    let currentSequenceTerm = startingValue;
    let sequenceIndex = 0; // Tracks the current position in the sequence
    let cycleStartPoint = -1; // The index where the repeating part of the sequence begins
    let cycleEndPoint = -1;   // The index of the current term that completes the cycle

    // --- Sequence Generation Loop with Cycle Detection ---
    // The loop continues until either:
    // 1. We have generated `modulusBase` terms (guaranteeing a cycle if N is large enough).
    // 2. We have generated `targetTermCount` terms (if N is smaller than the cycle length).
    // 3. A cycle is detected.
    while (sequenceIndex < modulusBase && sequenceIndex < targetTermCount) {
        // Check if `currentSequenceTerm` has been seen before
        if (valueToFirstIndexMap.has(currentSequenceTerm)) {
            cycleStartPoint = valueToFirstIndexMap.get(currentSequenceTerm); // Found the start of the cycle
            cycleEndPoint = sequenceIndex; // The current index marks the end of the non-repeating part + beginning of repeating part
            break; // Cycle detected, exit sequence generation
        }

        // If the term is new, record its first occurrence and add it to our sequence
        valueToFirstIndexMap.set(currentSequenceTerm, sequenceIndex);
        generatedSequence.push(currentSequenceTerm);

        // Compute the next term in the sequence
        currentSequenceTerm = calculateNextTerm(currentSequenceTerm, modulusBase);
        sequenceIndex++;
    }

    // --- Summation Logic ---
    let finalTotalSum = 0;

    // Scenario 1: No cycle was detected within the `targetTermCount` or `modulusBase` terms,
    // or `targetTermCount` is small enough that it falls entirely within the non-repeating prefix.
    if (cycleStartPoint === -1 || targetTermCount <= cycleStartPoint) {
        // In this case, simply sum all terms generated up to `targetTermCount`.
        // The `Math.min` ensures we don't try to access beyond the generated sequence length.
        const effectiveLimit = Math.min(targetTermCount, generatedSequence.length);
        for (let i = 0; i < effectiveLimit; i++) {
            finalTotalSum += generatedSequence[i];
        }
        console.log(finalTotalSum);
        return; // Summation complete for this scenario
    }

    // Scenario 2: A cycle was successfully detected.
    // Step 1: Sum the non-repeating prefix part of the sequence.
    for (let i = 0; i < cycleStartPoint; i++) {
        finalTotalSum += generatedSequence[i];
    }

    // Calculate the length of the detected cycle.
    const detectedCycleLength = cycleEndPoint - cycleStartPoint;

    // Defensive check: A cycle length must be positive.
    if (detectedCycleLength <= 0) {
        // If this happens, it indicates a logical error in cycle detection or an edge case
        // where cycleStartPoint == cycleEndPoint (e.g., a single-element cycle at the very beginning).
        // For robustness, sum the remaining terms directly up to targetTermCount.
        for (let i = cycleStartPoint; i < Math.min(targetTermCount, generatedSequence.length); i++) {
             finalTotalSum += generatedSequence[i];
        }
        console.log(finalTotalSum);
        return;
    }

    // Step 2: Calculate the sum of one full cycle.
    let sumOfSingleCycle = 0;
    for (let i = cycleStartPoint; i < cycleEndPoint; i++) {
        sumOfSingleCycle += generatedSequence[i];
    }

    // Calculate how many terms remain to be summed after the non-repeating prefix.
    const termsRemainingAfterPrefix = targetTermCount - cycleStartPoint;

    // Determine how many full cycles fit into the remaining terms.
    const numberOfCompleteCycles = Math.floor(termsRemainingAfterPrefix / detectedCycleLength);
    finalTotalSum += sumOfSingleCycle * numberOfCompleteCycles;

    // Step 3: Sum the remaining partial cycle terms.
    // These are the terms after the full cycles, at the beginning of the cycle segment.
    const remainingTermsInPartialCycle = termsRemainingAfterPrefix % detectedCycleLength;
    for (let i = 0; i < remainingTermsInPartialCycle; i++) {
        finalTotalSum += generatedSequence[cycleStartPoint + i];
    }

    // Output the final calculated sum to standard output.
    console.log(finalTotalSum);
};

// --- Main Execution Block ---
// This part handles reading the input from standard input and calling the main processing function.
const { readFileSync } = require('fs');

try {
    // Read the entire content of /dev/stdin, convert to UTF-8, and remove leading/trailing whitespace.
    const inputContent = readFileSync("/dev/stdin", "utf8").trim();
    executeSequenceSummation(inputContent);
} catch (error) {
    // Catch and report any errors that occur during file reading or processing.
    console.error("An error occurred during input processing:", error.message);
}