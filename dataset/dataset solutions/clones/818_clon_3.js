// This JavaScript program is designed to process numerical input from standard input.
// It searches for specific pairs of integers (firstNumber, secondNumber) that satisfy
// a particular mathematical identity, based on digit length constraints provided in the input.
// The program reads multiple test cases, each defining the required digit lengths for the numbers.

// Initialize standard input stream to be ready for receiving data.
// Ensure the input is treated as UTF-8 encoded text.
process.stdin.resume();
process.stdin.setEncoding('utf8');

/**
 * A private utility function to compute 10 raised to a given exponent.
 * It ensures the exponent is an integer.
 *
 * @param {number} exponentValue The power to which 10 should be raised.
 * @returns {number} The result of 10^exponentValue.
 */
const calculatePowerOfTen = (exponentValue) => {
    // Using Math.floor to ensure the exponent is an integer, similar to `~~` operator.
    const integralExponent = Math.floor(exponentValue);
    return Math.pow(10, integralExponent);
};

// Declare variables to manage the state of input processing and calculations.
let numberOfTestCases = 0;      // Stores the total count of processing scenarios.
let allInputLines = [];         // An array to hold all lines of data received from stdin.
let currentCaseProcessingIndex = 0; // Iterator for the current test case being handled.

// Register an event handler for when data becomes available on standard input.
process.stdin.on('data', (incomingRawDataBuffer) => {
    // Split the received data by newline characters to get an array of individual lines.
    allInputLines = incomingRawDataBuffer.split('\n');

    // The very first line of input specifies how many test cases follow.
    // Parse it as an integer, using radix 10 for explicit base.
    numberOfTestCases = parseInt(allInputLines[0], 10);

    // Basic validation: Check if the number of test cases is valid.
    // If not, log an error and terminate processing for this input chunk.
    if (isNaN(numberOfTestCases) || numberOfTestCases <= 0) {
        console.error("Fatal Error: The initial input line does not contain a valid positive number of test cases. Processing halted.");
        return;
    }

    // Begin iterating through each defined test case.
    for (currentCaseProcessingIndex = 0; currentCaseProcessingIndex < numberOfTestCases; ++currentCaseProcessingIndex) {
        // Each test case's parameters are on a line subsequent to the initial count line.
        // So, for case 0, we look at allInputLines[1], for case 1, allInputLines[2], and so on.
        const currentCaseParametersLine = allInputLines[currentCaseProcessingIndex + 1];

        // Validate if the current test case line actually exists.
        if (!currentCaseParametersLine) {
            console.error(`Warning: Input line for test case ${currentCaseProcessingIndex + 1} is missing or empty. Skipping this test case.`);
            continue; // Move to the next test case.
        }

        // Split the parameter line by space to get the two digit-length specifications.
        const digitSpecifiers = currentCaseParametersLine.split(' ');

        // Parse the required digit lengths for the two numbers.
        const requiredFirstNumDigits = parseInt(digitSpecifiers[0], 10);
        const requiredSecondNumDigits = parseInt(digitSpecifiers[1], 10);

        // Further validation for the parsed digit lengths.
        if (isNaN(requiredFirstNumDigits) || isNaN(requiredSecondNumDigits) || requiredFirstNumDigits <= 0 || requiredSecondNumDigits <= 0) {
            console.error(`Warning: Invalid digit length parameters (${digitSpecifiers[0]}, ${digitSpecifiers[1]}) for test case ${currentCaseProcessingIndex + 1}. Skipping.`);
            continue;
        }

        let countOfValidPairs = 0; // Counter for how many pairs satisfy the condition for the current case.

        // Determine the numerical range for the first number.
        // E.g., if requiredFirstNumDigits is 2, range is from 10 (10^(2-1)) to 99 (10^2 - 1).
        const firstNumLowerBound = calculatePowerOfTen(requiredFirstNumDigits - 1);
        const firstNumUpperBound = calculatePowerOfTen(requiredFirstNumDigits) - 1;

        // Iterate through all possible integer values for the first number within its defined range.
        for (let candidateFirstNumber = firstNumLowerBound; candidateFirstNumber <= firstNumUpperBound; ++candidateFirstNumber) {

            // Determine the numerical range for the second number, similar to the first.
            const secondNumLowerBound = calculatePowerOfTen(requiredSecondNumDigits - 1);
            const secondNumUpperBound = calculatePowerOfTen(requiredSecondNumDigits) - 1;

            // Iterate through all possible integer values for the second number within its defined range.
            for (let candidateSecondNumber = secondNumLowerBound; candidateSecondNumber <= secondNumUpperBound; ++candidateSecondNumber) {

                // Calculate the left-hand side of the mathematical condition: (B * (B + 1) - A * (A - 1)) / 2
                // This is equivalent to (B^2 + B - A^2 + A) / 2.
                const mathematicalExpressionResult = (candidateSecondNumber * (candidateSecondNumber + 1) - candidateFirstNumber * (candidateFirstNumber - 1)) / 2;

                // Create the concatenated numerical value: A followed by B.
                // For example, if A=12 and B=34, this becomes 1234.
                // We explicitly convert the template literal string back to a number.
                const concatenatedNumericalValue = Number(`${candidateFirstNumber}${candidateSecondNumber}`);

                // Check if the mathematical condition holds true.
                if (mathematicalExpressionResult === concatenatedNumericalValue) {
                    // If the condition is met, print the pair of numbers.
                    console.log(`${candidateFirstNumber} ${candidateSecondNumber}`);
                    // Increment the counter for valid pairs found in this test case.
                    countOfValidPairs++;
                }
            }
        }

        // After exhausting all possible pairs for the current test case,
        // check if any valid pairs were found.
        if (countOfValidPairs === 0) {
            // If no pairs were found, print a specific message for this case.
            console.log('No matching pairs found for this case.');
        }
    }
});