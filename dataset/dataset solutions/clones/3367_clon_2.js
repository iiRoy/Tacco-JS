/*
 * This JavaScript module is designed to perform a specific analysis
 * on input text data, primarily focusing on counting occurrences
 * of a particular numerical character.
 * It serves as a fundamental processing unit for various text-based tasks.
 */
function ProcessInput(
    rawSource // The primary input parameter: a string containing the raw data to be processed.
) {

    // Begin the core logical operation of the function.
    // The goal here is to identify and report the presence of the digit '2'.
    // A regular expression is utilized to achieve this, searching globally for all instances.
    console

        .log(

            // The ternary operator is employed to conditionally determine the output.
            // It checks if any matches for the digit '2' were found in the 'rawSource'.
            ( rawSource.match( /2/g ) === null )

                // If 'rawSource.match(/2/g)' returns 'null', it means no '2's were found.
                // In this specific scenario, the output should be the numerical zero.
                ?   0

                // Otherwise, if matches *were* found, 'rawSource.match(/2/g)' returns an array
                // containing all the matched substrings (in this case, an array of '2's).
                // This array itself is then used as the output.
                :   rawSource.match( /2/g )
        )
    ; // The statement concludes here, printing the determined value to the standard output.

} // End of the main 'ProcessInput' function definition.


// --- Global Execution Flow Starts Here ---

// To execute the 'ProcessInput' function, we first need to obtain the necessary input data.
// In this environment, input is typically read from the standard input stream.

// Step 1: Load the Node.js built-in 'fs' (File System) module.
// This module provides utilities for interacting with the file system, including reading files.
const fileSystemAccess = require(
    "fs"
);

// Step 2: Read the content from the standard input.
// The '/dev/stdin' path is a common convention for standard input in Unix-like systems.
// The 'utf8' encoding ensures proper interpretation of text characters.
const receivedTextContent = fileSystemAccess

    .readFileSync(
        "/dev/stdin", // Specifies the file path to read from.
        "utf8"        // Defines the character encoding for the file content.
    )
;

// Step 3: Invoke the primary processing function with the acquired data.
// This initiates the analysis and output generation.
ProcessInput(
    receivedTextContent
); // Function call with the prepared input string.