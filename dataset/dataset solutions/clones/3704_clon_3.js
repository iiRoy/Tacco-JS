// A comprehensive module for data transformation and aggregation.

/**
 * Orchestrates the processing of raw input data, applying a series of transformations
 * and aggregations to derive a final computed sum.
 *
 * @param {string} rawInputText - The raw string input, expected to contain multiple lines.
 *                                The first line is typically metadata, the second contains space-separated numbers.
 */
const processInputDataSet = (rawInputText) => {
    // --- Step 1: Input Preparation and Parsing ---
    // Ensure the input string is valid and clean before proceeding.
    if (!rawInputText || typeof rawInputText !== 'string') {
        console.error("Error: Invalid or empty input provided for processing.");
        return; // Terminate execution if the input is unsuitable.
    }

    // Sanitize and segment the raw input into individual lines for structured access.
    const inputLines = rawInputText
        .trim() // Remove any leading or trailing whitespace from the entire input block.
        .split('\n'); // Divide the string into an array, where each element is a line.

    // A note on the first line:
    // The initial line (e.g., 'N' in competitive programming contexts) often contains
    // metadata such as the count of elements. However, in this specific logic, its
    // value is explicitly not utilized for the final computation.
    // For example: const elementCount = Number(inputLines[0]); // This variable remains unused.

    // Validate that there is at least a second line present, which is crucial for our data.
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input lines. At least two lines are required for proper execution.");
        return; // Prevent errors from attempting to access non-existent lines.
    }

    // Parse the second line of input into an array of integers.
    // We use Array.prototype.map for transforming string elements and the Number constructor
    // for explicit and robust type conversion from string to number.
    const numericSequence = inputLines[1]
        .split(' ') // Break the second line by spaces to get string representations of numbers.
        .map(str => Number(str)); // Convert each string segment into its numeric equivalent.

    // --- Step 2: Intermediate Value Generation Through Transformation ---
    // Initialize an array to accumulate the results of our element-wise transformations.
    const intermediateCalculations = [];

    /**
     * Helper function to compute an adjusted value based on its original value and index.
     * This encapsulates the core arithmetic logic, enhancing modularity and readability.
     *
     * @param {number} originalValue - The raw numeric value from the input sequence.
     * @param {number} indexPosition - The zero-based index of the value within the sequence.
     * @returns {number} The calculated difference.
     */
    const computeAdjustedValue = (originalValue, indexPosition) => {
        // The adjustment involves subtracting the 1-based index (indexPosition + 1)
        // from the original numeric value.
        return originalValue - (indexPosition + 1);
    };

    // Iterate over the parsed numeric sequence to apply the defined transformation to each element.
    // Using `forEach` allows for clean iteration, providing both the value and its index.
    numericSequence.forEach((currentNumber, currentElementIndex) => {
        const derivedValue = computeAdjustedValue(currentNumber, currentElementIndex);
        intermediateCalculations.push(derivedValue); // Store the newly computed value in our list.
    });

    // --- Step 3: Deduplication and Absolute Value Transformation ---
    // Create a Set object from the array of intermediate calculations.
    // A Set automatically handles the elimination of any duplicate numeric values.
    const uniqueProcessedValues = new Set(intermediateCalculations);

    // Convert the Set back into an array. This step is necessary to enable
    // further array-based operations like `map` and `reduce`.
    const arrayOfUniqueValues = Array.from(uniqueProcessedValues);

    // Map each unique value to its absolute counterpart.
    // This ensures that all values contribute positively to the final sum, regardless of their original sign.
    const absoluteValuesArray = arrayOfUniqueValues.map(valueItem => Math.abs(valueItem));

    // --- Step 4: Final Aggregation ---
    // Sum all the absolute unique values to produce the final result.
    // The `reduce` method is employed here for accumulating a single aggregate result from an array.
    // An explicit initial value of `0` is provided to ensure correct summation even with an empty array.
    const finalComputedSum = absoluteValuesArray.reduce((accumulatorSum, currentVal) => {
        return accumulatorSum + currentVal;
    }, 0); // The sum begins from an initial value of zero.

    // --- Step 5: Output the Result ---
    // Display the final aggregated sum to the standard output.
    console.log(finalComputedSum);
};

// --- Execution Entry Point: Handling Input from Standard Input ---
// This block manages reading input from the standard input stream and initiating the data processing.
try {
    // Dynamically require the 'fs' (file system) module for input operations.
    const fileSystemModule = require('fs');
    // Define the standard input path, typical for Unix-like systems.
    const standardInputPath = '/dev/stdin';
    // Specify the character encoding for the input file.
    const inputEncoding = 'utf8';

    // Read the entire content of the standard input synchronously.
    // This is suitable for competitive programming contexts where input is small and blocking is acceptable.
    const inputTextFromStdin = fileSystemModule.readFileSync(standardInputPath, inputEncoding);

    // Invoke the main data processing function with the content obtained from stdin.
    processInputDataSet(inputTextFromStdin);
} catch (errorDetails) {
    // Catch and log any errors that may occur during the file reading or initial setup phase.
    console.error("An unexpected error occurred during input reading or initial processing:", errorDetails.message);
}