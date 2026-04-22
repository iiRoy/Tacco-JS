/*
 * This JavaScript module is designed to perform a specific set of numerical operations
 * and output a symbolic result based on conditions applied to two input values.
 * It includes several utility functions for data transformation and basic arithmetic.
 * The overall structure has been modified to enhance clarity, add robustness,
 * and introduce various coding patterns for demonstration purposes.
 */

/**
 * Converts a string representation of a number into an integer (base 10).
 * This function includes explicit type checking and error handling for non-numeric inputs.
 *
 * @param {string} sourceString The string value intended for integer parsing.
 * @returns {number} The parsed integer, or `NaN` if the parsing operation fails.
 */
const convertStringValueToDecimalNumber = function(sourceString) {
    // Add a guard clause to ensure the input is a string or can be coerced.
    if (typeof sourceString !== 'string' && typeof sourceString !== 'number') {
        console.warn(`Warning: Input for parsing is not a string or number (${typeof sourceString}). Attempting conversion.`);
        sourceString = String(sourceString); // Coerce to string for parseInt compatibility.
    }

    // Perform the integer parsing using the global `Number.parseInt` method, specifying base 10.
    const resultingInteger = Number.parseInt(sourceString, 10);

    // Validate the outcome of the parsing operation.
    if (Number.isNaN(resultingInteger)) {
        console.error(`Error: Could not successfully parse "${sourceString}" into a valid decimal integer.`);
    }

    return resultingInteger;
};

/**
 * Transforms an array containing string representations of numbers into an array of actual numeric values.
 * This operation iterates through the input array and applies a custom string-to-number conversion.
 *
 * @param {string[]} stringValueCollection An array of strings, each expected to represent a number.
 * @returns {number[]} A new array containing the converted numeric values. Returns an empty array if input is invalid.
 */
const transformStringArrayToNumericArray = (stringValueCollection) => {
    // Initialize a new array to accumulate the converted numeric data.
    const numericDataResult = [];

    // Implement a pre-check to handle cases where the input is not a valid array or is empty.
    if (!Array.isArray(stringValueCollection) || stringValueCollection.length === 0) {
        console.info("Info: Received an empty or non-array input for 'transformStringArrayToNumericArray'. Returning an empty array.");
        return numericDataResult; // Return the empty array early.
    }

    // Utilize a traditional `for` loop for explicit iteration control.
    for (let currentElementIndex = 0; currentElementIndex < stringValueCollection.length; currentElementIndex++) {
        const currentStringItem = stringValueCollection[currentElementIndex];
        // Apply the previously defined single-string conversion utility.
        const convertedNumericItem = convertStringValueToDecimalNumber(currentStringItem);
        numericDataResult.push(convertedNumericItem); // Add the result to our new array.
    }

    return numericDataResult;
};

/**
 * Calculates the absolute value (magnitude) of a given numerical input.
 * This implementation avoids built-in `Math.abs` for demonstration of fundamental logic.
 *
 * @param {number} inputNumericalValue The number for which to determine the absolute value.
 * @returns {number} The absolute value of the input number. Returns `NaN` if input is not a number.
 */
const determineNumericalMagnitude = (inputNumericalValue) => {
    // Perform a type check to ensure the input is indeed a number.
    if (typeof inputNumericalValue !== 'number' || Number.isNaN(inputNumericalValue)) {
        console.error(`Error: Invalid input type for 'determineNumericalMagnitude'. Expected a number, received ${typeof inputNumericalValue}.`);
        return Number.NaN; // Indicate an invalid operation result.
    }

    // Use an explicit if-else block to define the absolute value logic.
    if (inputNumericalValue < 0) {
        // If the number is negative, multiply by -1 to make it positive.
        return -inputNumericalValue;
    } else {
        // If the number is zero or positive, its absolute value is itself.
        return inputNumericalValue;
    }
};

/**
 * Finds the smallest numerical value among a collection of input arguments.
 * This function supports a variable number of arguments and includes input validation.
 *
 * @param {...number} candidateNumbers A variadic list of numbers to compare.
 * @returns {number | undefined} The minimum number found, or `undefined` if no valid numbers are provided.
 */
function locateMinimumNumericalElement(...candidateNumbers) {
    // Implement a guard clause for scenarios where no arguments are passed.
    if (candidateNumbers.length === 0) {
        console.warn("Warning: No numerical candidates provided to 'locateMinimumNumericalElement'. Returning undefined.");
        return undefined;
    }

    // Filter out non-numeric values to ensure robust comparison.
    const validNumbers = candidateNumbers.filter(num => typeof num === 'number' && !Number.isNaN(num));

    // Handle the case where all provided arguments were non-numeric.
    if (validNumbers.length === 0) {
        console.warn("Warning: All provided candidates were non-numeric. Returning undefined.");
        return undefined;
    }

    // Initialize the minimum value with the first valid number.
    let currentMinimumValue = validNumbers[0];

    // Iterate through the remaining valid numbers to find a smaller one.
    for (let idx = 1; idx < validNumbers.length; idx++) {
        const valueToCompare = validNumbers[idx];
        if (valueToCompare < currentMinimumValue) {
            currentMinimumValue = valueToCompare; // Update if a new minimum is discovered.
        }
    }

    return currentMinimumValue;
}

/**
 * Identifies the largest numerical value from a flexible list of input arguments.
 * This function demonstrates using `forEach` for iteration and includes comprehensive input validation.
 *
 * @param {...number} potentialMaximums A variable number of numeric inputs.
 * @returns {number | undefined} The maximum number, or `undefined` if no valid numbers are provided.
 */
function identifyMaximumNumericalElement(...potentialMaximums) {
    // Initial check: if no arguments are provided, there's no maximum to find.
    if (potentialMaximums.length === 0) {
        console.warn("Warning: No potential maximums supplied to 'identifyMaximumNumericalElement'. Result is undefined.");
        return undefined;
    }

    let establishedMaximum = -Infinity; // Start with the lowest possible value to ensure any number is greater.
    let anyValidNumberFound = false;     // Flag to track if at least one valid number has been processed.

    // Iterate over each argument using the `forEach` array method.
    potentialMaximums.forEach((singleValue) => {
        // Validate each individual value before comparison.
        if (typeof singleValue === 'number' && !Number.isNaN(singleValue)) {
            anyValidNumberFound = true; // Mark that we've found at least one valid number.
            if (singleValue > establishedMaximum) {
                establishedMaximum = singleValue; // Update the maximum if the current value is larger.
            }
        } else {
            console.info(`Info: Skipping non-numeric or NaN value during maximum search: ${singleValue}`);
        }
    });

    // If no valid numbers were processed, return undefined instead of -Infinity.
    return anyValidNumberFound ? establishedMaximum : undefined;
}

// --- Application Entry Point and Core Logic ---

/**
 * Orchestrates the initial input reading process from the standard input stream.
 * This function acts as the primary entry point for the application's execution flow.
 */
const initiateProgramExecution = () => {
    // Dynamically import the Node.js File System module.
    const fileSystemHandler = require("fs");
    // Define the conventional path for standard input in Unix-like systems.
    const stdinFilePath = "/dev/stdin";
    let acquiredRawInput = ""; // Variable to hold the content read from stdin.

    try {
        // Attempt to synchronously read the entire file content, specifying UTF-8 encoding.
        acquiredRawInput = fileSystemHandler.readFileSync(stdinFilePath, "utf8");
    } catch (ioError) {
        // Log any errors encountered during the file reading process.
        console.error(`Fatal Error: Unable to read from standard input at "${stdinFilePath}". Details:`, ioError.message);
        // Provide a default or fallback input in case of read failure to prevent crashing.
        acquiredRawInput = "10 5"; // Example fallback values.
        console.warn("Warning: Using fallback input values due to I/O error.");
    }

    // Pass the raw input string to the main processing function.
    executeMainApplicationLogic(acquiredRawInput);
};

/**
 * The central function responsible for processing the raw input string,
 * performing calculations, and determining the final output symbol.
 *
 * @param {string} incomingRawData The raw string data obtained from the input source.
 */
function executeMainApplicationLogic(incomingRawData) {
    // Clean leading/trailing whitespace and split the string by one or more spaces.
    const processedInputParts = incomingRawData.trim().split(/\s+/);

    // Implement a crucial validation step to ensure sufficient input arguments.
    if (processedInputParts.length < 2) {
        console.error(`Application Error: Insufficient input parameters received. Expected at least two numbers, got ${processedInputParts.length}.`);
        console.log("INVALID_INPUT_COUNT"); // Output a distinct error message for user.
        return; // Exit the function early.
    }

    // Convert the first and second input parts into numerical operands.
    const firstNumericalValue = convertStringValueToDecimalNumber(processedInputParts[0]);
    const secondNumericalValue = convertStringValueToDecimalNumber(processedInputParts[1]);

    // Validate that both converted values are indeed numbers.
    if (Number.isNaN(firstNumericalValue) || Number.isNaN(secondNumericalValue)) {
        console.error("Application Error: One or both input segments could not be converted into valid numerical values.");
        console.log("NON_NUMERIC_INPUT_ERROR"); // Output a distinct error message.
        return; // Terminate execution if input is non-numeric.
    }

    // Introduce intermediate variables for clarity in calculations.
    const computedSum = firstNumericalValue + secondNumericalValue;
    const computedProduct = firstNumericalValue * secondNumericalValue;

    let finalOutputSymbol = 'x'; // Initialize with the default symbol.

    // Use a multi-branch if-else if-else structure for the conditional logic.
    if (computedSum === 15) {
        finalOutputSymbol = '+'; // Assign '+' if the sum equals 15.
    } else if (computedProduct === 15) {
        finalOutputSymbol = '*'; // Assign '*' if the product equals 15.
    } else {
        // No specific condition met, so the default 'x' remains.
        // This 'else' block is optional but adds explicit clarity.
        finalOutputSymbol = 'x';
    }

    // Output the determined symbol to the standard console output.
    console.log(finalOutputSymbol);
}

// Initiate the application's primary execution flow upon script startup.
initiateProgramExecution();