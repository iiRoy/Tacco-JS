const fileSystemModule = require('fs');

/**
 * Safely converts a string to an integer.
 * In this context, input strings are expected to be valid numbers.
 * @param {string} stringValue - The string to convert.
 * @returns {number} The parsed integer.
 */
const convertToInteger = (stringValue) => {
    // Using parseInt with radix 10 for explicit base conversion.
    // Original code used implicit type coercion (value - 0).
    return parseInt(stringValue, 10);
};

/**
 * Parses a line containing two space-separated numeric values into an array of numbers.
 * @param {string} lineContent - The input line string.
 * @returns {number[]} An array containing two numeric values.
 */
const parseNumericPairFromLine = (lineContent) => {
    const components = lineContent.split(" ");
    const valOne = convertToInteger(components[0]);
    const valTwo = convertToInteger(components[1]);
    return [valOne, valTwo];
};

// Read all raw data from standard input, ensuring UTF-8 encoding.
let rawStreamData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process the raw data: remove leading/trailing whitespace and split into an array of lines.
let processedInputLines = rawStreamData.trim().split("\n");

// The first line typically contains a count, but it is not utilized in subsequent calculations.
// We consume it from the input stream to advance to relevant data.
const initialDiscardedCount = convertToInteger(processedInputLines.shift());

// Extract the starting value (initialTerm) and the common difference for the series.
// These are found on the second line of the input.
const [initialTerm, commonDifference] = parseNumericPairFromLine(processedInputLines.shift());

// Initialize an empty object to serve as a dynamic mapping store.
// This object will hold key-value associations based on input operations.
const activeKeyMappings = {};

// Determine the total number of mapping operations to perform.
// This count is provided on the third line of the input.
const totalOperationCount = convertToInteger(processedInputLines.shift());

// Iterate through each specified mapping operation.
for (let currentOperationIndex = 0; currentOperationIndex < totalOperationCount; currentOperationIndex++) {
    // Parse the current operation line: operation type, primary key, and secondary key.
    const [operationIdentifier, operandOne, operandTwo] = processedInputLines.shift().split(" ");

    // Check for the existence of both operands in the current mapping store for conditional logic.
    const operandOneExists = activeKeyMappings.hasOwnProperty(operandOne);
    const operandTwoExists = activeKeyMappings.hasOwnProperty(operandTwo);

    // Apply mapping logic based on the operation identifier.
    // "0" indicates a bidirectional or symmetrical mapping update.
    if (operationIdentifier === "0") {
        // Condition 1: Neither operand exists in the mappings.
        // Establish a new bidirectional link between operandOne and operandTwo.
        if (!operandOneExists && !operandTwoExists) {
            activeKeyMappings[operandOne] = operandTwo;
            activeKeyMappings[operandTwo] = operandOne;
        }
        // Condition 2: OperandOne exists, but operandTwo is new.
        // OperandTwo inherits the mapping of operandOne, and operandOne then maps to operandTwo.
        else if (operandOneExists && !operandTwoExists) {
            activeKeyMappings[operandTwo] = activeKeyMappings[operandOne];
            activeKeyMappings[operandOne] = operandTwo;
        }
        // Condition 3: OperandOne is new, but operandTwo exists.
        // Symmetric to Condition 2: OperandOne inherits operandTwo's mapping, and operandTwo maps to operandOne.
        else if (!operandOneExists && operandTwoExists) {
            activeKeyMappings[operandOne] = activeKeyMappings[operandTwo];
            activeKeyMappings[operandTwo] = operandOne;
        }
        // Condition 4: Both operands already exist.
        // Swap their current mapped values.
        else {
            // Utilizes array destructuring for an elegant swap.
            [activeKeyMappings[operandOne], activeKeyMappings[operandTwo]] =
            [activeKeyMappings[operandTwo], activeKeyMappings[operandOne]];
        }
    } else { // Handle unidirectional mapping logic (operationIdentifier is not "0", typically "1").
        // This simplified logic covers all sub-cases of the original code's "else" block.
        // If operandTwo has an existing mapping, operandOne maps to that value.
        // Otherwise, operandOne maps directly to operandTwo.
        activeKeyMappings[operandOne] = operandTwoExists ? activeKeyMappings[operandTwo] : operandTwo;
    }
}

// Retrieve the final key from the remaining input lines for the arithmetic series calculation.
let finalLookupKeyCandidate = processedInputLines.shift();

// If the final key exists in our dynamic mappings, resolve it to its mapped value.
if (activeKeyMappings.hasOwnProperty(finalLookupKeyCandidate)) {
    finalLookupKeyCandidate = activeKeyMappings[finalLookupKeyCandidate];
}

// Convert the resolved key to its numeric representation.
const effectiveNumericIndex = convertToInteger(finalLookupKeyCandidate);

// Calculate the term in the arithmetic progression using the formula:
// Term_n = initialTerm + (n - 1) * commonDifference
// Where 'n' is our effectiveNumericIndex.
const computedSeriesResult = initialTerm + ((effectiveNumericIndex - 1) * commonDifference);

// Output the final calculated result to standard output.
console.log(computedSeriesResult);