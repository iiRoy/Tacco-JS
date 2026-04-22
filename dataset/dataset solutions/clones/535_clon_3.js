import * as fileSystem from 'node:fs';

// Define a constant for the input file path. Using a constant improves readability
// and maintainability, making it easier to change the source in the future.
const DATA_SOURCE_PATH = '/dev/stdin';

// Define a constant for the divisor used in averaging.
// This makes the '2' in the division more semantically clear within the calculation.
const AVERAGING_DIVISOR = 2;

/**
 * Calculates the arithmetic mean of two numerical values.
 * This function encapsulates the core averaging logic, promoting reusability and clarity.
 * @param {number} valOne The first numerical component for averaging.
 * @param {number} valTwo The second numerical component for averaging.
 * @returns {number} The computed average of the two input numbers.
 */
function computeArithmeticMean(valOne, valTwo) {
    // Perform the summation of the two provided values.
    const sumOfOperands = valOne + valTwo;
    // Divide the sum by the predefined averaging divisor to obtain the mean.
    const calculatedMeanValue = sumOfOperands / AVERAGING_DIVISOR;
    return calculatedMeanValue;
}

// Main execution block for handling input data processing and calculation.
try {
    // Attempt to synchronously read the entire content of the specified file.
    // The data is expected to be in UTF-8 encoding.
    // The raw buffer content is stored as a string.
    let rawInputBufferContent = fileSystem.readFileSync(DATA_SOURCE_PATH, { encoding: 'utf8' });

    // Crucial guard clause: Ensure that the read content is not null, undefined,
    // or entirely empty after trimming whitespace. This prevents errors in subsequent steps.
    if (!rawInputBufferContent || rawInputBufferContent.trim().length === 0) {
        console.error("Error: No data found in the input stream or the stream is empty.");
        // Terminate the process with an error code to indicate failure.
        process.exit(1);
    }

    // Prepare the raw string data by removing any leading or trailing whitespace.
    const cleanedInputString = rawInputBufferContent.trim();

    // Split the cleaned string into an array of string tokens,
    // using a single space character as the primary delimiter.
    const stringTokens = cleanedInputString.split(" ");

    // Process each string token to convert it into a number.
    // This pipeline includes filtering out empty strings (which can result from multiple spaces)
    // and validating that the conversion to a number is successful.
    const processedNumericValues = stringTokens
        .filter(token => token.length > 0) // Remove any empty strings that might arise from `split`
        .map(token => {
            const numCandidate = Number(token);
            // Check if the conversion resulted in a valid number.
            if (isNaN(numCandidate)) {
                console.warn(`Warning: Encountered and skipped non-numeric token: '${token}'`);
                return null; // Mark invalid numbers for later filtering.
            }
            return numCandidate;
        })
        .filter(num => num !== null); // Remove all previously marked invalid (null) entries.

    // Validate that there are sufficient numeric values available for the calculation.
    // This guard prevents attempts to access undefined array elements.
    if (processedNumericValues.length < AVERAGING_DIVISOR) {
        console.error(`Error: Insufficient numeric values for averaging. Expected at least ${AVERAGING_DIVISOR}, but found only ${processedNumericValues.length}.`);
        // Terminate the process with an error code.
        process.exit(1);
    }

    // Extract the first two relevant numerical components from the validated array.
    const firstOperand = processedNumericValues[0];
    const secondOperand = processedNumericValues[1];

    // Compute the average using the dedicated helper function, enhancing code modularity.
    const finalCalculatedResult = computeArithmeticMean(firstOperand, secondOperand);

    // Display the calculated average to the standard output.
    // The output message is formatted for improved user understanding.
    console.log(`The computed arithmetic average is: ${finalCalculatedResult}`);

} catch (operationError) {
    // Catch and handle any potential errors that occur during file reading or data processing.
    console.error(`An unexpected system error occurred during file operation or data parsing: ${operationError.message}`);
    // Terminate the process with an error code to signal failure.
    process.exit(1);
}