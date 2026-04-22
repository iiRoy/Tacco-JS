/*
 * This JavaScript file is a Type I clone.
 * It maintains exact logical and structural equivalence to the original.
 * All identifiers, operators, and expressions are identical.
 * Only whitespace (indentation, spacing, blank lines) and comments have been altered.
 */
'use strict'; // Enables strict mode for the entire script, catching common coding errors.

function Main ( input ) {
    // Splits the entire input string by newline characters into an array of strings.
    input = input . split ( "\n" ) ;

    // Takes the first line of the input array and splits it by spaces.
    var one = input [ 0 ] . split ( " " ) ;

    // Takes the second line of the input array and splits it by spaces.
    var two = input [ 1 ] . split ( " " ) ;


    // Parses the first element of the 'one' array as an integer and stores it in 'num'.
    var num = parseInt ( one [ 0 ] ) ;

    // Initializes a variable 'sum' to zero. This will accumulate values.
    var sum = 0 ;

    // Iterates through each element in the 'two' array using a for loop.
    for ( let i = 0 ; i < two . length ; i ++ ) {
        // Converts the current string element of 'two' to an integer and adds it to 'sum'.
        sum += parseInt ( two [ i ] ) ;
    } // The loop concludes after processing all elements in the 'two' array.


    // Checks if the calculated 'sum' is greater than or equal to 'num'.
    if ( sum >= num ) {
        // If the condition is true, output "Yes" to the console.
        console . log ( "Yes" ) ;
    } else {
        // Otherwise (if sum is less than num), output "No" to the console.
        console . log ( "No" ) ;
    }
} // End of the Main function definition.

// The following line handles reading standard input and invoking the Main function.
// This part should typically remain untouched as it's for environment setup.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;