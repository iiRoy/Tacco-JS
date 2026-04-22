const MAXIMUM_DIGIT_CAPACITY = 80; // Defines the upper limit for the number of digits an input number can have.

/**
 * Computes the sum of two arbitrarily large numbers represented as strings.
 * This function performs digit-by-digit addition, handling carries, and
 * manages potential overflows based on a predefined digit capacity.
 *
 * @param {string} operandAString - The first number as a string.
 * @param {string} operandBString - The second number as a string.
 * @returns {string} The sum of the two numbers as a string, or an error/overflow message.
 */
function calculateLargeNumberSum(operandAString, operandBString) {

    // --- Stage 1: Initial Input Validation and Preparation ---

    // Ensure both inputs are indeed strings. If not, return an error.
    if (typeof operandAString !== 'string' || typeof operandBString !== 'string') {
        return "INPUT_ERROR: Both operands must be provided as string data types.";
    }

    // Remove any leading or trailing whitespace from the input strings.
    const sanitizedOperandA = operandAString.trim();
    const sanitizedOperandB = operandBString.trim();

    // Validate that the sanitized strings contain only digits.
    // This guards against non-numeric characters that would break `Number()` conversion.
    const digitPattern = /^\d+$/;
    if (!digitPattern.test(sanitizedOperandA) || !digitPattern.test(sanitizedOperandB)) {
        return "INPUT_ERROR: Operands must contain only numerical digits.";
    }

    // Determine which number string is longer to simplify subsequent iteration logic.
    let longerNumberSequence, shorterNumberSequence;
    if (sanitizedOperandA.length >= sanitizedOperandB.length) {
        longerNumberSequence = sanitizedOperandA;
        shorterNumberSequence = sanitizedOperandB;
    } else {
        longerNumberSequence = sanitizedOperandB;
        shorterNumberSequence = sanitizedOperandA;
    }

    const longerSequenceLength = longerNumberSequence.length;
    const shorterSequenceLength = shorterNumberSequence.length;

    // Implement a preliminary overflow check based on input length.
    // If an input number itself exceeds the maximum allowed digits, it's an overflow.
    if (longerSequenceLength > MAXIMUM_DIGIT_CAPACITY) {
        return "OVERFLOW_ERROR: An input number exceeds the maximum allowed digit count.";
    }

    // Convert digit strings into arrays of actual numbers for easier arithmetic.
    // This is a structural change from repeatedly parsing characters in the loop.
    const digitsOfLonger = Array.from(longerNumberSequence, Number);
    const digitsOfShorter = Array.from(shorterNumberSequence, Number);

    // --- Stage 2: Core Addition Logic ---

    // Initialize the result buffer. Its maximum possible size is `longerSequenceLength + 1`
    // to accommodate a potential final carry digit.
    const sumResultBuffer = new Array(longerSequenceLength + 1).fill(0);

    let currentCarryValue = 0; // The carry-over from the previous digit addition.
    let longerDigitIndex = longerSequenceLength - 1; // Start from the rightmost digit of the longer number.
    let shorterDigitIndex = shorterSequenceLength - 1; // Start from the rightmost digit of the shorter number.
    let resultBufferPosition = longerSequenceLength; // Start filling the result buffer from its rightmost end.

    // Iterate and add digits for the common length segment of both numbers.
    // This loop continues as long as there are digits in the shorter number to process.
    while (shorterDigitIndex >= 0) {
        const digitFromLonger = digitsOfLonger[longerDigitIndex];
        const digitFromShorter = digitsOfShorter[shorterDigitIndex];

        let temporarySum = digitFromLonger + digitFromShorter + currentCarryValue;

        sumResultBuffer[resultBufferPosition] = temporarySum % 10; // Store the unit digit of the sum.
        currentCarryValue = Math.floor(temporarySum / 10); // Calculate the new carry for the next iteration.

        // Move to the next digit position (leftwards) for all involved sequences.
        longerDigitIndex--;
        shorterDigitIndex--;
        resultBufferPosition--;
    }

    // After exhausting the shorter number, process any remaining digits in the longer number.
    // This loop incorporates any remaining carry from the previous additions.
    while (longerDigitIndex >= 0) {
        const digitFromLonger = digitsOfLonger[longerDigitIndex];

        let temporarySum = digitFromLonger + currentCarryValue;

        sumResultBuffer[resultBufferPosition] = temporarySum % 10;
        currentCarryValue = Math.floor(temporarySum / 10);

        // Move to the next digit position (leftwards).
        longerDigitIndex--;
        resultBufferPosition--;
    }

    // Place any final carry into the very first position of the result buffer.
    sumResultBuffer[0] = currentCarryValue;

    // --- Stage 3: Formatting and Final Validation ---

    // Convert the array of digits back into a single string.
    let finalResultString = sumResultBuffer.join('');

    // Remove any leading zero if the sum does not start with a carry and is not a single digit '0'.
    // E.g., '0123' should become '123'. '0' should remain '0'.
    if (finalResultString.startsWith('0') && finalResultString.length > 1) {
        finalResultString = finalResultString.substring(1);
    }

    // Perform a final overflow check on the computed result's length.
    // An 80-digit number + another 80-digit number could result in an 81-digit number.
    // If the problem defines 80 digits as the maximum *output* length as well, this check is crucial.
    if (finalResultString.length > MAXIMUM_DIGIT_CAPACITY) {
        return "OVERFLOW_ERROR: The computed sum exceeds the maximum allowed digit count.";
    }

    return finalResultString; // Return the final computed sum.
}

// --- Standard Input Processing Block ---

// Ensure the Node.js standard input stream remains active.
process.stdin.resume();
// Set the character encoding for incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Register an event listener to handle data received from standard input.
process.stdin.on('data', function(incomingDataBuffer) {
    // Clean and split the raw input buffer into an array of individual lines.
    const arrayOfInputLines = incomingDataBuffer.trim().split('\n');

    let currentProcessingLineIdx = 0; // Index to track which line we are currently processing.

    // Guard clause: If no input lines are received, log an error and exit.
    if (arrayOfInputLines.length === 0) {
        console.error("ERROR: No input data was provided.");
        return;
    }

    // Attempt to parse the total number of test cases from the very first line.
    // Include validation for the test case count itself.
    const testCasesCountRaw = arrayOfInputLines[currentProcessingLineIdx++].trim();
    if (!/^\d+$/.test(testCasesCountRaw)) {
        console.error("PARSING_ERROR: The first line must be a positive integer indicating the number of test cases.");
        return;
    }
    let remainingTestCases = parseInt(testCasesCountRaw, 10);

    // Loop through each test case until all are processed or an error occurs.
    while (remainingTestCases > 0) {
        // Essential check: Ensure there are enough lines remaining for the current test case.
        // Each test case requires two lines (two numbers).
        if (currentProcessingLineIdx + 1 >= arrayOfInputLines.length) {
            console.error(`DATA_ERROR: Insufficient input lines for test case ${remainingTestCases} (expected 2 operands).`);
            break; // Exit the loop if input is incomplete.
        }

        // Extract the two operands for the current addition operation.
        const firstOperand = arrayOfInputLines[currentProcessingLineIdx];
        const secondOperand = arrayOfInputLines[currentProcessingLineIdx + 1];

        let computationResult;
        try {
            // Invoke the main calculation function with the extracted operands.
            computationResult = calculateLargeNumberSum(firstOperand, secondOperand);
        } catch (executionError) {
            // Catch any unexpected runtime errors from the calculation logic.
            computationResult = `RUNTIME_ERROR: An unexpected error occurred during sum computation: ${executionError.message}`;
        }

        // Output the result of the current computation to standard output.
        console.log(computationResult);

        // Advance the line index to skip the two operands just processed.
        currentProcessingLineIdx += 2;
        // Decrement the counter for remaining test cases.
        remainingTestCases--;
    }
});