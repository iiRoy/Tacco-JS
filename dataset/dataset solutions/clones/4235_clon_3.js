const acquireSystemInput = () => {
    try {
        return require('fs').readFileSync('/dev/stdin', 'utf8');
    } catch (dataReadError) {
        console.error("Error encountered during system input acquisition:", dataReadError.message);
        return "";
    }
};

const evaluateNumericLogic = (receivedContent) => {

    // Process the input string to isolate the primary data line.
    // This handles various line ending styles and guards against empty input.
    const contentLines = receivedContent.split(/\r?\n/);
    const primaryDataLine = contentLines[0] || '';

    // Extract numerical string tokens from the primary data line.
    // Handles multiple spaces between numbers and filters out any empty strings resulting from the split.
    const rawNumberTokens = primaryDataLine.split(/\s+/).filter(Boolean);

    // Implement a preliminary validation for the number of expected arguments.
    // If not enough tokens are found, we default to an output of zero,
    // mirroring the 'else' branch of the core logic.
    const EXPECTED_ARGUMENT_COUNT = 3;
    if (rawNumberTokens.length < EXPECTED_ARGUMENT_COUNT) {
        console.log(0);
        return;
    }

    // Parse the string tokens into numerical values.
    // Using Number() for conversion, which is an alternative to parseInt().
    const firstOperand = Number(rawNumberTokens[0]); // Corresponds to 'x'
    const secondOperand = Number(rawNumberTokens[1]); // Corresponds to 'y'
    const thirdOperand = Number(rawNumberTokens[2]); // Corresponds to 'z'

    // Perform validation to ensure all parsed values are valid numbers.
    // If any conversion results in NaN, output zero and terminate.
    if (isNaN(firstOperand) || isNaN(secondOperand) || isNaN(thirdOperand)) {
        console.log(0);
        return;
    }

    // Introduce an intermediate variable for the expression 'y + z * 2'.
    // This simplifies the main conditional check and the subsequent calculation.
    const comparisonThreshold = secondOperand + (thirdOperand * 2);

    // Introduce another intermediate variable for the expression 'y + z'.
    // This value is used in the denominator of the main calculation.
    const sumOfOperandsTwoAndThree = secondOperand + thirdOperand;

    // Evaluate the primary conditional expression.
    // The original condition 'y + z * 2 < x' is rephrased as 'x > (y + z * 2)'.
    if (firstOperand > comparisonThreshold) {

        // Calculate the numerator part of the fraction: 'x - (y + z * 2)'.
        const numeratorDifference = firstOperand - comparisonThreshold;

        // Implement a guard against division by zero.
        // In typical problem contexts, 'y' and 'z' are positive integers,
        // ensuring 'y + z' is positive. However, this check enhances robustness.
        if (sumOfOperandsTwoAndThree === 0) {
            // If sum is zero, and we've reached this branch,
            // it indicates a scenario where a calculation involving division by zero would occur.
            // Returning 0 here acts as a safe default for such an edge case.
            console.log(0);
            return;
        }

        // Perform the division step.
        const calculatedQuotient = numeratorDifference / sumOfOperandsTwoAndThree;

        // Add 1 to the quotient and then floor the result to get the final integer.
        const finalResult = Math.floor(calculatedQuotient + 1);

        // Output the computed numerical result.
        console.log(finalResult);

    } else {
        // If the main condition is not satisfied (i.e., 'x' is not strictly greater than 'y + z * 2'),
        // the problem dictates an output of zero.
        console.log(0);
    }
};

// Initiate the entire processing chain by first acquiring input
// and then passing it to the core logic evaluation function.
evaluateNumericLogic(acquireSystemInput());