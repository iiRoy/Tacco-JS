const fileSystemModule = require('fs'); // Obtain the necessary file system utilities

/**
 * Processes a string containing four space-separated numbers,
 * calculates the product of the first two and the last two,
 * and returns the greater of these two products.
 *
 * @param {string} rawInputString - The complete string read from input, e.g., "10 20 30 40".
 * @returns {number} The maximum value between (val1 * val2) and (val3 * val4).
 */
function processNumericProducts(rawInputString) {
    // Ensure the input string is trimmed of leading/trailing whitespace
    // and split by one or more whitespace characters to get individual components.
    const inputComponents = rawInputString.trim().split(/\s+/);

    // Initial validation: Check if exactly four numeric components were provided.
    if (inputComponents.length !== 4) {
        console.error(`Runtime Error: Expected exactly 4 numeric values, but received ${inputComponents.length}.`);
        // Terminate execution with an error status.
        process.exit(1);
    }

    // Explicitly convert string components to floating-point numbers.
    // Using parseFloat allows for decimal inputs, although the original likely implies integers.
    const firstOperand = parseFloat(inputComponents[0]);
    const secondOperand = parseFloat(inputComponents[1]);
    const thirdOperand = parseFloat(inputComponents[2]);
    const fourthOperand = parseFloat(inputComponents[3]);

    // Further validation: Check if any conversion resulted in a non-numeric value (NaN).
    if (isNaN(firstOperand) || isNaN(secondOperand) || isNaN(thirdOperand) || isNaN(fourthOperand)) {
        console.error("Data Conversion Error: One or more input values could not be parsed as valid numbers.");
        process.exit(1);
    }

    // Calculate the product of the initial pair of numbers.
    const productOfInitialPair = firstOperand * secondOperand;

    // Calculate the product of the subsequent pair of numbers.
    const productOfSubsequentPair = thirdOperand * fourthOperand;

    // Determine the highest value between the two computed products.
    // An if-else construct is used instead of a ternary operator or Math.max for structural variation.
    let greatestCalculatedProduct;
    if (productOfInitialPair > productOfSubsequentPair) {
        greatestCalculatedProduct = productOfInitialPair;
    } else {
        greatestCalculatedProduct = productOfSubsequentPair;
    }

    return greatestCalculatedProduct;
}

// Main execution block: Handles input reading and calls the processing function.
try {
    // Read all data from the standard input stream ('/dev/stdin') as a UTF-8 string.
    const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

    // Invoke the core logic function with the retrieved input.
    const finalComputedValue = processNumericProducts(standardInputContent);

    // Display the final result to the standard output.
    console.log(finalComputedValue);

} catch (executionIssue) {
    // Catch and report any potential errors that occur during file reading or other operations.
    console.error("An unhandled exception occurred during program execution:", executionIssue.message);
    process.exit(1); // Exit with an error code to indicate failure.
}