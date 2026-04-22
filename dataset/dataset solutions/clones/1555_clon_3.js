/*
 * This module is designed to perform a specialized calculation on a sequence of numerical data.
 * It involves constructing prefix sums and then computing a cumulative sum of products,
 * all operations being performed under a specific large prime modulus to prevent overflow
 * and ensure results remain within a defined range.
 *
 * The primary objective is to demonstrate robust data processing including input validation,
 * modular arithmetic, and clear separation of concerns through helper functions.
 */

// In a production environment, this might read from standard input or a file.
// const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");

// Example input data for development and testing.
// The first line indicates the total number of elements in the sequence.
// The second line contains the space-separated integer elements.
const sourceData = `4
141421356 17320508 22360679 244949`;

/**
 * A large prime number used as the modulus for all arithmetic operations.
 * This constant is critical for ensuring that intermediate and final results
 * do not exceed JavaScript's safe integer limits and for specific mathematical properties.
 */
const primeDivisor = 1000000007;

/**
 * Computes the modular product of two numbers, `operandA` and `operandB`,
 * with respect to a given `modulusValue`. This function is optimized to
 * prevent potential overflow issues that can arise when `operandA * operandB`
 * exceeds JavaScript's maximum safe integer before the modulo operation.
 * It employs a technique of splitting one operand into high and low 16-bit parts.
 *
 * @param {number} operandA - The first numerical operand.
 * @param {number} operandB - The second numerical operand.
 * @param {number} modulusValue - The modulus to apply to the product.
 * @returns {number} The result of `(operandA * operandB) % modulusValue`.
 */
function computeSafeModularProduct(operandA, operandB, modulusValue) {
    // Early exit for zero operands, which simplifies calculations and improves efficiency.
    if (operandA === 0 || operandB === 0) {
        return 0;
    }

    // Decompose operandA into its high and low 16-bit components.
    // This allows intermediate products to stay smaller.
    const highPartOperandA = Math.floor(operandA / 65536); // Equivalent to operandA >> 16
    const lowPartOperandA = operandA % 65536;             // Equivalent to operandA & 65535

    // Calculate the contribution from the high part of operandA:
    // (highPartOperandA * operandB * 65536) % modulusValue
    let highTermContribution = (highPartOperandA * operandB) % modulusValue;
    highTermContribution = (highTermContribution * 65536) % modulusValue;

    // Calculate the contribution from the low part of operandA:
    // (lowPartOperandA * operandB) % modulusValue
    let lowTermContribution = (lowPartOperandA * operandB) % modulusValue;

    // Sum the two contributions and apply the modulus one final time.
    return (highTermContribution + lowTermContribution) % modulusValue;
}

/**
 * Parses a string of space-separated numbers into an array of integers.
 * Includes validation to ensure all parsed values are indeed numbers
 * and to check if the length matches an `expectedSize`.
 *
 * @param {string} lineContent - The string containing space-separated numbers.
 * @param {number} expectedSize - The expected count of numbers in the sequence.
 * @returns {number[]} An array of parsed integer values.
 */
const parseIntegerSequence = (lineContent, expectedSize) => {
    const stringTokens = lineContent.split(' ');
    // Provide a warning if the actual number of elements doesn't match the declared count.
    if (stringTokens.length !== expectedSize) {
        console.warn(`Warning: Declared element count was ${expectedSize}, but found ${stringTokens.length} elements. Processing with available data.`);
    }

    // Map string tokens to integers, validating each conversion.
    const numericArray = stringTokens.map(token => {
        const numValue = parseInt(token, 10);
        if (isNaN(numValue)) {
            console.error(`Error: Non-numeric value detected ('${token}') in sequence. Program will terminate.`);
            process.exit(1); // Exit due to critical input error.
        }
        return numValue;
    });
    return numericArray;
};

// --- Main Program Flow ---

// 1. Input Processing and Validation
const dataRows = sourceData.split('\n');

// Ensure that sufficient input lines are provided.
if (dataRows.length < 2) {
    console.error("Fatal Error: Input data is incomplete. Expected at least two lines.");
    process.exit(1);
}

// Extract and validate the declared count of elements from the first line.
const declaredElementCount = parseInt(dataRows[0], 10);
if (isNaN(declaredElementCount) || declaredElementCount <= 0) {
    console.error("Fatal Error: Invalid or non-positive element count provided in input. Program exiting.");
    process.exit(1);
}

// Parse the actual sequence of numbers from the second line.
const valueSequence = parseIntegerSequence(dataRows[1], declaredElementCount);

// Perform a final check to ensure the parsed sequence length is adequate.
if (valueSequence.length < declaredElementCount) {
    console.error(`Fatal Error: Mismatch. Declared element count (${declaredElementCount}) is greater than actual sequence length (${valueSequence.length}).`);
    process.exit(1);
}

// 2. Prefix Sum Calculation
// Initialize an array to store the prefix sums. `prefixSumArray[0]` is always 0.
const prefixSumArray = [0];

// Iterate through the `valueSequence` to compute and store prefix sums.
// Each `prefixSumArray[k]` will hold the sum of `valueSequence[0]` through `valueSequence[k-1]`, modulo `primeDivisor`.
for (let currentElementIndex = 0; currentElementIndex < declaredElementCount; currentElementIndex++) {
    const previousAccumulatedSum = prefixSumArray[currentElementIndex];
    const currentSequenceValue = valueSequence[currentElementIndex];
    const newAccumulatedSum = (previousAccumulatedSum + currentSequenceValue) % primeDivisor;
    prefixSumArray.push(newAccumulatedSum);
}

// 3. Final Result Computation
// Initialize the accumulator for the final result.
let overallCumulativeResult = 0;

// Iterate from the second element (index 1) up to the last element of the sequence.
// For each element, calculate the product of its corresponding prefix sum and the element itself,
// then add this product to the `overallCumulativeResult`, all under the `primeDivisor` modulus.
// The loop runs for indices `1` through `declaredElementCount - 1`.
for (let processingPosition = 1; processingPosition < declaredElementCount; processingPosition++) {
    const currentPrefixValue = prefixSumArray[processingPosition];
    const currentSequenceElement = valueSequence[processingPosition];

    // Compute the modular product for the current pair of values.
    const termProduct = computeSafeModularProduct(currentPrefixValue, currentSequenceElement, primeDivisor);

    // Add the computed term product to the overall result, maintaining the modulus.
    overallCumulativeResult = (overallCumulativeResult + termProduct) % primeDivisor;
}

// 4. Output the Final Result
console.log(overallCumulativeResult);