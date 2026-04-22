// Function to compute the greatest common divisor (GCD) of two numbers
// using the Euclidean algorithm. This is a fundamental operation
// required for calculating the Least Common Multiple (LCM).
// The algorithm works by repeatedly replacing the larger number with the
// remainder of the division of the larger number by the smaller number,
// until the smaller number becomes zero. The non-zero number is then the GCD.
const findGreatestCommonDivisor = (firstNum, secondNum) => {
    // Base case: if the second number is zero, the first number is the GCD.
    if (secondNum === 0) {
        return firstNum;
    }
    // Recursive step: call GCD with the second number and the remainder
    // of the first number divided by the second number.
    return findGreatestCommonDivisor(secondNum, firstNum % secondNum);
};

// Function to compute the least common multiple (LCM) of two individual numbers.
// The formula used is: LCM(a, b) = |a * b| / GCD(a, b).
// This relies on the previously defined `findGreatestCommonDivisor` function.
const computePairwiseLcm = (valueA, valueB) => {
    // If either value is zero, their LCM is zero by definition.
    if (valueA === 0 || valueB === 0) {
        return 0;
    }

    // Calculate the greatest common divisor of the two input values.
    const commonDivisor = findGreatestCommonDivisor(valueA, valueB);

    // Defensive check: If GCD is zero (which shouldn't happen for non-zero inputs),
    // return 0 or handle as an error to prevent division by zero.
    if (commonDivisor === 0) {
        console.warn("Warning: GCD returned zero for non-zero inputs. This indicates an unexpected scenario.");
        return 0;
    }

    // Apply the LCM formula. Math.abs ensures a positive LCM,
    // as LCM is typically defined for positive integers.
    return Math.abs((valueA * valueB) / commonDivisor);
};

/**
 * Calculates the Least Common Multiple (LCM) for an entire array of numbers.
 * It iteratively applies the pairwise LCM function to accumulate the result.
 *
 * @param {number[]} numericSequence - An array of numbers for which to calculate the LCM.
 * @returns {number} The cumulative LCM of all numbers in the input array.
 * @throws {Error} If the input array is null, undefined, or empty, as LCM cannot be calculated.
 */
function calculateLeastCommonMultiple(numericSequence) {
    // Input validation: Ensure the array is valid and contains elements.
    if (!numericSequence || numericSequence.length === 0) {
        console.error("Error: Input array for LCM calculation is empty or invalid.");
        throw new Error("Cannot calculate LCM for an empty or invalid sequence.");
    }

    // Initialize the accumulator with the first element of the sequence.
    // This value will be updated in each iteration with the LCM of itself and the next element.
    let cumulativeLcm = numericSequence[0];

    // Iterate through the rest of the array (starting from the second element).
    // In each step, compute the LCM of the current cumulative value and the next array element.
    for (let index = 1; index < numericSequence.length; index++) {
        cumulativeLcm = computePairwiseLcm(cumulativeLcm, numericSequence[index]);
    }

    // Return the final calculated Least Common Multiple for the entire sequence.
    return cumulativeLcm;
}

/**
 * Main processing function for the problem.
 * It reads structured input data, performs a series of calculations
 * involving LCM, and then outputs a specific derived result.
 *
 * The problem essentially asks to count numbers 'x' up to 'M' such that 'x'
 * is an odd multiple of the LCM of a set of half-values.
 * This is equivalent to `floor(M / LCM_val) - floor(M / (2 * LCM_val))`.
 *
 * @param {string[]} rawInputLines - An array of strings, where each string represents a line of input.
 *                                   Expected format:
 *                                   Line 0: "N M" (N is unused, M is the upper limit)
 *                                   Line 1: "a1 a2 ... ak" (space-separated numbers)
 */
function processInputData(rawInputLines) {
    // --- Step 1: Parse the first line of input ---
    // The first line contains two space-separated integers.
    // The first integer ('N' in the original problem) is not utilized in the final calculation,
    // so we can choose to parse it or simply ignore it. Here, we parse only the relevant 'M'.
    const firstLineParts = rawInputLines[0].split(" ");
    // const unusedCount = parseInt(firstLineParts[0], 10); // Variable 'N' is not used, thus deleted.
    const upperLimitM = parseInt(firstLineParts[1], 10); // This is 'M', the upper limit for counting.

    // --- Step 2: Process the second line of input ---
    // This line contains a sequence of space-separated numbers.
    // Each number needs to be converted to a numeric type and then divided by two.
    const stringValuesFromSecondLine = rawInputLines[1].split(" ");
    const initialNumericValues = stringValuesFromSecondLine.map(strVal => Number(strVal));
    const processedHalfValues = initialNumericValues.map(numVal => numVal / 2);

    // --- Step 3: Calculate the Least Common Multiple (LCM) of the processed values ---
    // This LCM value is central to the problem's counting logic.
    const finalCalculatedLcm = calculateLeastCommonMultiple(processedHalfValues);

    // --- Step 4: Perform the core calculation based on the LCM ---
    // The problem asks for the count of numbers 'x' such that:
    // 1. 'x' is a multiple of `finalCalculatedLcm`.
    // 2. 'x' is less than or equal to `upperLimitM`.
    // 3. 'x' is an ODD multiple of `finalCalculatedLcm`.

    // First, add a guard clause for the calculated LCM. If it's zero,
    // division operations would be problematic. For positive inputs, LCM should be positive.
    if (finalCalculatedLcm === 0) {
        console.error("Error: Calculated LCM is zero. Cannot perform division for final result.");
        return; // Exit the function or throw an error.
    }

    // Calculate the total number of multiples of `finalCalculatedLcm` that are less than or equal to `upperLimitM`.
    // This includes both odd and even multiples. `Math.floor` is used for integer division.
    const countAllMultiples = Math.floor(upperLimitM / finalCalculatedLcm);

    // Calculate the number of multiples of `2 * finalCalculatedLcm` that are less than or equal to `upperLimitM`.
    // These are precisely the EVEN multiples of `finalCalculatedLcm`.
    const countEvenMultiples = Math.floor(upperLimitM / (finalCalculatedLcm * 2));

    // The final result is obtained by subtracting the count of even multiples from the total count of multiples.
    // This leaves only the count of ODD multiples of `finalCalculatedLcm` up to `upperLimitM`.
    const finalResult = countAllMultiples - countEvenMultiples;

    // --- Step 5: Output the final computed result ---
    console.log(finalResult);
}

// --- Entry point for the script execution ---
// This block handles reading input from standard input and initiating the processing.
try {
    // Use the 'node:fs' module to read the entire content of standard input.
    // The content is expected to be a string, decoded as UTF-8.
    const rawFileContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');

    // Trim any leading/trailing whitespace from the raw content and
    // then split the content into an array of strings, where each string is a line.
    const inputLinesArray = rawFileContent.trim().split("\n");

    // Invoke the main data processing function with the prepared array of input lines.
    processInputData(inputLinesArray);
} catch (executionError) {
    // If any error occurs during file reading or the processing steps,
    // catch it here and log a descriptive error message to the console.
    console.error("An unexpected error occurred during script execution:", executionError.message);
    // Optionally, terminate the process with a non-zero exit code to signal an error.
    process.exit(1);
}