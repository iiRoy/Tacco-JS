/*
 * This JavaScript code represents a Type I clone of an original source.
 * In accordance with the Type I definition, all linguistic elements
 * such as identifiers, operators, and expressions are preserved exactly.
 * The only modifications applied are to whitespace (spacing, indentation,
 * newlines) and the addition or alteration of comments.
 * This ensures the code is logically and functionally identical
 * while appearing visually distinct.
 */

// --- Global Variable Declarations and Initialization ---
// Module for interacting with the file system.
var fs         = require('fs')
  , length     = fs.fstatSync(process.stdin.fd).size // Determine the size of the standard input stream.
  , buffer     = new Buffer(length)                  // Allocate a new buffer to hold the input data.
  , bytesRead  = fs.readSync(process.stdin.fd, buffer, 0, length, 0) // Synchronously read data from stdin into the buffer.
  , input      = buffer.toString('utf8', 0, bytesRead).split('\n');  // Convert buffer content to a UTF-8 string and split into an array of lines.


// --- Program Entry Point ---
// Immediately invoke the main function to begin execution.
main();


/**
 * main()
 *
 * This is the primary function where the core logic of the program resides.
 * It processes the input lines to find a specific 'name' based on a given
 * condition involving 'N' and 'Q' values.
 *
 * @returns {void} No explicit return value; prints the determined name to console.
 */
function main()
{
    // Local variable declarations within the main function scope.
    var lines = input,                                 // Reference to the global 'input' array.
        N     = lines[0].split(' ')[0] - 0,            // Parse integer N from the first part of the first line.
        Q     = lines[0].split(' ')[1] - 0,            // Parse integer Q from the second part of the first line.
        pair,                                          // Temporary variable to hold split line components.
        name  = 'kogakubu10gokan';                     // Default initial value for the 'name'.


    // Loop through the input lines starting from the second line (index 1) up to N.
    for ( var i = 1; i <= N; i++ )
    {
        // Split the current line into an array of strings based on spaces.
        pair = lines[i].split(' ');

        // Conditional check: if Q is greater than the numeric value of the first element in 'pair'.
        if ( Q > pair[0] - 0 )
        {
            break; // If condition met, exit the loop immediately.
        }

        // If the condition is not met, update 'name' with the second element of the current 'pair'.
        name = pair[1];
    }

    // Output the final determined 'name' to the standard console output.
    console.log(name);

} // End of the main function.