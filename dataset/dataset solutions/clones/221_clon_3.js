const fileSystemModule = require("fs");

// Define the standard input file path for reading data.
const standardInputPath = "/dev/stdin";

// Read the entire content of the standard input file.
// The content is decoded using UTF-8 to handle various characters.
const rawInputContent = fileSystemModule.readFileSync(standardInputPath, "utf8");

// Split the raw input content into individual string tokens.
// The split is performed using any whitespace as a delimiter.
// Note: `split(/\s/)` can produce empty strings if there are consecutive delimiters.
const inputTokens = rawInputContent.split(/\s/);

// Initialize an index to keep track of the current token being processed.
let processingIndex = 0;

// Iterate through each token in the `inputTokens` array.
// The loop continues as long as there are tokens available to process.
while (processingIndex < inputTokens.length) {
    // Retrieve the current token string from the array.
    const currentTokenString = inputTokens[processingIndex];
    // Advance the index to the next token for the subsequent iteration.
    processingIndex++;

    // Attempt to convert the current string token into a numeric value.
    // The `Number()` constructor handles various cases:
    // - Numeric strings (e.g., "123", "1.5") become numbers.
    // - An empty string ("") becomes 0.
    // - Non-numeric strings (e.g., "abc") become NaN (Not a Number).
    let currentNumericOperand = Number(currentTokenString);

    // Validate if the converted value is a valid number.
    // If it's NaN, it means the token was not a recognizable number (e.g., "hello").
    // In such cases, we skip this token and move to the next one.
    if (isNaN(currentNumericOperand)) {
        continue; // Proceed to the next token without processing this invalid one.
    }

    // Store the initial numeric value of the token.
    // This value serves as the base for the sum calculation for the current block.
    const startingValueForBlock = currentNumericOperand;

    // Initialize an accumulator for the sum of values within the current processing block.
    // It begins with the initial numeric value of the token.
    let blockAccumulator = startingValueForBlock;

    // Define the total number of transformation steps to be performed.
    const totalTransformationCount = 9;

    // Execute a series of transformations and additions for the current numeric operand.
    // This loop runs `totalTransformationCount` (9) times.
    for (let currentTransformationStep = 0; currentTransformationStep < totalTransformationCount; currentTransformationStep++) {
        // Calculate an 'effective step identifier' which mimics the original loop's
        // counter behavior (from 9 down to 1). This is used for the odd/even check.
        const effectiveStepIdentifier = totalTransformationCount - currentTransformationStep;

        // Apply a conditional transformation based on the effective step identifier:
        // - If the step is odd (9, 7, 5, 3, 1), the operand is doubled.
        // - If the step is even (8, 6, 4, 2), the operand is divided by three.
        if (effectiveStepIdentifier % 2 !== 0) {
            // Double the current numeric operand.
            currentNumericOperand *= 2;
        } else {
            // Guard against division by zero, though dividing 0 by 3 still results in 0.
            // This explicit check is an example of adding robustness/intermediate steps.
            if (currentNumericOperand === 0) {
                // If the operand is already zero, dividing by three won't change it.
                // No operation needed, it remains zero.
            } else {
                // Divide the current numeric operand by three.
                currentNumericOperand /= 3;
            }
        }

        // Add the transformed numeric operand to the running sum for this block.
        blockAccumulator += currentNumericOperand;
    }

    // Output the final accumulated sum for the current input token.
    // The sum is formatted to exactly 8 decimal places for consistent output.
    console.log(blockAccumulator.toFixed(8));
}