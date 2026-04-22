const inputProcessor = require('readline'); // Module for handling standard input/output streams line by line.

let inputBuffer = []; // A dynamic array to accumulate all lines read from standard input.

// Initialize an interface for reading input from the console.
const streamHandler = inputProcessor.createInterface({
    input: process.stdin,    // Specifies standard input as the source.
    output: process.stdout,  // Specifies standard output (not used for writing in this script, but part of setup).
});

/**
 * Core utility function to determine the minimum of maximum span values for a given binary string.
 * This calculation is specific: it finds '1' characters that are either the last character
 * in the string or are immediately followed by a '0'. For each such '1', it calculates
 * the maximum of its distance from the string's start (1-indexed) and its distance
 * from the string's end. The function then returns the minimum of these maximum spans.
 *
 * @param {string} targetBitString - The binary string ('0's and '1's) to be analyzed.
 * @returns {number} The smallest maximum span found among qualifying '1's, or Number.POSITIVE_INFINITY
 *                   if no '1's meet the specified criteria.
 */
const calculateMinimumMaxSpan = (targetBitString) => {
    let currentBestSpan = Number.POSITIVE_INFINITY; // Start with the largest possible value for finding a minimum.
    const stringLength = targetBitString.length;    // Cache string length for performance.

    // Iterate over each character in the provided binary string.
    for (let charIndex = 0; charIndex < stringLength; ++charIndex) {
        const currentBit = targetBitString[charIndex]; // Get the character at the current position.

        // Only process if the current character is a '1'.
        if (currentBit === '1') {
            // Calculate the 1-indexed distance from the beginning of the string.
            const distanceToLeft = charIndex + 1;
            // Calculate the 1-indexed distance from the end of the string.
            const distanceToRight = stringLength - charIndex;

            // Determine the greater of these two distances for the current '1'.
            const localMaxSpan = Math.max(distanceToLeft, distanceToRight);

            // Check if the current '1' is the last character of the string,
            // OR if it's followed by a '0' (indicating the end of a '1' block).
            const isEndOfOneBlockOrString = (charIndex === stringLength - 1) || (targetBitString[charIndex + 1] === '0');

            if (isEndOfOneBlockOrString) {
                // If the condition is met, update the overall minimum span found so far.
                currentBestSpan = Math.min(currentBestSpan, localMaxSpan);
            }
        }
    }
    return currentBestSpan; // Return the ultimate minimum of all qualifying maximum spans.
};

// Event handler for when a new line of input is received.
streamHandler.on('line', (receivedSegment) => {
    inputBuffer.push(receivedSegment); // Add the received line to our buffer.
});

// Event handler for when the input stream has ended. This is where the primary computation occurs.
streamHandler.on('close', () => {
    // --- Input Validation and Guard Clauses ---
    if (inputBuffer.length === 0) {
        // If no input was provided, output 0 and terminate.
        console.log(0);
        return;
    }

    const primaryBinaryString = inputBuffer[0]; // Assume the first line is the required binary string.

    if (!primaryBinaryString || primaryBinaryString.length === 0) {
        // If the first line is empty or null, output 0 and terminate.
        console.log(0);
        return;
    }

    // --- String Transformation ---
    // Create a complementary binary string by inverting each bit ('0' becomes '1', '1' becomes '0').
    // This is achieved by converting the string to an array of characters, mapping each character,
    // and then joining them back into a new string.
    const complementaryBitsArray = [...primaryBinaryString].map(bitChar => {
        return (bitChar === "0" ? "1" : "0"); // Ternary operator for concise inversion.
    });
    const complementaryBinaryString = complementaryBitsArray.join('');

    // --- Calculation using Helper Function ---
    // Calculate the minimum of maximum spans for the original input string.
    const minMaxDistanceOriginal = calculateMinimumMaxSpan(primaryBinaryString);

    // Calculate the minimum of maximum spans for the newly generated complementary string.
    const minMaxDistanceComplement = calculateMinimumMaxSpan(complementaryBinaryString);

    // --- Final Result Aggregation ---
    // The final step involves taking the maximum of the two calculated minimums.
    // This value could be Number.POSITIVE_INFINITY if no valid '1's were found in either string
    // according to the specific criteria (e.g., an input string like "000").
    const overallMaxOfMinDistances = Math.max(minMaxDistanceOriginal, minMaxDistanceComplement);

    // Output the final result, adjusted by subtracting one as per the problem's requirement.
    console.log(overallMaxOfMinDistances - 1);
});