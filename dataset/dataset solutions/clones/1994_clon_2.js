(inputString => {
    // Parse input values from the provided string.
    // The first part is the number of iterations, the second is the maximum value.
    const numIterations = Math.floor(inputString.split(' ')[0]);
    const maxVal = Math.floor(inputString.split(' ')[1]);

    /**
     * Calculates the greatest common divisor (GCD) of two non-negative integers.
     * This implementation uses the Euclidean algorithm, expressed recursively.
     * @param {number} valA - The first integer for GCD calculation.
     * @param {number} valB - The second integer for GCD calculation.
     * @returns {number} The greatest common divisor of valA and valB.
     */
    const greatestCommonDivisor = (valA, valB) => {
        // Inner recursive function to perform the Euclidean algorithm.
        // If paramB is zero, paramA is the GCD. Otherwise, recurse with paramB and the remainder of paramA / paramB.
        const recursiveGcd = (paramA, paramB) => paramB ? recursiveGcd(paramB, paramA % paramB) : paramA;
        return recursiveGcd(valA, valB);
    };

    // Pre-computation phase: Build a lookup table for GCD counts.
    // `precomputedData[x]` will store an array of `[gcd_value, count]` pairs.
    // Each pair indicates that `gcd_value` occurs `count` times when `(x+1)` is paired with `(y+1)` for `y` from 0 to `maxVal-1`.
    const precomputedData = [];
    for (let outerIdx = 0; outerIdx < maxVal; ++outerIdx) {
        // `currentPreaddMap` temporarily stores the frequency of each GCD for the current `outerIdx`.
        const currentPreaddMap = {};
        for (let innerIdx = 0; innerIdx < maxVal; ++innerIdx) {
            // Calculate the GCD for the current pair of numbers (outerIdx + 1, innerIdx + 1).
            const commonDiv = greatestCommonDivisor(outerIdx + 1, innerIdx + 1);
            // Increment the count for this specific GCD value in the map.
            if (currentPreaddMap[commonDiv] === undefined) {
                currentPreaddMap[commonDiv] = 0;
            }
            currentPreaddMap[commonDiv] += 1;
        }
        // Convert the map of GCD counts into an array of `[key, value]` pairs.
        // This format is more convenient for iteration in the dynamic programming step.
        const currentPreaddList = [];
        Object.keys(currentPreaddMap).forEach(mapEntryKey => {
            currentPreaddList.push([+mapEntryKey, currentPreaddMap[mapEntryKey]]);
        }, currentPreaddMap); // The `thisArg` is passed but not strictly necessary for this arrow function.
        precomputedData.push(currentPreaddList);
    }

    // Initialize the dynamic programming table.
    // `dynamicProgTable[i][j]` will store the sum of ways to reach a state after `i` iterations
    // where the last chosen number resulted in a GCD of `j+1`.
    // The first row (index 0) is initialized with 1s, representing the base case or initial state.
    const dynamicProgTable = [new Array(maxVal + 1).fill(1)];

    // Define the modulo constant to prevent integer overflow.
    const MODULO_CONSTANT = 1000000007; // Equivalent to 1e+9+7

    // Populate the dynamic programming table for `numIterations - 1` steps.
    // `iterationStep` represents the current iteration number (from 1 to numIterations - 1).
    for (let iterationStep = 1; iterationStep < numIterations; ++iterationStep) {
        // Add a new row for the current iteration, initialized with zeros.
        dynamicProgTable.push(new Array(maxVal + 1).fill(0));
        // `prevColIdx` iterates through the possible GCD values from the previous iteration (0 to maxVal - 1).
        for (let prevColIdx = 0; prevColIdx < maxVal; ++prevColIdx) {
            // Iterate through the precomputed GCD entries for the current `prevColIdx`.
            // `precomputedEntry[0]` is the GCD value, `precomputedEntry[1]` is its count.
            for (let precomputedEntry of precomputedData[prevColIdx]) {
                const targetGcdValue = precomputedEntry[0];
                const countOfGcd = precomputedEntry[1];

                // The index in the DP table is 0-based, so `targetGcdValue - 1`.
                const targetGcdIndex = targetGcdValue - 1;

                // Update the current DP state:
                // Add the product of the previous DP state and the count of the current GCD.
                // Apply modulo operation to keep the result within bounds.
                dynamicProgTable[iterationStep][targetGcdIndex] =
                    (dynamicProgTable[iterationStep][targetGcdIndex] +
                    dynamicProgTable[iterationStep - 1][prevColIdx] * countOfGcd) % MODULO_CONSTANT;
            }
        }
    }

    // Retrieve the last row of the DP table, which contains the results after `numIterations` steps.
    const finalRow = dynamicProgTable.pop();
    let finalResult = 0;

    // Calculate the final sum: sum of (GCD_value * count_for_that_GCD) for all GCDs in the final row.
    for (let resultIdx = 0; resultIdx < finalRow.length; ++resultIdx) {
        // `resultIdx + 1` gives the actual GCD value.
        finalResult = (finalResult + (resultIdx + 1) * finalRow[resultIdx]) % MODULO_CONSTANT;
    }

    // Print the final computed result to standard output.
    console.log(finalResult);

})(require("fs").readFileSync("/dev/stdin", "utf8"));
