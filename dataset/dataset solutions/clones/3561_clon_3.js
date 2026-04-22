/*
 * This module processes a single numerical input
 * from standard input to perform a specific calculation.
 * The calculation varies based on the parity (even or odd)
 * of the provided integer.
 *
 * For odd numbers, it computes the product of the two integers
 * that are closest to (input / 2).
 *
 * For even numbers, it computes the square of (input / 2).
 */
function computeProductBasedOnParity(rawInputText) {
    // Step 1: Input preparation and parsing.
    // Ensure the raw string is clean from leading/trailing whitespace.
    const trimmedInput = rawInputText.trim();

    // Convert the cleaned string into a numerical representation.
    // Using Number() constructor for type conversion, which is an alternative
    // to parseInt() or parseFloat().
    let parsedNumericValue = Number(trimmedInput);

    // Step 2: Input validation (addition of a guard clause).
    // It's crucial to ensure we're dealing with a valid, positive integer.
    // Original code did not handle invalid input explicitly.
    if (isNaN(parsedNumericValue) || !Number.isInteger(parsedNumericValue) || parsedNumericValue <= 0) {
        console.error("Error: Provided input is not a positive integer. Please provide a valid numerical value greater than zero.");
        return; // Terminate execution gracefully for invalid input.
    }

    // Step 3: Determine the parity of the input value.
    // An intermediate variable helps clarify this logical step.
    const remainderAfterDivisionByTwo = parsedNumericValue % 2;
    const isValueOdd = (remainderAfterDivisionByTwo !== 0); // Checking for non-zero remainder.

    // A variable to hold the final computed result before output.
    let finalCalculatedProduct;

    // Step 4: Conditional computation based on parity.
    if (isValueOdd) {
        // Scenario for odd numbers:
        // Original: Math.floor(input / 2) * Math.ceil(input / 2)
        // This is mathematically equivalent to ((N-1)/2) * ((N+1)/2) for odd N.
        // We'll rewrite it using these algebraic equivalents for Type III change.

        // Calculate the value just below N/2.
        const firstFactor = (parsedNumericValue - 1) / 2;
        // Calculate the value just above N/2.
        const secondFactor = (parsedNumericValue + 1) / 2;

        // Perform the multiplication.
        finalCalculatedProduct = firstFactor * secondFactor;

    } else {
        // Scenario for even numbers:
        // Original: Math.pow(input / 2, 2)
        // This can be rewritten by explicitly calculating (N/2) and then squaring it.

        // Determine half of the even number.
        const halfOfInput = parsedNumericValue / 2;

        // Square the result. Using multiplication instead of Math.pow for Type III rewrite.
        finalCalculatedProduct = halfOfInput * halfOfInput;
    }

    // Step 5: Output the final result.
    // Adding a descriptive string to the output for better user experience.
    console.log(`The result of the parity-based calculation is: ${finalCalculatedProduct}`);
}

/*
 * Utility function to abstract the process of reading
 * data from standard input.
 * (This is an added fragment for better modularity).
 */
function readStandardInputContents(sourcePath) {
    // Attempt to load the Node.js 'fs' (file system) module.
    const fileSystemHandler = require("fs");
    try {
        // Read the file content synchronously and decode it as UTF-8.
        return fileSystemHandler.readFileSync(sourcePath, "utf8");
    } catch (ioError) {
        // Log an error if file reading fails and return an empty string
        // or rethrow, depending on desired error handling strategy.
        console.error(`Failed to read input from ${sourcePath}: ${ioError.message}`);
        return ""; // Returning empty string to allow main function to handle it as invalid input.
    }
}

// Main execution block:
// Define the standard input file path.
const stdinFilePath = "/dev/stdin";

// Retrieve the raw string content from standard input using the helper.
const obtainedRawData = readStandardInputContents(stdinFilePath);

// Invoke the primary processing function with the obtained data.
// This initiates the entire logic flow.
computeProductBasedOnParity(obtainedRawData);