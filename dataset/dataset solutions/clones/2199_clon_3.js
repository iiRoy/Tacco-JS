function calculateValueForInput(rawTextualInput) {
    // Begin processing the raw input data provided to the function.
    // First, remove any leading or trailing whitespace to ensure clean parsing.
    const trimmedInputString = rawTextualInput.trim();

    // Implement a guard clause for empty input.
    if (!trimmedInputString) {
        console.error("Error: The provided input string is empty or contains only whitespace.");
        return; // Exit if no meaningful input.
    }

    // Convert the cleaned string into an integer, specifying base 10 for safety.
    const initialNumericValue = parseInt(trimmedInputString, 10);

    // Add robust validation for the numeric input.
    // Ensure it's a valid number and adheres to problem constraints (e.g., positive).
    if (isNaN(initialNumericValue) || initialNumericValue < 1) {
        console.error(`Error: Invalid or non-positive input received: '${trimmedInputString}'. Expected a positive integer.`);
        return; // Exit if the input is not a valid positive integer.
    }

    // Initialize a variable to track powers of two.
    // This variable will progressively grow until it exceeds the initial numeric value.
    let currentPowerOfTwo = 1;

    // This loop structure finds the smallest power of two that is strictly greater than the initial value.
    // For example, if initialNumericValue is 3, currentPowerOfTwo will become 4.
    // If initialNumericValue is 1, currentPowerOfTwo will become 2 after the first iteration.
    while (currentPowerOfTwo <= initialNumericValue) {
        // Use a bitwise left shift for efficient multiplication by 2.
        currentPowerOfTwo <<= 1;
    }

    // The final result is one less than the computed power of two.
    // This corresponds to a sequence of ones (e.g., 2^3 - 1 = 7, which is binary 111).
    const finalComputedResult = currentPowerOfTwo - 1;

    // Output the final calculated result to the standard console.
    console.log(finalComputedResult);
}

// This section handles the environment-specific input/output operations.
// It's wrapped in a separate function to isolate I/O concerns from the core logic.
function executeSolutionProcess() {
    try {
        // Dynamically import the Node.js file system module for reading input.
        const fileSystemModule = require("fs");

        // Define the standard input file path and character encoding.
        const standardInputPath = "/dev/stdin";
        const contentEncoding = "utf8";

        // Read the entire content from the standard input file synchronously.
        const receivedData = fileSystemModule.readFileSync(standardInputPath, contentEncoding);

        // Pass the received data to our main processing function.
        calculateValueForInput(receivedData);

    } catch (ioError) {
        // Catch and log any errors that occur during file reading or module loading.
        console.error("An error occurred during the input reading or processing stage:", ioError.message);
        // Optionally, provide more details for debugging.
        // console.error(ioError.stack);
    }
}

// Execute the solution process to start the program.
executeSolutionProcess();