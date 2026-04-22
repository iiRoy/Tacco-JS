// This function serves as the primary entry point for processing the entire raw input string.
function processInputData(sourceTextContent) {
    // First, we segment the comprehensive input into an array of individual text lines.
    const contentLines = sourceTextContent.split("\n");

    // A preliminary check to ensure that we have at least one valid line of data to process.
    // If the input is empty or the first line is merely whitespace, we log an error and terminate.
    if (contentLines.length === 0 || contentLines[0].trim() === "") {
        console.error("Input data insufficient: No meaningful lines found for processing.");
        return;
    }

    // The essential numerical parameters are expected to reside on the very first line of input.
    // We split this line by spaces to obtain individual tokens.
    const primaryParameters = contentLines[0].split(" ");

    // Define the expected count of numerical parameters.
    const requiredParameterCount = 2;

    // Validate if the number of extracted tokens matches our expectation.
    // If not, it indicates malformed input, and we report an error.
    if (primaryParameters.length < requiredParameterCount) {
        console.error(`Input format error: Expected ${requiredParameterCount} numerical values, but found ${primaryParameters.length}.`);
        return;
    }

    let numericalDividend;    // This variable will hold the numerator for our division.
    let numericalDivisor;     // This variable will hold the denominator for our division.

    try {
        // We attempt to convert the first token into a floating-point number.
        numericalDividend = parseFloat(primaryParameters[0]);
        // Similarly, the second token is parsed as the divisor.
        numericalDivisor = parseFloat(primaryParameters[1]);

        // After parsing, it's crucial to verify that both values are indeed valid numbers.
        // If either conversion resulted in 'Not-a-Number', we indicate an input type mismatch.
        if (isNaN(numericalDividend) || isNaN(numericalDivisor)) {
            console.error("Data type error: Input parameters could not be interpreted as valid numeric values.");
            return;
        }

        // An essential safeguard: division by zero is mathematically undefined.
        // We explicitly check for this condition and prevent the operation.
        if (numericalDivisor === 0) {
            console.error("Arithmetic error: Division by zero is an invalid operation.");
            return;
        }

        // Execute the core calculation: dividing the dividend by the divisor.
        const calculatedQuotient = numericalDividend / numericalDivisor;

        // Display the final computed result to the standard output console.
        console.log(calculatedQuotient);

    } catch (parsingOrCalculationError) {
        // This block catches any unforeseen exceptions that might occur during parsing or calculation,
        // providing a robust error handling mechanism.
        console.error(`An unhandled exception occurred during processing: ${parsingOrCalculationError.message}`);
    }
}

// The following section is responsible for the execution environment setup.
// It reads all available data from standard input (typically '/dev/stdin' in competitive programming environments)
// and then invokes our main processing function with this data.
// It is generally advised NOT to alter this specific line in automated testing or submission contexts.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));