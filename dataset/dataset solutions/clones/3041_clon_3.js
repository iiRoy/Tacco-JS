'use strict';

// Helper function for modular arithmetic, ensuring results are always positive within the modulus.
function calculateModularValue(inputVal, moduloBase) {
    let result = inputVal % moduloBase;
    return result < 0 ? result + moduloBase : result; // Adjust negative results to be positive.
}

// This function encapsulates the main logic for processing input and calculating the result.
function processInputData(rawTextInput) {
    // Define a constant for the primary modulus used in calculations.
    // This value is crucial for preventing integer overflow and ensuring correct arithmetic in modular fields.
    const MODULUS_CONSTANT = 998244353; // Renamed from K to be more descriptive.

    // A placeholder constant, demonstrating an added non-essential fragment.
    // This value is not directly used in the core algorithm but could represent a system limit or a configuration.
    const SYSTEM_UPPER_BOUND = 1_000_000_000_000; // New fragment, replacing the concept of the original 'M'.

    // --- Input Sanitation and Parsing ---
    // First, remove any leading or trailing whitespace from the raw input string.
    const trimmedInput = rawTextInput.trim();

    // Implement a guard clause: If the input is empty after trimming, log an error and exit.
    if (!trimmedInput) {
        console.error("Error: Provided input data is empty or consists only of whitespace.");
        return; // Terminate execution gracefully.
    }

    // Split the cleaned input string into an array of string parts using any whitespace as a delimiter.
    const stringComponentArray = trimmedInput.split(/\s+/);

    // Convert each string component into an integer. Using `Number()` for type coercion.
    // This is an alternative to `parseInt(val, 10)` or `val - 0`.
    const numericalDataSet = stringComponentArray.map(Number); // Updated conversion method.

    // Another guard clause: Check if any conversion resulted in NaN (Not a Number).
    if (numericalDataSet.some(isNaN)) {
        console.error("Error: Input data contains non-numeric values that cannot be processed.");
        return; // Terminate execution.
    }

    // The first number in the dataset represents the count of subsequent elements.
    const numberOfElements = numericalDataSet.shift(); // Renamed from N.

    // The remaining numbers are the actual item values.
    const itemValuesArray = numericalDataSet; // Renamed from input (after shift).

    // Validate if the declared number of elements matches the actual count of item values.
    if (numberOfElements < 0 || numberOfElements !== itemValuesArray.length) {
        console.error("Error: Mismatch detected between declared element count and actual data length.");
        return; // Terminate if data integrity is compromised.
    }

    // Calculate the total sum of all item values.
    const collectiveSum = itemValuesArray.reduce((accumulator, currentVal) => accumulator + currentVal, 0); // Renamed from sum.

    // Determine the upper bound for sums in the DP tables, which is half of the collective sum, floored.
    const maxHalfSumBoundary = Math.floor(collectiveSum / 2); // Renamed from half.

    // --- Dynamic Programming Table 1: Dual-Choice Partition Ways ---
    // This 2D array, `partitionCountsDualChoice`, stores the number of ways to achieve a specific sum `j`
    // using a subset of the first `i` elements. Each element, if chosen, can be assigned one of two distinct states.
    // Original comment: "dp[i][j]でinput[0~i]のうち任意個のg,bを使って合計をjにする場合の数"
    // Now rewritten and expanded for clarity.
    const partitionCountsDualChoice = Array.from(
        { length: numberOfElements + 1 },
        () => Array(maxHalfSumBoundary + 1).fill(0)
    ); // Renamed from dp, updated initialization using Array.from.

    // Base case for DP: There is exactly one way to achieve a sum of 0 using zero elements.
    partitionCountsDualChoice[0][0] = 1;

    // Populate the DP table using a nested loop approach.
    for (let currentElementIndex = 0; currentElementIndex < numberOfElements; currentElementIndex++) { // Renamed i.
        const valueOfCurrentElement = itemValuesArray[currentElementIndex]; // New helper variable for readability.

        for (let currentAccumulatedSum = 0; currentAccumulatedSum <= maxHalfSumBoundary; currentAccumulatedSum++) { // Renamed j.
            // Scenario A: The current element is NOT included in the subset.
            // The ways to reach `currentAccumulatedSum` with `currentElementIndex + 1` elements
            // are at least the ways to reach the same sum with `currentElementIndex` elements.
            partitionCountsDualChoice[currentElementIndex + 1][currentAccumulatedSum] = calculateModularValue(
                partitionCountsDualChoice[currentElementIndex + 1][currentAccumulatedSum] + partitionCountsDualChoice[currentElementIndex][currentAccumulatedSum],
                MODULUS_CONSTANT
            );

            // Scenario B: The current element IS included in the subset.
            // Check if adding the current element's value would exceed our target sum boundary.
            if (currentAccumulatedSum + valueOfCurrentElement <= maxHalfSumBoundary) {
                // If included, this element can be chosen in one of two ways (e.g., 'green' or 'blue').
                // Thus, we multiply the previous ways by 2.
                const waysWhenPicked = calculateModularValue(
                    2 * partitionCountsDualChoice[currentElementIndex][currentAccumulatedSum],
                    MODULUS_CONSTANT
                );
                partitionCountsDualChoice[currentElementIndex + 1][currentAccumulatedSum + valueOfCurrentElement] = calculateModularValue(
                    partitionCountsDualChoice[currentElementIndex + 1][currentAccumulatedSum + valueOfCurrentElement] + waysWhenPicked,
                    MODULUS_CONSTANT
                );
            }
        }
    }

    // --- Initial Result Calculation for Overall Answer ---
    // Start with a base result representing 3 raised to the power of `numberOfElements` (3^N) modulo `MODULUS_CONSTANT`.
    // This value often represents the total number of ways to assign one of three states to each item.
    let finalComputedResult = 1; // Renamed from ans.
    for (let iterationCounter = 0; iterationCounter < numberOfElements; iterationCounter++) { // Renamed i.
        finalComputedResult = calculateModularValue(finalComputedResult * 3, MODULUS_CONSTANT);
    }

    // Adjust the `finalComputedResult` by subtracting values derived from the first DP table.
    // This step is typically part of an inclusion-exclusion principle specific to the problem.
    // Original: dp[N].forEach(function(x,i,arr){ ans-=3*x; });
    // Rewritten using a more modern `for...of` loop and clearer variable names.
    const lastRowDualChoice = partitionCountsDualChoice[numberOfElements];
    for (const countOfWays of lastRowDualChoice) { // Renamed x to countOfWays.
        const termToSubtract = calculateModularValue(3 * countOfWays, MODULUS_CONSTANT);
        finalComputedResult = calculateModularValue(finalComputedResult - termToSubtract, MODULUS_CONSTANT);
    }

    // --- Dynamic Programming Table 2: Single-Choice Partition Ways ---
    // This 2D array, `partitionCountsSingleChoice`, tracks the number of ways to achieve a specific sum `j`
    // using a subset of the first `i` elements, where each chosen element can only be assigned one specific state.
    // Original comment: "DP[i][j]でinput[0~i]のうち任意個のgを使って合計をjにする場合の数"
    // Now rewritten and expanded.
    const partitionCountsSingleChoice = Array.from(
        { length: numberOfElements + 1 },
        () => Array(maxHalfSumBoundary + 1).fill(0)
    ); // Renamed from DP, updated initialization.

    // Base case: One way to achieve a sum of 0 with no elements.
    partitionCountsSingleChoice[0][0] = 1;

    // Populate the second DP table.
    for (let currentElementIndex = 0; currentElementIndex < numberOfElements; currentElementIndex++) {
        const valueOfCurrentElement = itemValuesArray[currentElementIndex]; // New helper variable.

        for (let currentAccumulatedSum = 0; currentAccumulatedSum <= maxHalfSumBoundary; currentAccumulatedSum++) {
            // Scenario A: The current element is NOT included.
            partitionCountsSingleChoice[currentElementIndex + 1][currentAccumulatedSum] = calculateModularValue(
                partitionCountsSingleChoice[currentElementIndex + 1][currentAccumulatedSum] + partitionCountsSingleChoice[currentElementIndex][currentAccumulatedSum],
                MODULUS_CONSTANT
            );

            // Scenario B: The current element IS included.
            // Here, it can only be assigned one state, so no multiplication factor like '2'.
            if (currentAccumulatedSum + valueOfCurrentElement <= maxHalfSumBoundary) {
                partitionCountsSingleChoice[currentElementIndex + 1][currentAccumulatedSum + valueOfCurrentElement] = calculateModularValue(
                    partitionCountsSingleChoice[currentElementIndex + 1][currentAccumulatedSum + valueOfCurrentElement] + partitionCountsSingleChoice[currentElementIndex][currentAccumulatedSum],
                    MODULUS_CONSTANT
                );
            }
        }
    }

    // --- Final Adjustment to the Result ---
    // Apply an additional adjustment if the total collective sum of all elements is an even number.
    // Using a bitwise AND operation `& 1` is a common and slightly optimized way to check for odd/even parity.
    if ((collectiveSum & 1) === 0) { // Updated `sum%2===0` to `(collectiveSum & 1) === 0`.
        // Add 3 times the number of ways to achieve exactly `maxHalfSumBoundary`
        // using all elements under the single-choice rule.
        const termToAdd = calculateModularValue(
            3 * partitionCountsSingleChoice[numberOfElements][maxHalfSumBoundary],
            MODULUS_CONSTANT
        );
        finalComputedResult = calculateModularValue(finalComputedResult + termToAdd, MODULUS_CONSTANT);
    }

    // The original `ans+=K; ans%=K;` line is now implicitly handled by `calculateModularValue`
    // ensuring the final result is always positive and within the modulo range. Thus, it is 'deleted' as a separate step.

    // Output the final computed result to the console.
    console.log(finalComputedResult);
}

// This is the entry point for running the script in a Node.js environment.
// It reads the input from standard input (`/dev/stdin`) using Node's `fs` module.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));