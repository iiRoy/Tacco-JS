function processInputData(rawDataLines) {
    // Define a constant for the modulo operation to improve readability and maintainability.
    const MODULO_DIVISOR = 998244353;

    // Validate input array length to prevent errors and ensure essential data is present.
    if (!rawDataLines || rawDataLines.length < 2) {
        console.error("Error: Insufficient input data provided. Expected at least two lines.");
        return; // Terminate execution if input is invalid.
    }

    // The first line of input (rawDataLines[0]) often contains an initial count or parameter,
    // but it is not utilized in the core logic of this particular calculation.
    // It is deliberately omitted from variable assignment here as a Type III modification
    // (deletion of unused code).

    // This object will store the frequency (number of occurrences) of each distinct number encountered.
    const valueOccurrences = {};
    let highestValueEncountered = 0; // This variable tracks the maximum numerical value found in the input.

    // A utility function to safely parse a string into an integer.
    // It handles cases where the string might not be a valid number, returning 0 instead of NaN.
    const parseNumericValueSafely = (inputString) => {
        const parsedNumber = parseInt(inputString, 10);
        // If parsing results in NaN (Not-a-Number), treat it as zero to prevent calculation issues.
        return isNaN(parsedNumber) ? 0 : parsedNumber;
    };

    // The second line of input contains space-separated numbers that need to be processed.
    const sequenceOfNumberStrings = rawDataLines[1].split(" ");

    // Iterate over each string representing a number in the sequence.
    for (const currentNumberString of sequenceOfNumberStrings) {
        const actualNumericalValue = parseNumericValueSafely(currentNumberString);

        // We are only interested in non-negative numbers for frequency counting in this context.
        // Negative values or other edge cases can be skipped or handled differently.
        if (actualNumericalValue < 0) {
            // Optionally, a warning could be logged here for unexpected input.
            continue; // Skip processing negative numbers.
        }

        // Increment the count for the current number.
        // If the number hasn't been seen before, initialize its count to 0 before incrementing.
        valueOccurrences[actualNumericalValue] = (valueOccurrences[actualNumericalValue] || 0) + 1;

        // Dynamically update the highest value encountered to determine the loop's upper bound.
        if (actualNumericalValue > highestValueEncountered) {
            highestValueEncountered = actualNumericalValue;
        }
    }

    // Initialize the result accumulator for the final product.
    // It must be initialized to 1 for correct multiplicative accumulation.
    let cumulativeProductResult = 1;

    // This loop calculates a chained product based on the frequencies of adjacent integers.
    // The iteration starts from 1 up to the maximum value found in the input data.
    for (let currentIterationIndex = 1; currentIterationIndex <= highestValueEncountered; currentIterationIndex++) {
        // Get the frequency of the number immediately preceding the current index.
        // If the number (currentIterationIndex - 1) was not present in the input, its frequency is 0.
        const baseForPowerCalculation = valueOccurrences[currentIterationIndex - 1] || 0;

        // Get the frequency of the number at the current index.
        // If the number (currentIterationIndex) was not present, its frequency is 0.
        const exponentForPowerCalculation = valueOccurrences[currentIterationIndex] || 0;

        // Calculate the power term: (frequency of i-1) ^ (frequency of i).
        // Special consideration for Math.pow(0,0) which is 1 in JavaScript.
        // Also, Math.pow(0, positive_exponent) is 0.
        let currentTermPowerResult;
        if (baseForPowerCalculation === 0 && exponentForPowerCalculation === 0) {
            currentTermPowerResult = 1; // Explicitly handle 0^0 as 1.
        } else if (baseForPowerCalculation === 0) {
            currentTermPowerResult = 0; // Any positive power of 0 is 0.
        } else {
            currentTermPowerResult = Math.pow(baseForPowerCalculation, exponentForPowerCalculation);
        }

        // Multiply the running product by the newly calculated power term.
        cumulativeProductResult = cumulativeProductResult * currentTermPowerResult;

        // Apply the modulo operation to ensure the result stays within the required range
        // and prevents potential integer overflow issues in large calculations.
        cumulativeProductResult %= MODULO_DIVISOR;
    }

    // Display the final computed product to the console.
    console.log(cumulativeProductResult);
}

// --- Application Entry Point & Input Handling ---
// This block handles reading input from standard input (e.g., '/dev/stdin' in Unix-like systems).
// It then passes the parsed input lines to the main data processing function.
try {
    // Attempt to read the entire file content synchronously.
    const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Split the content into an array of lines.
    const allInputLines = fileContents.split("\n");
    // Call the main processing function with the prepared input.
    processInputData(allInputLines);
} catch (inputError) {
    // Log any errors that occur during file reading or initial data parsing.
    console.error("An error occurred during input processing:", inputError.message);
    // Optionally, exit the process with an error code.
    // process.exit(1);
}