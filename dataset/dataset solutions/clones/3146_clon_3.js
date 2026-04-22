/**
 * Performs a custom bitwise XOR-like operation on two potentially large numbers.
 * This function effectively splits numbers into an "upper" and "lower" segment
 * based on a large divisor, XORs these segments independently, and then
 * recombines them. This approach is typically used when standard bitwise XOR
 * (which often operates on 32-bit signed integers in JavaScript) needs to be
 * extended for larger numerical ranges or specific problem constraints.
 *
 * @param {number} firstNum The first integer operand for the custom XOR.
 * @param {number} secondNum The second integer operand for the custom XOR.
 * @returns {number} The result of the custom segmented XOR operation. Returns 0 if inputs are invalid.
 */
function extendedBitwiseXOR(firstNum, secondNum) {
    // --- Input Validation ---
    // Ensure both operands are valid non-negative integers.
    if (typeof firstNum !== 'number' || typeof secondNum !== 'number' ||
        !Number.isInteger(firstNum) || !Number.isInteger(secondNum) ||
        firstNum < 0 || secondNum < 0) {
        // Log a warning and return a default value (0) for invalid inputs.
        // In a production system, this might throw an error or handle differently.
        console.warn("Warning: extendedBitwiseXOR received invalid input. Expecting non-negative integers.");
        return 0;
    }

    // --- Segmentation Constant ---
    // A large constant used to define the boundary between the "lower" and "upper" parts of the numbers.
    const segmentDivisor = 10000000;

    // --- Segment Extraction ---
    // Calculate the upper segment for each number using integer division (Math.floor).
    const firstNumUpperSegment = Math.floor(firstNum / segmentDivisor);
    const secondNumUpperSegment = Math.floor(secondNum / segmentDivisor);

    // Calculate the lower segment for each number using the modulo operator.
    const firstNumLowerSegment = firstNum % segmentDivisor;
    const secondNumLowerSegment = secondNum % segmentDivisor;

    // --- Segment XOR Operations ---
    // Perform standard bitwise XOR on the lower segments.
    const lowerXORComponent = firstNumLowerSegment ^ secondNumLowerSegment;

    // Perform standard bitwise XOR on the upper segments, then scale it back up
    // by multiplying with the segment divisor.
    const upperXORComponent = (firstNumUpperSegment ^ secondNumUpperSegment) * segmentDivisor;

    // --- Result Combination ---
    // The final result is the sum of the XORed components, effectively recombining
    // the segmented XOR results into a single number.
    return lowerXORComponent + upperXORComponent;
}


/**
 * Helper function to determine if a number is even.
 * @param {number} numericalValue The number to check.
 * @returns {boolean} True if the number is even, false otherwise.
 */
const isEven = (numericalValue) => numericalValue % 2 === 0;

/**
 * Helper function to determine if a number is odd.
 * @param {number} numericalValue The number to check.
 * @returns {boolean} True if the number is odd, false otherwise.
 */
const isOdd = (numericalValue) => numericalValue % 2 !== 0;

/**
 * Calculates a specific adjustment factor (0 or 1) used in the XOR sum logic.
 * This factor depends on the total count of numbers in the range and its parity.
 *
 * @param {number} totalCount The total number of elements in the range [A, B].
 * @param {boolean} isTotalCountEven Flag indicating if totalCount is even.
 * @returns {number} The calculated adjustment factor (0 or 1).
 */
function calculateXORAdjustmentFactor(totalCount, isTotalCountEven) {
    if (isTotalCountEven) {
        // Logic specific to ranges with an even number of elements.
        if (totalCount === 2) {
            return 0; // Special pattern for exactly two elements.
        } else if (totalCount > 2) {
            // For even counts greater than two, the pattern follows ((count/2) - 1) % 2.
            return (Math.floor(totalCount / 2) - 1) % 2;
        }
    } else {
        // Logic specific to ranges with an odd number of elements.
        if (totalCount === 1) {
            return 0; // Special pattern for a single element.
        } else if (totalCount > 1) {
            // For odd counts greater than one, the pattern follows ((count-1)/2) % 2.
            return (Math.floor((totalCount - 1) / 2)) % 2;
        }
    }
    // Fallback for unexpected or invalid counts, though inputs are assumed to be positive.
    return 0;
}

/**
 * Processes input data to determine a specific XOR-related aggregate value
 * for a given numerical range [rangeStart, rangeEnd]. The calculation
 * employs a pattern-based optimization depending on the parity of the
 * range's length and its starting value.
 *
 * @param {string} rawInputData A string containing the input, typically in the format "START_VALUE END_VALUE" on the first line.
 */
function processRangeXORCalculation(rawInputData) {
    // --- Input Validation and Parsing ---
    // Initial check for empty or invalid input string.
    if (typeof rawInputData !== 'string' || rawInputData.trim() === '') {
        console.error("Error: Provided input data is empty or not a string.");
        return;
    }

    // Split the input string into individual lines, then parse the first line
    // to extract the numerical range boundaries.
    const inputLines = rawInputData.trim().split('\n');
    const firstLineTokens = inputLines[0].split(' ');

    // Convert the string tokens to integers, specifying base 10 for safety.
    const rangeStart = parseInt(firstLineTokens[0], 10);
    const rangeEnd = parseInt(firstLineTokens[1], 10);

    // Validate the parsed numerical range.
    if (isNaN(rangeStart) || isNaN(rangeEnd) || rangeStart < 0 || rangeEnd < rangeStart) {
        console.error("Error: Invalid numerical range provided. Expected non-negative integers where start <= end.");
        return;
    }

    // Calculate the total number of integers within the specified range, inclusive.
    const totalNumberCount = rangeEnd - rangeStart + 1;

    let finalComputedXORResult; // Variable to hold the ultimate XOR calculation result.

    // --- Core Logic: Branching based on range properties ---

    // Primary decision branch: Is the total number of elements in the range even or odd?
    if (isEven(totalNumberCount)) {
        // Scenario 1: The total number of elements (totalNumberCount) is even.
        if (isEven(rangeStart)) {
            // Sub-scenario 1.1: rangeStart is even.
            // This specific pattern (0 or 1) is derived from XOR sum properties for even ranges starting with an even number.
            const isHalfCountEven = isEven(Math.floor(totalNumberCount / 2));
            finalComputedXORResult = isHalfCountEven ? 0 : 1;
        } else {
            // Sub-scenario 1.2: rangeStart is odd.
            // Calculate an adjustment factor using our helper function.
            const xorAdjustmentFactor = calculateXORAdjustmentFactor(totalNumberCount, true);
            // Apply the custom extended XOR function twice as per the problem's logic.
            finalComputedXORResult = extendedBitwiseXOR(extendedBitwiseXOR(rangeStart, rangeEnd), xorAdjustmentFactor);
        }
    } else {
        // Scenario 2: The total number of elements (totalNumberCount) is odd.
        if (isEven(rangeStart)) {
            // Sub-scenario 2.1: rangeStart is even.
            // Calculate an adjustment factor.
            const xorAdjustmentFactor = calculateXORAdjustmentFactor(totalNumberCount, false);
            // Apply custom extended XOR with the range end and the adjustment factor.
            finalComputedXORResult = extendedBitwiseXOR(rangeEnd, xorAdjustmentFactor);
        } else {
            // Sub-scenario 2.2: rangeStart is odd.
            // Calculate an adjustment factor.
            const xorAdjustmentFactor = calculateXORAdjustmentFactor(totalNumberCount, false);
            // Apply custom extended XOR with the range start and the adjustment factor.
            finalComputedXORResult = extendedBitwiseXOR(rangeStart, xorAdjustmentFactor);
        }
    }

    // --- Output Result ---
    // Display the final calculated XOR result to standard output.
    console.log(finalComputedXORResult);
}

// --- Application Entry Point ---
// This block handles reading input from standard input (/dev/stdin) and
// initiating the main processing function. Includes basic error handling for file operations.
try {
    // Dynamically require the file system module.
    const fileSystemHandler = require('fs');
    // Read the entire content of the standard input as a UTF-8 string.
    const inputContent = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');
    // Invoke the main processing function with the read input.
    processRangeXORCalculation(inputContent);
} catch (fileReadError) {
    // Catch and report any errors that occur during file reading.
    console.error("Error encountered while reading from standard input (/dev/stdin):", fileReadError.message);
    // Depending on requirements, could exit process, provide default input, or re-throw.
    // For this clone, just logging the error is sufficient.
}