/*
 * This JavaScript code represents a Type I clone of an original snippet.
 * A Type I clone implies that the code fragments are exactly equal,
 * with the sole exceptions being variations in whitespace and comments.
 *
 * This version has been extensively reformatted with altered indentation,
 * spacing, and the addition of numerous comments to demonstrate the
 * visual difference while maintaining complete logical and structural
 * identity with the source code.
 *
 * All identifiers, variable names, function names, operators, expressions,
 * and the literal content of strings (especially within `eval`) remain
 * precisely as they were in the original.
 */

// Declare and initialize string constants 'm' and 'n'.
// 'm' is a reusable string fragment for mathematical operations within the `eval` call.
m = '+= r * Math.' ;

// 'n' is a reusable string fragment for converting an angle 's' from degrees to radians.
n = '(s * Math.PI/180)' ;

// Initialize numeric variables 'x', 'y' (coordinates) and 's' (sum of angles) to zero.
x = y = s = 0 ;

// Utilize the Node.js 'fs' module to synchronously read data from standard input.
require ( "fs" )
    . readFileSync ( "/dev/stdin" , "utf8" )  // Read the entire standard input as a UTF-8 string.
    . trim ( )                                 // Remove any leading or trailing whitespace from the input.
    . split ( '\n' )                           // Split the input string into an array of lines based on newline characters.
    . some ( function ( i ) {                  /* Iterate over each line 'i' in the array.
                                                * The 'some' method is used here for iteration,
                                                * continuing as long as the callback does not return a truthy value. */

        // Split the current line 'i' by the comma (',') character.
        // This is expected to yield two numeric string values.
        j = i . split ( ',' ) ;

        // Convert the first part of the split line (j[0]) to a number 'r' (radius/magnitude).
        r = + j [ 0 ] ;

        // Convert the second part of the split line (j[1]) to a number 't' (angle increment).
        t = + j [ 1 ] ;

        // Check if both 'r' and 't' are truthy (i.e., non-zero numbers).
        if ( r && t )
            // If both conditions are met, execute the following compound statement:
            // 1. Dynamically construct and evaluate a JavaScript expression string.
            //    This expression updates 'x' and 'y' coordinates based on 'r' and the sine/cosine of 's'.
            eval ( 'x' + m + 'sin' + n + ',' + 'y' + m + 'cos' + n ) ,
            // 2. Add the current angle increment 't' to the total angle 's'.
            s += t ;

        // The callback function implicitly returns 'undefined' if no explicit return is present.
        // 'undefined' is a falsy value, which causes the `some` method to continue iterating through the array.
    } ) ; // End of the .some() method call and its anonymous function.

// Output the final calculated 'x' coordinate to the console.
// The double-bitwise NOT operator (~~) is used as a fast way to truncate the number to an integer.
console . log ( ~~ x ) ;

// Output the final calculated 'y' coordinate to the console, similarly truncated.
console . log ( ~~ y ) ;