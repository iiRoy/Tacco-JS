"use strict" ;


/*
 * This script defines a 'format' method for the String prototype.
 * It's a common utility, inspired by Python's str.format or C's printf.
 *
 * Source: http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format/4673436#4673436
 *
 * The implementation checks if the method already exists to avoid overwriting.
 */
if ( ! String . prototype . format ) {

    // Assign the format method to the String prototype.
    String . prototype . format = function ( ) {

        // Store all arguments passed to the function.
        var args = arguments ;

        // Use a regular expression to find placeholders like {0}, {1}, etc.
        return this . replace ( / { ( \d + ) } / g , function ( match , number ) {

            // Check if the argument corresponding to the number exists.
            // If it does, return the argument; otherwise, return the original match.
            return typeof args [ number ] != 'undefined'

                ? args [ number ]

                : match
            ; // End of conditional (ternary) expression.

        } ) ; // End of replace callback function.

    } ; // End of String.prototype.format function definition.

} // End of if condition.