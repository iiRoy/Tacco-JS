/**
 * This script computes the total number of divisors for the factorial of a given input number (N!),
 * applying modular arithmetic to keep the result within a manageable range.
 * The calculation is performed modulo 10^9 + 7.
 *
 * It consists of two primary functions:
 * 1. `obtainPrimeDecomposition`: Determines the prime factors and their exponents for an individual integer.
 * 2. `executeCalculation`: Orchestrates the process, aggregating prime factors across all numbers up to N,
 *    and then applying the divisor counting formula.
 */


/**
 * Decomposes a positive integer into its prime factors and their corresponding powers.
 *
 * This function identifies all unique prime factors of the `targetValue` and counts
 * how many times each prime factor appears in its prime factorization.
 * For example, for 12, it would return [{primeBase: 2, occurrenceCount: 2}, {primeBase: 3, occurrenceCount: 1}].
 *
 * @param {number} targetValue The integer to be factorized. Must be a positive integer.
 * @returns {Array<Object>} An array of objects, where each object has:
 *   - `primeBase`: The prime factor.
 *   - `occurrenceCount`: The exponent (number of occurrences) of that prime factor.
 *   Returns an empty array if `targetValue` is 0 or 1, or negative.
 */
function obtainPrimeDecomposition(targetValue) {
    // Input validation: prime factorization is typically defined for integers >= 2.
    // For 0, 1, or negative numbers, we consider an empty set of prime factors.
    if (targetValue <= 1) {
        return [];
    }

    // A list to store the prime factors and their powers as objects.
    let factorElements = [];

    // We use a temporary variable to modify during the division process,
    // preserving the original `targetValue` if needed elsewhere (though not in this script).
    let currentRemainder = targetValue;

    // Iterate through potential divisors starting from 2.
    // The loop runs as long as the square of the potential divisor is less than or equal to the current remainder.
    // This optimization avoids checking divisors larger than the square root of the number.
    for (let potentialDivisor = 2; potentialDivisor * potentialDivisor <= currentRemainder; potentialDivisor++) {
        // Initialize a counter for the power of the current potentialDivisor.
        let powerAccumulator = 0;

        // Continuously divide `currentRemainder` by `potentialDivisor` as long as it's perfectly divisible.
        while (currentRemainder % potentialDivisor === 0) {
            currentRemainder = Math.floor(currentRemainder / potentialDivisor); // Perform integer division.
            powerAccumulator++; // Increment the exponent for this prime factor.
        }

        // If the `potentialDivisor` was indeed a factor (i.e., its power is greater than 0),
        // add it to our list of prime elements.
        if (powerAccumulator > 0) {
            factorElements.push({ primeBase: potentialDivisor, occurrenceCount: powerAccumulator });
        }
    }

    // After the loop, if `currentRemainder` is still greater than 1, it means the remaining `currentRemainder`
    // is a prime number itself (and greater than the square root of the original number).
    if (currentRemainder > 1) {
        factorElements.push({ primeBase: currentRemainder, occurrenceCount: 1 });
    }

    return factorElements;
}


/**
 * Orchestrates the calculation of the total number of divisors for N! (N factorial)
 * modulo a large prime number (10^9 + 7).
 *
 * This function first parses the input string to obtain N. Then, for each integer
 * from 2 up to N, it finds its prime factorization. These individual prime factors
 * and their exponents are then aggregated to determine the total exponent for each
 * unique prime factor in the factorization of N!. Finally, it applies the formula
 * for the number of divisors (product of (exponent + 1) for each prime factor),
 * ensuring all intermediate and final products are taken modulo 10^9 + 7.
 *
 * @param {string} rawInput The input string, expected to contain a single positive integer N.
 * @returns {void} The function prints the calculated number of divisors to the console.
 *                 It prints an error message and returns early for invalid input.
 */
function executeCalculation(rawInput) {
    // Define the modulus constant for all arithmetic operations.
    const MODULO_CONSTANT = 1000000007; // A common large prime modulus.

    // Parse the input string into an integer. Trim whitespace to handle potential extra spaces.
    const processedNumber = parseInt(rawInput.trim(), 10);

    // Input validation: Ensure the input is a valid positive integer.
    if (isNaN(processedNumber) || processedNumber < 1) {
        console.error("Error: Input must be a positive integer to compute N! divisors.");
        return; // Exit if input is invalid.
    }

    // Store the parsed number as the upper limit for iteration.
    const limitValue = processedNumber;

    // A Map to store the aggregated prime factors and their total exponents for N!.
    // Keys are prime numbers, values are their cumulative exponents.
    const aggregatedPrimeExponents = new Map();

    // Iterate from 2 up to `limitValue`. Numbers less than 2 do not contribute
    // to prime factors in a factorial in a meaningful way for this calculation.
    for (let currentInteger = 2; currentInteger <= limitValue; currentInteger++) {
        // Obtain the prime decomposition for the current integer.
        const decomposedElements = obtainPrimeDecomposition(currentInteger);

        // Iterate over each prime factor component obtained for `currentInteger`.
        // Using `for...of` loop for iterating over array elements.
        for (const component of decomposedElements) {
            const primeFactorKey = component.primeBase;
            const exponentValue = component.occurrenceCount;

            // Retrieve the current total exponent for this prime factor from the map.
            // If the prime factor is not yet in the map, its current exponent is 0.
            const currentTotalExponent = aggregatedPrimeExponents.get(primeFactorKey) || 0;

            // Update the map with the new cumulative exponent for this prime factor.
            aggregatedPrimeExponents.set(primeFactorKey, currentTotalExponent + exponentValue);
        }
    }

    // Initialize the variable to store the final product of divisors.
    // It starts at 1 because it's a multiplicative identity.
    let finalProductOfDivisors = 1;

    // Iterate through the total exponents of all unique prime factors found in N!.
    // The number of divisors is calculated as the product of (exponent + 1) for each prime factor.
    for (const totalExponent of aggregatedPrimeExponents.values()) {
        // Calculate (exponent + 1). This is a term in the product.
        const incrementedExponent = totalExponent + 1;

        // Multiply the running product by the current term, and take the result modulo MODULO_CONSTANT.
        // This keeps the numbers from becoming excessively large.
        finalProductOfDivisors = (finalProductOfDivisors * incrementedExponent) % MODULO_CONSTANT;
    }

    // Output the final calculated number of divisors.
    console.log(finalProductOfDivisors);
}


// Self-executing anonymous function to handle input reading and function invocation.
// This structure helps encapsulate the global scope.
(function() {
    // Use Node.js's 'fs' module to read synchronous input from standard input.
    // This is typical for competitive programming environments.
    const fileSystemModule = require("fs");
    const inputPath = "/dev/stdin"; // Standard input file path in many environments.

    try {
        // Read the entire content of the standard input as a UTF-8 string.
        const rawInputData = fileSystemModule.readFileSync(inputPath, "utf8");

        // Call the main computation function with the raw input data.
        executeCalculation(rawInputData);
    } catch (error) {
        // Log any errors that occur during file reading or parsing.
        console.error("An error occurred while reading input:", error.message);
    }
})();