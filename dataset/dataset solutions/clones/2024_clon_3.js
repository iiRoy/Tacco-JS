// This function serves as the primary entry point for processing external textual data.
function ProcessInputData(sourceString) {
    // A preliminary check to ensure the provided input is indeed a string.
    // If not, an error is logged, and the function terminates early to prevent unexpected behavior.
    if (typeof sourceString !== 'string') {
        console.error("The supplied input must be a string type. Operation aborted.");
        return; // Halt execution.
    }

    // Divide the entire input string into an array of individual lines,
    // using the newline character as the delimiter.
    const dataLines = sourceString.split('\n');

    // Establish symbolic constants for the two different unit denominations involved in the calculation.
    const LARGE_UNIT_VALUE = 500;
    const SMALL_UNIT_VALUE = 5;

    // Implement a guard clause to verify that there is at least one meaningful line of data.
    // An empty array or a first line consisting only of whitespace would indicate invalid input.
    if (dataLines.length === 0 || dataLines[0].trim() === '') {
        console.error("No discernible data was found within the input string. Execution halted.");
        return;
    }

    // Attempt to convert the content of the very first line into an integer.
    // The radix (base 10) is explicitly provided for robustness.
    let initialNumericValue = Number.parseInt(dataLines[0], 10);

    // Validate if the parsing operation resulted in a legitimate number.
    // If it's Not-a-Number (NaN), it signifies an invalid numeric input.
    if (isNaN(initialNumericValue)) {
        console.error("The initial line of input does not represent a valid numerical quantity.");
        return;
    }

    // Handle potential negative input values. While the calculation logic might still work,
    // for this specific problem context, a non-negative value is typically expected.
    // We'll proceed by taking the absolute value and issue a warning.
    if (initialNumericValue < 0) {
        console.warn("A negative input value was detected. Proceeding with its absolute equivalent for computation.");
        initialNumericValue = Math.abs(initialNumericValue); // Transform to positive.
    }

    // Calculate the maximum number of times the large unit denomination can be
    // extracted from the total initial value. Math.trunc ensures integer division.
    let countOfFiveHundreds = Math.trunc(initialNumericValue / LARGE_UNIT_VALUE);

    // Determine the remainder of the initial value after all possible large units have been accounted for.
    let remainingAmountAfterLarge = initialNumericValue % LARGE_UNIT_VALUE;

    // From the remaining amount, calculate how many times the small unit denomination fits.
    // Again, Math.trunc is used for precise integer division.
    let countOfFives = Math.trunc(remainingAmountAfterLarge / SMALL_UNIT_VALUE);

    // Aggregate the counts of both large and small units to arrive at the final composite total.
    const grandTotalOfItems = countOfFiveHundreds + countOfFives;

    // Display the computed grand total to the standard output.
    console.log(grandTotalOfItems);
}

// This immediately-invoked function expression (IIFE) handles the operational environment setup,
// specifically reading input from standard input and initiating the processing logic.
(function() {
    try {
        // Dynamically import the Node.js file system module for I/O operations.
        const fileSystemHandler = require("fs");
        // Read the entire content of the standard input stream (typically /dev/stdin on Linux/macOS)
        // as a UTF-8 encoded string. This is a synchronous operation.
        const rawInputBuffer = fileSystemHandler.readFileSync("/dev/stdin", "utf8");
        // Pass the raw, unparsed input string to our main processing function.
        ProcessInputData(rawInputBuffer);
    } catch (fileReadError) {
        // Should any error occur during the file reading process (e.g., file not found, permissions),
        // capture it and log an informative message to the console.
        console.error("An exceptional condition was encountered while attempting to read from /dev/stdin:", fileReadError.message);
        // In a production system, one might consider providing a default input,
        // attempting a retry, or exiting the application gracefully at this point.
    }
})();