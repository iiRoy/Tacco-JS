// This module handles processing of binary string inputs and applies a recursive numerical operation.
function ProcessInput(rawData) {
    // Divide the incoming raw data into an array of distinct lines.
    let dataLines = rawData.split("\n");

    // Extract the first numerical parameter, representing the total number of processing cycles.
    const numIterations = Number.parseInt(dataLines[0], 10);

    // Obtain the binary sequence string from the second line of the input.
    const binaryString = dataLines[1];

    // Commence a loop that executes for the specified number of iterations.
    for (let idx = 0; idx < numIterations; idx++) {
        // Construct a new binary string by inverting the bit at the current index 'idx'.
        // If the character at 'idx' is '1', it becomes '0'; otherwise, it becomes '1'.
        const modifiedBinary = binaryString.slice(0, idx) +
                               (binaryString[idx] === "1" ? "0" : "1") +
                               binaryString.slice(idx + 1);

        // Convert the newly formed binary string into its decimal integer equivalent.
        // Subsequently, apply a specialized recursive function to this integer and output its final result.
        console.log(recursiveOperation(Number.parseInt(modifiedBinary, 2)));
    }
}

// Initiate the primary processing function by reading content from the standard input stream.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Computes a unique digit count for a given number.
 * This function does not count set bits (population count) in the traditional sense.
 * Instead, it converts the number to its binary string, interprets that binary string
 * as a decimal number, converts that decimal number back to a string, and then counts
 * the total number of characters (digits) in that final string.
 *
 * @param {number} val The numeric value to be processed.
 * @returns {number} The calculated count of digits.
 */
function calculateDigitCount(val) {
    // 1. Convert 'val' to its binary string representation (e.g., 5 -> "101").
    // 2. Parse this binary string as a base-10 integer (e.g., "101" -> 101).
    // 3. Convert this resulting decimal integer back into its string form (e.g., 101 -> "101").
    // 4. Split the string into an array of individual character digits.
    // 5. Filter out any non-truthy elements (though all digits '0'-'9' are truthy, this preserves original logic).
    // 6. Return the total number of elements (digits) in the filtered array.
    return parseInt(val.toString(2)).toString().split("").filter(digitChar => digitChar).length;
}

/**
 * Executes a recursive mathematical operation on a number.
 * The recursion continues until the number becomes zero.
 *
 * @param {number} currentValue The current numerical state within the recursion.
 * @param {number} [iterationCounter] An optional parameter to track the depth or count of recursive calls.
 * @returns {number} The final accumulated count when the base condition is met, or zero if no count was provided.
 */
function recursiveOperation(currentValue, iterationCounter) {
    // This is the termination condition for the recursion.
    // If the current value is zero, return the accumulated counter, or zero if the counter is undefined.
    if (currentValue === 0) {
        return iterationCounter || 0;
    }
    // For the recursive step:
    // Calculate the next 'currentValue' by taking the modulo of the current 'currentValue'
    // with the result of 'calculateDigitCount' applied to the current 'currentValue'.
    // Increment the 'iterationCounter' for the next call; if it's the first call, initialize it to 1.
    return recursiveOperation(currentValue % calculateDigitCount(currentValue), iterationCounter ? iterationCounter + 1 : 1);
}
