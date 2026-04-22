const fileSystem = require('fs');

// Define the path to read standard input from.
const standardInputSource = '/dev/stdin';

/**
 * Reads content from a specified file path, processes it, and returns an array of cleaned lines.
 * This function encapsulates the input reading logic.
 * @param {string} filePath - The path to the input file.
 * @returns {string[]} An array of strings, where each string is a trimmed line from the input.
 */
const acquireAndPrepareInputData = (filePath) => {
    // Read the raw content from the file synchronously, assuming UTF-8 encoding.
    const rawFileContent = fileSystem.readFileSync(filePath, 'utf8');

    // Remove leading/trailing whitespace from the entire content block.
    const trimmedContentBlock = rawFileContent.trim();

    // Split the content into individual lines and filter out any empty lines
    // that might result from extra newlines in the input.
    const arrayOfProcessedLines = trimmedContentBlock.split('\n').filter(line => line.length > 0);

    return arrayOfProcessedLines;
};

// Global constant for the base percentage value, enhancing readability.
const PERCENTAGE_BASE_VALUE = 100;

/**
 * Calculates the floor value of a quantity after applying a given percentage rate.
 * This helper function centralizes the calculation logic for clarity and reusability.
 * @param {number} quantity - The base quantity.
 * @param {number} rate - The percentage rate to apply (e.g., 5 for 5%).
 * @returns {number} The floor value of the quantity after rate application.
 */
const computeAdjustedValue = (quantity, rate) => {
    // The formula is: floor(quantity * (100 + rate) / 100)
    // This represents quantity plus 'rate' percent of quantity.
    return Math.floor(quantity * (PERCENTAGE_BASE_VALUE + rate) / PERCENTAGE_BASE_VALUE);
};

// Retrieve and preprocess all input lines once at the beginning.
let allInputSegments = acquireAndPrepareInputData(standardInputSource);

// Control flag for the main processing loop.
let processingIsActive = true;

// The main loop continues as long as the processingIsActive flag is true.
while (processingIsActive) {
    // Check if there are any input lines remaining to be processed.
    if (allInputSegments.length === 0) {
        // If no more lines, gracefully terminate the processing.
        processingIsActive = false;
        continue;
    }

    // Extract the next line from the beginning of the array.
    const currentInputLine = allInputSegments.shift();

    // Parse the space-separated values from the current line into numbers.
    const numericalParameters = currentInputLine.split(' ').map(val => parseInt(val, 10));

    // Input validation: Ensure exactly three parameters are provided per line.
    if (numericalParameters.length !== 3) {
        console.error("Error: Input line has an incorrect number of parameters. Skipping line:", currentInputLine);
        // Skip this malformed line and proceed to the next iteration.
        continue;
    }

    // Use array destructuring to assign the parsed values to meaningful variable names.
    const [interestRateX, interestRateY, targetSumS] = numericalParameters;

    // Check for the sentinel condition (0 0 0) to terminate the program.
    if (interestRateX === 0 && interestRateY === 0 && targetSumS === 0) {
        processingIsActive = false; // Set flag to exit the loop after this iteration.
        continue;
    }

    // Initialize the maximum calculated value for the current set of parameters.
    let currentMaximumResult = 0;

    // Guard clause: If the target sum is non-positive, no meaningful calculation can occur.
    if (targetSumS <= 0) {
        console.log(0); // Output 0 as no items can satisfy the condition.
        continue; // Proceed to the next set of parameters.
    }

    // Outer loop: Iterate through possible quantities for the first item.
    // The loop runs from 1 up to (but not including) targetSumS.
    for (let firstItemQuantity = 1; firstItemQuantity < targetSumS; ++firstItemQuantity) {

        // Inner loop: Iterate through possible quantities for the second item.
        // Similar bounds as the outer loop.
        for (let secondItemQuantity = 1; secondItemQuantity < targetSumS; ++secondItemQuantity) {

            // Calculate the adjusted values of both items using interestRateX.
            const adjustedValue1_X = computeAdjustedValue(firstItemQuantity, interestRateX);
            const adjustedValue2_X = computeAdjustedValue(secondItemQuantity, interestRateX);
            const sumWithRateX = adjustedValue1_X + adjustedValue2_X;

            // Optimization: If the sum already exceeds the target,
            // increasing secondItemQuantity further will only increase the sum,
            // so we can break out of the inner loop.
            if (sumWithRateX > targetSumS) {
                break;
            }

            // If the sum exactly matches the targetSumS with interestRateX.
            if (sumWithRateX === targetSumS) {
                // Now, calculate the sum of the same quantities using interestRateY.
                const adjustedValue1_Y = computeAdjustedValue(firstItemQuantity, interestRateY);
                const adjustedValue2_Y = computeAdjustedValue(secondItemQuantity, interestRateY);
                const sumWithRateY = adjustedValue1_Y + adjustedValue2_Y;

                // Update currentMaximumResult if the newly calculated sum is greater.
                currentMaximumResult = Math.max(currentMaximumResult, sumWithRateY);

                // Since we found a pair (firstItemQuantity, secondItemQuantity) that sums to targetSumS
                // with interestRateX, we can stop iterating for this firstItemQuantity in the inner loop
                // and move to the next firstItemQuantity.
                break;
            }
        }
    }
    // Output the maximum result found for the current set of parameters.
    console.log(currentMaximumResult);
}