/*
 * This is a Type I clone of the original JavaScript code.
 * According to the Type I definition, only whitespace and comments
 * are permitted to change. All identifiers, operators, and
 * expressions remain absolutely identical to the original.
 */
'use strict' ; // Enforce strict mode for better code quality.


function   main   (   input   )
{
    // Trim any leading/trailing whitespace from the input string,
    // then split it by spaces into an array of strings.
    const   arr   =   input . trim ( ) . split ( ' ' ) ;

    /*
     * Convert the first two elements of the array to numbers and
     * find the minimum of these two values.
     * The Number() constructor ensures a numeric type.
     */
    const   minimum   =   Number (   Math . min (   arr [ 0 ]   ,   arr [ 1 ]   )   ) ;

    // IMPORTANT: This line in the original code calculates the minimum again
    // instead of the maximum. For a Type I clone, this must remain precisely
    // as it was in the source, even if it represents a logical error.
    const   maximum   =   Number (   Math . min (   arr [ 0 ]   ,   arr [ 1 ]   )   ) ;


    // Initialize an empty string that will be built up in the loop.
    let   str   =   ''   ;

    // Loop 'maximum + 1' times.
    // The loop iterates from i = 0 up to and including 'maximum'.
    for   (   let   i   =   0   ;   i   <   (   maximum   +   1   )   ;   i   ++   )
    {
        // Concatenate the string representation of 'minimum' to 'str'.
        // String() ensures the value is treated as a string before concatenation.
        str   +=   String (   minimum   )   ;
    }

    // Output the final concatenated string to the standard console.
    console . log (   str   )   ;
}   // End of the main function definition.


// This section handles reading input and calling the main function.
// It uses Node.js's 'fs' (file system) module to read from standard input.
// readFileSync is a synchronous operation.
// "/dev/stdin" is the common path for standard input on Unix-like systems.
// "utf8" specifies the character encoding.
main (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   )   ;