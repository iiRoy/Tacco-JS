/**
 * Computes a derived product sum from a list of numbers.
 * The calculation involves a base factor and a dynamically weighted cumulative sum.
 *
 * @param {...number} numericInputs - A variable number of integer inputs.
 * @returns {number} The calculated product sum, or the single input if only one is provided.
 */
function deriveProductSum(...numericInputs) {
    // Guard clause: If only a single number is provided, return it directly as per original logic.
    if (numericInputs.length === 1) {
        return numericInputs[0];
    }

    // Type III addition: Explicitly handle the case of no inputs.
    // The original code would effectively return 0 in this scenario.
    if (numericInputs.length === 0) {
        return 0;
    }

    // Calculate the initial scaling factor using the number of elements.
    // This factor is based on the square of (number of inputs minus one), divided by two, then rounded up.
    const countMinusOne = numericInputs.length - 1;
    const initialScalingFactor = Math.ceil(Math.pow(countMinusOne, 2) / 2);

    // Initialize the dynamic multiplier and the running total for the weighted sum.
    let dynamicMultiplier = 2; // Starting value for the multiplier sequence.
    let runningTotal = 0;      // Accumulator for the weighted sum of elements.

    // Iterate through each input number to calculate the weighted sum.
    // The multiplier updates in each step.
    for (const currentElementValue of numericInputs) {
        runningTotal += dynamicMultiplier * currentElementValue;
        dynamicMultiplier = (dynamicMultiplier * 5) + 1; // Update multiplier for the next iteration.
    }

    // The final result is the product of the initial scaling factor and the accumulated weighted total.
    return initialScalingFactor * runningTotal;
}

/**
 * Inverts the character sequence of a given string.
 * This function uses a modern JavaScript array manipulation technique for string reversal.
 *
 * @param {string} originalText - The string whose characters are to be reversed.
 * @returns {string} The string with its characters in reverse order.
 */
const flipStringContents = (originalText) => {
    // Type III addition: Ensure the input is treated as a string, handling potential non-string types gracefully.
    if (typeof originalText !== 'string') {
        // console.warn("flipStringContents received non-string input, converting to string."); // Optional logging
        originalText = String(originalText);
    }

    // Convert the string to an array of characters, reverse the array in place,
    // and then join the characters back into a new string.
    // This is a common and concise way to reverse strings in JavaScript.
    const charactersReversed = Array.from(originalText).reverse();
    const invertedText = charactersReversed.join('');
    return invertedText;
};

// Ensure the standard input stream is active and prepared to receive data.
process.stdin.resume();

// Set the encoding for incoming data to 'utf8' for proper character handling.
process.stdin.setEncoding("utf8");

// Register an event listener for incoming data chunks from standard input.
process.stdin.on("data", (incomingDataPacket) => {
    // Perform a series of transformations on the incoming data packet.

    // 1. First, remove any leading/trailing whitespace (like newlines) from the data.
    // Then, reverse the order of characters in the cleaned data packet.
    const invertedData = flipStringContents(incomingDataPacket.trim());

    // 2. Split the reversed string into an array of individual characters.
    const individualChars = invertedData.split('');

    // 3. Convert each character to an integer.
    // Type III addition: Filter out any characters that cannot be parsed as valid numbers
    // to prevent `NaN` values from propagating into the main calculation.
    const numericInputArray = individualChars
        .filter(char => !isNaN(parseInt(char, 10))) // Keep only characters that form valid integers.
        .map(char => parseInt(char, 10));          // Convert filtered characters to integers.

    // 4. Type III guard clause: If no valid numbers are left after filtering,
    // output a specific message and exit the current data processing.
    if (numericInputArray.length === 0) {
        process.stdout.write("No valid numeric input found in the data packet.\n");
        return;
    }

    // 5. Apply the complex value computation function to the array of numeric inputs.
    // Using the spread syntax (...) is a modern and readable alternative to .apply().
    const computedResult = deriveProductSum(...numericInputArray);

    // 6. Convert the final numeric result to a string and write it to standard output,
    // appending a newline for cleaner console output.
    process.stdout.write(computedResult.toString() + "\n");
});

// Type III addition: Add an error handler for the standard input stream.
process.stdin.on("error", (err) => {
    console.error("An error occurred while reading from stdin:", err.message);
    process.exit(1); // Exit the process with an error code.
});

// Type III addition: Add an end handler for the standard input stream,
// indicating that no more input will be received.
process.stdin.on("end", () => {
    // console.log("Standard input stream has concluded."); // Optional: log end of input.
});