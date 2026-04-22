const diskIOHandler = require("fs");

const systemInputSource = "/dev/stdin"; // Standard input stream location
const characterEncoding = "utf8";       // Encoding for text processing

// Step 1: Read all raw data from the designated input source.
// This operation is synchronous to simplify the example.
const rawDataString = diskIOHandler.readFileSync(systemInputSource, characterEncoding);

// Step 2: Process the raw string data.
// Split the string by one or more whitespace characters.
// Then, filter out any empty strings that might result from consecutive delimiters.
const parsedInputTokens = rawDataString.split(/\s+/).filter(Boolean);

// Initialize an index to keep track of the current token being processed.
let currentTokenIndex = 0;

// Step 3: Iterate through each token obtained from the input.
// The loop continues as long as there are tokens left to be processed.
while (currentTokenIndex < parsedInputTokens.length) {
    // Attempt to convert the current token string into an integer.
    // Explicitly specify base 10 for reliable parsing.
    const numericValue = parseInt(parsedInputTokens[currentTokenIndex], 10);

    // Advance the index to the next token for the subsequent iteration.
    currentTokenIndex++;

    // Validation: If the parsed value is not a valid number (e.g., empty string, non-numeric text),
    // skip this token and proceed to the next one. This prevents errors.
    if (isNaN(numericValue)) {
        continue;
    }

    // Initialize an empty string buffer to accumulate the binary components (powers of two).
    let binaryComponentsAccumulator = '';

    // Step 4: Analyze the binary representation of the numeric value.
    // Iterate from bit position 0 up to 9 (inclusive), covering values up to 2^10 - 1.
    // This loop identifies which powers of two contribute to the numericValue.
    for (let bitPosition = 0; bitPosition < 10; bitPosition++) {
        // Calculate the power of two corresponding to the current bit position.
        // (e.g., 2^0=1, 2^1=2, 2^2=4, etc.)
        const powerOfTwoTerm = 1 << bitPosition;

        // Perform a bitwise AND operation. If the result is non-zero,
        // it means the 'bitPosition'-th bit is set in 'numericValue'.
        if ((numericValue & powerOfTwoTerm) !== 0) {
            // If the bit is set, append the power of two term to our accumulator,
            // followed by a space for clear separation.
            binaryComponentsAccumulator += powerOfTwoTerm + ' ';
        }
    }

    // Step 5: Output the result for the current numeric value.
    // Print the accumulated binary components. The .trim() method removes
    // any trailing space that might have been added by the loop.
    // A newline character is implicitly added by console.log, ensuring each output
    // corresponds to a single input number.
    console.log(binaryComponentsAccumulator.trim());
}