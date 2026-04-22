/*
 * This script reads input from stdin, processes it,
 * and prints a Christmas message if certain conditions are met.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Initialize a variable 'i' by reading data from standard input.
// The data is read as a UTF-8 string.
i = require("fs") . readFileSync ( "/dev/stdin" , "utf8" )


// Initialize an empty string 's'.
// This string will accumulate " Eve" based on the value of 'i'.
s = i == 24 ? " Eve" : "" ;  // Check if input 'i' is exactly 24.

/*
 * Append " Eve" to 's' if 'i' is 23.
 * This is a conditional concatenation.
 */
s += i == 23 ? " Eve" : "" ;


// Check for another specific value of 'i'.
s += i == 22 ? " Eve" : "" ; // If 'i' is 22, add " Eve" to 's'.

// Main logic: Check if 'i' matches any of the Christmas-related numbers.
// If there's a match, then print the "Christmas" message along with the accumulated 's'.
i . match ( /25|24|23|22/ ) && console . log ( "Christmas" + s ) ; // The '&&' ensures console.log only runs if match is found.