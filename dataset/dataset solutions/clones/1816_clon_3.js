// Read the initial raw data from the standard input stream, ensuring UTF-8 decoding.
let rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

/**
 * Executes the primary business logic, performing a specific arithmetic calculation.
 * This function is designed to be modular, receiving its dependencies through a utility object.
 *
 * @param {object} serviceProviders - An object containing various helper functions.
 * @param {function} serviceProviders.parseInputValues - A utility to extract and convert input tokens.
 * @returns {string} The final computed result, formatted as a string.
 */
function processCalculation({ parseInputValues }) {
    // Define a constant for the BigInt scaling factor, improving clarity and maintainability.
    const SCALING_DENOMINATOR = 1000n;

    // Retrieve the first numerical operand from the input.
    // It is explicitly cast to a BigInt to handle large integer arithmetic.
    // We expect a single value, hence the array destructuring.
    const [firstNumericalComponent] = parseInputValues(1, 1, BigInt);

    // Retrieve the second numerical operand. By default, `parseInputValues`
    // will return a single Number type value.
    let [secondNumericalComponentRaw] = parseInputValues();

    // Implement a basic validation check for the raw second component.
    // If it's not a valid number, log a warning and default to zero to prevent errors.
    if (typeof secondNumericalComponentRaw !== 'number' || isNaN(secondNumericalComponentRaw)) {
        console.warn("Input error: The second numerical component is invalid. Using 0 as a fallback.");
        secondNumericalComponentRaw = 0;
    }

    // Convert the second component into a BigInt after scaling it by 1000 and flooring.
    // This step is crucial for maintaining precision before BigInt division.
    const scaledSecondNumericalComponent = BigInt(Math.floor(secondNumericalComponentRaw * Number(SCALING_DENOMINATOR)));

    // Perform the core arithmetic operation: (first_component * scaled_second_component) / 1000n.
    // All calculations are done using BigInt for exact integer results.
    const intermediateProduct = firstNumericalComponent * scaledSecondNumericalComponent;
    const finalComputedResult = intermediateProduct / SCALING_DENOMINATOR;

    // Return the final result converted to its string representation.
    return finalComputedResult.toString();
}

// Pre-process the raw input data by splitting it into an array of tokens.
// This regex handles various whitespace characters (spaces, tabs, newlines) as delimiters.
let parsedInputTokens = rawInputData.split(/[\s\n]+/);

// Assemble a comprehensive object of utility functions that will be provided to the main processing logic.
// This promotes dependency injection and makes the `processCalculation` function more testable.
let executionUtilities = {
    /**
     * A flexible function to parse and extract specific values from the `parsedInputTokens` array.
     * It supports defining the expected structure (rows, columns) and the target data type for conversion.
     *
     * @param {number} [expectedRows=1] - The number of rows to extract.
     * @param {number} [expectedColumns=1] - The number of columns to extract.
     * @param {Function} [desiredDataType=Number] - The constructor function (e.g., Number, BigInt, String) for type conversion.
     * @returns {Array<any>|Array<Array<any>>} An array of parsed values, or a 2D array if `expectedColumns` > 1.
     */
    parseInputValues(expectedRows = 1, expectedColumns = 1, desiredDataType = Number) {
        // Guard clause: Ensure positive dimensions are requested.
        if (expectedRows <= 0 || expectedColumns <= 0) {
            console.error("Input parsing error: Requested dimensions must be positive integers.");
            return []; // Return an empty array for invalid requests.
        }

        const requiredTokenCount = expectedRows * expectedColumns;
        // Extract a chunk of tokens from the global `parsedInputTokens` array using `splice`.
        let extractedTokenChunk = parsedInputTokens.splice(0, requiredTokenCount);

        // Validation: Check if enough tokens were available.
        if (extractedTokenChunk.length < requiredTokenCount) {
            console.warn(`Warning: Insufficient input tokens. Expected ${requiredTokenCount}, but only found ${extractedTokenChunk.length}.`);
            // Decision: Continue with available tokens, padding might be needed depending on context.
        }

        // Convert each extracted token to the `desiredDataType`, unless it's already String.
        let typeConvertedValues = (desiredDataType !== String) ? extractedTokenChunk.map(token => {
            try {
                // Attempt type conversion.
                return desiredDataType(token);
            } catch (e) {
                // Log conversion errors and return a fallback value.
                console.error(`Type conversion failed for token '${token}' to ${desiredDataType.name}: ${e.message}`);
                return (desiredDataType === Number || desiredDataType === BigInt) ? NaN : token; // Return NaN for numeric failures.
            }
        }) : extractedTokenChunk;

        // If a multi-column structure is requested, rearrange the flat array into a 2D array (column-major order).
        if (expectedColumns > 1) {
            const reshapedColumnarData = Array.from({ length: expectedColumns }, () => []); // Initialize array of empty arrays.

            for (let r = 0; r < expectedRows; r++) {
                for (let c = 0; c < expectedColumns; c++) {
                    const flatIndex = r * expectedColumns + c;
                    if (flatIndex < typeConvertedValues.length) {
                        reshapedColumnarData[c].push(typeConvertedValues[flatIndex]);
                    } else {
                        // Fill with undefined if input was shorter than expected.
                        reshapedColumnarData[c].push(undefined);
                    }
                }
            }
            typeConvertedValues = reshapedColumnarData;
        }

        return typeConvertedValues;
    },

    /**
     * Converts a boolean value into a localized 'Yes' or 'No' string.
     * @param {boolean} flagValue - The boolean value to format.
     * @returns {string} 'Yes' if true, 'No' if false.
     */
    formatBooleanResponse: flagValue => flagValue ? 'Yes' : 'No',

    /**
     * Calculates the sum of all numeric elements in an array. Includes basic validation.
     * @param {Array<number>} numericCollection - An array of numbers to sum.
     * @returns {number} The total sum, or 0 if the input is invalid.
     */
    calculateTotalSum: numericCollection => {
        if (!Array.isArray(numericCollection) || numericCollection.some(item => typeof item !== 'number' || isNaN(item))) {
            console.error("Invalid array provided for sum calculation. Returning 0.");
            return 0;
        }
        return numericCollection.reduce((accumulator, currentElement) => accumulator + currentElement, 0);
    },

    /**
     * A utility function intended to prevent or signal infinite loop conditions.
     * In this specific application, it serves as a placeholder and is not actively invoked.
     */
    infiniteLoopGuard: () => {
        throw new Error("Critical error: An infinite loop condition was detected or prevented.");
    },

    // References to globally defined mathematical helper functions.
    findMaximumElement,
    findMinimumElement,

    /**
     * Logs an object to the console in a human-readable JSON format.
     * Includes error handling for objects that cannot be stringified.
     * @param {object} dataObject - The object to be logged.
     */
    outputStructuredData(dataObject) {
        try {
            console.log(JSON.stringify(dataObject, null, 2)); // Pretty-print JSON with 2-space indentation.
        } catch (e) {
            console.error("Error: Could not convert object to JSON for structured logging:", e.message);
            console.log(dataObject); // Fallback to basic object logging.
        }
    },
};

// Invoke the main calculation function with the prepared set of utilities.
let finalComputationOutcome = processCalculation(executionUtilities);

// Evaluate the outcome of the calculation and provide appropriate output to the console.
if (finalComputationOutcome === undefined || finalComputationOutcome === null || finalComputationOutcome === '') {
    // A more comprehensive check for "empty" or invalid results.
    console.warn("The final computation did not yield a meaningful result.");
    // Depending on requirements, one might exit the process here or return a default.
} else {
    // Output the successful result.
    console.log(finalComputationOutcome);
}

/**
 * Determines the largest numeric value within an array.
 * Includes robustness checks for empty arrays and non-numeric elements.
 *
 * @param {Array<number>} numericElements - An array of numbers.
 * @param {number|null} [initialComparisonValue=null] - An optional starting value for comparison.
 * @returns {number|null} The maximum value found, or null if the array is empty and no initial value is provided.
 */
function findMaximumElement(numericElements, initialComparisonValue = null) {
    if (!Array.isArray(numericElements) || numericElements.length === 0) {
        if (initialComparisonValue !== null) return initialComparisonValue;
        console.warn("Operation warning: Cannot determine maximum from an empty array without an initial comparison value.");
        return null;
    }

    let currentMaximum = (initialComparisonValue === null) ? numericElements[0] : initialComparisonValue;

    // Start iteration from the second element if the first was used as the initial maximum,
    // otherwise start from the beginning.
    const iterationStartIndex = (initialComparisonValue === null) ? 1 : 0;
    for (let i = iterationStartIndex; i < numericElements.length; i++) {
        const item = numericElements[i];
        // Ensure the item is a valid number before comparison.
        if (typeof item === 'number' && !isNaN(item) && item > currentMaximum) {
            currentMaximum = item;
        }
    }
    return currentMaximum;
}

/**
 * Determines the smallest numeric value within an array.
 * Includes robustness checks for empty arrays and non-numeric elements.
 *
 * @param {Array<number>} numericElements - An array of numbers.
 * @param {number|null} [initialComparisonValue=null] - An optional starting value for comparison.
 * @returns {number|null} The minimum value found, or null if the array is empty and no initial value is provided.
 */
function findMinimumElement(numericElements, initialComparisonValue = null) {
    if (!Array.isArray(numericElements) || numericElements.length === 0) {
        if (initialComparisonValue !== null) return initialComparisonValue;
        console.warn("Operation warning: Cannot determine minimum from an empty array without an initial comparison value.");
        return null;
    }

    let currentMinimum = (initialComparisonValue === null) ? numericElements[0] : initialComparisonValue;

    // Start iteration from the second element if the first was used as the initial minimum,
    // otherwise start from the beginning.
    const iterationStartIndex = (initialComparisonValue === null) ? 1 : 0;
    for (let i = iterationStartIndex; i < numericElements.length; i++) {
        const item = numericElements[i];
        // Ensure the item is a valid number before comparison.
        if (typeof item === 'number' && !isNaN(item) && item < currentMinimum) {
            currentMinimum = item;
        }
    }
    return currentMinimum;
}