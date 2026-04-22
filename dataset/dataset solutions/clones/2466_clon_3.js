const InputOutputModule = require('readline'); // Renamed module import
// Configuration for the console input/output interface
const consoleInterface = InputOutputModule.createInterface({
  input: process.stdin,  // Standard input stream
  output: process.stdout // Standard output stream
});

// A global array to hold the numeric values parsed from the input line
let processedValuesStore = []; // Renamed global input variable

// Define a constant for the maximum allowed operand value
const MAX_OPERAND_VALUE = 9;

/**
 * Parses a raw input string line into an array of integers.
 * Handles trimming whitespace and robust splitting by spaces.
 * @param {string} rawLine - The raw string received from the input stream.
 * @returns {number[]} An array of parsed integer values.
 */
const parseInputLineToNumbersArray = (rawLine) => {
    // Trim leading/trailing whitespace and split by one or more space characters
    const stringComponents = rawLine.trim().split(/\s+/);

    // Convert each string component to an integer.
    // Use Number() for conversion and Math.trunc for explicit integer part.
    const numericComponents = stringComponents
        .filter(component => component !== '') // Filter out any empty strings from splitting
        .map(component => Math.trunc(Number(component))); // Ensure integer conversion

    // Optional: Add a validation for minimum number of components
    if (numericComponents.length < 2) {
        console.warn("Warning: Input line did not contain at least two valid numbers. Processing might be incomplete.");
        // Depending on requirements, might throw an error or return a specific indicator
    }

    return numericComponents;
};

/**
 * Core function to compute the product of two numbers with specific constraints.
 * It checks if both numbers are within a defined range (1-9).
 * @param {number[]} valuePair - An array containing two numeric components.
 * @returns {number} The product of the two numbers, or -1 if constraints are violated,
 *                   or null if input array is malformed.
 */
const computeProductWithConstraints = (valuePair) => {
    // Initial validation: Ensure the input is an array with at least two elements
    if (!Array.isArray(valuePair) || valuePair.length < 2) {
        console.error("Error: Invalid input format. Expected an array with at least two numeric values.");
        return null; // Returning null for a structural error in input array
    }

    // Extract the two operands for clearer readability and potential further validation
    const firstNumericalComponent = valuePair[0];
    const secondNumericalComponent = valuePair[1];

    // Check if either operand exceeds the maximum allowed value
    // Using Math.max provides an alternative equivalent to A > 9 || B > 9
    if (Math.max(firstNumericalComponent, secondNumericalComponent) > MAX_OPERAND_VALUE) {
        // Return the specified error code for out-of-bounds values
        return -1;
    }

    // Perform the multiplication operation. Math.imul can be used as an alternative
    // to the simple '*' operator, ensuring 32-bit integer multiplication.
    const computedResult = Math.imul(firstNumericalComponent, secondNumericalComponent);

    // Return the final calculated product
    return computedResult;
};

// Event listener for when a line of input is received
consoleInterface.on('line', (rawInputLineString) => { // Renamed parameter
    // Parse the received string into an array of numbers and store it globally
    processedValuesStore = parseInputLineToNumbersArray(rawInputLineString);
})
// Event listener for when the input stream is closed
.on('close', () => {
    // Execute the main computation logic using the stored numeric values
    const finalCalculationOutcome = computeProductWithConstraints(processedValuesStore);

    // Output the result to the console.
    // Added a check for 'null' outcome which indicates a structural input error.
    if (finalCalculationOutcome !== null) {
        console.log(finalCalculationOutcome);
    } else {
        // A more descriptive message for structural input errors.
        console.log("Computation failed due to malformed input data.");
    }

    // Removed process.exit(); as the program will naturally terminate
    // once the readline interface is closed and no other async tasks are pending.
});