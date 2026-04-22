// A fundamental constant: a large prime number used for modular arithmetic operations.
// This value is 10^9 + 7, commonly used in competitive programming.
const MODULO_VAL = 1_000_000_007;

/**
 * Computes (base ^ exponent) % MODULO_VAL using an iterative modular exponentiation approach.
 * This function is optimized for non-negative integer exponents and prevents intermediate
 * results from exceeding standard number limits by applying the modulo operation at each step.
 *
 * @param {number} baseVal The base number for the exponentiation.
 * @param {number} exponentVal The power to which the base is raised. Must be a non-negative integer.
 * @returns {number} The result of (baseVal ^ exponentVal) modulo MODULO_VAL.
 * @throws {Error} If a negative exponent is provided, as this function does not handle modular inverse.
 */
function calculateModularPower(baseVal, exponentVal) {
    // Pre-check for invalid exponent values.
    if (exponentVal < 0) {
        throw new Error("Modular power function does not support negative exponents. Received: " + exponentVal);
    }

    // Any non-zero number raised to the power of 0 is 1.
    // This is an optimization; the loop would also correctly yield 1 for exponentVal = 0.
    if (exponentVal === 0) {
        return 1;
    }

    let currentAccumulator = 1; // Initialize the result to 1 (base case for multiplication).
    let loopIteration = 0;      // Counter for the loop, starting from zero.

    // Loop `exponentVal` times to perform repeated multiplication.
    // Each multiplication is immediately followed by a modulo operation.
    while (loopIteration < exponentVal) {
        currentAccumulator = (currentAccumulator * baseVal) % MODULO_VAL;
        loopIteration++; // Increment the iteration counter.
    }

    return currentAccumulator; // Return the final modular power.
}

/**
 * The main program execution function. It reads a number from the input,
 * performs a specific mathematical calculation involving modular powers,
 * and then prints the final result to standard output.
 * The calculation is equivalent to (10^N - 2 * 9^N + 8^N) % MODULO_VAL.
 *
 * @param {string} inputString The raw string input, expected to be a single integer.
 */
function executeProgram(inputString) {
    // Sanitize and parse the input string into an integer.
    // Using trim() to remove leading/trailing whitespace and radix 10 for explicit base.
    const numericInput = parseInt(inputString.trim(), 10);

    // Perform input validation to ensure a valid number was provided.
    if (isNaN(numericInput)) {
        console.error("Input Error: The provided input could not be parsed as a valid integer.");
        return; // Exit the function if input is invalid.
    }

    // --- Core Calculation Breakdown ---
    // The problem requires computing (10^N - 2 * 9^N + 8^N) modulo MODULO_VAL.
    // We break this down into several steps to improve readability and manage intermediate results.

    // Step 1: Calculate the first term: (10 ^ numericInput) % MODULO_VAL
    const firstTermResult = calculateModularPower(10, numericInput);

    // Step 2: Calculate the second term's base: (9 ^ numericInput) % MODULO_VAL
    const ninePowerResult = calculateModularPower(9, numericInput);
    // Then, multiply by 2, ensuring the modulo operation is applied.
    const secondTermResult = (ninePowerResult * 2) % MODULO_VAL;

    // Step 3: Calculate the third term: (8 ^ numericInput) % MODULO_VAL
    const thirdTermResult = calculateModularPower(8, numericInput);

    // Step 4: Combine the terms while carefully handling negative results from subtraction.
    // The formula is (A - B + C) % M.
    // A standard way to ensure a positive result after subtraction and before modulo is:
    // ((A - B) % M + M) % M.

    // First, handle the subtraction: (firstTermResult - secondTermResult)
    let intermediateCalculation = firstTermResult - secondTermResult;

    // Adjust for potential negative results from subtraction: (intermediateCalculation % M + M) % M
    // This ensures intermediateCalculation is always non-negative before the final addition.
    intermediateCalculation = (intermediateCalculation % MODULO_VAL + MODULO_VAL) % MODULO_VAL;

    // Finally, add the third term and apply the modulo one last time.
    const finalComputedValue = (intermediateCalculation + thirdTermResult) % MODULO_VAL;

    // Output the final calculated value to standard output.
    console.log(finalComputedValue);
}

// --- Program Entry Point ---
// This block handles reading input from /dev/stdin, which is common in competitive programming
// environments using Node.js. A try-catch block is used for robustness in case of file system errors.
try {
    // Read the entire content of standard input as a UTF-8 string.
    const rawDataFromStdin = require("fs").readFileSync("/dev/stdin", "utf8");
    // Pass the raw input data to the main program execution function.
    executeProgram(rawDataFromStdin);
} catch (error) {
    // Log any errors that occur during file reading or program execution.
    console.error("An unhandled error occurred during program execution:", error.message);
    // Optionally, exit with a non-zero status code to indicate failure.
    process.exit(1);
}