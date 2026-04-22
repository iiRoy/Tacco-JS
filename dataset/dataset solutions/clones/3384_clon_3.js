/**
 * This module provides utilities for number theory operations, specifically prime decomposition
 * and a calculation involving prime factors.
 *
 * It's structured to read numerical input, factorize one of the numbers,
 * and then compute a derived value based on its prime components.
 */

/**
 * Decomposes a given positive integer into its fundamental prime factors and their corresponding exponents.
 * This function efficiently finds all prime numbers that multiply together to form the input value.
 *
 * @param {number} inputVal The non-negative integer that needs to be factorized into its prime constituents.
 * @returns {Array<Object>} An array where each element is an object like `{ base: primeNumber, exp: exponent }`.
 *                          Returns an empty array if the input value is less than or equal to 1.
 */
const obtainPrimeDivisors = (inputVal) => {
    // Initialize an array to store the prime factors and their powers.
    // Each entry will be an object with 'base' (the prime) and 'exp' (its exponent).
    const primeFactorList = [];

    // Early exit for numbers that do not have prime factors (1) or are non-positive.
    // Prime factorization is typically defined for integers greater than 1.
    if (inputVal <= 1) {
        return primeFactorList; // For 0, 1, or negative numbers, return an empty list.
    }

    // Create a mutable copy of the input value. This copy will be progressively
    // divided by its prime factors until it becomes 1 or a prime itself.
    let currentMutableValue = inputVal;

    // Iterate through potential divisors starting from 2.
    // We only need to check divisors up to the square root of the current mutable value.
    // If a number 'd' divides `currentMutableValue`, then `currentMutableValue / d` also divides it.
    // At least one of these (d or `currentMutableValue / d`) must be less than or equal to sqrt(`currentMutableValue`).
    for (let candidateDivisor = 2; candidateDivisor * candidateDivisor <= currentMutableValue; candidateDivisor++) {
        let powerCount = 0; // This counter tracks how many times `candidateDivisor` divides `currentMutableValue`.

        // Continuously divide `currentMutableValue` by `candidateDivisor` as long as it's a factor.
        while (currentMutableValue % candidateDivisor === 0) {
            currentMutableValue /= candidateDivisor; // Reduce the number by dividing out the factor.
            powerCount++;                             // Increment the exponent for this prime factor.
        }

        // If `candidateDivisor` was indeed a factor (i.e., `powerCount` is greater than zero),
        // add it to our list of prime factors along with its calculated exponent.
        if (powerCount > 0) {
            primeFactorList.push({ base: candidateDivisor, exp: powerCount });
        }
    }

    // After the loop, if `currentMutableValue` is still greater than 1, it implies that
    // the remaining `currentMutableValue` itself is a prime number. This happens when
    // the largest prime factor is greater than the square root of the original input.
    if (currentMutableValue > 1) {
        primeFactorList.push({ base: currentMutableValue, exp: 1 }); // It's a prime factor with an exponent of 1.
    }

    return primeFactorList; // Return the comprehensive list of prime factors.
};

/**
 * This is the primary execution function of the program. It parses raw input data,
 * performs a specific mathematical computation based on prime factorization, and outputs the result.
 * The calculation involves taking the prime factors of one number and modifying their exponents
 * based on a second number, then multiplying these modified prime powers together.
 *
 * @param {string} rawInputData A string expected to contain two space-separated non-negative integers.
 *                              Example: "10 1000"
 */
const processInputAndCompute = (rawInputData) => {
    // Trim whitespace from the input and split it into an array of string parts.
    const inputComponents = rawInputData.trim().split(" ");

    // Parse the string components into numbers.
    // The first number (`divisorValue`) acts as a divisor for exponents.
    // The second number (`targetNumber`) is the one whose prime factors are analyzed.
    const divisorValue = Number(inputComponents[0]);
    const targetNumber = Number(inputComponents[1]);

    // --- Robust Input Validation and Edge Case Handling ---

    // 1. Check for non-numeric or negative inputs.
    if (isNaN(divisorValue) || isNaN(targetNumber) || divisorValue < 0 || targetNumber < 0) {
        console.error("Error: Invalid input provided. Both numbers must be non-negative integers.");
        return; // Terminate execution if input is invalid.
    }

    // 2. Handle specific edge cases for `targetNumber`.
    if (targetNumber === 0) {
        console.log(0); // If the target number is 0, the result of the computation is 0.
        return;
    }
    if (targetNumber === 1) {
        console.log(1); // If the target number is 1, its prime factorization is empty, leading to a product of 1.
        return;
    }

    // 3. Handle division by zero for `divisorValue`.
    if (divisorValue === 0) {
        console.error("Error: The divisor value cannot be zero as it would lead to undefined exponents.");
        return; // Terminate execution to prevent division by zero.
    }

    // --- Core Logic ---

    // Obtain the list of prime factors and their exponents for the `targetNumber`.
    const primeFactorsOfTarget = obtainPrimeDivisors(targetNumber);

    // Initialize an accumulator for the final product.
    // This variable will hold the result of multiplying prime bases raised to their modified exponents.
    let finalCalculatedProduct = 1;

    // Iterate through each prime factor entry obtained from `obtainPrimeDivisors`.
    for (let currentFactorIndex = 0; currentFactorIndex < primeFactorsOfTarget.length; currentFactorIndex++) {
        // Extract the current prime factor object for easier access.
        const currentFactorEntry = primeFactorsOfTarget[currentFactorIndex];

        // Calculate the modified exponent: This is the integer part (floor) of
        // the original exponent divided by `divisorValue`.
        const exponentQuotient = Math.floor(currentFactorEntry.exp / divisorValue);

        // Only include this prime factor in the product if its modified exponent is positive.
        // If `exponentQuotient` is 0, `base^0` is 1, which doesn't change the product,
        // so we can optimize by skipping the multiplication.
        if (exponentQuotient > 0) {
            // Multiply `finalCalculatedProduct` by the current prime `base` raised to `exponentQuotient`.
            finalCalculatedProduct *= Math.pow(currentFactorEntry.base, exponentQuotient);
        }
    }

    // Output the final computed result to the standard console.
    // Convert to string explicitly for consistency, though `console.log` handles numbers fine.
    console.log(String(finalCalculatedProduct));
};

/**
 * A helper function to abstract the process of reading raw input data, typically from a file.
 * This simulates reading from standard input in environments like competitive programming platforms.
 *
 * @param {string} dataSourcePath The path to the input data source (e.g., "/dev/stdin").
 * @returns {string} The content read from the specified data source as a UTF-8 encoded string.
 */
const obtainRawDataFromFile = (dataSourcePath) => {
    try {
        // Node.js 'fs' module is used for file system operations.
        // `readFileSync` reads the entire file synchronously.
        return require("fs").readFileSync(dataSourcePath, "utf8");
    } catch (readError) {
        // Log an error if file reading fails.
        console.error(`Error: Could not retrieve input data from ${dataSourcePath}.`, readError.message);
        // Return an empty string or throw the error, depending on desired error handling.
        // An empty string will likely cause parsing errors downstream, which is acceptable for robustness testing.
        return "";
    }
};

// The program's entry point:
// It orchestrates the flow by first reading the input and then invoking the main processing function.
// The path "/dev/stdin" is a common Unix-like convention for standard input.
processInputAndCompute(obtainRawDataFromFile("/dev/stdin"));