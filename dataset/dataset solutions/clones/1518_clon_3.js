const computeSequenceSum = (inputString) => {
    // Parse the input parameters: total length, starting value, and modulus.
    const parameters = inputString.split(" ").map(Number);
    const totalTerms = parameters[0]; // N: The number of terms to sum.
    const initialValue = parameters[1]; // X: The first term of the sequence (a_0).
    const modulus = parameters[2]; // M: The modulus for sequence generation (a_k = (a_{k-1})^2 % M).

    // --- Input Validation and Edge Cases ---
    // The modulus must be a positive integer to ensure valid modulo operations and array indexing.
    if (modulus <= 0) {
        console.error("Error: Modulus must be a positive integer.");
        return 0; // Return 0 or throw an error for invalid input.
    }
    // If no terms are requested, the sum is trivially zero.
    if (totalTerms === 0) {
        return 0;
    }

    // --- Sequence Generation and Cycle Detection ---
    // `generatedValues`: This array stores the sequence terms (a_0, a_1, a_2, ...).
    // Values are always less than `modulus` after the first step. The array needs space for `modulus` elements.
    const generatedValues = Array.from({ length: modulus }, () => -1); // Initialize with -1 to indicate uncomputed.

    // `firstOccurrenceIndex`: This array acts as a hash map. It maps a sequence value (0 to M-1)
    // to the *first index* at which that value appeared in the `generatedValues` sequence.
    // It's crucial for detecting cycles. Initialized with -1.
    const firstOccurrenceIndex = Array.from({ length: modulus }, () => -1);

    // Calculate the initial term, ensuring it is within the range [0, modulus-1] for consistent indexing
    // in `firstOccurrenceIndex`. This handles cases where `initialValue` might be >= `modulus`.
    const startTermModulo = initialValue % modulus;
    generatedValues[0] = startTermModulo;
    firstOccurrenceIndex[startTermModulo] = 0;

    let currentStep = 1; // Tracks the current index in `generatedValues` we are computing.
    let cycleStartPoint = -1; // Stores the index where the detected cycle begins.
    let cycleEndPoint = -1;   // Stores the index where the cycle is first detected (first re-occurrence).

    // Generate sequence terms and detect cycles. A cycle *must* be detected within `modulus` steps.
    while (currentStep < modulus) {
        const previousTerm = generatedValues[currentStep - 1];
        const nextTerm = (previousTerm * previousTerm) % modulus; // Calculate the next term.
        generatedValues[currentStep] = nextTerm;

        // Check if `nextTerm` has been encountered before by looking it up in `firstOccurrenceIndex`.
        if (firstOccurrenceIndex[nextTerm] !== -1) {
            cycleStartPoint = firstOccurrenceIndex[nextTerm]; // The value `nextTerm` was first seen here.
            cycleEndPoint = currentStep;                     // The cycle ends (or repeats) at the current step.
            break; // Cycle found, exit the generation loop.
        } else {
            // Record the current step as the first time `nextTerm` was seen.
            firstOccurrenceIndex[nextTerm] = currentStep;
        }
        currentStep++;
    }

    // --- Summation Logic ---
    let overallSum = 0; // Accumulator for the total sum of `totalTerms`.

    // Case 1: No cycle was found within `modulus` steps, or `totalTerms` is less than or equal to the cycle detection point.
    // This implies either the sequence is very short, or it doesn't repeat within the `modulus` limit for `N`.
    if (cycleEndPoint === -1 || totalTerms <= cycleEndPoint) {
        // Sum only the first `totalTerms` values, up to what we have successfully generated.
        for (let j = 0; j < Math.min(totalTerms, currentStep); j++) {
            overallSum += generatedValues[j];
        }
        console.log(overallSum); // Output the result for this case.
        return; // Complete execution and return.
    }

    // Case 2: A cycle was successfully detected. Calculate the sum in three distinct parts:
    //         1. The non-cyclic prefix.
    //         2. Full repetitions of the cycle.
    //         3. A partial part of the cycle (if any remaining terms).

    // Part A: Sum the non-cyclic prefix.
    // These are terms from index 0 up to (but not including) `cycleStartPoint`.
    for (let j = 0; j < cycleStartPoint; j++) {
        overallSum += generatedValues[j];
    }

    // Calculate properties of the detected cycle for subsequent summation.
    const cycleLength = cycleEndPoint - cycleStartPoint;
    const termsRemainingAfterPrefix = totalTerms - cycleStartPoint;

    // Calculate the sum of one full repetition of the cycle.
    let sumOfOneCycle = 0;
    for (let j = cycleStartPoint; j < cycleEndPoint; j++) {
        sumOfOneCycle += generatedValues[j];
    }

    // Part B: Sum the full repetitions of the cycle.
    const numberOfFullCycles = Math.floor(termsRemainingAfterPrefix / cycleLength);
    overallSum += sumOfOneCycle * numberOfFullCycles;

    // Part C: Sum the remaining partial part of the cycle.
    // These are terms that extend into the cycle but do not complete another full cycle.
    const partialCycleRemainder = termsRemainingAfterPrefix % cycleLength;
    for (let j = 0; j < partialCycleRemainder; j++) {
        overallSum += generatedValues[cycleStartPoint + j];
    }

    // Output the final accumulated sum.
    console.log(overallSum);
};

// The example calls below are typically for testing and would not be part of the final generated code.
// computeSequenceSum("6 2 1001");
// computeSequenceSum("100 2 1002");
computeSequenceSum("1000 2 16");
// computeSequenceSum("19 3 4");
// computeSequenceSum("10000000000 10 99959");
// computeSequenceSum("10000000000 1889 99959");
// computeSequenceSum(require("fs").readFileSync("/dev/stdin", "utf8"));