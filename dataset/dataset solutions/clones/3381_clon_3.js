process.stdin.resume();
process.stdin.setEncoding('utf8');

/**
 * Decomposes a given positive integer into its prime factors and their respective exponents.
 * For example, an input of 12 would result in [{ primeFactor: 2, exponent: 2 }, { primeFactor: 3, exponent: 1 }].
 * This function handles numbers up to the safe integer limit for JavaScript's Number type.
 *
 * @param {number} inputNumber The integer for which to find prime factors. Must be a positive integer.
 * @returns {Array<Object>} An array of objects, where each object has 'primeFactor' (the prime base)
 *                          and 'exponent' (its power in the factorization).
 */
const obtainPrimeFactors = (inputNumber) => {
    // Initialize an empty list to store the prime factorization components.
    let factorComponents = [];
    // Use a mutable variable to perform divisions on the original number.
    let remainingValue = inputNumber;

    // A quick validation: numbers less than or equal to 1 have no prime factors.
    if (remainingValue <= 1) {
        return factorComponents;
    }

    // Iterate through potential prime divisors, starting from 2.
    // The loop condition `Math.pow(candidateDivisor, 2) <= remainingValue` is an optimization
    // because if a number `N` has a prime factor greater than `sqrt(N)`, it must also have
    // a prime factor smaller than `sqrt(N)`.
    for (let candidateDivisor = 2; Math.pow(candidateDivisor, 2) <= remainingValue; ++candidateDivisor) {
        let powerCount = 0; // Counter for how many times the current candidateDivisor divides remainingValue.

        // Keep dividing remainingValue by candidateDivisor as long as it's perfectly divisible.
        while (remainingValue % candidateDivisor === 0) {
            remainingValue = remainingValue / candidateDivisor; // Reduce the number by dividing.
            powerCount++;                                     // Increment the count for this prime factor.
        }

        // If the candidateDivisor was indeed a factor (i.e., powerCount > 0), add it to the list.
        if (powerCount > 0) {
            factorComponents.push({ primeFactor: candidateDivisor, exponent: powerCount });
        }
    }

    // After the loop, if remainingValue is still greater than 1, it means the remaining value
    // itself is a prime number (the largest prime factor).
    if (remainingValue > 1) {
        factorComponents.push({ primeFactor: remainingValue, exponent: 1 });
    }

    // Return the complete list of prime factors and their exponents.
    return factorComponents;
};

/**
 * Orchestrates the solution logic: reads input, factorizes, computes the result, and outputs it.
 * The goal is to find the largest integer X such that X to the power of `requiredDivisorCount`
 * is a divisor of `initialProduct`.
 *
 * @param {string} rawInputLine The input string, expected to be two space-separated integers (N P).
 */
const executeSolution = (rawInputLine) => {
    // Split the input string into parts and convert them to integers.
    const inputSegments = rawInputLine.trim().split(" ");
    const requiredDivisorCount = parseInt(inputSegments[0], 10); // Represents 'N' from problem.
    const initialProduct = parseInt(inputSegments[1], 10);       // Represents 'P' from problem.

    // Implement basic input validation to ensure valid positive integers.
    if (isNaN(requiredDivisorCount) || isNaN(initialProduct) || requiredDivisorCount < 1 || initialProduct < 1) {
        console.error("Error: Both N and P must be positive integers. Received:", rawInputLine);
        return; // Exit if input is invalid.
    }

    // Get the prime factorization of the initial product.
    const productFactorization = obtainPrimeFactors(initialProduct);

    // Initialize the result accumulator. Using BigInt for calculations to prevent
    // potential overflow with large intermediate or final values, as standard JavaScript
    // numbers have a limited safe integer range.
    let finalResultAccumulator = 1n; // 'n' suffix denotes a BigInt literal.

    // Iterate through each unique prime factor found in the productFactorization.
    for (let currentFactorIndex = 0; currentFactorIndex < productFactorization.length; ++currentFactorIndex) {
        const factorEntry = productFactorization[currentFactorIndex];
        const primeBaseValue = factorEntry.primeFactor;
        const totalOccurrences = factorEntry.exponent;

        // Determine the maximum exponent for the current prime factor that can be part of the result.
        // This is found by dividing its total occurrences by `requiredDivisorCount` and taking the floor.
        // For example, if a prime appears 7 times (p^7) and N=3, then floor(7/3) = 2, so p^2 contributes.
        const effectivePowerContribution = Math.floor(totalOccurrences / requiredDivisorCount);

        // If this prime factor contributes to the result (i.e., its effective power is greater than 0).
        if (effectivePowerContribution > 0) {
            // Calculate the term for this prime factor: (primeBaseValue ^ effectivePowerContribution).
            // Convert numbers to BigInt before performing exponentiation to handle large results.
            const currentTerm = BigInt(primeBaseValue) ** BigInt(effectivePowerContribution);
            // Multiply this term into the overall result accumulator.
            finalResultAccumulator *= currentTerm;
        }
    }

    // Output the final computed result. Convert the BigInt back to a string for console output.
    console.log(String(finalResultAccumulator));
};

// Main execution block: Reads input from standard input and calls the solution function.
try {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    executeSolution(fileContent);
} catch (executionError) {
    // Log any errors that occur during file reading or solution execution.
    console.error("An error occurred during execution:", executionError.message);
    // Exit the process with an error code to indicate failure.
    process.exit(1);
}