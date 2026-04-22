// Configuration for I/O operations and application settings.
const programParameters = {
    sourceFile: '/dev/stdin', // Path to the input data source.
    encodingFormat: 'utf-8',   // Character encoding for file reading.
    lineDelimiter: '\n'        // Character used to separate lines in the input.
};

// Import the Node.js File System module for file operations.
const fileSystemModule = require('fs');

/**
 * Reads content from a specified file path.
 * @param {string} filePath - The path to the file to read.
 * @param {string} encoding - The character encoding to use.
 * @returns {string | null} The file content as a string, or null if an error occurs.
 */
function obtainFileContent(filePath, encoding) {
    try {
        // Synchronously read the entire content of the file.
        const contentBuffer = fileSystemModule.readFileSync(filePath, encoding);
        return contentBuffer;
    } catch (readError) {
        // Log an error if file reading fails.
        console.error(`Error encountered during file read from ${filePath}:`, readError.message);
        return null; // Return null to indicate failure.
    }
}

/**
 * Computes the Greatest Common Divisor (GCD) of two integers
 * using the iterative Euclidean algorithm. Handles negative inputs by taking absolute values.
 * @param {number} primaryValue - The first integer.
 * @param {number} secondaryValue - The second integer.
 * @returns {number} The GCD of the two input values.
 */
const determineCommonDivisor = (primaryValue, secondaryValue) => {
    // Ensure both inputs are treated as positive for GCD calculation, as GCD is non-negative.
    let currentA = Math.abs(primaryValue);
    let currentB = Math.abs(secondaryValue);

    // Apply the Euclidean algorithm iteratively until the remainder is zero.
    while (currentB !== 0) {
        const temporaryRemainder = currentA % currentB;
        currentA = currentB;
        currentB = temporaryRemainder;
    }
    return currentA; // The GCD is the last non-zero remainder.
};

// --- Main application logic starts here ---

// Retrieve raw input string from the configured source file using the helper function.
const rawInputString = obtainFileContent(programParameters.sourceFile, programParameters.encodingFormat);

// Check if input was successfully obtained. If not, terminate the process.
if (rawInputString === null) {
    process.exit(1);
}

// Split the raw input string by the defined line delimiter to get an array of all lines.
const allInputLines = rawInputString.split(programParameters.lineDelimiter);

// Focus on the very first line of input for processing, trimming any surrounding whitespace.
const relevantInputSegment = allInputLines[0].trim();

// Perform a validation check: if the first line is empty after trimming, report an error.
if (!relevantInputSegment) {
    console.error("Error: Input line is empty or contains only whitespace. Expected two numbers.");
    process.exit(1);
}

// Split the first line by a space character to get individual string representations of numbers.
const stringValueArray = relevantInputSegment.split(' ');

// Validate that exactly two numbers were provided in the input line.
const expectedArgumentCount = 2;
if (stringValueArray.length !== expectedArgumentCount) {
    console.error(`Error: Expected ${expectedArgumentCount} numbers for GCD calculation, but received ${stringValueArray.length}.`);
    process.exit(1);
}

// Convert string values to numeric types using the Number() constructor.
// This also includes a basic validation for successfully parsed numbers.
const numericOperands = stringValueArray.map(strVal => {
    const numVal = Number(strVal);
    // If the conversion results in NaN, it indicates invalid input.
    if (isNaN(numVal)) {
        console.error(`Error: Invalid number detected in input: '${strVal}'. Please provide valid integers.`);
        process.exit(1);
    }
    return numVal;
});

// Destructure the two parsed numbers for clearer variable names.
const [firstNumber, secondNumber] = numericOperands;

// Calculate the GCD using the dedicated function.
const finalCommonDivisor = determineCommonDivisor(firstNumber, secondNumber);

// Output the computed result to the console with a descriptive label.
console.log(`Calculated GCD: ${finalCommonDivisor}`);