/*
 * This is a JavaScript program designed to process input from stdin.
 * It reads a sequence of lines and performs string inclusion checks.
 */

// Declare a variable to store the raw input read from standard input.
var   input =   require('fs') .  readFileSync (   '/dev/stdin'  ,  'utf8'   ) ;

// Process the input: trim whitespace and split into an array of lines.
var   arr   =   input .  trim ( ) .  split ( "\n" ) ;

// The first line of the input becomes the target string for inclusion checks.
var   str   =   arr .  shift ( ) ;

// The second line of the input is parsed as a number, representing
// the count of subsequent strings to check against the target string.
var   n   =   arr .  shift ( )  -  0   ; // The '- 0' ensures explicit numeric conversion.

// Initialize an empty string variable, though it appears unused in the current logic.
var   ans   =   ""   ;

// Loop through the remaining elements in the 'arr' array.
// Each element represents a string to be checked for inclusion in 'str'.
for ( var   i   =   0   ;   i   <   n   ;   i ++   )
{
    // For each string, check if 'str' includes it.
    // If it does, print '1'; otherwise, print '0'.
    console .  log ( str .  includes ( arr [ i ] )  ?  1  :  0 ) ;
}

// End of program.