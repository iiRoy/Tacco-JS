// This module processes numerical inputs to determine a specific count related to their greatest common divisor.
function executeProgram(rawInputData) {
    // Standard input data is expected as a single string.
    // It's split by spaces to extract individual numerical tokens.
    const tokenizedValues = rawInputData.trim().split(" ");

    // Ensure we have exactly two numerical tokens.
    if (tokenizedValues.length < 2) {
        console.error("Error: Insufficient input values provided. Expected two numbers separated by space.");
        return; // Exit if input is invalid
    }

    // Convert string tokens to numbers for calculation.
    const firstOperand = Number(tokenizedValues[0]);
    const secondOperand = Number(tokenizedValues[1]);

    // Validate the parsed numbers to ensure they are indeed numerical.
    if (isNaN(firstOperand) || isNaN(secondOperand)) {
        console.error("Error: Input values must be valid numerical representations.");
        return; // Exit if input is invalid
    }

    // Calculate the greatest common divisor (GCD) of the two input numbers.
    // This value will be the basis for our factor analysis.
    let greatestCommonFactor = computeGreatestCommonDivisor(firstOperand, secondOperand);

    // Initialize a counter for unique factors. We always include '1' as a factor,
    // which is coprime to all other integers.
    let uniquePrimeFactorCount = 1;

    // Use a temporary variable to hold the current GCD value during factorization.
    // This allows us to modify it (by dividing out factors) without altering the original GCD.
    let tempFactorizableValue = greatestCommonFactor;

    // Efficiently handle the prime factor '2' first.
    // If '2' divides the current value, increment the count and remove all its occurrences.
    if (tempFactorizableValue % 2 === 0) {
        uniquePrimeFactorCount++;
        while (tempFactorizableValue % 2 === 0) {
            tempFactorizableValue /= 2;
        }
    }

    // Iterate through odd numbers starting from 3 up to the square root of the remaining value.
    // This method efficiently finds and counts distinct prime factors.
    for (let currentPrimeCandidate = 3; currentPrimeCandidate * currentPrimeCandidate <= tempFactorizableValue; currentPrimeCandidate += 2) {
        // If the candidate divides the remaining value, it means we've found a new prime factor.
        if (tempFactorizableValue % currentPrimeCandidate === 0) {
            uniquePrimeFactorCount++; // Increment count for this new distinct prime factor.
            // Divide out all occurrences of this prime factor from the temporary value.
            while (tempFactorizableValue % currentPrimeCandidate === 0) {
                tempFactorizableValue /= currentPrimeCandidate;
            }
        }
    }

    // After the loop, if 'tempFactorizableValue' is still greater than 1,
    // it implies that the remaining value itself is a prime factor (a large one).
    if (tempFactorizableValue > 1) {
        uniquePrimeFactorCount++;
    }

    // Output the final calculated count to the console. This count represents
    // 1 (for the factor '1') plus the number of distinct prime factors of the GCD.
    console.log(uniquePrimeFactorCount);
}

// Recursive utility function to compute the greatest common divisor (GCD) of two non-negative integers.
// This implementation uses the well-known Euclidean algorithm.
function computeGreatestCommonDivisor(dividend, divisor) {
    // Base case: If the divisor is zero, the GCD is the current dividend.
    if (divisor === 0) {
        return dividend;
    }
    // Recursive step: GCD(a, b) is equivalent to GCD(b, a % b).
    // This process continues until the remainder (a % b) becomes zero.
    return computeGreatestCommonDivisor(divisor, dividend % divisor);
}

// This section handles standard input/output operations. It should not be modified.
executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));