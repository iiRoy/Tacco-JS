function computeRangeSum(inputDataLines) {
    // Validate the initial input array to ensure it's not empty or malformed.
    if (!Array.isArray(inputDataLines) || inputDataLines.length === 0) {
        console.error("Input data is either missing or not in an array format.");
        // In a real application, one might throw an error or handle it differently.
        return 0;
    }

    // Process the first line of the input, which is expected to contain three space-separated numbers.
    // These numbers define the upper limit for iteration and the bounds for the digit sum.
    const parsedNumericParams = inputDataLines[0].split(' ').map(Number);

    // Perform a quick check to ensure all parameters were successfully converted to numbers.
    if (parsedNumericParams.some(isNaN)) {
        console.error("One or more numeric parameters could not be parsed from the input.");
        return 0;
    }

    // Assign the parsed values to descriptive constants for improved clarity.
    const iterationUpperBoundary = parsedNumericParams[0]; // Denotes N in the problem statement
    const minAcceptableDigitSum = parsedNumericParams[1]; // Denotes A
    const maxAcceptableDigitSum = parsedNumericParams[2]; // Denotes B

    // Initialize a variable to accumulate the sum of numbers that meet the criteria.
    let finalAccumulatedResult = 0;

    // Define an internal helper function to compute the sum of digits for any given positive integer.
    // This modularizes the digit sum calculation, making the main loop cleaner.
    const calculateIntegerDigitSum = (value) => {
        let temporaryNumber = value;
        let currentDigitSum = 0;
        // Loop until the number is reduced to zero, extracting each digit.
        while (temporaryNumber > 0) {
            currentDigitSum += temporaryNumber % 10; // Add the last digit
            temporaryNumber = Math.floor(temporaryNumber / 10); // Remove the last digit
        }
        return currentDigitSum;
    };

    // Iterate through each integer from 1 up to and including the specified upper boundary.
    for (let currentNumber = 1; currentNumber <= iterationUpperBoundary; currentNumber++) {
        // Calculate the sum of digits for the current integer using the helper function.
        const digitsTotal = calculateIntegerDigitSum(currentNumber);

        // Check if the calculated digit sum falls within the specified range [minAcceptableDigitSum, maxAcceptableDigitSum].
        const isSumWithinPermittedRange = (digitsTotal >= minAcceptableDigitSum &&
                                          digitsTotal <= maxAcceptableDigitSum);

        // If the digit sum satisfies the condition, add the current number to our running total.
        if (isSumWithinPermittedRange) {
            finalAccumulatedResult += currentNumber;
        }
    }

    // Return the total sum of all qualifying numbers.
    return finalAccumulatedResult;
}

// --- Execution entry point: Reads input, calls the main logic, and prints the output ---

// Read all standard input as a UTF-8 string. This is common for competitive programming.
const rawDataBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the raw input: remove leading/trailing whitespace and split into an array of lines.
const processedInputLinesArray = rawDataBuffer.trim().split('\n');

// Execute the core logic function with the prepared input lines.
const computedFinalAnswer = computeRangeSum(processedInputLinesArray);

// Output the final computed result to the standard output.
console.log(computedFinalAnswer);