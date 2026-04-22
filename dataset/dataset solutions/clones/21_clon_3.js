// This module handles reading numerical input from standard input,
// processes pairs of numbers from each line, and then computes their
// Greatest Common Divisor (GCD) and Least Common Multiple (LCM).

// Utilize the Node.js 'fs' module for file system operations, specifically for reading standard input.
const fileSystemUtility = require("fs");

// Read all incoming data from '/dev/stdin' as a UTF-8 encoded string.
// This variable holds the raw text content provided as input.
let sourceContentString = fileSystemUtility.readFileSync("/dev/stdin", "utf8");

// Prepare the input: remove any leading/trailing whitespace from the entire string,
// then split it into an array where each element represents a single line of input.
let dataLineCollection = sourceContentString.trim().split("\n");

// Iterate through each line of the input collection to process the numerical data.
for (let entryIndex = 0; entryIndex < dataLineCollection.length; entryIndex++) {
    // Extract the current line being processed.
    let currentInputLine = dataLineCollection[entryIndex];

    // Skip processing if the line is empty or contains only whitespace characters.
    if (!currentInputLine.trim()) {
        continue;
    }

    // Split the current line by spaces to get an array of potential number strings.
    let stringTokens = currentInputLine.split(" ");

    // Ensure there are at least two tokens to work with for GCD/LCM calculation.
    if (stringTokens.length < 2) {
        console.error(`Error on line ${entryIndex + 1}: Insufficient number of values provided. Skipping.`);
        continue;
    }

    // Convert the string tokens into actual numerical values.
    // Filter out any entries that could not be parsed as valid numbers (e.g., 'abc', '').
    let parsedNumericValues = stringTokens
        .map(strValue => Number(strValue)) // Attempt to convert each string to a number.
        .filter(numValue => !isNaN(numValue)); // Keep only valid numbers.

    // After parsing and filtering, re-check if we still have at least two valid numbers.
    if (parsedNumericValues.length < 2) {
        console.error(`Error on line ${entryIndex + 1}: Invalid or insufficient numerical data after parsing. Skipping.`);
        continue;
    }

    // Sort the valid numbers in descending order. This ensures that `data[0]` and `data[1]`
    // consistently refer to the largest and second largest numbers respectively,
    // which can be useful for certain arithmetic contexts or simply for consistent input to the helper function.
    parsedNumericValues.sort((valueB, valueA) => valueB - valueA);

    // Invoke a dedicated function to perform the core arithmetic operations (GCD and LCM)
    // on the processed and sorted numerical array.
    computeArithmeticResults(parsedNumericValues);
}

/**
 * Calculates the Greatest Common Divisor (GCD) and Least Common Multiple (LCM)
 * for the first two numbers in a given array.
 *
 * @param {number[]} numberSequence - An array of numbers, expected to contain at least two.
 *                                  It is assumed to be pre-sorted in descending order by the caller.
 */
function computeArithmeticResults(numberSequence) {
    // Extract the first two numbers from the input sequence.
    // These are treated as the primary operands for GCD and LCM calculations.
    let primaryOperandA = numberSequence[0];
    let primaryOperandB = numberSequence[1];

    // Handle edge cases where one or both numbers are zero.
    // The GCD of (X, 0) is |X|, and the LCM of (X, 0) is 0.
    // For simplicity, if either is zero, we output "0 0" as per common problem interpretations
    // where the GCD/LCM of zero with another number might be undefined or specific to context.
    if (primaryOperandA === 0 || primaryOperandB === 0) {
        console.log(`0 0`);
        return;
    }

    // Store the initial values of the operands. This is crucial because the Euclidean
    // algorithm for GCD modifies its input variables, but the LCM calculation
    // requires the original numbers.
    const initialValA = primaryOperandA;
    const initialValB = primaryOperandB;

    // Calculate the Greatest Common Divisor (GCD) using the Euclidean algorithm.
    // This iterative process continuously replaces the larger number with the remainder
    // of the division of the two numbers until the remainder is zero.
    // The last non-zero remainder is the GCD.
    while (primaryOperandB !== 0) {
        let currentRemainder = primaryOperandA % primaryOperandB;
        primaryOperandA = primaryOperandB;
        primaryOperandB = currentRemainder;
    }
    // At this point, primaryOperandA holds the GCD.
    const calculatedGCD = primaryOperandA;

    // Calculate the Least Common Multiple (LCM).
    // The LCM of two numbers (a, b) can be derived from their GCD using the formula:
    // LCM(a, b) = |a * b| / GCD(a, b).
    // We use Math.abs() to ensure the product is positive, which is standard for LCM.
    const calculatedLCM = Math.abs((initialValA * initialValB) / calculatedGCD);

    // Output the computed LCM and GCD to the console,
    // formatted as two space-separated numbers on a single line.
    console.log(`${calculatedLCM} ${calculatedGCD}`);
}