// Import the necessary module for file system operations.
const fileSystemModule = require("fs");

// Define the path to the standard input stream.
const inputSourceIdentifier = "/dev/stdin";

// Function to calculate the specific value based on an input number.
// This function computes (n * (n + 1)) / 2 + 1, which represents the n-th triangular number plus one.
function computeSpecialValue(inputNumber) {
    // It's good practice to ensure the input is treated as a number for arithmetic operations.
    // Although JavaScript often coerces, explicit conversion can prevent subtle bugs.
    const validatedNumber = Number(inputNumber);

    // Calculate the triangular number component: n * (n + 1) / 2.
    const triangularPart = (validatedNumber * (validatedNumber + 1)) / 2;

    // Add the constant offset of 1 to complete the required calculation.
    const finalComputedValue = triangularPart + 1;

    return finalComputedValue;
}

// --- Main script execution flow ---

let rawInputContent;
try {
    // Read the entire content from the specified input source synchronously.
    // The content is expected to be UTF-8 encoded text.
    rawInputContent = fileSystemModule.readFileSync(inputSourceIdentifier, "utf8");
} catch (readError) {
    // If there's an error reading the file (e.g., file not found, permissions),
    // log the error and gracefully exit or fallback to an empty string to prevent further processing issues.
    console.error(`An error occurred while attempting to read the input file at ${inputSourceIdentifier}: ${readError.message}`);
    // Set content to an empty string so subsequent operations don't throw errors.
    rawInputContent = "";
}

// Split the raw input content into individual tokens using one or more whitespace characters as a delimiter.
// The `+` in `/\s+/` ensures that multiple consecutive spaces are treated as a single delimiter.
// Then, filter out any empty strings that might result from leading/trailing whitespace or multiple delimiters.
const inputTokens = rawInputContent.split(/\s+/).filter(token => token.trim() !== "");

// Iterate over each processed token obtained from the input array.
// This loop will process every non-empty, whitespace-trimmed string token.
for (const currentTokenString of inputTokens) {
    // Attempt to convert the string token into a floating-point number.
    // parseFloat is used to handle potential decimal numbers, though integers are expected here.
    const numericValue = parseFloat(currentTokenString);

    // Validate if the conversion resulted in a valid number.
    // If `parseFloat` returns `NaN` (Not a Number), it means the token was not a valid numeric string.
    if (isNaN(numericValue)) {
        // For non-numeric input, we skip this token and proceed to the next one.
        // In a more complex application, one might log a warning or throw an error.
        // console.warn(`Skipping invalid non-numeric input token: '${currentTokenString}'`);
        continue;
    }

    // Perform the main calculation using our dedicated helper function.
    const calculatedOutput = computeSpecialValue(numericValue);

    // Display the computed result to the standard output, followed by a newline.
    console.log(calculatedOutput);
}