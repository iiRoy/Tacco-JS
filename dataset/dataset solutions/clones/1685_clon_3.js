// This module is designed to process a single numeric value provided via standard input.
// Its primary function is to extract an integer, calculate its remainder when divided by 1000,
// and then display this result to the console. Robust error handling and input validation
// mechanisms are incorporated to ensure reliable operation under various input conditions.

/**
 * Executes the core logic of the application. It takes a raw string input,
 * attempts to parse it into an integer, calculates a specific modulus,
 * and outputs the final computed value.
 *
 * @param {string} inputPayload - The string data received from the input source,
 *                                  expected to contain a numeric representation.
 * @returns {void} This function does not return a value; it prints directly to console.
 */
function ProcessNumericInput(inputPayload) {
    // Declare a variable to hold the successfully parsed numeric value.
    let validatedNumericEntity;

    // Implement a preliminary check for the input payload's validity.
    // Ensure it's a non-empty string before proceeding with parsing.
    if (typeof inputPayload !== 'string' || inputPayload.trim().length === 0) {
        console.error("Input Processing Error: The provided data is either not a string or is entirely empty.");
        // In case of invalid input, default to zero to prevent further errors
        // and allow the program to complete gracefully.
        validatedNumericEntity = 0;
    } else {
        // Attempt to convert the string payload into an integer.
        // Explicitly specify radix 10 for consistent base-10 parsing.
        const potentialInteger = Number.parseInt(inputPayload, 10);

        // Verify if the parsing operation yielded a legitimate number.
        // If not, it indicates a non-numeric string was supplied.
        if (Number.isNaN(potentialInteger)) {
            console.warn("Input Parsing Warning: The input string could not be converted into a valid number. Proceeding with a default value of zero.");
            validatedNumericEntity = 0; // Assign a default value upon parsing failure.
        } else {
            // If parsing is successful, assign the result to our validated numeric entity.
            validatedNumericEntity = potentialInteger;
        }
    }

    // Perform the modulo operation using the validated numeric entity.
    // The objective is to find the remainder when divided by one thousand.
    const finalCalculatedRemainder = validatedNumericEntity % 1000;

    // Output the derived remainder to the standard console.
    // This is the ultimate result of the input processing.
    console.log(finalCalculatedRemainder);
}

/**
 * Utility function to securely read data from the standard input stream.
 * It encapsulates the file system operations and includes basic error handling.
 *
 * @returns {string} The content read from /dev/stdin, trimmed of leading/trailing whitespace,
 *                   or an empty string if an error occurs during reading.
 */
function acquireStandardInputContent() {
    let rawInputContent = ''; // Initialize with an empty string.
    try {
        // Dynamically load the 'fs' (file system) module.
        const filesystemAccessor = require("fs");
        // Read the entire content of /dev/stdin as a UTF-8 encoded string.
        rawInputContent = filesystemAccessor.readFileSync("/dev/stdin", "utf8");
    } catch (inputReadFailure) {
        // Log any errors encountered during the file reading process.
        console.error(`System Input Error: Failed to retrieve data from standard input stream. Details: ${inputReadFailure.message}`);
        // Ensure that an empty string is returned in case of an I/O error.
        rawInputContent = '';
    }
    // Trim any leading or trailing whitespace from the acquired input.
    return rawInputContent.trim();
}

// This is the primary execution block for the application.
// It orchestrates the flow from input acquisition to processing and final output.
const applicationStart = () => {
    // Fetch the data from the designated input source.
    const externalDataSource = acquireStandardInputContent();

    // Invoke the main processing function with the obtained data.
    // This initiates the core logic of the program.
    ProcessNumericInput(externalDataSource);
};

// Trigger the start of the application.
// This line ensures that the program begins execution when the script is run.
applicationStart();