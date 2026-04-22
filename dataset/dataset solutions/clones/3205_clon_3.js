const nodeFileSystem = require('fs'); // Utilize Node.js file system module for I/O operations

/**
 * Parses and validates input data from a string.
 * Ensures that three valid integer parameters are extracted.
 * @param {string} rawDataString - The raw string data read from input.
 * @returns {{maximumOperations: number, purchaseThreshold: number, enhancedRewardRate: number}} - Object containing parsed numerical parameters.
 */
const processInputParameters = (rawDataString) => {
    // Type III: Add guard clause for empty or invalid input
    if (!rawDataString || typeof rawDataString !== 'string' || rawDataString.trim() === '') {
        console.error("Fatal Error: Input stream provided no data or was malformed.");
        process.exit(1); // Terminate execution due to critical error
    }

    // Type II: Rename 'list' to 'inputSegments', use a more robust split regex
    const inputSegments = rawDataString.trim().split(/\s+/);

    // Type III: Add validation for the number of segments
    if (inputSegments.length < 3) {
        console.error("Fatal Error: Insufficient numerical arguments. Expected 3, received " + inputSegments.length + ".");
        process.exit(1);
    }

    // Type II: Rename variables for clarity
    // Type III: Use parseInt with radix for explicit base, add validation
    const maximumOperations = parseInt(inputSegments[0], 10);
    const purchaseThreshold = parseInt(inputSegments[1], 10);
    const enhancedRewardRate = parseInt(inputSegments[2], 10);

    // Type III: Validate parsed numbers
    if (isNaN(maximumOperations) || isNaN(purchaseThreshold) || isNaN(enhancedRewardRate)) {
        console.error("Fatal Error: One or more input values could not be converted to valid numbers.");
        process.exit(1);
    }

    // Type III: Add a soft validation/warning for potentially problematic inputs
    if (maximumOperations < 0 || purchaseThreshold < 0 || enhancedRewardRate < 0) {
        console.warn("Warning: Negative input values were detected. Results may be non-standard for this problem context.");
    }

    return {
        maximumOperations,
        purchaseThreshold,
        enhancedRewardRate
    };
};

/**
 * Calculates the ultimate product count based on a strategy involving operations,
 * a threshold for a special purchase, and an enhanced reward rate.
 * This function implements the specific logic of the original problem.
 * @param {number} totalOperations - The total number of operations available (k).
 * @param {number} thresholdForPurchase - The value required to activate the bonus (a).
 * @param {number} bonusRateValue - The value obtained after bonus activation (b).
 * @returns {number} The final calculated product count.
 */
const computeFinalProductQuantity = (totalOperations, thresholdForPurchase, bonusRateValue) => {
    // Type III: Introduce a constant for the implicit starting value (often 1 in such problems)
    const initialProductCount = 1;

    // Type III: Introduce helper variable for clarity: `k - a`
    // Represents operations remaining after reaching the threshold value (assuming we started at 1 and gained +1 per op).
    const remainingOperationSlots = totalOperations - thresholdForPurchase;

    // Type III: Introduce helper variable for clarity: `b - a`
    // Represents the incremental gain per operation if the bonus is active.
    const incrementalRewardPerBonus = bonusRateValue - thresholdForPurchase;

    // Type II: Rewrite conditions for clarity, using new variable names
    // Condition 1: If total operations are too few to even reach the purchase threshold.
    // Original: `if (k < a + 1)` which is `k <= a`. Here, `totalOperations <= thresholdForPurchase`.
    // In this case, we simply gain 1 for each operation from the initial count.
    if (remainingOperationSlots <= 0) {
        return initialProductCount + totalOperations; // Equivalent to `k + 1`
    }

    // Condition 2: If the enhanced reward rate is not significantly better than default +1 gain.
    // Original: `else if (b <= a + 2)` which means `b - a <= 2`.
    // If the incremental gain is 0, 1, or 2, it's generally not worth activating the bonus.
    if (incrementalRewardPerBonus <= 2) {
        return initialProductCount + totalOperations; // Equivalent to `k + 1`
    }

    // Type II: Add a comment block to explain the remaining logic
    // Remaining conditions apply when `totalOperations` is sufficient and `incrementalRewardPerBonus` is substantial.
    // The original logic involves specific calculations based on the parity of `(k - a + 1)`.
    // Type III: Introduce an intermediate variable for the parity check operand: `k - a + 1`
    const parityCheckOperand = remainingOperationSlots + initialProductCount;

    let ultimateProductTally; // Declare the result variable for assignment

    // Type II: Rewrite condition `(k - a + 1) % 2 === 0` using new variable
    // Type III: Rewrite calculation using new variable names
    if (parityCheckOperand % 2 === 0) { // If `k - a + 1` is even (i.e., `k - a` is odd)
        // Original formula: `a + (b - a) * (k - a + 1) / 2`
        ultimateProductTally = thresholdForPurchase + incrementalRewardPerBonus * (remainingOperationSlots + initialProductCount) / 2;
    } else { // If `k - a + 1` is odd (i.e., `k - a` is even)
        // Original formula: `a + (b - a) * (k - a) / 2 + 1`
        ultimateProductTally = thresholdForPurchase + incrementalRewardPerBonus * remainingOperationSlots / 2 + initialProductCount;
    }

    return ultimateProductTally;
};

// Type III: Encapsulate main execution logic within an Immediately Invoked Function Expression (IIFE)
// This helps to keep global scope clean and organize execution flow.
(function executeCookieOperationSimulation() {
    // Type II: Rename `input` to `sourceDataStream`
    const sourceDataStream = nodeFileSystem.readFileSync('/dev/stdin', 'utf8');

    // Parse and validate the input parameters
    const { maximumOperations, purchaseThreshold, enhancedRewardRate } = processInputParameters(sourceDataStream);

    // Compute the final result using the dedicated function
    const finalOutcome = computeFinalProductQuantity(maximumOperations, purchaseThreshold, enhancedRewardRate);

    // Display the computed result to standard output
    console.log(finalOutcome);
})();