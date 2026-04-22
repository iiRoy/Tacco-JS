/*
 * This JavaScript program is designed to process an input string
 * and determine the presence of the digit '2' within it.
 * It strictly adheres to a specific logic for outputting results.
 */
function   Main
(
    input // The primary string input provided to the function.
)
{
    // The core logic of the program is contained within this console.log statement.
    // It utilizes a ternary operator to conditionally output a value.
    console.log
    (
        // First part of the ternary condition: Check if the 'match' operation returns null.
        // The 'match' method is called on the 'input' string with a regular expression.
        (
              input
                  .match // Invoke the 'match' method on the input string.
                      (
                          /2/g // Regular expression: search for all occurrences ('g' flag) of the digit '2'.
                      )
            === // Strict equality comparison operator.
            null // Check if the result of the match operation is 'null', indicating no matches.
        )
        ? // If the condition (input.match(/2/g) === null) is true...
        0 // ...then output the integer 0. This signifies no '2's were found.
        : // Otherwise (if the condition is false, meaning '2's were found)...
        input // Re-evaluate the match for the output.
            .match // Invoke the 'match' method again.
                (
                    /2/g // The same regular expression, ensuring consistent matching.
                )
    )
    ; // Statement terminator for the console.log call.
} // End of the Main function definition.


// --- Program Execution Start ---
// This section handles the initial setup and function call.
// It involves reading data from standard input using Node.js modules.
Main // Call the Main function to initiate the program's logic.
(
    require("fs") // Access the built-in 'fs' (file system) module.
        .readFileSync // Call the 'readFileSync' method from the 'fs' module.
            (
                "/dev/stdin", // The path to the standard input file, common in competitive programming environments.
                "utf8"        // Specify the encoding for reading the file content as UTF-8.
            )
)
; // Statement terminator for the Main function call.