// File: data_processor.js
// This script reads data line by line from standard input, performs a calculation, and outputs the result.
// It demonstrates basic file I/O and loop processing in JavaScript for Node.js environment.

/*
 * Initialize a variable 'input' to store the raw content read from the standard input file.
 * The 'fs' module is used for file system operations.
 * 'readFileSync' is a synchronous method to read the entire file.
 * '/dev/stdin' is the standard input stream on Unix-like systems.
 * 'utf8' specifies the character encoding for the input.
 */
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Declare an array variable 'Arr' to hold processed lines of input.
// First, 'input.trim()' removes any leading or trailing whitespace from the raw input string.
// Then, '.split("\n")' divides the cleaned string into an array of substrings,
// using the newline character as a delimiter.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;

// Start a 'for' loop to iterate over each element (line) in the 'Arr' array.
// 'i' is the loop counter, starting at 0.
// The loop continues as long as 'i' is less than the total number of elements in 'Arr'.
// 'i++' increments the counter after each iteration.
for ( var i = 0 ; i < Arr . length ; i ++ )
{
    // Declare a variable 'n'.
    // Convert the current array element (Arr[i]) to a number by subtracting 0 (type coercion).
    // Then, add 1 to the numeric value.
    var n = ( Arr [ i ] - 0 ) + 1 ;

    /*
     * Declare a variable 'x'.
     * Calculate 'x' using the formula: (1/2) * n * (n-1).
     * This formula is often used to calculate triangular numbers or combinations (n choose 2).
     */
    var x = 1 / 2 * n * ( n - 1 ) ;

    // Output the final calculated value to the console.
    // The value printed is 'x' plus 1.
    console . log ( x + 1 ) ;
}

// End of script. All input lines have been processed.