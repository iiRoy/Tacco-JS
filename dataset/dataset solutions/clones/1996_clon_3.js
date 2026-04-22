const ModuloUtils = {
    // Main modulus for all primary calculations, frequently a large prime number.
    PRIMARY_MODULUS: 1000000007, // Represents 1e+9 + 7

    // A specific factor employed to divide larger numbers during modular multiplication.
    // This strategy helps prevent potential integer overflows when intermediate products
    // might exceed JavaScript's safe integer limits before the final modulo operation.
    SPLIT_FACTOR_FOR_MULT: 100000, // Represents 1e+5

    /**
     * Guarantees that a number is non-negative after a modulo operation.
     * Standard JavaScript's `%` operator can yield a negative result if the dividend is negative.
     * This utility ensures the output is always within the range [0, modulus - 1].
     * @param {number} value The numerical operand for the modulo operation.
     * @param {number} modulus The divisor (must be positive).
     * @returns {number} The positive modular remainder.
     */
    ensurePositiveResult: function(value, modulus) {
        return (value % modulus + modulus) % modulus;
    },

    /**
     * Executes modular multiplication: (baseValue * operandB) % modulus.
     * This function is optimized for scenarios where `baseValue * operandB` could be excessively large.
     * It achieves this by decomposing `operandB` into parts relative to `splitFactor`.
     * @param {number} baseValue The initial multiplicand.
     * @param {number} operandB The second multiplicand.
     * @param {number} modulus The modulo constant.
     * @param {number} splitFactor The factor used for splitting `operandB`.
     * @returns {number} The modular product.
     */
    performModularMultiplication: function(baseValue, operandB, modulus, splitFactor) {
        // Deconstruct operandB into a quotient and a remainder with respect to the splitFactor.
        const quotientPart = Math.floor(operandB / splitFactor);
        const remainderPart = operandB % splitFactor;

        // Apply the distributive property of multiplication over addition for modular arithmetic:
        // (A * B) % M = (A * (Q*S + R)) % M = (((A*Q)%M * S)%M + (A*R)%M) % M
        let currentProduct = (baseValue * quotientPart % modulus);
        currentProduct = (currentProduct * splitFactor % modulus);
        currentProduct = ModuloUtils.ensurePositiveResult(currentProduct + (baseValue * remainderPart), modulus);

        return currentProduct;
    },

    /**
     * Calculates modular exponentiation: (baseValue^exponentValue) % modulus.
     * This implementation utilizes the efficient binary exponentiation (or "fast power") algorithm,
     * processing the exponent's bits directly via bitwise operations.
     * @param {number} baseValue The base of the exponentiation.
     * @param {number} exponentValue The power to which the base is raised.
     * @param {number} modulus The modulus constant.
     * @param {number} splitFactor The factor for modular multiplication, passed to `performModularMultiplication`.
     * @returns {number} The modular exponentiation result.
     */
    computeModularExponentiation: function(baseValue, exponentValue, modulus, splitFactor) {
        let finalResult = 1; // Initialize the result to 1 (any_base^0 = 1).
        let currentIterativeBase = baseValue; // Holds baseValue^(2^k) in each step.

        // Iterate through the bits of `exponentValue` from the least significant bit (LSB) upwards.
        // If a bit is set (i.e., 1), incorporate `currentIterativeBase` into `finalResult`.
        // In every iteration, `currentIterativeBase` is squared.
        while (exponentValue > 0) {
            // Check if the current LSB of `exponentValue` is 1.
            if (exponentValue & 1) {
                finalResult = ModuloUtils.performModularMultiplication(
                    finalResult, currentIterativeBase, modulus, splitFactor
                );
            }
            // Square `currentIterativeBase` for the next bit position.
            currentIterativeBase = ModuloUtils.performModularMultiplication(
                currentIterativeBase, currentIterativeBase, modulus, splitFactor
            );
            // Shift `exponentValue` right by 1 bit to examine the next bit.
            exponentValue >>= 1;
        }
        return finalResult;
    }
};


/**
 * Orchestrates the processing of input data to derive a specific combinatorial sum.
 * This function is designed to solve problems involving modular exponentiation and
 * pattern counting, typically encountered in number theory or combinatorics.
 * @param {string} rawInputContent The raw string data read from the input source.
 */
function ProcessInputData(rawInputContent) {
    // --- Input Validation and Parsing Phase ---
    if (!rawInputContent || rawInputContent.trim() === "") {
        console.error("Input processing error: The provided content is empty or contains only whitespace.");
        return; // Exit if input is invalid.
    }

    const inputLines = rawInputContent.trim().split("\n");
    if (inputLines.length === 0) {
        console.error("Input parsing error: No discernible lines found within the input content.");
        return;
    }

    const firstLineData = inputLines[0].split(" ");
    if (firstLineData.length < 2) {
        console.error("Input parsing error: Expected at least two numerical tokens in the first line, but found fewer.");
        return;
    }

    // Convert the extracted string tokens into integer parameters.
    const paramN = parseInt(firstLineData[0], 10);
    const paramK = parseInt(firstLineData[1], 10);

    // Validate that the parsed parameters are valid positive integers.
    if (isNaN(paramN) || isNaN(paramK) || paramN < 1 || paramK < 1) {
        console.error(`Input validation error: Parameters N (${firstLineData[0]}) or K (${firstLineData[1]}) are not valid positive integers.`);
        return;
    }

    // --- Pre-computation of Modular Powers Cache ---
    // This array will store pre-calculated values of (i^paramN) % PRIMARY_MODULUS.
    // The size is `paramK` to accommodate values for `i` up to `paramK`.
    // It's initialized with zeros to ensure a clean state.
    const modularPowerCache = new Array(paramK).fill(0);

    let currentDivisorBlock; // Represents the result of `floor(paramK / currentFactor)`.
    // This loop is optimized to iterate efficiently through distinct values of `floor(paramK / j)`.
    // It calculates `(i^paramN) % MODULUS` for specific `i` values derived from these blocks.
    for (let factorIndex = 1; factorIndex <= paramK; /* factorIndex is updated internally */){
        currentDivisorBlock = Math.floor(paramK / factorIndex);
        // The `effectiveFactor` determines the actual `i` for which we need to compute `i^paramN`.
        // This jump ensures that each block of `j` values where `floor(paramK/j)` is constant
        // is processed only once at its boundary.
        const effectiveFactor = Math.floor(paramK / currentDivisorBlock);

        modularPowerCache[effectiveFactor - 1] = ModuloUtils.computeModularExponentiation(
            effectiveFactor,
            paramN,
            ModuloUtils.PRIMARY_MODULUS,
            ModuloUtils.SPLIT_FACTOR_FOR_MULT
        );
        factorIndex = effectiveFactor + 1; // Advance `factorIndex` to the start of the next block.
    }

    // --- Main Combinatorial Summation Loop ---
    // This array will store the computed counts for specific patterns `f(x)` for each `x` from 1 to `paramK`.
    // `f(x)` typically represents counts related to greatest common divisors or similar number theory concepts.
    const patternFrequencyCounts = new Array(paramK).fill(0);
    let cumulativeFinalResult = 0; // The accumulator for the final answer.

    // The loop iterates downwards from `paramK` to 1. This order is critical
    // because the calculation for `currentValX` depends on results already computed
    // for its multiples (e.g., `currentValX * multipleFactor`).
    for (let currentValX = paramK; currentValX >= 1; currentValX--) {
        const upperLimitForDivisors = Math.floor(paramK / currentValX);

        // Initialize `currentPatternCount` with the pre-calculated modular power.
        // This value is `(upperLimitForDivisors)^paramN % MODULUS`.
        let currentPatternCount = modularPowerCache[upperLimitForDivisors - 1];

        // Apply the principle of inclusion-exclusion (or Mobius inversion) to refine `currentPatternCount`.
        // Subtract contributions from multiples of `currentValX` that have already been calculated.
        for (let multipleFactor = 2; multipleFactor <= upperLimitForDivisors; multipleFactor++) {
            const subtractionIndex = currentValX * multipleFactor - 1;
            // A basic check to ensure the index is within the array bounds, though logically it should be.
            if (subtractionIndex < patternFrequencyCounts.length) {
                currentPatternCount -= patternFrequencyCounts[subtractionIndex];
            }
        }

        // Ensure `currentPatternCount` remains positive and within the modulus after subtractions.
        currentPatternCount = ModuloUtils.ensurePositiveResult(currentPatternCount, ModuloUtils.PRIMARY_MODULUS);

        // Calculate the term for the current `currentValX` and add it to the cumulative result.
        const termToAdd = ModuloUtils.performModularMultiplication(
            currentValX,
            currentPatternCount,
            ModuloUtils.PRIMARY_MODULUS,
            ModuloUtils.SPLIT_FACTOR_FOR_MULT
        );
        // Add `termToAdd` to the running total, ensuring the total also stays within the modulus.
        cumulativeFinalResult = ModuloUtils.ensurePositiveResult(cumulativeFinalResult + termToAdd, ModuloUtils.PRIMARY_MODULUS);

        // Store the final calculated pattern count for `currentValX`.
        patternFrequencyCounts[currentValX - 1] = currentPatternCount;
    }

    // Output the final computed result to standard output.
    console.log(cumulativeFinalResult);
}

// Entry point of the script: Reads input from standard input and initiates processing.
// This line typically assumes execution within a Node.js environment.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));