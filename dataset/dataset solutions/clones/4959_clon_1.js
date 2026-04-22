/*
 * This JavaScript file processes input from stdin.
 * It performs a Caesar cipher-like transformation on a string,
 * attempting to convert characters to 'a' where possible,
 * and then applying a final shift to the last character.
 */
'use strict' ;  // Enforce strict mode for better code quality and error handling.


// Read the entire standard input, decode it as UTF-8,
// and split it into an array of lines.
const   i   =   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) . split ( "\n" ) ;


// Declare and initialize variables for processing.
// 's' will store the input string (first line).
// 'p' will store the integer shift value (second line).
// 'code' is a temporary variable for character ASCII codes.
// 'result' will accumulate the transformed string.
let s   =   i [ 0 ] ,
    p   =   parseInt ( i [ 1 ] ) ,
    code ,
    result   =   "" ;


// Iterate through each character of the input string 's'.
for ( let   j   =   0 ;   j   <   s . length ;   j ++ )
{
    // Get the ASCII (Unicode) value of the current character.
    code   =   s [ j ] . charCodeAt ( 0 ) ;

    // Special handling for the last character of the string.
    if   ( s . length   -   1   ===   j )
    {
        // Apply the remaining shift 'p' (modulo 26) to the last character's code.
        code   +=   p % 26 ;
        // If the character's ASCII code exceeds 'z' (122),
        // wrap it around by subtracting 26 to stay within the 'a'-'z' range.
        code   +=   ( code   >   122 )   ?   - 26   :   0 ;
        // Convert the modified ASCII code back to a character and append to the result.
        result   +=   String . fromCharCode ( code ) ;
    }
    // For all characters except the last one.
    else
    {
        // Calculate the shift needed to transform the current character to 'a'.
        // If this required shift is less than or equal to the available 'p'
        // AND the current character is not already 'a', then perform the transformation.
        if   ( ( 123   -   code )   <=   p   &&   ! ( s [ j ]   ===   "a" ) )
        {
            // Deduct the used shift amount from 'p'.
            p   -=   ( 123   -   code ) ;
            // Append 'a' to the result string.
            result   +=   "a" ;
        }
        // If the transformation to 'a' is not possible or not required,
        // append the original character without modification.
        else
        {
            result   +=   s [ j ] ;
        }
    }
}
// Output the final transformed string to the console.
console . log ( result ) ;