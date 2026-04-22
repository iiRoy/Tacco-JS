const processInputData = (inputContentString) => {
    // A significant prime constant used for the final modulo-like operation.
    // This value ensures the result fits within certain constraints or is used for hashing/output formatting.
    const LARGE_PRIME_MODULUS = 10000000007n; // Using BigInt for consistency with large number arithmetic

    // Initialize accumulator for the sum of GCDs
    let totalAccumulatedGCDSum = 0n; // Initialize as BigInt to handle potentially massive sums

    // Parse the raw input string into an array of lines
    const dataLines = inputContentString.trim().split("\n");

    // --- Input Validation and Parsing ---
    // Ensure there's at least one line of input
    if (dataLines.length === 0) {
        console.error("Input processing error: No data lines provided.");
        return; // Terminate if input is empty
    }

    // Split the first line to extract the two essential numeric parameters
    const firstLineParameters = dataLines[0].split(" ");

    // Validate the number of parameters on the first line
    if (firstLineParameters.length < 2) {
        console.error("Input processing error: Insufficient parameters on the first line.");
        return;
    }

    // Convert string parameters to integers (base 10)
    const dimensionSizeN = parseInt(firstLineParameters[0], 10);
    const baseValueK = parseInt(firstLineParameters[1], 10);

    // Basic validation for parsed numbers
    if (isNaN(dimensionSizeN) || isNaN(baseValueK) || dimensionSizeN < 0 || baseValueK < 0) {
        console.error("Input processing error: Invalid or negative numeric parameters detected.");
        return; // Terminate on invalid input
    }
    // --- End Input Validation ---

    // Calculate the power value. The original loop `a = K; for (s=1; s<=N; s++) { a *= K; }`
    // effectively computes K^(N+1).
    // Using Math.pow for efficiency, then converting to BigInt for subsequent operations.
    const rawPowerResult = Math.pow(baseValueK, dimensionSizeN + 1);
    // Ensure the power result is an integer and convert to BigInt for loops.
    const currentPowerTarget = BigInt(Math.floor(rawPowerResult));

    // --- Nested Loop for GCD Summation ---
    // Iterate through a cube of numbers up to `currentPowerTarget`.
    // All loop variables and GCD calculations must use BigInts to prevent overflow.
    for (let outerIterator = 1n; outerIterator <= currentPowerTarget; outerIterator++) {
        for (let middleIterator = 1n; middleIterator <= currentPowerTarget; middleIterator++) {
            for (let innerIterator = 1n; innerIterator <= currentPowerTarget; innerIterator++) {
                // Add the greatest common divisor of the three current iterators to the running sum.
                totalAccumulatedGCDSum += computeGreatestCommonDivisor(outerIterator, middleIterator, innerIterator);
            }
        }
    }
    // --- End Nested Loop ---

    // Perform the final division using the large prime modulus and output the result.
    // The result of BigInt division is also a BigInt (integer division).
    const finalCalculatedOutput = totalAccumulatedGCDSum / LARGE_PRIME_MODULUS;
    console.log(finalCalculatedOutput.toString()); // Convert BigInt to string for output
};

/**
 * Computes the greatest common divisor (GCD) for an arbitrary number of BigInt values
 * using the Euclidean algorithm.
 *
 * @param {...BigInt} numbersToProcess - A variable number of BigInt arguments.
 * @returns {BigInt} The greatest common divisor of all provided numbers. Returns 0n if no numbers are provided.
 */
const computeGreatestCommonDivisor = (...numbersToProcess) => {
    // Helper function to calculate GCD of two BigInts
    const _calculatePairwiseGCD = (firstNum, secondNum) => {
        // Ensure both inputs are BigInts for consistent arithmetic.
        firstNum = BigInt(firstNum);
        secondNum = BigInt(secondNum);
        // Euclidean algorithm: gcd(a, b) = gcd(b, a % b)
        return secondNum === 0n ? firstNum : _calculatePairwiseGCD(secondNum, firstNum % secondNum);
    };

    // Handle edge case: no numbers provided
    if (numbersToProcess.length === 0) {
        return 0n; // Conventionally, GCD of an empty set is 0 or undefined; 0n is a safe default for sums.
    }

    // Start with the first number as the initial GCD.
    let currentAggregateGCD = BigInt(numbersToProcess[0]);

    // Iterate through the rest of the numbers, updating the GCD iteratively.
    for (let idx = 1; idx < numbersToProcess.length; idx++) {
        currentAggregateGCD = _calculatePairwiseGCD(currentAggregateGCD, numbersToProcess[idx]);
    }

    return currentAggregateGCD;
};

// --- Execution Entry Point ---
// This block reads input from standard input and passes it to the main processing function.
try {
    // Synchronously read the entire content of standard input as a UTF-8 string.
    const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');
    processInputData(fileContents); // Invoke the primary function
} catch (error) {
    // Catch and log any errors during file reading or initial processing.
    console.error("An error occurred during input reading or initial setup:", error.message);
    // Optionally, exit the process with an error code.
    // process.exit(1);
}
// --- End Execution Entry Point ---