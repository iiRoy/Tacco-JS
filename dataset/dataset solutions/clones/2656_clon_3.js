/**
 * This script processes a raw string input containing two space-separated numerical values.
 * It performs three distinct arithmetic operations (addition, subtraction, multiplication)
 * on these values and then determines the maximum result among them.
 * The final maximum value is then printed to the console.
 *
 * This implementation includes robust input parsing, explicit type conversions,
 * validation checks, and utilizes helper functions to modularize different
 * aspects of the data processing and output.
 */
function executeNumericalOperation(rawInputString) {
    // --- Step 1: Input Preparation and Initial Validation ---

    // Trim leading/trailing whitespace from the input string and split it
    // by one or more whitespace characters to get the individual components.
    // This makes the parsing more resilient to varied spacing.
    const inputSegments = rawInputString.trim().split(/\s+/);

    // Define the expected number of numerical inputs.
    const REQUIRED_NUMBER_OF_VALUES = 2;

    // Implement a guard clause to check if the input format is as expected.
    // If not, an error message is logged, and the function exits early.
    if (inputSegments.length !== REQUIRED_NUMBER_OF_VALUES) {
        logMessage("Error: The provided input does not contain exactly two space-separated values. Please check the format.");
        return; // Terminate execution due to invalid input structure.
    }

    // Extract the raw string representations of the two values.
    const stringValueFirst = inputSegments[0];
    const stringValueSecond = inputSegments[1];

    // --- Step 2: Data Type Conversion and Numerical Validation ---

    // Explicitly convert the string values into floating-point numbers.
    // Using parseFloat ensures that operations are numerical, not string concatenations.
    const numericValueFirst = parseFloat(stringValueFirst);
    const numericValueSecond = parseFloat(stringValueSecond);

    // Implement another guard clause to validate if the converted values are indeed numbers.
    // If either conversion results in NaN (Not-a-Number), an error is logged, and the function exits.
    if (isNaN(numericValueFirst) || isNaN(numericValueSecond)) {
        logMessage(`Error: One or both of the input values ('${stringValueFirst}', '${stringValueSecond}') could not be converted to valid numbers.`);
        return; // Terminate execution due to non-numeric input.
    }

    // --- Step 3: Perform Core Numerical Computations ---

    // Calculate the sum of the two numerical inputs.
    const sumResult = numericValueFirst + numericValueSecond;
    // Calculate the difference between the two numerical inputs.
    const differenceResult = numericValueFirst - numericValueSecond;
    // Calculate the product of the two numerical inputs.
    const productResult = numericValueFirst * numericValueSecond;

    // Aggregate all computed results into an array for easier processing.
    const collectionOfResults = [sumResult, differenceResult, productResult];

    // --- Step 4: Determine the Maximum Value ---

    /**
     * Helper function to find the largest number within an array of numerical values.
     * This abstracts the logic for finding the maximum, enhancing readability.
     * @param {number[]} numbersArray An array of numbers.
     * @returns {number} The maximum value in the array, or -Infinity if the array is empty.
     */
    const findGreatestValue = (numbersArray) => {
        if (!Array.isArray(numbersArray) || numbersArray.length === 0) {
            // Return a very small number if the array is empty or invalid,
            // or consider throwing an error for more strict handling.
            return -Infinity;
        }
        // Utilize the built-in Math.max function with the spread operator
        // to efficiently find the maximum value from the array elements.
        return Math.max(...numbersArray);
    };

    // Call the helper function to get the overall maximum from our computed results.
    const finalMaximumCalculated = findGreatestValue(collectionOfResults);

    // --- Step 5: Output the Final Result ---

    // Use a dedicated logging helper to display the final maximum value.
    logMessage(finalMaximumCalculated);
}

/**
 * A utility function designed to abstract the process of reading data from standard input.
 * It specifically targets the '/dev/stdin' path, common in Unix-like environments.
 * @returns {string} The content read from the standard input as a UTF-8 encoded string.
 */
function acquireStandardInputContent() {
    // This line assumes a Node.js execution environment where 'fs' module is available.
    // It synchronously reads the entire content of the standard input stream.
    return require("fs").readFileSync("/dev/stdin", "utf8");
}

/**
 * A simple helper function to encapsulate the console logging mechanism.
 * This allows for potential future modifications to how messages are displayed
 * without altering the core logic of the main function.
 * @param {*} contentToDisplay The data or message to be logged to the console.
 */
function logMessage(contentToDisplay) {
    console.log(contentToDisplay);
}

// --- Program Execution Entry Point ---

// First, retrieve the input string from standard input using our helper.
const runtimeInputData = acquireStandardInputContent();

// Then, pass the retrieved data to the main processing function to start the operations.
executeNumericalOperation(runtimeInputData);