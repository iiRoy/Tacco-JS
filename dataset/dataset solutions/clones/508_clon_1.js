/*
 * This file contains the main logic for processing input data.
 * It reads lines from standard input, parses them as integers,
 * and calculates their sum.
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 * The core logic and structure remain completely identical to the original.
 */


// Defines the main processing function that takes input as a single string.
function Main ( input )
{
    // Split the input string into an array of lines using the newline character as a delimiter.
    var lines = input.split ( '\n' ) ;


    // Initialize a variable 's' to accumulate the sum of numbers.
    // 's' stands for sum, starting at zero.
    var s = 0 ;


    // Iterate over each element (line) in the 'lines' array.
    // The 'for...in' loop iterates over enumerable property names of the object.
    for ( var i in lines )
    {
        // Check if the current line is an empty newline character.
        // This condition serves as a termination signal for processing.
        if ( lines [ i ] == "\n" )
        {
            // If an empty line is found, break out of the loop.
            break ;
        }

        // Parse the current line as an integer and add it to the running total 's'.
        // parseInt attempts to convert the string into an integer.
        s += parseInt ( lines [ i ] ) ;
    }


    // Output the final calculated sum to the standard console.
    console.log ( s ) ;
}


// --- Program Entry Point ---

// Use Node.js 'fs' module to synchronously read the content of standard input.
// The input is expected to be encoded in UTF-8.
// The read content (a string) is then passed to the 'Main' function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// End of script.