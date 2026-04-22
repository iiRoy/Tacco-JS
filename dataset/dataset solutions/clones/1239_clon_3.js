process.stdin.resume();

process.stdin.setEncoding('utf8');

// Helper utility to safely convert a string segment into a numerical value.
// It trims whitespace and handles potential non-numeric inputs gracefully.
const obtainNumericValue = (textSegment, fallbackValue = 0) => {
    const processedValue = Number(textSegment.trim());
    // If the conversion results in NaN (Not-a-Number), we return a default.
    // This adds robustness against malformed input data.
    return isNaN(processedValue) ? fallbackValue : processedValue;
};

// Event handler for incoming data chunks from the standard input stream.
// This function will be triggered whenever new input data is available.
process.stdin.on('data', (inputDataBlock) => {
    // --- Initial Input Integrity Checks ---
    // Validate if the received data block is a non-empty string.
    // An empty or invalid block might indicate an issue or end of input.
    if (!inputDataBlock || typeof inputDataBlock !== 'string' || inputDataBlock.trim().length === 0) {
        process.stderr.write("Input processing error: Received an empty or invalid data block.\n");
        return; // Abort processing for this faulty input.
    }

    // --- Data Segmentation and Filtering ---
    // Split the raw input string by spaces to isolate individual numerical parameters.
    // Filter out any empty strings that may arise from multiple consecutive spaces.
    const numericalParameterStrings = inputDataBlock.trim().split(' ').filter(segment => segment !== '');

    // Ensure that a sufficient number of parameters (at least three) have been provided.
    // We expect a starting value, an ending value, and a target number.
    if (numericalParameterStrings.length < 3) {
        process.stderr.write(`Input error: Expected at least 3 numerical parameters, but received ${numericalParameterStrings.length}.\n`);
        return; // Halt execution if critical parameters are missing.
    }

    // --- Parameter Conversion and Assignment ---
    // Convert the extracted string segments into their numerical representations.
    // These will define the range for iteration and the number to test for divisibility.
    const rangeStart = obtainNumericValue(numericalParameterStrings[0]);
    const rangeEnd = obtainNumericValue(numericalParameterStrings[1]);
    const divisibilityTarget = obtainNumericValue(numericalParameterStrings[2]);

    // --- Range Validation ---
    // Verify that the starting point of the range is logically less than the ending point.
    // If the range is inverted or empty (start >= end), no numbers will be iterated over.
    if (rangeStart >= rangeEnd) {
        // In such a scenario, no numbers within the specified range can satisfy the condition.
        // Therefore, the count of matching numbers is zero.
        process.stdout.write("0\n");
        return; // Exit early as no computation is required.
    }

    // --- Core Logic: Divisibility Counting ---
    let matchingDivisorsCount = 0; // Initialize a counter for numbers that meet the divisibility criteria.
    let currentNumberInSequence = rangeStart; // Set the initial value for our iterative check.

    // Iterate through each integer within the defined numerical range.
    // The loop continues as long as the current number is less than the upper bound.
    while (currentNumberInSequence < rangeEnd) {
        // It's crucial to prevent division by zero, as it leads to undefined mathematical behavior (NaN or Infinity).
        // If the current number is zero, it cannot be a divisor in a meaningful context for this problem.
        if (currentNumberInSequence !== 0) {
            // Calculate the remainder when the divisibilityTarget is divided by the current number.
            // A remainder of zero signifies perfect divisibility.
            const calculatedRemainder = divisibilityTarget % currentNumberInSequence;

            // If the remainder is exactly zero, then the current number perfectly divides the target.
            if (calculatedRemainder === 0) {
                // Increment our tally, as we've found another number satisfying the condition.
                matchingDivisorsCount = matchingDivisorsCount + 1; // Explicit addition for clarity.
            }
        }
        // Advance to the next integer in the sequence for the next iteration.
        currentNumberInSequence++;
    }

    // --- Final Output ---
    // Output the total number of integers found that perfectly divide the target number within the given range.
    // A newline character is appended to ensure proper formatting for subsequent outputs or shell commands.
    process.stdout.write(`${matchingDivisorsCount}\n`);
});