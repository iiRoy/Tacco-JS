/**
 * This module is designed to process numerical data from a specified input source.
 * It extracts a sequence of numbers from the first line of the input and
 * performs a particular arithmetic operation, returning an integer result.
 */

/**
 * Analyzes and calculates a derived numerical value from a given raw string input.
 * The input is expected to contain space-separated numerical components on its first line.
 * The calculation performed is floor((first - third) / (second + third)).
 *
 * @param {string} inputSourceContent - The complete string content received, typically from a file.
 *                                      It is assumed the relevant data is on the initial line.
 * @returns {number | null} The computed integer result, or null if any processing
 *                          or validation step fails.
 */
const performComplexCalculation = (inputSourceContent) => {
    // Stage 1: Initial input validation
    if (typeof inputSourceContent !== 'string' || inputSourceContent.trim().length === 0) {
        console.error("Error: Provided input source content is empty or not a valid string type.");
        return null;
    }

    // Extract the primary data string, assuming it's the first line of the content.
    const initialDataLine = inputSourceContent.split('\n')[0];

    // Stage 2: Validate the extracted data line.
    if (!initialDataLine || initialDataLine.trim().length === 0) {
        console.error("Error: The first line of input is empty or could not be extracted.");
        return null;
    }

    // Split the data line into individual string tokens based on whitespace.
    const rawValueTokens = initialDataLine.trim().split(/\s+/); // Use regex for multiple spaces

    // Stage 3: Parse and validate numerical components.
    const processedNumericValues = [];
    const minimumExpectedValues = 3;

    // Iterate through each token to convert it to a number and check for validity.
    for (let i = 0; i < rawValueTokens.length; i++) {
        const currentToken = rawValueTokens[i];
        const convertedNumber = Number(currentToken); // Attempt conversion

        if (isNaN(convertedNumber)) {
            console.error(`Error: Input token '${currentToken}' at position ${i} is not a valid number.`);
            return null; // Abort if a non-numeric value is found.
        }
        processedNumericValues.push(convertedNumber);
    }

    // Stage 4: Ensure sufficient data for the calculation.
    if (processedNumericValues.length < minimumExpectedValues) {
        console.error(`Error: Insufficient numerical values for calculation. Expected at least ${minimumExpectedValues}, but found ${processedNumericValues.length}.`);
        return null;
    }

    // Assign the required values to clearly named constants for the calculation.
    const valueA = processedNumericValues[0]; // Corresponds to s[0]
    const valueB = processedNumericValues[1]; // Corresponds to s[1]
    const valueC = processedNumericValues[2]; // Corresponds to s[2]

    // Stage 5: Perform the arithmetic operations in steps.
    // Calculate the numerator component: (valueA - valueC)
    const numeratorDifference = valueA - valueC;

    // Calculate the denominator component: (valueB + valueC)
    const denominatorSum = valueB + valueC;

    // Stage 6: Guard against division by zero.
    if (denominatorSum === 0) {
        console.error("Error: Division by zero prevented. The sum of valueB and valueC is zero.");
        return null;
    }

    // Execute the division.
    const unroundedQuotient = numeratorDifference / denominatorSum;

    // Stage 7: Final step - apply the floor function to get an integer result.
    const finalCalculatedInteger = Math.floor(unroundedQuotient);

    return finalCalculatedInteger;
};

// --- Main execution block for reading input and displaying the result ---
try {
    // Leverage the Node.js file system module for input handling.
    const nodeFileSystem = require("fs");
    const standardInputPath = "/dev/stdin"; // Standard Unix-like input path.
    const textEncodingFormat = "utf8"; // Specify character encoding.

    // Read the entire content from the standard input synchronously.
    const rawInputFileData = nodeFileSystem.readFileSync(standardInputPath, textEncodingFormat);

    // Invoke our primary function to process the data and get the outcome.
    const operationResult = performComplexCalculation(rawInputFileData);

    // Display the result if the calculation was successful, otherwise indicate failure.
    if (operationResult !== null) {
        console.log(operationResult);
    } else {
        // An error message would have been logged by 'performComplexCalculation'.
        // Exit with a non-zero status to indicate an error to the system.
        process.exit(1);
    }
} catch (ioError) {
    // Catch and report any errors that occur during file reading.
    console.error(`Critical Error: Failed to read input from /dev/stdin. Details: ${ioError.message}`);
    process.exit(1); // Exit with error code.
}