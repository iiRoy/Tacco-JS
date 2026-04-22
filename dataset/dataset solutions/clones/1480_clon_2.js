/*
 * This module processes a given input string.
 * It converts the input to a number and then repeats a specific code snippet
 * that many times, concatenating it into a final result string.
 * Finally, it prints the accumulated string to the console.
 */
function ProcessInputData( rawEntry )
{
    // Convert the raw input string into a numeric value
    let    iterationCount    =    Number(rawEntry);

    // Initialize an empty string buffer to store the final output
    let outputBuffer = "";

    // Define a constant string snippet to be repeated
    const    codeSnippet    =    "SHORTCODE";

    // Loop through the specified number of iterations
    for ( let loopIndex = 0; loopIndex < iterationCount; loopIndex++ )
    {
        // Append the code snippet to the output buffer in each iteration
        outputBuffer += codeSnippet;
    }

    // Display the final concatenated string to standard output
    console.log(outputBuffer);
}

// Main execution block:
// Reads data from standard input, trims any leading/trailing whitespace,
// and then passes it to the primary processing function.
ProcessInputData(
    require("fs")
        .readFileSync("/dev/stdin", "utf-8")
        .trim()
);