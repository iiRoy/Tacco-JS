// This module provides a utility function to calculate the number of non-negative integer solutions
// to a linear Diophantine equation of the form:
// A * x + B * y + C * z = N
// where A, B, C are positive integer coefficients, N is the target sum,
// and x, y, z are the non-negative integer variables.

/**
 * Calculates the total number of distinct non-negative integer combinations (x, y, z)
 * that satisfy the equation: coeffA * x + coeffB * y + coeffC * z = targetValue.
 *
 * The function reads input coefficients and the target sum from a string,
 * then iterates through possible values for x, y, and z, counting valid combinations.
 *
 * @param {string} rawDataString - A string containing four space-separated integers:
 *                                 "coeffA coeffB coeffC targetValue".
 *                                 Example: "1 2 3 10"
 * @returns {void} - Prints the total count of valid combinations to the console.
 */
function processInputData(rawDataString) {
    // Split the raw input string by spaces to get individual value strings.
    const parsedValues = rawDataString.split(' ');

    // Parse the string values into base-10 integers.
    // These represent the coefficients for the three variables and the target sum.
    const coeffA = parseInt(parsedValues[0], 10); // Coefficient for the first variable (e.g., 'r' in original)
    const coeffB = parseInt(parsedValues[1], 10); // Coefficient for the second variable (e.g., 'g' in original)
    const coeffC = parseInt(parsedValues[2], 10); // Coefficient for the third variable (e.g., 'b' in original)
    const targetValue = parseInt(parsedValues[3], 10); // The desired sum (e.g., 'n' in original)

    // --- Input Validation and Edge Case Handling ---

    // If the target sum is negative, no non-negative combination of positive coefficients can reach it.
    if (targetValue < 0) {
        console.log(0); // Zero valid combinations
        return;
    }

    // This problem is typically defined for positive integer coefficients.
    // If any coefficient is zero or negative, the problem's behavior changes significantly.
    // For instance, a zero coefficient might lead to infinite solutions if the target is reachable
    // by other means, or cause issues with loop termination logic.
    // To ensure the integrity of the counting logic (which assumes positive coefficients for efficient iteration),
    // we'll explicitly handle non-positive coefficients as an invalid input condition for this specific solver.
    // A more complex solution might branch based on coefficient values, but for a Type III clone,
    // adhering to typical problem constraints is reasonable.
    if (coeffA <= 0 || coeffB <= 0 || coeffC <= 0) {
        // If all coefficients are zero, then:
        // - If targetValue is 0, (0,0,0) is one solution.
        // - If targetValue is not 0, no solutions.
        if (coeffA === 0 && coeffB === 0 && coeffC === 0) {
            console.log(targetValue === 0 ? 1 : 0);
        } else {
            // For other cases with non-positive coefficients, assuming 0 valid combinations
            // as this implies the problem is ill-defined for this specific solver's assumptions.
            console.log(0);
        }
        return;
    }

    // Initialize a counter for the number of successful combinations found.
    let validCombinationCount = 0;

    // --- Nested Loop Iteration for Combinations ---

    // Outer loop for the first variable (iterA).
    // It iterates from 0 upwards. The loop continues indefinitely until an explicit `break` condition is met.
    // The `break` is triggered when `iterA * coeffA` exceeds the `targetValue`.
    for (let iterA = 0; ; ++iterA) {
        const currentSumA = iterA * coeffA; // Calculate the contribution from the first variable.

        // If the current contribution from 'A' alone already exceeds the target,
        // then increasing 'iterA' further will only make the sum larger.
        // No more combinations are possible for this outer loop, so we break.
        if (currentSumA > targetValue) {
            break;
        }

        // Optimization: If 'A' alone sums up to the target, then 'B' and 'C' must be zero.
        // This is a valid combination. Increment the counter and skip to the next 'iterA'
        // without entering the inner loops for this specific 'iterA' value.
        if (currentSumA === targetValue) {
            validCombinationCount++;
            continue; // Proceed to the next iteration of the outer loop.
        }

        // Inner loop for the second variable (iterB).
        // Similar to the outer loop, it iterates from 0 and breaks when its contribution
        // (along with 'A's contribution) exceeds the target.
        for (let iterB = 0; ; ++iterB) {
            const currentSumAB = currentSumA + (iterB * coeffB); // Sum of contributions from 'A' and 'B'.

            // If the sum from 'A' and 'B' combined exceeds the target,
            // no further combinations are possible by increasing 'iterB' for the current 'iterA'.
            if (currentSumAB > targetValue) {
                break; // Break out of the inner loop (for 'iterB').
            }

            // Optimization: If 'A' and 'B' together sum up to the target, then 'C' must be zero.
            // This is a valid combination. Increment the counter and skip to the next 'iterB'.
            if (currentSumAB === targetValue) {
                validCombinationCount++;
                continue; // Proceed to the next iteration of the inner loop.
            }

            // Innermost loop for the third variable (iterC).
            // Iterates from 0 and breaks when the total sum exceeds the target.
            for (let iterC = 0; ; ++iterC) {
                const finalSum = currentSumAB + (iterC * coeffC); // Total sum of contributions from 'A', 'B', and 'C'.

                // If the total sum exceeds the target, no further combinations are possible
                // by increasing 'iterC' for the current 'iterA' and 'iterB'.
                if (finalSum > targetValue) {
                    break; // Break out of the innermost loop (for 'iterC').
                }

                // If the total sum exactly matches the target, we've found a valid combination.
                if (finalSum === targetValue) {
                    validCombinationCount++; // Increment the counter.
                    // Optimization: Since coeffC is positive (guarded earlier),
                    // increasing iterC further would make finalSum > targetValue.
                    // Therefore, for a given currentSumAB, there can only be one iterC that matches.
                    break; // Break out of the innermost loop, as no other 'iterC' will work.
                }
                // If finalSum < targetValue, continue to the next 'iterC' to try and reach the target.
            }
        }
    }

    // Output the final computed count of valid combinations to the console.
    console.log(validCombinationCount);
}

// Read the input data from standard input.
// The 'require' statement is common in competitive programming environments for I/O.
// 'readFileSync' reads the entire file synchronously, and 'utf8' specifies the encoding.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));