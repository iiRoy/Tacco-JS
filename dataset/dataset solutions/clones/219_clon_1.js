/*
 * This JavaScript file processes numerical input from standard input.
 * It calculates the sum of decimal digits for a division operation,
 * up to a specified number of decimal places.
 */

// Core Node.js module for file system operations.
var fs         = require ( 'fs' ) ,

    // Determine the size of the standard input stream.
    length     = fs . fstatSync ( process . stdin . fd ) . size ,

    // Allocate a buffer to hold the input data.
    buffer     = new Buffer ( length ) ,

    // Read data from standard input into the buffer.
    bytesRead  = fs . readSync ( process . stdin . fd , buffer , 0 , length , 0 ) ,

    // Convert buffer to string, trim whitespace, and split into lines.
    input      = buffer . toString ( 'utf8' , 0 , bytesRead ) . trim ( ) . split ( '\n' ) ;


// Execute the main processing logic.
main ( ) ;


/**
 * The primary function containing the application's core logic.
 * It iterates through each line of input and performs calculations.
 */
function main ( ) {

        // Loop through each line of the processed input array.
        for ( var i = 0 , len = input . length ; i < len ; i ++ ) {

                // Split the current input line by space to get individual components.
                var c = input [ i ] . split ( ' ' ) ;


                // Perform division and convert the result to a string.
                // This is to easily extract the decimal part.
                var div = c [ 0 ] / c [ 1 ] + '' ;


                // Extract the decimal part of the division result.
                // Split it into an array of individual digit characters.
                var decimalNumber = div . split ( '.' ) [ 1 ] . split ( '' ) ;


                // Initialize a variable to accumulate the sum of decimal digits.
                var result = 0 ;


                // Loop through the decimal digits up to the specified count (c[2]).
                for ( var j = 0 ; j < + c [ 2 ] ; j ++ ) {

                        // Convert the current decimal digit character to a number.
                        var num = + decimalNumber [ j ] ;

                        // Add the number to the result. If 'num' is NaN (e.g., end of digits),
                        // it will be treated as 0 due to the ternary operator.
                        result += num ? num : 0 ;

                } // End of inner loop for decimal digits.


                // Output the calculated sum of decimal digits to the console.
                console . log ( result ) ;

        } // End of outer loop for input lines.

} // End of main function.