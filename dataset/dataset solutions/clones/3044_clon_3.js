'use strict'; // Enforce strict JavaScript mode for cleaner code practices and error detection.

// A custom modular multiplication function designed to handle potential overflows
// when computing `(a * b) % m` where `a * b` might exceed JavaScript's
// `Number.MAX_SAFE_INTEGER` (which is approximately 9 * 10^15).
// This function utilizes the binary exponentiation (or Russian peasant multiplication) method,
// providing a robust alternative to a direct `(a * b) % m` when intermediate products are too large.
// This serves as a significant Type III structural modification, replacing a more
// obscure and context-specific overflow prevention strategy from the original code.
function safeModularMultiply(multiplierA, multiplierB, modulusValue) {
    let currentAccumulatedResult = 0;
    // Ensure `multiplierA` is within the modulus range to start.
    multiplierA = Number(multiplierA) % Number(modulusValue);

    // Basic guard clauses for negative inputs, although usually not expected in this context.
    if (multiplierA < 0) multiplierA += modulusValue;
    if (multiplierB < 0) multiplierB += modulusValue;

    // Loop continues as long as `multiplierB` has bits to process.
    while (multiplierB > 0) {
        // If the least significant bit of `multiplierB` is 1 (i.e., `multiplierB` is odd),
        // add `multiplierA` to our `currentAccumulatedResult`.
        if (multiplierB & 1) {
            currentAccumulatedResult = (currentAccumulatedResult + multiplierA) % modulusValue;
        }
        // Double `multiplierA` for the next iteration (effectively shifting left).
        multiplierA = (multiplierA * 2) % modulusValue;
        // Halve `multiplierB` (effectively shifting right).
        multiplierB >>= 1; // Equivalent to `multiplierB = Math.floor(multiplierB / 2)`
    }
    return currentAccumulatedResult;
}

// The core function responsible for processing the raw input and performing the main calculation.
// This replaces the original `Main` function, encapsulating the primary logic.
function ExecuteProblemSolution(rawInputData) {
    // Define the primary modulo constant, used for all arithmetic operations to keep results
    // within a manageable range and prevent integer overflow.
    const ARITHMETIC_MODULO = 998244353;

    // Step 1: Pre-process the raw input string.
    // - Trim any leading/trailing whitespace.
    // - Split the string into an array of segments based on any whitespace.
    // - Convert each segment to a `Number` type, explicitly handling potential `NaN` values.
    const numericInputSegments = rawInputData.trim().split(/\s+/).map(segment => {
        const parsedValue = Number(segment);
        // Input validation: If a segment cannot be converted to a valid number,
        // log a warning and default its value to 0 to prevent computation errors.
        if (isNaN(parsedValue)) {
            console.warn(`Non-numeric input detected: "${segment}". Treating as 0.`);
            return 0;
        }
        return parsedValue;
    });

    // Step 2: Extract the total count of elements from the beginning of the processed array.
    // This value, `totalProblemItems`, dictates the size of subsequent data structures and loops.
    let totalProblemItems = numericInputSegments.shift();

    // Critical Guard Clause: Validate `totalProblemItems`.
    // Ensure it's a positive integer; otherwise, the problem's logic is invalid,
    // and proceeding would lead to errors or nonsensical results.
    if (!Number.isInteger(totalProblemItems) || totalProblemItems <= 0) {
        console.error("Invalid or non-positive integer provided for the count of problem items. Terminating operation.");
        return 0; // Return a default error value.
    }

    // Step 3: The remaining segments in the array are the actual numbers for which
    // subset sums will be calculated using dynamic programming.
    const inputNumberSet = numericInputSegments;

    // Step 4: Calculate the sum of all numbers in `inputNumberSet`.
    // This `overallCollectionSum` is used to determine the target sum for the DP table.
    let overallCollectionSum = inputNumberSet.reduce((accumulator, currentElement) => accumulator + currentElement, 0);

    // Step 5: Determine the maximum target sum for subsets.
    // We're interested in subsets whose sum is at most half of the `overallCollectionSum`.
    const maximumSubsetSumTarget = Math.floor(overallCollectionSum / 2);

    // Step 6: Pre-calculate a series of factors: `3 * (2^index) % ARITHMETIC_MODULO`.
    // These factors are essential for later adjustments to the final answer.
    const precomputedPowerSeries = [];
    let currentFactorValue = 3; // Initial factor is 3 * 2^0 = 3.
    for (let currentFactorIdx = 0; currentFactorIdx < totalProblemItems; ++currentFactorIdx) {
        precomputedPowerSeries.push(currentFactorValue);
        // Use `safeModularMultiply` to compute the next factor to prevent overflow,
        // even though multiplying by 2 is unlikely to overflow `ARITHMETIC_MODULO` in one step,
        // this ensures consistency and robustness.
        currentFactorValue = safeModularMultiply(currentFactorValue, 2, ARITHMETIC_MODULO);
    }

    // Step 7: Initialize a 3D Dynamic Programming table.
    // `dpSolutions[i][j][k]` will store the number of ways to select `j` elements
    // from the first `i` items in `inputNumberSet` to achieve a sum of `k`.
    // `Array.from` is used here for a more modern and declarative array initialization
    // compared to nested `for` loops and pushes.
    const dpSolutions = Array.from({ length: totalProblemItems + 1 }, () =>
        Array.from({ length: totalProblemItems + 1 }, () =>
            Array.from({ length: maximumSubsetSumTarget + 1 }, () => 0)
        )
    );

    // Step 8: Establish the base case for the DP table.
    // With 0 items considered, selecting 0 elements yields a sum of 0 in 1 way (by choosing nothing).
    dpSolutions[0][0][0] = 1;

    // Step 9: Populate the DP table using nested loops.
    // `itemIndexCounter` iterates through each item in `inputNumberSet`.
    for (let itemIndexCounter = 0; itemIndexCounter < totalProblemItems; ++itemIndexCounter) {
        // The value of the current item being processed.
        const currentItemNumericalValue = inputNumberSet[itemIndexCounter];

        // `selectedCount` iterates through the number of elements chosen so far.
        for (let selectedCount = 0; selectedCount <= itemIndexCounter; ++selectedCount) {
            // `currentAchievedSum` iterates through all possible sums up to `maximumSubsetSumTarget`.
            for (let currentAchievedSum = 0; currentAchievedSum <= maximumSubsetSumTarget; ++currentAchievedSum) {

                // Option A: Do NOT include the `currentItemNumericalValue`.
                // The ways to achieve `currentAchievedSum` with `selectedCount` elements
                // from `itemIndexCounter + 1` items are at least the ways from `itemIndexCounter` items.
                dpSolutions[itemIndexCounter + 1][selectedCount][currentAchievedSum] =
                    (dpSolutions[itemIndexCounter + 1][selectedCount][currentAchievedSum] +
                     dpSolutions[itemIndexCounter][selectedCount][currentAchievedSum]) % ARITHMETIC_MODULO;

                // Option B: DO include the `currentItemNumericalValue`.
                // This is only possible if adding the current item's value does not exceed the target sum.
                if (currentAchievedSum + currentItemNumericalValue <= maximumSubsetSumTarget) {
                    // The ways to achieve `currentAchievedSum + currentItemNumericalValue` with
                    // `selectedCount + 1` elements from `itemIndexCounter + 1` items are increased.
                    dpSolutions[itemIndexCounter + 1][selectedCount + 1][currentAchievedSum + currentItemNumericalValue] =
                        (dpSolutions[itemIndexCounter + 1][selectedCount + 1][currentAchievedSum + currentItemNumericalValue] +
                         dpSolutions[itemIndexCounter][selectedCount][currentAchievedSum]) % ARITHMETIC_MODULO;
                }
            }
        }
    }

    // Step 10: Initialize the `finalCalculatedResult` accumulator.
    let finalCalculatedResult = 1;

    // Step 11: Calculate `3^totalProblemItems % ARITHMETIC_MODULO`.
    // This is performed iteratively using `safeModularMultiply` for robustness against large numbers.
    for (let iterationIndex = 0; iterationIndex < totalProblemItems; ++iterationIndex) {
        finalCalculatedResult = safeModularMultiply(finalCalculatedResult, 3, ARITHMETIC_MODULO);
    }

    // Step 12: Adjust `finalCalculatedResult` by subtracting terms derived from the DP table.
    // This loop iterates through all possible counts of chosen elements.
    for (let chosenElementCount = 0; chosenElementCount < totalProblemItems; ++chosenElementCount) {
        // Retrieve the pre-calculated factor `3 * (2^chosenElementCount) % ARITHMETIC_MODULO`.
        const currentPowerFactor = precomputedPowerSeries[chosenElementCount];
        
        // Sum all ways to achieve any sum `k` (up to `maximumSubsetSumTarget`) using
        // exactly `chosenElementCount` elements from all `totalProblemItems`.
        // The `reduce` method efficiently aggregates these counts.
        // The `if (j <= half)` condition from the original code is implicitly handled
        // as the `dpSolutions` inner array is already sized to `maximumSubsetSumTarget + 1`.
        let totalWaysForThisCount = dpSolutions[totalProblemItems][chosenElementCount].reduce((sumAccumulator, waysAtSpecificSum) => {
            return (sumAccumulator + waysAtSpecificSum) % ARITHMETIC_MODULO;
        }, 0);

        // Compute the term to subtract using `safeModularMultiply` to prevent overflow.
        // This replaces the complex `n, r, M` logic from the original code, which served the same purpose
        // of safely computing `(currentPowerFactor * totalWaysForThisCount) % ARITHMETIC_MODULO` for large numbers.
        const subtractionTerm = safeModularMultiply(currentPowerFactor, totalWaysForThisCount, ARITHMETIC_MODULO);
        
        // Subtract the term, ensuring the result remains positive by adding `ARITHMETIC_MODULO`
        // before the final modulo operation.
        finalCalculatedResult = (finalCalculatedResult - subtractionTerm + ARITHMETIC_MODULO) % ARITHMETIC_MODULO;
    }

    // Step 13: Final normalization of `finalCalculatedResult`.
    // This ensures the answer is always positive and within the `ARITHMETIC_MODULO` range.
    finalCalculatedResult = (finalCalculatedResult % ARITHMETIC_MODULO + ARITHMETIC_MODULO) % ARITHMETIC_MODULO;

    // Step 14: Conditional adjustment based on the parity of `overallCollectionSum`.
    // If the total sum of all input numbers is even, an additional term is added.
    if (overallCollectionSum % 2 === 0) {
        let evenSumSpecificComponent = 0;
        // Sum up specific DP entries where the sum exactly equals `maximumSubsetSumTarget`.
        for (let currentJLoop = 0; currentJLoop <= totalProblemItems; ++currentJLoop) {
            evenSumSpecificComponent = (evenSumSpecificComponent + dpSolutions[totalProblemItems][currentJLoop][maximumSubsetSumTarget]) % ARITHMETIC_MODULO;
        }
        // Multiply this accumulated sum by 3 and add to the `finalCalculatedResult`,
        // again using `safeModularMultiply` for safety.
        const additionalEvenTerm = safeModularMultiply(3, evenSumSpecificComponent, ARITHMETIC_MODULO);
        finalCalculatedResult = (finalCalculatedResult + additionalEvenTerm) % ARITHMETIC_MODULO;
    }

    return finalCalculatedResult;
}

// Standard boilerplate for reading input in competitive programming environments (Node.js).
// The `Main` function from the original is effectively replaced by `ExecuteProblemSolution`
// and this invocation block, promoting better separation of concerns.
const inputContentString = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(ExecuteProblemSolution(inputContentString));