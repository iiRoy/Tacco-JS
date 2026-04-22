// This module is designed to process a single numerical input from a file
// and perform a specific mathematical operation, then output the result modulo a large prime.

/**
 * Processes a raw string input, converts it to a number, performs a calculation,
 * and prints the result modulo a predefined prime.
 *
 * @param {string} rawInputString - The raw string data read from the input source.
 *                                  Expected to be a string representation of an integer.
 */
function processNumericalInput(rawInputString) {
    // Define a constant for the modulo operation.
    // This value is commonly used in competitive programming to prevent integer overflow
    // and to ensure results fit within specific ranges. It's 10^9 + 7.
    const MODULO_VALUE = 1000000000 + 7;

    // Step 1: Parse the input string into an integer.
    // Using parseInt with radix 10 ensures the string is interpreted as a decimal number.
    let parsedNumber = parseInt(rawInputString, 10);

    // Step 2: Validate the parsed input.
    // If the input string could not be converted to a valid number,
    // log an error and terminate the function gracefully.
    if (isNaN(parsedNumber)) {
        console.error("Error: The provided input is not a valid numerical string. Please provide an integer.");
        return; // Exit the function if input is invalid.
    }

    // Step 3: Perform the core calculation.
    // The original calculation was N*N - N.
    // This can be refactored to N * (N - 1) for potentially minor performance benefits
    // or just as an alternative algebraic representation.
    // Introducing an intermediate variable for (N - 1) makes the steps explicit.
    const decrementedN = parsedNumber - 1;
    let intermediateCalculation = parsedNumber * decrementedN;

    // Step 4: Apply the modulo operation to the calculated result.
    // This ensures the final output is within the range [0, MODULO_VALUE - 1].
    const finalModuloResult = intermediateCalculation % MODULO_VALUE;

    // Step 5: Output the final computed value to the standard console.
    console.log(finalModuloResult);
}

// --- Main Execution Block ---
// This section handles reading input from the file system and invoking the processing function.
// A try-catch block is used to gracefully handle potential errors during file operations.
try {
    // Specify the path for standard input, typically /dev/stdin on Unix-like systems.
    const standardInputPath = "/dev/stdin";

    // Use Node.js 'fs' module to synchronously read the file content.
    // The 'utf8' encoding ensures correct character interpretation.
    // .trim() removes any leading or trailing whitespace (like newlines) from the input string.
    const fileContents = require("fs").readFileSync(standardInputPath, "utf8").trim();

    // Call the main processing function with the cleaned content from the file.
    processNumericalInput(fileContents);

} catch (ioError) {
    // Catch any errors that occur during file reading (e.g., file not found, permission issues).
    console.error("An error occurred while attempting to read the input file:", ioError.message);
    // Exit the process with a non-zero status code to indicate an error.
    process.exit(1);
}