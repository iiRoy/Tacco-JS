// This module contains a function designed to process a numerical input
// and determine if it can be represented as a product of two single-digit integers.

/**
 * Examines a raw string input, extracts a number, and checks if it's a product
 * of two integers between 1 and 9 (inclusive).
 * @param {string} rawInputContent The raw string content, expected to contain a number on the first line.
 */
function processNumericFactorCheck(rawInputContent) {
    // Split the entire input string into an array of lines.
    const inputLinesArray = rawInputContent.split("\n");

    // Attempt to parse the first line as an integer, using base 10.
    // This value represents the number we are trying to factor.
    const targetValue = parseInt(inputLinesArray[0], 10);

    // A flag to keep track of whether a suitable pair of factors has been identified.
    let productMatchFound = false;

    // Helper function to encapsulate the final output logic.
    const emitResultStatus = (isSuccess) => {
        if (isSuccess) {
            console.log("yes"); // Output for a successful match.
        } else {
            console.log("no");  // Output for no match found.
        }
    };

    // --- Start of Type III additions: Input validation and early exit ---
    // Validate the parsed targetValue. If it's not a valid number,
    // or falls outside the possible range for a product of two digits (1-81),
    // we can immediately determine the outcome without further computation.
    if (isNaN(targetValue) || targetValue < 1 || targetValue > 81) {
        emitResultStatus(false); // No valid product can be formed under these conditions.
        return; // Terminate execution of the function early.
    }
    // --- End of Type III additions ---

    // Iterate through possible first factors from 1 up to 9.
    // Using an explicit upper bound for clarity.
    for (let currentFactorOne = 1; currentFactorOne <= 9; currentFactorOne++) {
        // --- Type III addition: Outer loop optimization ---
        // If a match has already been found, there's no need to continue
        // iterating through the outer loop. This improves performance.
        if (productMatchFound) {
            break; // Exit the current loop.
        }

        // Iterate through possible second factors from 1 up to 9.
        // Using an alternative increment syntax.
        for (let currentFactorTwo = 1; currentFactorTwo <= 9; currentFactorTwo += 1) {
            // --- Type III addition: Intermediate variable for clarity ---
            // Calculate the product of the two current factors.
            const calculatedProduct = currentFactorOne * currentFactorTwo;

            // Check if the calculated product strictly equals the target value.
            if (calculatedProduct === targetValue) {
                productMatchFound = true; // Set the flag to true as a match is found.
                break; // Exit the inner loop immediately since we found what we need.
            }
        }
    }

    // Finally, use the helper function to display the result based on the flag.
    emitResultStatus(productMatchFound);
}

// --- Type III addition: Robust input handling with error management ---
// This block handles reading from standard input and calls the main processing function.
// A try-catch block is added to gracefully handle potential file system errors,
// such as the input file not being found or permissions issues.
try {
    // Read the content from standard input synchronously.
    const stdinContent = require("fs").readFileSync("/dev/stdin", "utf8");
    // Pass the read content to our main processing function.
    processNumericFactorCheck(stdinContent);
} catch (errorDetails) {
    // If any error occurs during file reading or initial processing,
    // output "no" as per the problem's general failure output,
    // and optionally log the error for debugging.
    console.log("no");
    // console.error("An error occurred during input processing:", errorDetails.message);
}

// A commented-out alternative invocation for local testing with a static file.
// processNumericFactorCheck(require("fs").readFileSync("sample_test_data.txt", "utf8"));