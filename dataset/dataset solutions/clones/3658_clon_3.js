// This JavaScript file processes input from standard input to perform a specific numerical calculation.

/**
 * Executes a primary numerical operation based on the provided raw content.
 * The function expects the content to be a string containing at least two lines.
 * - The first line should contain a single number. This number will be negated.
 * - The second line should contain space-separated numbers, which will be summed.
 * The final output is the sum of the negated first number and the total sum of the second line's numbers.
 *
 * @param {string} sourceContent - The raw string data read from an input source.
 */
function executeNumericalOperation(sourceContent) {
    // Pre-computation validation: Ensure the input content is a valid string.
    if (typeof sourceContent !== 'string' || sourceContent === null) {
        console.error("Error: Provided input source content is invalid or null. Cannot proceed.");
        return; // Exit early if input is not a string.
    }

    // Step 1: Divide the entire input content into separate lines.
    // This creates an array where each element corresponds to a line from the input.
    const contentSegments = sourceContent.split('\n');

    // Step 2: Perform essential checks on the structure of the input lines.
    // We anticipate at least two lines for the calculation.
    if (contentSegments.length < 2) {
        console.error("Error: Insufficient input lines detected. Expected a minimum of two lines for calculation.");
        // Depending on requirements, could throw an error or return a default value here.
        return;
    }

    // Step 3: Process the first line to extract and negate its numeric value.
    // We use parseInt to ensure an integer conversion from the string.
    const rawFirstLineString = contentSegments[0];
    const numericValueFromFirstLine = parseInt(rawFirstLineString, 10);

    // Validate the conversion of the first line's content.
    if (isNaN(numericValueFromFirstLine)) {
        console.error(`Warning: First line content '${rawFirstLineString}' is not a valid number. Treating it as 0 for negation.`);
        // Default to 0 if the first line doesn't contain a parseable number.
        numericValueFromFirstLine = 0;
    }

    // The first part of our final calculation: the negated value.
    const negatedComponent = -numericValueFromFirstLine; // Equivalent to multiplying by -1.

    // Step 4: Process the second line to sum all its space-separated numeric values.
    // Initialize an accumulator for the sum.
    let sumOfSecondLineNumbers = 0;

    // Retrieve the second line string, providing a fallback for undefined scenarios.
    const rawSecondLineString = contentSegments[1] || '';

    // Split the second line by spaces to get an array of potential number strings.
    const individualNumberStrings = rawSecondLineString.split(' ');

    // Iterate through each string from the second line, convert to a number, and add to the sum.
    // This loop replaces the compact 'reduce' method for clarity and detailed error handling.
    for (const numberToken of individualNumberStrings) {
        // Trim any leading/trailing whitespace before parsing.
        const trimmedNumberToken = numberToken.trim();

        // Skip empty strings that might result from multiple spaces.
        if (trimmedNumberToken === '') {
            continue;
        }

        const currentParsedNumber = parseInt(trimmedNumberToken, 10);

        // Validate each parsed number. If it's not a valid number, it's skipped from the sum.
        if (!isNaN(currentParsedNumber)) {
            sumOfSecondLineNumbers += currentParsedNumber;
        } else {
            // Optional: Log a warning if an item in the second line couldn't be parsed.
            // console.warn(`Skipping non-numeric token in second line: '${trimmedNumberToken}'`);
        }
    }

    // Step 5: Combine the results from both lines to get the final outcome.
    const finalComputedResult = negatedComponent + sumOfSecondLineNumbers;

    // Step 6: Display the final calculation result to the standard output.
    console.log(finalComputedResult);
}

// --- Main execution block for reading input and invoking the processing function ---

// Define constants for file system operations to improve readability and maintainability.
const fileSystemUtility = require("fs");
const inputFilePath = "/dev/stdin";
const defaultEncoding = "utf8";

let retrievedInputContent;
try {
    // Attempt to read the entire file synchronously.
    // This ensures that the script waits until all input is available.
    retrievedInputContent = fileSystemUtility.readFileSync(inputFilePath, defaultEncoding);
} catch (fileReadError) {
    // Catch and report any errors that occur during file reading.
    console.error(`Failed to read input from '${inputFilePath}': ${fileReadError.message}`);
    // Terminate the process with an error code if input cannot be read.
    process.exit(1);
}

// Convert the retrieved content to a string explicitly, though readFileSync with 'utf8' usually returns a string.
const processedInputString = String(retrievedInputContent);

// Call our main processing function with the obtained input.
executeNumericalOperation(processedInputString);