// Function designed to interpret raw string input and perform a specific numerical computation.
function processInputData(rawData) {
    // Divide the comprehensive raw input string into an array of individual text lines.
    const inputRows = rawData.split('\n');

    // Implement a preliminary validation step: ensure that a minimum number of input lines are present.
    if (inputRows.length < 2) {
        console.error("Error: The provided input lacks the necessary number of lines for processing.");
        // In a production environment, one might throw an exception or return a specific error code.
        // For typical script-based challenges, logging an error and halting is often sufficient.
        return null;
    }

    // Extract the first line, which is expected to contain three space-separated numerical components.
    const initialValuesStr = inputRows[0].split(' ');

    // Validate the structural integrity of the first line: it must contain exactly three values.
    if (initialValuesStr.length !== 3) {
        console.error("Error: The first line of input must contain exactly three numerical values.");
        return null;
    }

    // Convert the string representations of the initial values into actual numerical types.
    const valX = Number(initialValuesStr[0]);
    const valY = Number(initialValuesStr[1]);
    const valZ = Number(initialValuesStr[2]);

    // Conduct a post-conversion validation to confirm that all initial values are indeed valid numbers.
    if (isNaN(valX) || isNaN(valY) || isNaN(valZ)) {
        console.error("Error: One or more of the primary input values could not be parsed as valid numbers.");
        return null;
    }

    // Retrieve the second line, which is anticipated to hold a single numerical value for an exponent.
    const powerFactorStr = inputRows[1];
    const powerFactor = Number(powerFactorStr);

    // Validate that the exponent factor has been successfully converted into a valid numerical type.
    if (isNaN(powerFactor)) {
        console.error("Error: The exponential factor provided is not a valid number.");
        return null;
    }

    // To efficiently determine the largest value and the sum of the remaining two,
    // place the three numerical values into an array.
    const numberSet = [valX, valY, valZ];

    // Sort the array in ascending order. This method provides a clean and scalable way
    // to identify the largest element and the sum of the others, avoiding complex conditional logic.
    numberSet.sort((numA, numB) => numA - numB);

    // Following the sort, the largest value will reside at the highest index of the array.
    const maxValue = numberSet[2];
    // The sum of the two smaller values will be the sum of the elements at the first two indices.
    const remainingSum = numberSet[0] + numberSet[1];

    // Establish a constant for the base of the exponential operation, as specified by the problem's nature.
    const EXPONENT_BASE = 2;

    // Compute the exponential term separately for clarity and potential reuse.
    const powerTerm = Math.pow(EXPONENT_BASE, powerFactor);

    // Execute the final calculation according to the problem's formula:
    // (largest value multiplied by the exponential term) plus (the sum of the other two values).
    const finalResult = (maxValue * powerTerm) + remainingSum;

    // Return the computed result.
    return finalResult;
}

// This block serves as the execution entry point for the script.
// It orchestrates reading input from standard input and invoking the core processing logic.
try {
    // Asynchronously read the entire content from the standard input stream, interpreting it as UTF-8 text.
    const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

    // Invoke the primary data processing function with the acquired input.
    const resultValue = processInputData(standardInputContent);

    // If the processing function successfully returned a non-null value, print it to standard output.
    if (resultValue !== null) {
        console.log(resultValue);
    } else {
        // If 'resultValue' is null, it indicates that an error was encountered during processing,
        // and an error message would have already been logged by 'processInputData'.
        // Terminate the process with a non-zero exit code to signal an error.
        process.exit(1);
    }
} catch (executionError) {
    // Capture and report any unforeseen errors that might occur during file I/O or initial script execution.
    console.error("An unforeseen runtime error occurred:", executionError.message);
    // Terminate the process with an error code.
    process.exit(1);
}