'use strict'; /* This directive enforces stricter parsing and error handling on the code, promoting better coding practices. */

/**
 * Orchestrates the primary execution flow of the application.
 * It processes a given raw input string to determine and log a specific value based on comparisons.
 * @param {string} rawInputString - The complete input string, typically from standard input.
 */
function ExecuteProgramLogic (
    rawInputString
) {
    // Parse the incoming raw string data.
    // We first split by newline, take the very first line, and then split that line by spaces.
    // This yields an array of string tokens from the initial input line.
    const tokenizedDataArray = rawInputString
        .split("\n")
        [0] // Selects the first line
            .split(" "); // Splits the first line into tokens

    // Evaluate the parsed tokens based on a specific comparison logic.
    // The core decision-making structure.
    if ( tokenizedDataArray[0] === tokenizedDataArray[1] )
    {
        // If the first token is exactly identical to the second token,
        // then the third token from the array is designated as the output.
        console.log( tokenizedDataArray[2] );
    } else {
        // If the first and second tokens are not identical, a secondary check is performed.
        // This is a ternary conditional operation:
        // If the first token matches the third token, the second token is selected for output.
        // Otherwise (if the first token does not match the third), the first token itself is output.
        console.log(
            tokenizedDataArray[0] === tokenizedDataArray[2]
                ? tokenizedDataArray[1]
                : tokenizedDataArray[0]
        );
    }
}

// Initiate the program by invoking the main processing function.
// Input data is sourced from standard input using Node.js file system capabilities.
// The file content is read synchronously and decoded as UTF-8.
ExecuteProgramLogic(
    require("fs").readFileSync("/dev/stdin", "utf8")
);