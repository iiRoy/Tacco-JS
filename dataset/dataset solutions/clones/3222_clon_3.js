/**
 * Analyzes a collection of numeric values to determine if the largest element
 * is strictly less than the sum of all other elements in the collection.
 * This function incorporates robust input validation and uses modern JavaScript constructs.
 *
 * @param {Array<number>} numericValues - An array of numbers to be processed.
 * @returns {string} 'Yes' if the condition is met, 'No' otherwise.
 */
function evaluateNumbers(numericValues) {
    // Validate the input array. If it's not an array or is empty,
    // we cannot perform the required analysis.
    if (!Array.isArray(numericValues) || numericValues.length === 0) {
        console.warn('Input for evaluateNumbers is not a valid array or is empty. Returning "No".');
        return 'No';
    }

    let cumulativeTotal = 0; // Stores the sum of all valid numbers.
    // Initialize peakValue to negative infinity to correctly handle arrays with negative numbers,
    // ensuring any actual number in the array will be greater.
    let peakValue = -Infinity;
    let validNumbersFound = false; // Flag to track if any valid numbers were processed.

    // Iterate through each element using a for...of loop for cleaner syntax.
    for (const itemValue of numericValues) {
        // Perform a type check to ensure the current item is a valid number.
        // Skip non-numeric values to prevent errors and ensure robustness.
        if (typeof itemValue !== 'number' || isNaN(itemValue)) {
            console.warn(`Skipping non-numeric or NaN value: ${itemValue}`);
            continue;
        }

        cumulativeTotal += itemValue; // Accumulate the sum.
        peakValue = Math.max(peakValue, itemValue); // Update the maximum value found so far.
        validNumbersFound = true;
    }

    // If no valid numbers were found after iterating (e.g., array was [null, 'a']),
    // the condition cannot be met in a meaningful way.
    if (!validNumbersFound) {
        console.warn('No valid numbers were found in the input array. Returning "No".');
        return 'No';
    }

    // The core condition: is the largest element less than the sum of the rest?
    // This can be rephrased as: is twice the largest element less than the total sum?
    // (max < sum - max) is equivalent to (2 * max < sum)
    const doubledPeakValue = 2 * peakValue; // Introduce an intermediate variable for clarity.

    // Perform the final comparison.
    if (doubledPeakValue < cumulativeTotal) {
        return 'Yes';
    } else {
        return 'No';
    }
}

/**
 * Orchestrates the solution process: reads raw input, parses it into
 * a usable format, and then invokes the core logic function to get a result.
 * Finally, it displays the outcome to the console.
 *
 * @param {string} sourceText - The raw input string, typically from standard input.
 */
function orchestrateSolution(sourceText) {
    // Verify that the input is a non-empty string to avoid processing issues.
    if (typeof sourceText !== 'string' || sourceText.trim() === '') {
        console.error('Error: Provided input data is empty or not a string.');
        console.log('No'); // Output a default negative result for invalid input.
        return;
    }

    // Split the entire input text into individual lines.
    const inputLines = sourceText.split('\n');

    // The first line (inputLines[0]) usually contains 'n' (the count of numbers),
    // but our 'evaluateNumbers' function processes the array directly, making 'n' redundant.
    // Therefore, we omit parsing or using it here.

    // Ensure there is at least a second line containing the numeric data.
    if (inputLines.length < 2 || inputLines[1].trim() === '') {
        console.error('Error: The line containing numeric data is missing or empty.');
        console.log('No'); // Output a default negative result for missing data.
        return;
    }

    // Process the second line: split by spaces and filter out any empty strings
    // that might result from multiple consecutive spaces.
    const rawNumberStrings = inputLines[1].split(' ').filter(segment => segment !== '');

    // Convert each string segment into a floating-point number.
    // parseFloat is used for robustness with potential decimal inputs, though Number() also works.
    const parsedNumbers = rawNumberStrings.map(strValue => parseFloat(strValue));

    // Optional: Add a check to warn about or handle any non-numeric values that couldn't be parsed.
    const hasUnparseableValues = parsedNumbers.some(num => isNaN(num));
    if (hasUnparseableValues) {
        console.warn('Warning: Some input tokens could not be parsed into numbers. These will be ignored by the analysis logic.');
    }

    // Call the primary logic function with the prepared numeric data.
    const finalOutcome = evaluateNumbers(parsedNumbers);

    // Output the final decision.
    console.log(finalOutcome);
}

// This section handles reading from standard input and invoking the main orchestration function.
// It should typically remain untouched in competitive programming contexts.
orchestrateSolution(require("fs").readFileSync("/dev/stdin", "utf8"));