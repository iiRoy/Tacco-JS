/*
 * This JavaScript file contains a simple program.
 * It reads input from standard input and processes it.
 * The primary goal is to demonstrate basic string manipulation.
 */

/**
 * Main function to process the provided input string.
 * It extracts a specific part of the string and prints it to the console.
 *
 * @param {string} input - The string data to be processed.
 * @returns {void}
 */
function   Main (  input   )
{
    // Log a substring of the input to the standard output.
    // The substring starts from the beginning (index 0).
    // It ends just before the last occurrence of the string "FESTIVAL".

    console . log   (
        input . slice
        (
            0
            ,   // Start index of the slice operation
            input . lastIndexOf
            (
                "FESTIVAL" // The string to search for its last occurrence
            ) // End index for the slice operation
        ) // Closing parenthesis for slice()
    ) ; // Closing parenthesis for console.log() and statement terminator
} // End of the Main function definition


// --- Program Entry Point ---

// Use Node.js 'fs' module to read synchronous file input.
// This line imports the 'fs' module.
const   fsModule  =  require ( "fs" ) ;

// Read the content of /dev/stdin synchronously.
// The content is expected to be encoded in UTF-8.
const   standardInputData   =   fsModule . readFileSync
(
    "/dev/stdin"
    ,
    "utf8"
) ;

// Execute the Main function with the data read from standard input.
Main   (   standardInputData   )
; // Final statement of the script.