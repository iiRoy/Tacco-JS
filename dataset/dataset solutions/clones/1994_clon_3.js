((rawInput) => {
    // Define a constant for the modulo operation to enhance clarity and maintainability.
    const MODULO_CONSTANT = 1_000_000_007; // A common prime modulus in competitive programming

    // --- Input Processing and Initial Validation ---
    // The input string is expected to contain two space-separated integers.
    // Robustly parse the string by trimming whitespace, splitting by any sequence of spaces,
    // and filtering out empty strings that might result from extra spaces.
    const numericParts = rawInput.trim().split(/\s+/).filter(Boolean);

    // Ensure the input adheres to the expected format.
    if (numericParts.length !== 2) {
        console.error("Input format error: Expected exactly two space-separated integers.");
        return; // Terminate execution if input is malformed.
    }

    // Convert string parts to integers using parseInt with radix 10 for explicit base.
    const totalSteps = parseInt(numericParts[0], 10); // Represents 'n' from original problem
    const maxValueRange = parseInt(numericParts[1], 10); // Represents 'k' from original problem

    // Perform basic validation on the parsed numeric values.
    if (isNaN(totalSteps) || isNaN(maxValueRange) || totalSteps <= 0 || maxValueRange <= 0) {
        console.error("Input value error: Both N and K must be positive integers.");
        return; // Terminate if numbers are invalid.
    }

    // --- Core Utility Function: Greatest Common Divisor (GCD) ---
    // This function computes the GCD of two numbers using the Euclidean algorithm.
    // It's implemented recursively for conciseness.
    const computeGreatestCommonDivisor = (firstNum, secondNum) => {
        // Ensure inputs are non-negative for standard GCD definition.
        let a = Math.abs(firstNum);
        let b = Math.abs(secondNum);

        // Inner recursive helper to perform the Euclidean algorithm.
        const recursiveGcdHelper = (currentA, currentB) => {
            if (currentB === 0) {
                return currentA; // Base case: GCD is currentA when currentB is zero.
            }
            // Recursive step: replace (a, b) with (b, a % b).
            const remainder = currentA % currentB;
            return recursiveGcdHelper(currentB, remainder);
        };

        return recursiveGcdHelper(a, b);
    };

    // --- Pre-computation Phase: Building GCD Frequency Data ---
    // This phase generates a lookup table `gcdFrequencyMaps`.
    // `gcdFrequencyMaps[i]` will contain a list of [GCD_value, count] pairs
    // representing the frequencies of GCDs when `(i+1)` is paired with all `(j+1)`
    // where `0 <= j < maxValueRange`.
    const gcdFrequencyMaps = [];

    // Iterate for the first number (from 1 to maxValueRange).
    for (let i = 0; i < maxValueRange; ++i) {
        // Use a Map to efficiently count frequencies of GCDs for the current `i`.
        // A Map is generally more flexible than a plain object for dynamic key types.
        const currentIterationGcdCounts = new Map();

        // Iterate for the second number (from 1 to maxValueRange).
        for (let j = 0; j < maxValueRange; ++j) {
            // Calculate the GCD for the pair `(i+1, j+1)`.
            const calculatedGcd = computeGreatestCommonDivisor(i + 1, j + 1);
            // Increment the count for this specific GCD value in the map.
            currentIterationGcdCounts.set(calculatedGcd, (currentIterationGcdCounts.get(calculatedGcd) || 0) + 1);
        }

        // Convert the Map entries into an array of `[key, value]` pairs.
        // This format is convenient for subsequent iteration in the DP phase.
        const formattedGcdPairs = Array.from(currentIterationGcdCounts.entries()).map(([gcdVal, count]) => [Number(gcdVal), count]);
        gcdFrequencyMaps.push(formattedGcdPairs);
    }

    // --- Dynamic Programming Phase ---
    // The `dpTable` stores the dynamic programming states.
    // `dpTable[step][gcdIndex]` represents a cumulative count or possibility
    // after `step` iterations, where `gcdIndex` (0-indexed) corresponds to
    // a GCD value of `gcdIndex + 1`.
    // Each row in `dpTable` will have `maxValueRange` elements, covering GCDs from 1 to `maxValueRange`.
    const dpTable = [];

    // Initialize the base case (the first row, corresponding to step 0).
    // All possible GCD values (1 to maxValueRange) are initialized with a count of 1.
    const initialDpRow = new Array(maxValueRange).fill(1);
    dpTable.push(initialDpRow);

    // Iterate for `totalSteps - 1` subsequent steps, building up the DP table.
    // `currentIteration` ranges from 1 up to `totalSteps - 1`.
    for (let currentIteration = 1; currentIteration < totalSteps; ++currentIteration) {
        // Create a new row for the current iteration, initially filled with zeros.
        const newDpRow = new Array(maxValueRange).fill(0);

        // Iterate through each possible GCD index from the previous step.
        // `prevGcdValueIndex` is 0-indexed, representing GCD value `prevGcdValueIndex + 1`.
        for (let prevGcdValueIndex = 0; prevGcdValueIndex < maxValueRange; ++prevGcdValueIndex) {
            // Optimization: If the count for this GCD in the previous step is zero,
            // there's no contribution from it, so skip calculations.
            if (dpTable[currentIteration - 1][prevGcdValueIndex] === 0) {
                continue;
            }

            // Retrieve the precomputed GCD frequency list corresponding to the
            // `prevGcdValueIndex + 1` (which is `i+1` from the pre-computation loop).
            const relevantGcdFreqs = gcdFrequencyMaps[prevGcdValueIndex];

            // Iterate through each `[GCD_value, count]` pair in the relevant list.
            for (const [resultingGcd, frequencyCount] of relevantGcdFreqs) {
                // Update the `newDpRow` for the `resultingGcd`.
                // Convert the 1-indexed `resultingGcd` to a 0-indexed array position.
                // Apply modulo arithmetic to the sum at each step to prevent integer overflow.
                newDpRow[resultingGcd - 1] = (newDpRow[resultingGcd - 1] +
                                            (dpTable[currentIteration - 1][prevGcdValueIndex] * frequencyCount)) % MODULO_CONSTANT;
            }
        }
        dpTable.push(newDpRow); // Add the newly computed row to the DP table.
    }

    // --- Final Result Aggregation ---
    // The final result is derived from the last row of the `dpTable`.
    // Instead of popping, we directly access the last element.
    const finalStateValues = dpTable[totalSteps - 1];

    let overallSum = 0n; // Use BigInt for summation to safely handle potentially large intermediate products before modulo.

    // Iterate through the final state values.
    // Each element `finalStateValues[idx]` represents a count for GCD `(idx + 1)`.
    for (let idx = 0; idx < finalStateValues.length; ++idx) {
        // Calculate the weighted term: (actual GCD value) * (its count).
        // Apply modulo at each addition to keep the sum within bounds.
        // Ensure all operands are BigInt before multiplication/addition.
        const currentTerm = (BigInt(idx + 1) * BigInt(finalStateValues[idx]));
        overallSum = (overallSum + currentTerm) % BigInt(MODULO_CONSTANT);
    }

    // Output the final accumulated result, converting back to a standard Number.
    console.log(Number(overallSum));

})(require("fs").readFileSync("/dev/stdin", "utf8")); // Immediately invoke the function with input from stdin.