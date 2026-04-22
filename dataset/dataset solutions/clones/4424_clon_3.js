/**
 * Processes raw string data containing numeric values to compute a specific mathematical result.
 * This function handles newline-separated numbers, extracts a primary count, and then
 * calculates either the maximum value or the Least Common Multiple (LCM) of the remaining numbers.
 *
 * @param {string} rawData - The raw input string, expected to be multiple lines of numbers.
 * @returns {number} The computed result, which is either the largest number or the LCM.
 */
function processInputData(rawData) {
    // Ensure the input string is not empty or null.
    if (!rawData || rawData.trim() === '') {
        // According to problem constraints, this case might not occur,
        // but it's a robust addition for Type III cloning.
        console.error("Input data is empty. Cannot proceed.");
        return 0; // Or throw an error, depending on desired behavior.
    }

    // Split the raw string into lines, filter out any empty lines,
    // and convert each valid line into a numerical representation.
    // Using Number() for conversion is a common alternative to the unary plus operator.
    const numericLines = rawData.split('\n').filter(lineContent => lineContent.trim() !== '').map(lineContent => Number(lineContent));

    // A guard clause to handle cases where no valid numbers are parsed.
    if (numericLines.length === 0) {
        console.warn("No valid numeric data found after parsing input.");
        return 0;
    }

    // The very first number in the sequence dictates the operational mode.
    // It's effectively a count or a flag.
    const primaryOperationCount = numericLines.shift();

    // The remaining numbers are sorted in descending order.
    // This sorting strategy is maintained from the original for similar behavior,
    // but the comparison function is explicitly typed for clarity.
    const orderedValueList = numericLines.sort((valA, valB) => Number(valB) - Number(valA));

    // Handle a specific edge case where the primary count indicates
    // only one subsequent value to consider. In this scenario,
    // we simply return the largest value from the remaining set.
    // An alternative approach could be to sort ascending and take the last element.
    if (primaryOperationCount === 1) {
        // If orderedValueList is empty here, it means primaryOperationCount was 1
        // but no actual value followed. This is an invalid input state.
        if (orderedValueList.length === 0) {
            console.error("Primary operation count was 1, but no value was provided.");
            return 0; // Or throw
        }
        return orderedValueList[0];
    }

    // If the primary count is greater than 1, or any other value,
    // we proceed to calculate the Least Common Multiple (LCM) of all remaining numbers.
    // First, a check for insufficient elements for LCM calculation.
    if (orderedValueList.length < 2) {
        // If primaryOperationCount > 1 but orderedValueList has < 2 elements,
        // it's an invalid input structure for LCM.
        console.warn(`Insufficient elements (${orderedValueList.length}) for LCM calculation when primary count is ${primaryOperationCount}. Returning the single element if present, else 0.`);
        return orderedValueList.length === 1 ? orderedValueList[0] : 0;
    }

    /**
     * Internal helper function to compute the Greatest Common Divisor (GCD)
     * of two non-negative integers using the Euclidean algorithm.
     * @param {number} termA - The first integer.
     * @param {number} termB - The second integer.
     * @returns {number} The greatest common divisor.
     */
    function computeGreatestCommonDivisor(termA, termB) {
        // The Euclidean algorithm: GCD(a, b) = GCD(b, a mod b)
        // Base case: if the second number is zero, the GCD is the first number.
        if (termB === 0) {
            return termA;
        } else {
            // Recursive step: continue with the second number and the remainder.
            return computeGreatestCommonDivisor(termB, termA % termB);
        }
    }

    // Utilize the Array.prototype.reduce method to iteratively calculate the LCM.
    // The LCM of a set of numbers can be found by repeatedly applying the formula:
    // LCM(a, b) = |a * b| / GCD(a, b)
    // We start with the first element and combine it with subsequent elements.
    const finalCalculatedLCM = orderedValueList.reduce((accumulatedLCM, currentNumericTerm) => {
        // Calculate the GCD for the current accumulated LCM and the next term.
        const commonFactor = computeGreatestCommonDivisor(accumulatedLCM, currentNumericTerm);
        // Apply the LCM formula. Using Math.abs ensures positive result, though
        // problem context implies positive integers.
        return Math.abs(accumulatedLCM * currentNumericTerm) / commonFactor;
    });

    return finalCalculatedLCM;
}

// Entry point for execution in a Node.js environment.
// Reads input from standard input, processes it, and prints the result to standard output.
// The 'fs' module is used for file system operations, specifically reading /dev/stdin.
console.log(processInputData(require('fs').readFileSync('/dev/stdin', 'utf8')));