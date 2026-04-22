const fileSystem = require('fs');

/**
 * Orchestrates the process of reading a number, factorizing it, and printing the result.
 * This function handles input/output and coordinates the factorization logic.
 * @returns {void}
 */
function initiatePrimeFactorizationProcess() {
    // Acquire the raw input string from the standard input stream.
    // The .trim() method ensures no leading or trailing whitespace interferes with parsing.
    const rawInputString = fileSystem.readFileSync('/dev/stdin', 'utf8').trim();

    // Parse the acquired string into an integer. An explicit radix of 10 is used for safety.
    const initialNumericValue = parseInt(rawInputString, 10);

    // Implement a guard clause to validate the input.
    // Factorization is meaningful for positive integers greater than 1.
    if (isNaN(initialNumericValue) || initialNumericValue < 2) {
        // If the input is invalid, output an error message to standard error and terminate.
        process.stderr.write("Validation Error: Please provide a positive integer value greater than one for factorization.\n");
        process.exit(1);
    }

    // Call a dedicated helper function to perform the actual prime decomposition.
    // This separates concerns and makes the code more modular.
    const decompositionResult = computePrimeFactors(initialNumericValue);

    // Extract the final value that remained after factorization (which might be 1 or a prime number itself).
    // Also, retrieve the array of all prime factors that were discovered.
    const finalUnfactoredValue = decompositionResult.remainingNumber;
    const allObtainedFactors = decompositionResult.factorsList;

    // Construct the output string using a template literal for better readability.
    // The format is "final_value: factor1 factor2 ...\n".
    const formattedOutputLine = `${finalUnfactoredValue}: ${allObtainedFactors.join(' ')}\n`;

    // Write the complete output string to the standard output.
    process.stdout.write(formattedOutputLine);
}

/**
 * Decomposes a given integer into its prime factors.
 * This function implements an optimized trial division algorithm.
 * @param {number} numberToFactor - The integer to be decomposed. Must be >= 2.
 * @returns {{remainingNumber: number, factorsList: number[]}} An object containing
 *                                                            the number's final state (1 if fully factored,
 *                                                            or its last prime factor) and a list of all found prime factors.
 */
function computePrimeFactors(numberToFactor) {
    // Initialize an empty array to store the prime factors as they are found.
    let factorsList = [];

    // Create a mutable copy of the input number to perform divisions on.
    let mutableValue = numberToFactor;

    // Iterate through potential divisors starting from 2.
    // The loop condition 'currentDivisor * currentDivisor <= mutableValue' is an optimization:
    // if 'mutableValue' has a prime factor larger than its square root, it must also have one smaller than its square root.
    // This reduces the upper bound of divisors to check.
    for (let currentDivisor = 2; currentDivisor * currentDivisor <= mutableValue; currentDivisor++) {
        // Continuously divide by the 'currentDivisor' as long as it's a factor.
        // This ensures all occurrences of a prime factor are captured.
        while (mutableValue % currentDivisor === 0) {
            factorsList.push(currentDivisor); // Add the found prime factor to the list.
            mutableValue /= currentDivisor;   // Reduce the number by this factor.
        }
    }

    // After the loop, if 'mutableValue' is still greater than 1,
    // it means the remaining 'mutableValue' itself is a prime number.
    // This handles cases where the original number was prime, or had a large prime factor
    // that was not caught by the `currentDivisor * currentDivisor <= mutableValue` loop condition.
    if (mutableValue > 1) {
        factorsList.push(mutableValue);
    }

    // Return a structured object containing the final state of the number and the list of factors.
    return {
        remainingNumber: mutableValue, // This will be 1 if completely factored, or the last prime factor.
        factorsList: factorsList
    };
}

// Execute the main factorization process.
initiatePrimeFactorizationProcess();