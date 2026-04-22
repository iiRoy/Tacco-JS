/**
 * Processes a string input containing three space-separated integers (L, R, d)
 * and calculates the count of numbers within the inclusive range [L, R]
 * that are perfectly divisible by 'd'.
 * The final tally is then printed to the standard output.
 *
 * @param {string} incomingDataPayload - The raw input string, typically sourced from standard input.
 *                                     Expected format example: "10 20 5\n"
 */
function ProcessDivisibleCount(incomingDataPayload) {
    // --- Input Validation and Initial Parsing Steps ---

    // First, ensure the provided input is a non-empty string.
    // This acts as a primary guard clause for malformed or missing data.
    if (typeof incomingDataPayload !== 'string' || incomingDataPayload.length === 0) {
        console.error("Error: The input data stream was found to be invalid or empty.");
        return; // Exit early if input is unusable.
    }

    // Sanitize the input line by removing any leading or trailing whitespace.
    // This helps in consistent parsing, especially with newline characters.
    const sanitizedInputLine = incomingDataPayload.trim();

    // Split the cleaned line into individual string tokens based on one or more whitespace characters.
    // This approach is more robust than splitting by a single space.
    const stringParameters = sanitizedInputLine.split(/\s+/);

    // Verify that the expected number of parameters (three: L, R, d) has been received.
    const REQUIRED_PARAMETER_QUANTITY = 3;
    if (stringParameters.length < REQUIRED_PARAMETER_QUANTITY) {
        console.error(`Error: Insufficient parameters. Expected ${REQUIRED_PARAMETER_QUANTITY} (L, R, d), but only received ${stringParameters.length}.`);
        return;
    }

    // Convert the string parameters into their numeric equivalents.
    // The `Number()` function is used for explicit type conversion.
    const lowerBoundValue = Number(stringParameters[0]);
    const upperBoundValue = Number(stringParameters[1]);
    const modulusFactor = Number(stringParameters[2]);

    // Validate that all parameters successfully converted to valid numbers.
    // `isNaN` checks for "Not-a-Number" results from parsing failures.
    if (isNaN(lowerBoundValue) || isNaN(upperBoundValue) || isNaN(modulusFactor)) {
        console.error("Error: One or more input parameters could not be successfully parsed as valid numbers.");
        return;
    }

    // --- Core Logic Pre-conditions and Setup ---

    // Crucially, prevent division by zero, which is mathematically undefined.
    if (modulusFactor === 0) {
        console.error("Error: The divisor (modulus factor) cannot be zero. Please provide a non-zero value.");
        return;
    }

    // Initialize a counter variable to keep track of numbers meeting the criteria.
    let divisibleNumbersCounter = 0;

    // Define a small helper function to encapsulate the divisibility check.
    // This improves readability and is a structural addition (Type III).
    const checkDivisibility = (targetNumber, factor) => {
        return targetNumber % factor === 0;
    };

    // --- Iteration and Calculation ---

    // Loop through the entire range, from the lower boundary to the upper boundary, inclusive.
    // Using `let` for the loop variable is standard in modern JavaScript.
    for (let currentIterationNumber = lowerBoundValue; currentIterationNumber <= upperBoundValue; currentIterationNumber++) {
        // Apply the divisibility check using the helper function.
        if (checkDivisibility(currentIterationNumber, modulusFactor)) {
            // Increment the counter if the current number is perfectly divisible.
            divisibleNumbersCounter++;
        }
    }

    // --- Final Output ---

    // Display the accumulated count of numbers that were divisible by the modulus factor.
    console.log(divisibleNumbersCounter);
}

// --- Input Acquisition and Execution Trigger ---

// Obtain a reference to the Node.js File System module.
const fileSystemModuleRef = require("fs");

// Specify the common path for standard input in Unix-like environments.
const standardInputFilePath = "/dev/stdin";

// Define the character encoding to ensure correct interpretation of input data.
const fileEncodingType = "utf8";

// Synchronously read the entire content of the standard input.
// The result is typically a Buffer, so `.toString()` is crucial for text processing.
const rawInputContent = fileSystemModuleRef.readFileSync(standardInputFilePath, fileEncodingType);

// Invoke the main processing function with the collected input string.
ProcessDivisibleCount(rawInputContent.toString());