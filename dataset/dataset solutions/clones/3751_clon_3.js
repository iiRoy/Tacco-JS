function processInputData(rawDataString) {
    // This function is designed to take a raw string input, parse it,
    // perform a specific mathematical calculation, and then output the result.

    // Step 1: Input Validation
    // Ensure the provided data is actually a string and not empty after trimming whitespace.
    if (typeof rawDataString !== 'string' || rawDataString.trim().length === 0) {
        console.error("Error: The provided input data is either not a string or is entirely empty.");
        return; // Abort processing if input is invalid.
    }

    // Step 2: Data Parsing
    // Clean up the input string by trimming leading/trailing whitespace,
    // then split it into an array of string components using one or more whitespace characters as delimiters.
    const stringComponents = rawDataString.trim().split(/\s+/);

    // Step 3: Component Count Validation
    // Verify that we have at least two components, as required for the calculation.
    if (stringComponents.length < 2) {
        console.error("Error: Insufficient numeric components detected in the input string. Expected at least two.");
        return; // Abort if not enough components.
    }

    // Step 4: Numeric Conversion and Validation
    // Convert the first two string components into base-10 integers.
    const exponentValue = parseInt(stringComponents[0], 10);
    const multiplicationFactor = parseInt(stringComponents[1], 10);

    // Check if the parsed values are indeed valid numbers.
    if (isNaN(exponentValue) || isNaN(multiplicationFactor)) {
        console.error("Error: One or both of the extracted components are not valid numerical values.");
        return; // Abort if conversion failed.
    }

    // Step 5: Define Constants and Perform Calculation
    // Establish the constant base for the exponentiation operation.
    const fixedBaseForPower = 100;

    // Calculate the power component using the ES6 exponentiation operator.
    // This is functionally equivalent to Math.pow(fixedBaseForPower, exponentValue).
    const intermediatePowerResult = fixedBaseForPower ** exponentValue;

    // Finally, compute the product of the power result and the multiplication factor.
    const finalCalculatedResult = intermediatePowerResult * multiplicationFactor;

    // Step 6: Output the Result
    // Display the computed numerical result to the console.
    console.log(finalCalculatedResult);
}

// Main execution block: Handles reading input from the file system and invoking the processing function.
// Define constants for file system interaction to enhance readability and maintainability.
const fileSystemModule = require("fs"); // Import the Node.js file system module.
const standardInputSourcePath = "/dev/stdin"; // Specify the path for standard input.
const characterEncodingType = "utf8"; // Define the character encoding for reading the file.

try {
    // Attempt to synchronously read the content from the designated standard input file.
    // The content is expected to be a string based on the specified encoding.
    const rawInputContent = fileSystemModule.readFileSync(standardInputSourcePath, characterEncodingType);

    // Pass the acquired raw string content to our primary processing function.
    processInputData(rawInputContent);
} catch (fileReadingError) {
    // If any error occurs during the file reading process, catch it and log an informative message.
    console.error("An error occurred while attempting to retrieve input data from the file system:", fileReadingError.message);
    // In a more robust application, additional error handling (e.g., exiting the process or providing default data) might be implemented here.
}