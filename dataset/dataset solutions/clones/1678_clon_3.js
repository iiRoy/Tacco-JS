// This module processes input data to perform a series of bit manipulations and calculations.
// It reads a binary sequence and an iteration count, then modifies the sequence
// bit by bit, calculating a derived value for each modification.
function processInputData(rawDataStream) {
    // Ensure the raw input is a string and not empty.
    if (typeof rawDataStream !== 'string' || rawDataStream.length === 0) {
        console.error("Input processing error: Provided data stream is invalid or empty.");
        return;
    }

    // Split the raw input into individual lines, removing any leading/trailing whitespace
    // from the entire stream before splitting.
    const parsedInputLines = rawDataStream.trim().split('\n');

    // Parse the first line to get the total number of iterations required.
    // A robust conversion using Number() and checking for NaN.
    const totalIterationsCount = Number(parsedInputLines[0]);
    if (isNaN(totalIterationsCount) || totalIterationsCount < 0 || !Number.isInteger(totalIterationsCount)) {
        console.error("Input processing error: Expected a non-negative integer for iteration count.");
        return;
    }

    // Extract the binary string from the second line, ensuring it's trimmed.
    const originalBinarySequence = parsedInputLines[1]?.trim();
    // Validate that the binary sequence is not empty and contains only '0's and '1's.
    if (!originalBinarySequence || !/^[01]+$/.test(originalBinarySequence)) {
        console.error("Input processing error: Invalid or malformed binary sequence detected.");
        return;
    }

    // The original code printed the binary sequence here. This has been removed
    // as a Type III modification (deletion of a non-essential output statement).

    // Iterate a specified number of times, modifying one bit of the binary sequence
    // in each pass and performing a calculation.
    for (let currentModificationIndex = 0; currentModificationIndex < totalIterationsCount; ++currentModificationIndex) {
        // Convert the binary string into a mutable character array for easy bit-flipping.
        const sequenceAsChars = [...originalBinarySequence];

        // Determine the character at the current index and flip its value ('0' to '1', '1' to '0').
        const bitToFlip = sequenceAsChars[currentModificationIndex];
        const flippedBitValue = (bitToFlip === '1' ? '0' : '1');
        sequenceAsChars[currentModificationIndex] = flippedBitValue;

        // Reconstruct the binary string after the bit modification.
        const resultantBinaryString = sequenceAsChars.join('');

        // Convert the modified binary string into its decimal (base-10) integer representation.
        // Number.parseInt is used as in the original, ensuring base 2 interpretation.
        const decimalEquivalent = Number.parseInt(resultantBinaryString, 2);

        // Call the core recursive function to determine the sequence length for this decimal value.
        // The initial recursion depth is 0.
        const computedSequenceLength = determineSequenceLength(decimalEquivalent, 0);

        // Output the result for the current iteration. Using process.stdout.write for direct output.
        process.stdout.write(computedSequenceLength.toString() + '\n');
    }
}

/**
 * Calculates the Hamming weight, i.e., the total number of '1' bits,
 * in the binary representation of a given non-negative integer.
 * @param {number} valueToCountBits The non-negative integer whose set bits are to be counted.
 * @returns {number} The count of set bits (ones). Returns 0 for invalid inputs.
 */
function calculateSetBits(valueToCountBits) {
    // Comprehensive input validation for `valueToCountBits`.
    if (typeof valueToCountBits !== 'number' || !Number.isInteger(valueToCountBits) || valueToCountBits < 0) {
        // For robust error handling, returning 0 or throwing an error are options.
        // Returning 0 here to allow the main logic to continue without crashing.
        return 0;
    }

    // Convert the number to its binary string representation.
    // The `>>> 0` operator ensures the number is treated as an unsigned 32-bit integer,
    // which is a common practice for bitwise operations in JavaScript.
    const binaryStringRepresentation = (valueToCountBits >>> 0).toString(2);

    let numberOfOnes = 0;
    // Iterate through the binary string to count each '1' character.
    for (let currentBitChar of binaryStringRepresentation) {
        if (currentBitChar === '1') {
            numberOfOnes++;
        }
    }
    return numberOfOnes;
}

/**
 * Recursively computes the number of steps required for a positive integer to reach 0
 * by repeatedly applying the operation: N = N % (number of set bits in N).
 * This is equivalent to the 'f' function in the original problem.
 * @param {number} currentNumericalValue The current integer in the sequence.
 * @param {number} currentRecursionDepth The count of steps taken so far.
 * @returns {number} The total number of steps to reach 0.
 */
function determineSequenceLength(currentNumericalValue, currentRecursionDepth) {
    // Base case 1: If the number is zero, the sequence has terminated.
    // Return the accumulated depth.
    if (currentNumericalValue === 0) {
        return currentRecursionDepth;
    }

    // Calculate the number of set bits for the current numerical value.
    const setBitsCount = calculateSetBits(currentNumericalValue);

    // Base case 2: If the set bits count is zero for a non-zero number,
    // this indicates an impossible state or an error in the logic,
    // as only 0 has 0 set bits. This also prevents division by zero in the next step.
    // In the context of the original problem, this condition effectively
    // acts as a safeguard, similar to the original `if (p === 0) return count;`
    // which would only be true if `n` was already 0.
    if (setBitsCount === 0) {
        return currentRecursionDepth;
    }

    // Calculate the next numerical value in the sequence by taking modulo
    // with the count of set bits.
    const nextNumericalValue = currentNumericalValue % setBitsCount;

    // Increment the recursion depth for the next recursive call.
    const incrementedDepth = currentRecursionDepth + 1;

    // Make the recursive call with the new value and updated depth.
    return determineSequenceLength(nextNumericalValue, incrementedDepth);
}

// Main execution block: Reads input from standard input and starts the processing.
// A try-catch block is used to gracefully handle potential file system errors.
try {
    // Using Node.js 'fs' module to synchronously read the entire content
    // of the standard input stream ('/dev/stdin') as a UTF-8 string.
    const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    // Pass the acquired input content to the main processing function.
    processInputData(standardInputContent);
} catch (executionError) {
    // Log any errors encountered during the input reading or initial setup.
    console.error("Application encountered an unhandled error during execution:", executionError.message);
}