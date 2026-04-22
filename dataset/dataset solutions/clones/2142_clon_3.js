// Utility to transform a multi-line string into an array of string tokens.
// This function handles potential empty lines or multiple spaces.
function processRawData(rawDataString) {
    // A guard clause to ensure the input is a valid string.
    if (typeof rawDataString !== 'string' || rawDataString.trim().length === 0) {
        console.error("Input for data processing must be a non-empty string.");
        return []; // Return an empty array for invalid input.
    }

    // Using Array.prototype.flatMap for a concise and expressive transformation.
    // It maps each line to an array of its words and then flattens the result.
    const tokenArray = rawDataString.split('\n') // Split into lines.
                                    .flatMap(lineSegment => {
                                        // Trim each line and split by spaces.
                                        // Filter out any empty strings that might result from multiple spaces.
                                        return lineSegment.trim().split(' ').filter(s => s !== '');
                                    });
    return tokenArray;
}

// Fetches the primary input data required for the problem solution.
// It prioritizes reading from standard input but falls back to a dummy string.
function retrieveProblemParameters() {
    // Define a default data string for testing or environments without file system access.
    const FALLBACK_INPUT_STRING = "1000000000 141421 173205";
    let sourceContentForProcessing;

    // Check if the Node.js 'fs' module is available to read from stdin.
    // This check makes the code more robust across different JavaScript environments.
    if (typeof require !== 'undefined' && typeof require('fs') !== 'undefined') {
        try {
            // Attempt to synchronously read the entire content from /dev/stdin.
            sourceContentForProcessing = require('fs').readFileSync('/dev/stdin', 'utf8');
        } catch (fileReadError) {
            // If reading from stdin fails, log a warning and use the fallback data.
            console.warn(`Warning: Could not read from /dev/stdin. Reason: ${fileReadError.message}. Using fallback data.`);
            sourceContentForProcessing = FALLBACK_INPUT_STRING;
        }
    } else {
        // If 'fs' module is not available (e.g., in a browser context), use fallback.
        console.info("Info: File system module not detected. Using pre-defined fallback data.");
        sourceContentForProcessing = FALLBACK_INPUT_STRING;
    }

    // Process the obtained content into an array of string tokens.
    return processRawData(sourceContentForProcessing);
}

// Helper function to compute (base^exponent) % modulus using modular exponentiation (binary exponentiation).
// This is essential for handling large exponents in modular arithmetic efficiently.
function power(baseValue, exponentValue, modulusValue) {
    let currentResult = 1n; // Initialize result as BigInt.
    baseValue = baseValue % modulusValue; // Ensure base is within modulo range.

    // Loop while the exponent is greater than zero.
    while (exponentValue > 0n) {
        // If exponent is odd, multiply currentResult by base.
        if (exponentValue % 2n === 1n) {
            currentResult = (currentResult * baseValue) % modulusValue;
        }
        // Square the base and halve the exponent.
        baseValue = (baseValue * baseValue) % modulusValue;
        exponentValue /= 2n;
    }
    return currentResult;
}

// Helper function to compute the modular multiplicative inverse of 'num' modulo 'mod'.
// This relies on Fermat's Little Theorem, which requires 'mod' to be a prime number.
// The inverse of 'a' modulo 'p' is 'a^(p-2)' modulo 'p'.
function getModularInverse(numberToInvert, primeModulus) {
    // Ensure numberToInvert is not zero, as inverse is undefined for zero.
    if (numberToInvert === 0n) {
        throw new Error("Modular inverse is undefined for 0.");
    }
    // Utilize the power function for modular exponentiation.
    return power(numberToInvert, primeModulus - 2n, primeModulus);
}

// Calculates "n choose r" (combinations) modulo a prime P.
// This implementation is optimized for cases where 'n' can be very large
// but 'r' is relatively small, which is common in competitive programming.
function computeCombinationsModular(totalElementsN, chosenElementsR, primeModulus) {
    // Guard clauses for invalid or trivial combination cases.
    if (chosenElementsR < 0n || chosenElementsR > totalElementsN) {
        return 0n; // No combinations possible if r is out of bounds.
    }
    if (chosenElementsR === 0n || chosenElementsR === totalElementsN) {
        return 1n; // C(n, 0) and C(n, n) are always 1.
    }

    // Optimization: C(n, r) = C(n, n-r). Choosing the smaller 'r' reduces calculations.
    if (chosenElementsR > totalElementsN / 2n) {
        chosenElementsR = totalElementsN - chosenElementsR;
    }

    let modularNumerator = 1n;
    // Calculate the numerator: (totalElementsN * (totalElementsN-1) * ... * (totalElementsN-chosenElementsR+1)) % primeModulus
    for (let i = 0n; i < chosenElementsR; i++) {
        modularNumerator = (modularNumerator * (totalElementsN - i)) % primeModulus;
    }

    let modularDenominator = 1n;
    // Calculate the denominator: (chosenElementsR!) % primeModulus
    for (let i = 1n; i <= chosenElementsR; i++) {
        modularDenominator = (modularDenominator * i) % primeModulus;
    }

    // The combination C(n, r) % P is calculated as (numerator * (denominator)^(-1)) % P.
    const inverseOfDenominator = getModularInverse(modularDenominator, primeModulus);
    return (modularNumerator * inverseOfDenominator) % primeModulus;
}

// The main execution block encapsulating the problem's solution logic.
// This immediately invoked function expression (IIFE) ensures self-contained execution.
(function executeSolution() {
    // Define the problem's specific prime modulus constant.
    const PROBLEM_MOD_CONSTANT = 1000000007n; // This is (10^9 + 7), a commonly used prime modulus.

    // Retrieve and parse the initial problem parameters.
    const parsedInputTokens = retrieveProblemParameters();

    // Critical input validation: check if enough numeric parameters are available.
    if (parsedInputTokens.length < 3) {
        console.error("Fatal Error: Insufficient input data. Expected three numeric parameters (N, A, B).");
        return; // Terminate execution if input is critically malformed.
    }

    // Convert string tokens to BigInts for precise arithmetic, especially for large N.
    const totalNCount = BigInt(parseInt(parsedInputTokens[0], 10)); // Represents 'N'
    const excludedCountA = BigInt(parseInt(parsedInputTokens[1], 10)); // Represents 'A'
    const excludedCountB = BigInt(parseInt(parsedInputTokens[2], 10)); // Represents 'B'

    // Additional validation for parsed numeric values.
    if (isNaN(Number(totalNCount)) || isNaN(Number(excludedCountA)) || isNaN(Number(excludedCountB))) {
        console.error("Fatal Error: One or more input parameters could not be parsed as valid numbers.");
        return;
    }

    // The problem asks for the sum of C(N, r) for r from 1 to N,
    // excluding r = A and r = B.
    // This can be rephrased as: (Total non-empty subsets) - C(N, A) - C(N, B).
    // Total non-empty subsets = 2^N - 1.

    // Step 1: Calculate 2^N modulo PROBLEM_MOD_CONSTANT.
    // This gives the total number of subsets (including the empty set).
    const totalPossibleSubsets = power(2n, totalNCount, PROBLEM_MOD_CONSTANT);

    // Initialize the result with (2^N - 1) modulo P.
    // Adding PROBLEM_MOD_CONSTANT before the final modulo ensures a positive result
    // in case (totalPossibleSubsets - 1n) becomes negative due to intermediate modulo ops.
    let finalCalculatedSum = (totalPossibleSubsets - 1n + PROBLEM_MOD_CONSTANT) % PROBLEM_MOD_CONSTANT;

    // Step 2: Subtract C(N, A) modulo PROBLEM_MOD_CONSTANT.
    const combinationsForA = computeCombinationsModular(totalNCount, excludedCountA, PROBLEM_MOD_CONSTANT);
    finalCalculatedSum = (finalCalculatedSum - combinationsForA + PROBLEM_MOD_CONSTANT) % PROBLEM_MOD_CONSTANT;

    // Step 3: Subtract C(N, B) modulo PROBLEM_MOD_CONSTANT.
    const combinationsForB = computeCombinationsModular(totalNCount, excludedCountB, PROBLEM_MOD_CONSTANT);
    finalCalculatedSum = (finalCalculatedSum - combinationsForB + PROBLEM_MOD_CONSTANT) % PROBLEM_MOD_CONSTANT;

    // Output the final computed sum.
    console.log(finalCalculatedSum.toString());
})();