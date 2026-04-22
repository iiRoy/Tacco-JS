const MODULAR_PRIME = 1000000007; // A common large prime modulus for computations

// Global caches for precomputed values to optimize modular arithmetic operations.
// These arrays will store factorials, inverse factorials, and modular inverses.
let cachedFactorials = [];
let cachedInverseFactorials = [];
let cachedModularInverses = [];

// A flag to indicate whether the precomputation tables have been initialized.
let precomputationInitialized = false;

/**
 * Initializes or re-initializes arrays for modular factorials, inverse factorials,
 * and modular inverses up to a specified maximum value. This precomputation
 * significantly speeds up subsequent modular combination calculations.
 *
 * @param {number} maximumValue - The highest number for which to precompute values.
 * @param {number} modulusValue - The prime modulus to be used for all calculations.
 */
function setupCombinatorialTables(maximumValue, modulusValue) {
    // Robust input validation: ensure inputs are valid for array sizing and calculations.
    if (maximumValue < 0 || modulusValue <= 1 || !Number.isInteger(maximumValue)) {
        // In a production environment, one might throw an error or log more verbosely.
        console.error("Error: Invalid parameters provided for combinatorial table setup.");
        precomputationInitialized = false; // Ensure flag is false if setup fails
        return;
    }

    // Check if the current cache size is insufficient or if it's the first initialization.
    // If maximumValue is larger than the current cache, or if it's not initialized, re-create.
    if (cachedFactorials.length <= maximumValue || !precomputationInitialized) {
        // Allocate new arrays with the required size.
        cachedFactorials = new Array(maximumValue + 1);
        cachedInverseFactorials = new Array(maximumValue + 1);
        cachedModularInverses = new Array(maximumValue + 1);

        // Base cases for factorials and inverse factorials.
        cachedFactorials[0] = 1;
        cachedInverseFactorials[0] = 1;

        // The modular inverse of 1 is always 1.
        cachedModularInverses[1] = 1;

        // Handle the case for maximumValue = 0 or 1 explicitly if loop starts from 2.
        if (maximumValue >= 1) {
            cachedFactorials[1] = 1;
            cachedInverseFactorials[1] = 1;
        }

        // Populate the arrays from 2 up to maximumValue.
        for (let currentIdx = 2; currentIdx <= maximumValue; currentIdx++) {
            // Calculate modular inverse using the property:
            // inv[i] = mod - floor(mod / i) * inv[mod % i] % mod
            const remainder = modulusValue % currentIdx;
            const quotient = Math.floor(modulusValue / currentIdx);
            cachedModularInverses[currentIdx] = (modulusValue - (quotient * cachedModularInverses[remainder]) % modulusValue) % modulusValue;

            // Calculate factorial: fact[i] = (fact[i-1] * i) % mod
            cachedFactorials[currentIdx] = (cachedFactorials[currentIdx - 1] * currentIdx) % modulusValue;

            // Calculate inverse factorial: finv[i] = (finv[i-1] * inv[i]) % mod
            cachedInverseFactorials[currentIdx] = (cachedInverseFactorials[currentIdx - 1] * cachedModularInverses[currentIdx]) % modulusValue;
        }
        precomputationInitialized = true; // Mark as initialized upon successful completion.
    }
}

/**
 * Computes the number of combinations (n choose k) modulo a prime number.
 * This function relies on precomputed factorial and inverse factorial tables.
 *
 * @param {number} totalElements - The total number of items available (n).
 * @param {number} chosenElements - The number of items to choose (k).
 * @param {number} modulusValue - The prime modulus for the calculation.
 * @returns {number} The result of C(n, k) % modulusValue, or 0 if inputs are invalid.
 */
function getCombinationsModulo(totalElements, chosenElements, modulusValue) {
    // Standard combination edge cases:
    // If k is negative or greater than n, there are no combinations.
    if (chosenElements < 0 || chosenElements > totalElements) {
        return 0;
    }
    // If n is negative, it's an invalid scenario for combinations.
    if (totalElements < 0) {
        return 0;
    }

    // Ensure the precomputation tables are ready and cover the required range.
    // If not, attempt to initialize them.
    if (!precomputationInitialized || cachedFactorials.length <= totalElements) {
        setupCombinatorialTables(totalElements, modulusValue);
        // If setup failed for some reason (e.g., invalid modulusValue),
        // precomputationInitialized might still be false.
        if (!precomputationInitialized) {
             console.error("Error: Combinatorial tables could not be prepared for the required range.");
             return 0; // Return 0 or throw an error indicating a critical failure.
        }
    }

    // The formula for combinations C(n, k) modulo P is:
    // C(n, k) = n! * (k!)^-1 * ((n-k)!)^-1 (mod P)
    // where (X)^-1 is the modular multiplicative inverse of X.
    const numeratorFactorial = cachedFactorials[totalElements];
    const inverseFactorialK = cachedInverseFactorials[chosenElements];
    const inverseFactorialNMinusK = cachedInverseFactorials[totalElements - chosenElements];

    // Calculate the product of inverse factorials first, then multiply by the numerator.
    // This helps manage intermediate values within the modulus.
    const denominatorProductInverse = (inverseFactorialK * inverseFactorialNMinusK) % modulusValue;
    const finalCombinationResult = (numeratorFactorial * denominatorProductInverse) % modulusValue;

    return finalCombinationResult;
}

/**
 * Calculates the number of unique paths from (0,0) to a target coordinate (endX, endY)
 * using only specific moves: (1,2) and (2,1). The result is returned modulo MODULAR_PRIME.
 * This problem translates to finding combinations C(a+b, a) where 'a' and 'b' are
 * the counts of each type of move required.
 *
 * @param {number} endX - The target X-coordinate.
 * @param {number} endY - The target Y-coordinate.
 * @returns {number} The count of valid paths modulo MODULAR_PRIME, or 0 if no paths exist.
 */
function calculateGridPathCount(endX, endY) {
    // Guard clause for invalid target coordinates.
    if (endX < 0 || endY < 0) {
        return 0;
    }

    const coordinateSum = endX + endY;

    // A fundamental condition for reaching (x,y) with (1,2) and (2,1) moves
    // is that the sum of coordinates (x + y) must be divisible by 3.
    if (coordinateSum % 3 !== 0) {
        return 0;
    }

    // Let 'movesA' be the count of (1,2) moves and 'movesB' be the count of (2,1) moves.
    // We set up a system of linear equations:
    // 1 * movesA + 2 * movesB = endX
    // 2 * movesA + 1 * movesB = endY
    //
    // Solving for movesA and movesB:
    // movesA = (2 * endY - endX) / 3
    // movesB = (2 * endX - endY) / 3

    const countOfMoveA = (2 * endY - endX) / 3;
    const countOfMoveB = (2 * endX - endY) / 3;

    // The number of moves must be non-negative integers.
    // Check for non-integer results (which means no valid path) or negative counts.
    if (!Number.isInteger(countOfMoveA) || !Number.isInteger(countOfMoveB) ||
        countOfMoveA < 0 || countOfMoveB < 0) {
        return 0;
    }

    // The total number of steps taken is the sum of movesA and movesB.
    // The problem then reduces to finding the number of ways to arrange 'movesA'
    // items of one type and 'movesB' items of another type, which is C(totalSteps, movesA).
    const totalSteps = countOfMoveA + countOfMoveB;

    // Ensure precomputation tables are ready for the required range before proceeding.
    // This check is a safety measure; getCombinationsModulo also handles it.
    if (!precomputationInitialized || cachedFactorials.length <= totalSteps) {
        setupCombinatorialTables(totalSteps, MODULAR_PRIME);
    }

    return getCombinationsModulo(totalSteps, countOfMoveA, MODULAR_PRIME);
}

/**
 * This function serves as the main pipeline for processing input,
 * executing the solution logic, and preparing the result.
 *
 * @param {string} rawInputString - The raw string input from a source like stdin.
 * @returns {number | null} The computed result if successful, or null if an error occurred.
 */
function processSolutionPipeline(rawInputString) {
    // Basic validation of the input string.
    if (!rawInputString || typeof rawInputString !== 'string') {
        console.error("Error: Input is null, undefined, or not a string.");
        return null;
    }

    // Trim whitespace and split the string by one or more whitespace characters
    // to robustly parse numerical arguments.
    const inputTokens = rawInputString.trim().split(/\s+/);

    // Ensure exactly two numerical inputs are provided.
    if (inputTokens.length < 2) {
        console.error("Error: Insufficient input parameters. Expected two integers (X Y).");
        return null;
    }

    // Convert string tokens to numbers. Using Number() is a concise way,
    // equivalent to parseInt() for simple integer parsing.
    const targetX = Number(inputTokens[0]);
    const targetY = Number(inputTokens[1]);

    // Validate that the parsed values are indeed numbers.
    if (isNaN(targetX) || isNaN(targetY)) {
        console.error("Error: Invalid numeric input provided. Please ensure X and Y are integers.");
        return null;
    }

    // Execute the core logic to calculate the path count.
    const computedAnswer = calculateGridPathCount(targetX, targetY);

    // Return the calculated result.
    return computedAnswer;
}

// --- Application Entry Point ---
// Utilize Node.js 'fs' module to read input from standard input.
const fileSystemUtility = require('fs');

try {
    // Read the entire content of stdin as a UTF-8 string.
    const inputData = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

    // Process the input and obtain the final answer.
    const finalAnswer = processSolutionPipeline(inputData);

    // If a valid answer was computed, print it to standard output.
    if (finalAnswer !== null) {
        console.log(finalAnswer);
    } else {
        // If processSolutionPipeline returned null, an error message
        // would have already been logged by that function.
        console.error("Execution halted due to critical processing errors.");
    }
} catch (executionError) {
    // Catch any errors that occur during file reading or the overall execution flow.
    console.error("An unexpected error occurred during program execution:", executionError.message);
}