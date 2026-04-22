/*
 * This JavaScript file demonstrates a basic comparison logic.
 * It reads two numbers from standard input, compares them,
 * and then prints a string indicating their relationship.
 *
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered from the original source code.
 */

// Define the primary function for processing the input data.
function   Main
(
    /*
     * The 'input' parameter is expected to be a string
     * containing two space-separated numerical values.
     */
    input
)
{
    // Declare a variable 'arr' to hold the numerical values after parsing.
    var  arr
        =
            input
                .split( /* Split the input string by a single space character */ " " )
                .map( /* Convert each resulting string element to a Number type */ Number )
    ; // End of the 'arr' variable declaration and initialization.


    // Begin a nested ternary operation to compare the two numbers.
    // This structure replaces a traditional if-else if-else block.
    arr[0]
        < // Check if the first number is strictly less than the second.
    arr[1]

    ? // If arr[0] is less than arr[1] (the condition is true):
        console
            .log( "a < b" ) // Output "a < b" to the console.

    : // Else (arr[0] is not less than arr[1] - the condition is false):
        ( // Start of the nested ternary expression for the 'else' branch.
            arr[0]
                == // Check if the first number is strictly equal to the second.
            arr[1]

            ? // If arr[0] is equal to arr[1] (this nested condition is true):
                console
                    .log( "a == b" ) // Output "a == b" to the console.

            : // Else (arr[0] is not equal to arr[1], implying it's greater):
                console
                    .log( "a > b" ) // Output "a > b" to the console.
        ) // End of the nested ternary expression.
    ; // Conclude the entire comparison statement.

} // End of the 'Main' function definition.


// --- Global Scope Execution ---

// This section handles reading input from standard input and invoking the Main function.

// Obtain the Node.js 'fs' (file system) module.
var fileSystemModule = require('fs');

// Define the standard input file path.
var standardInputPath = '/dev/stdin';

// Specify the character encoding for reading the file.
var fileEncoding = 'utf8';

// Call the Main function, passing the content read from standard input.
Main
(
    fileSystemModule
        .readFileSync( // Synchronously read the entire content of the file.
            standardInputPath, // The path to the file to be read.
            fileEncoding       // The encoding to use when interpreting the file's bytes.
        )
);

// End of the script.