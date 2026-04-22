// Define a global constant for the modulo operation to improve readability and maintainability.
const PRIME_MODULUS = 998244353n;

/**
 * Generates a unique string identifier for caching purposes based on two coordinates.
 * This function helps in creating keys for the memoization store.
 * @param {BigInt} coordRow - The row coordinate.
 * @param {BigInt} coordCol - The column coordinate.
 * @returns {string} A unique string key for the given coordinates.
 */
const generateKeyForCache = (coordRow, coordCol) => `_ROW_${coordRow}_COL_${coordCol}_`;

// A central cache to store previously computed results, avoiding redundant calculations.
// This is a memoization technique to optimize the recursive function.
const MEMOIZATION_STORE = new Map();

/**
 * Applies the modulo operation to a BigInt value.
 * Ensures that the result is always positive, which is crucial for modular arithmetic
 * especially when intermediate results might be negative due to subtraction.
 * @param {BigInt} valueToModulate - The BigInt value to apply the modulo to.
 * @returns {BigInt} The positive result of the modulo operation.
 */
const applyModulo = (valueToModulate) => {
    return (valueToModulate % PRIME_MODULUS + PRIME_MODULUS) % PRIME_MODULUS;
};

/**
 * Computes a complex recursive value based on four BigInt parameters, utilizing memoization.
 * This function forms the core logic of the program, performing calculations
 * based on specific conditions or recursively calling itself for subproblems.
 * @param {BigInt} startParamA - The first starting parameter.
 * @param {BigInt} startParamB - The second starting parameter.
 * @param {BigInt} currentCoordC - The current 'c' coordinate for calculation.
 * @param {BigInt} currentCoordD - The current 'd' coordinate for calculation.
 * @returns {BigInt} The computed result for the given parameters, modulo PRIME_MODULUS.
 */
const computeRecursiveResult = (startParamA, startParamB, currentCoordC, currentCoordD) => {
    // Construct a unique key for the current set of coordinates to check the cache.
    const currentLookupKey = generateKeyForCache(currentCoordC, currentCoordD);

    // If the result for these coordinates is already in the cache, return it directly.
    if (MEMOIZATION_STORE.has(currentLookupKey)) {
        return MEMOIZATION_STORE.get(currentLookupKey);
    }

    let finalComputedOutcome; // Variable to hold the result before caching.

    // --- Base Cases for the recursion ---
    // If the first starting parameter matches the current 'c' coordinate.
    if (startParamA === currentCoordC) {
        // Calculate (startParamA ^ (currentCoordD - startParamB)) % PRIME_MODULUS.
        finalComputedOutcome = applyModulo(startParamA ** (currentCoordD - startParamB));
    }
    // If the second starting parameter matches the current 'd' coordinate.
    else if (startParamB === currentCoordD) {
        // Calculate (startParamB ^ (currentCoordC - startParamA)) % PRIME_MODULUS.
        finalComputedOutcome = applyModulo(startParamB ** (currentCoordC - startParamA));
    }
    // --- Recursive Case ---
    else {
        // Pre-calculate decremented coordinates to avoid repeated calculations and improve readability.
        const prevCoordC = currentCoordC - 1n;
        const prevCoordD = currentCoordD - 1n;

        // Perform recursive calls for subproblems.
        const valueFromCDecremented = computeRecursiveResult(startParamA, startParamB, prevCoordC, currentCoordD);
        const valueFromDDecremented = computeRecursiveResult(startParamA, startParamB, currentCoordC, prevCoordD);
        const valueFromBothDecremented = computeRecursiveResult(startParamA, startParamB, prevCoordC, prevCoordD);

        // Calculate intermediate terms, applying modulo at each step to prevent overflow
        // and ensure correctness for large BigInts within modular arithmetic.
        const termOne = applyModulo(valueFromCDecremented * currentCoordD);
        const termTwo = applyModulo(valueFromDDecremented * currentCoordC);
        const termThree = applyModulo(valueFromBothDecremented * prevCoordC * prevCoordD);

        // Combine the terms according to the problem's formula.
        // The modulo operation is applied one last time to the final sum/difference.
        finalComputedOutcome = applyModulo(termOne + termTwo - termThree);
    }

    // Store the computed outcome in the memoization cache before returning.
    MEMOIZATION_STORE.set(currentLookupKey, finalComputedOutcome);
    return finalComputedOutcome;
};

/**
 * Orchestrates the program execution: reads input, parses parameters,
 * triggers the main computation, and outputs the final result.
 * @param {string} rawInputData - The raw string input read from stdin.
 */
const processProgramExecution = (rawInputData) => {
    // Divide the raw input into individual lines.
    const inputLines = rawInputData.split('\n');

    // --- Input Validation (Type III addition: Guard clauses) ---
    if (inputLines.length === 0 || inputLines[0].trim() === '') {
        console.error("Error: Input data is empty or malformed. Please provide at least one line of numbers.");
        return; // Exit if input is invalid.
    }

    // Extract the first line and split it into tokens.
    const firstLineNumericTokens = inputLines[0].split(' ');

    // Further validation for the number of expected parameters.
    if (firstLineNumericTokens.length !== 4) {
        console.error(`Error: Expected exactly 4 numeric parameters, but received ${firstLineNumericTokens.length}.`);
        return; // Exit if parameter count is incorrect.
    }

    // Parse the tokens into BigInt values.
    // Includes a try-catch block for robust error handling during parsing (Type III addition).
    const [p1Val, p2Val, p3Val, p4Val] = firstLineNumericTokens.map(tokenString => {
        try {
            return BigInt(tokenString);
        } catch (e) {
            console.error(`Parsing Error: Could not convert "${tokenString}" to BigInt. Details: ${e.message}`);
            // Re-throw to halt execution if parsing fails critical input.
            throw e;
        }
    });

    // Provide a status message before starting the main calculation (Type III addition).
    console.log("Initiating complex value computation with provided parameters...");
    // console.log(`Parameters: A=${p1Val}, B=${p2Val}, C=${p3Val}, D=${p4Val}`); // Deleted original debug log

    // Execute the main recursive computation.
    const finalCalculatedValue = computeRecursiveResult(p1Val, p2Val, p3Val, p4Val);

    // Output a descriptive message before the final result (Type III addition).
    console.log("Computation complete. The numerical result is:");
    // Convert the BigInt result back to a standard JavaScript Number for output,
    // as the problem implies the result fits within Number's precision for display.
    console.log(Number(finalCalculatedValue));
};

// --- Program Entry Point ---
// Utilize Node.js 'fs' module to read input from standard input.
const fileSystemHandler = require("fs");
const standardInputPath = "/dev/stdin"; // Standard path for input in competitive programming environments.

try {
    // Read the entire content of the standard input file as a UTF-8 string.
    const inputContent = fileSystemHandler.readFileSync(standardInputPath, "utf8");
    // Pass the read content to the main program execution function.
    processProgramExecution(inputContent);
} catch (readError) {
    // Handle potential errors during file reading (Type III addition: Error handling).
    console.error(`Failed to read input from ${standardInputPath}. Error: ${readError.message}`);
    // Exit the process with an error code to indicate failure.
    process.exit(1);
}