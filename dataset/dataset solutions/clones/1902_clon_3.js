/**
 * Expert-generated Type III code clone.
 *
 * This variant processes a single numerical input `targetValue` and aims to find
 * two integers, `A` and `B`, such that the equation A^5 - B^5 = targetValue holds true.
 *
 * Key transformations applied:
 * 1.  **Identifier Renaming (Type II):** All variable and function names have been
 *     changed to improve clarity and avoid direct resemblance to the original.
 * 2.  **Structural Rewrites (Type III):**
 *     -   **Helper Functions:** Introduced `calculatePower` for robust exponentiation
 *         (specifically for B^5) and `calculateFifthRoot` to correctly handle
 *         negative bases for odd roots, which `Math.pow(val, 1/5)` does not always
 *         do for negative `val`.
 *     -   **Input Processing:** Replaced `parseInt` with `Number()` for type conversion
 *         and added basic input validation using `isNaN` and `Number.isFinite`.
 *     -   **Integer Check:** Replaced `A - Math.floor(A) == 0` with the more
 *         robust `Number.isInteger(potentialA)`.
 *     -   **Loop Range Adjustment:** The iteration range for `currentB` has been
 *         significantly narrowed from `10^8` to a more practical `-200` to `200`,
 *         assuming typical competitive programming constraints for `targetValue`.
 *         This is a common optimization/adjustment for such problems.
 *     -   **Control Flow:** Added a `solutionFound` flag to manage the loop's
 *         termination and output.
 *     -   **Output Formatting:** Used template literals for cleaner output.
 *     -   **Error Handling/Robustness:** Added an explicit message for when no
 *         solution is found within the search range and an error message for invalid input.
 *     -   **Variable Declaration:** Switched from `var` to `const` and `let` for
 *         modern JavaScript practices.
 * 3.  **Comment and Whitespace (Type II):** Extensive new comments explain the logic,
 *     and whitespace/indentation have been adjusted for readability.
 * 4.  **Deletion (Type III):** Removed commented-out, unused lines related to input
 *     parsing that were not relevant to the problem's actual input format.
 */
function computeFifthPowerDifference(rawInputStr) {
    // Step 1: Prepare the input data.
    // Trim any leading or trailing whitespace from the raw string.
    const trimmedInput = rawInputStr.trim();

    // Convert the cleaned string into a numerical target value.
    // Using Number() is a concise way to convert, similar to parseInt().
    const targetSum = Number(trimmedInput);

    // Validate the parsed numerical input.
    // Ensure it's a valid finite number before proceeding.
    if (isNaN(targetSum) || !Number.isFinite(targetSum)) {
        console.error("Input Error: The provided string could not be converted into a valid number.");
        // Terminate execution or provide a default error state.
        return;
    }

    // Helper function to calculate base raised to an integer exponent.
    // This is more robust for odd exponents with negative bases than Math.pow directly.
    const calculatePower = (base, exponent) => {
        // If the exponent is not an integer, fall back to Math.pow.
        // For this problem, exponent is always 5.
        if (!Number.isInteger(exponent)) {
            return Math.pow(base, exponent);
        }
        // Handle negative base with odd exponent: result is negative.
        if (base < 0 && exponent % 2 !== 0) {
            return -Math.pow(Math.abs(base), exponent);
        }
        // All other cases (positive base, or negative base with even exponent)
        return Math.pow(base, exponent);
    };

    // Helper function to calculate the real Nth root (specifically 5th root).
    // Math.pow(negative, 1/odd) can return NaN in JavaScript, this handles it.
    const getRealFifthRoot = (value) => {
        if (value >= 0) {
            return Math.pow(value, 1/5);
        } else {
            // For negative numbers, take the 5th root of its absolute value and negate the result.
            return -Math.pow(Math.abs(value), 1/5);
        }
    };

    let finalA = 0; // Stores the integer 'A' value when a solution is found.
    let finalB = 0; // Stores the integer 'B' value when a solution is found.
    let hasSolutionBeenIdentified = false; // Flag to indicate successful discovery.

    // The problem aims to find A and B such that A^5 - B^5 = targetSum.
    // This can be rearranged to A^5 = targetSum + B^5.
    // We iterate through a range of possible 'B' values.
    // The typical constraints for such problems suggest 'A' and 'B' are relatively small
    // (e.g., within -200 to 200 for targetSum up to 10^9).
    // The original loop range was excessively large; this range is more practical.
    const lowerBoundForB = -200;
    const upperBoundForB = 200;

    for (let currentB = lowerBoundForB; currentB <= upperBoundForB; currentB++) {
        // Calculate B^5 using our robust helper function.
        const bToThePowerOfFive = calculatePower(currentB, 5);

        // Determine the value that A^5 must equal.
        const requiredAToThePowerOfFive = targetSum + bToThePowerOfFive;

        // Calculate the potential 'A' value by taking the real 5th root.
        const potentialAValue = getRealFifthRoot(requiredAToThePowerOfFive);

        // Check if the calculated 'potentialAValue' is an exact integer.
        // Number.isInteger is a reliable method for this check.
        if (Number.isInteger(potentialAValue)) {
            finalA = potentialAValue;
            finalB = currentB;
            hasSolutionBeenIdentified = true;
            // A solution has been found, so we can exit the loop early.
            break;
        }
    }

    // Output the results.
    if (hasSolutionBeenIdentified) {
        // Use a template literal for clear output formatting.
        console.log(`${finalA} ${finalB}`);
    } else {
        // This message indicates that no solution was found within the defined search range.
        // Depending on problem constraints, this branch might never be hit.
        console.log("No integer pair (A, B) satisfying the equation found within the specified range.");
    }
}

// Main execution block: read input from standard input and pass it to the processing function.
// This setup is common in competitive programming environments for JavaScript.
computeFifthPowerDifference(require("fs").readFileSync("/dev/stdin", "utf8"));