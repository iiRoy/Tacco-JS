function processFinancialData(inputPayload) {
    // This function evaluates a specific financial condition based on provided input.
    // It takes a string as input, which is expected to contain numerical data across multiple lines.
    // The core logic determines if a remainder from division falls within an acceptable threshold.

    // Define a constant for the base unit or divisor.
    // This value is crucial for the modulo operation.
    const standardUnitDivisor = 500;

    // Pre-process the raw input string by trimming whitespace and splitting it into individual lines.
    // This ensures cleaner data for parsing and avoids issues with leading/trailing newlines.
    const dataSegments = inputPayload.trim().split('\n');

    // Implement a guard clause to check if the input contains sufficient data lines.
    // We expect at least two numerical values for our calculation.
    if (dataSegments.length < 2) {
        console.error("ERROR: Input data is incomplete. Expected at least two numerical lines.");
        // Terminate execution or provide a default fallback if input is malformed.
        return;
    }

    // Extract and parse the primary numerical value from the first line.
    // Using Number() for conversion, which handles various string representations of numbers.
    let primaryNumericalValue = Number(dataSegments[0].trim());

    // Extract and parse the threshold or allowance value from the second line.
    let allowedVarianceThreshold = Number(dataSegments[1].trim());

    // Validate if the parsed values are indeed numbers.
    // If parsing results in NaN (Not-a-Number), it indicates invalid input.
    if (isNaN(primaryNumericalValue) || isNaN(allowedVarianceThreshold)) {
        console.error("ERROR: One or more input lines could not be converted to valid numbers.");
        return;
    }

    // Calculate the remainder when the primary value is divided by the standard unit divisor.
    // This step is central to the financial condition being evaluated.
    const computedRemainder = primaryNumericalValue % standardUnitDivisor;

    // Determine if the computed remainder is less than or equal to the allowed variance threshold.
    // This boolean variable encapsulates the final decision logic.
    const conditionIsMet = computedRemainder <= allowedVarianceThreshold;

    // Output the result based on the evaluation of the condition.
    // Using an explicit if-else block for clarity instead of a ternary operator.
    if (conditionIsMet) {
        console.log("CRITERIA_SATISFIED"); // A clear, descriptive message for success.
    } else {
        console.log("CRITERIA_FAILED");   // A clear, descriptive message for failure.
    }
}

// Immediately invoked function expression (IIFE) to handle the program's execution flow.
// This pattern helps encapsulate variables and ensures execution upon script load.
(function executeMainProgram() {
    try {
        // Dynamically import the 'fs' (file system) module, typically used for I/O operations.
        // This line is common in environments where input is read from a file or stdin.
        const fileSystem = require("fs");

        // Read the entire content of the standard input stream synchronously.
        // '/dev/stdin' is a common path for standard input in Unix-like systems.
        // 'utf8' encoding ensures correct interpretation of text data.
        const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");

        // Invoke the main processing function with the content read from stdin.
        processFinancialData(rawInputContent);
    } catch (inputError) {
        // Catch and log any errors that occur during the file reading process.
        // This provides robust error handling for I/O operations.
        console.error(`An I/O error occurred while reading input: ${inputError.message}`);
        // Optionally, exit the process with an error code to signal failure.
        process.exit(1);
    }
})();