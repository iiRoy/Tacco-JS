/*
 * This is a JavaScript program demonstration.
 * It's designed to read input from standard input,
 * perform a series of basic arithmetic operations
 * (integer division, remainder, and float division),
 * and then output the results to the console.
 *
 * This specific version aims to be a Type I clone,
 * meaning only whitespace and comments have been altered
 * from an original source. All code tokens remain identical.
 */
(  function   (   input   )
{

    // The 'inputs' variable will store the parsed numbers.
    // We expect a space-separated string of numbers.
    inputs   =   input . split ( ' ' ) . map ( Number ) ;

    // Declare and initialize variables 'a' and 'b' from the parsed input array.
    var   a   =   inputs [ 0 ] ;   // The first number provided in the input.
    var   b   =   inputs [ 1 ] ;   // The second number provided in the input.

    /*
     * Perform the required arithmetic calculations.
     * d: Represents the result of integer division (quotient).
     * r: Represents the remainder of the division.
     * f: Represents the result of floating-point division.
     */
    var   d   =   Math . floor (   a   /   b   ) ;   // Calculate the floor of the division.
    var   r   =   a   %   b ;                         // Calculate the remainder using the modulo operator.
    var   f   =   a   /   b ;                         // Calculate the full floating-point division result.

    // Output the calculated values to the console.
    // The format string '%d %d %d' is used to print three decimal integers.
    // Note: 'f' is a float, but '%d' will truncate it for display here.
    console . log (   '%d %d %d' ,   d ,   r ,   f   ) ;

} ) (

    /*
     * This is an Immediately Invoked Function Expression (IIFE).
     * The argument for this function is obtained by reading
     * the entire content of the standard input file '/dev/stdin'
     * synchronously, encoded as UTF-8.
     */
    require ( 'fs' )
        . readFileSync (   '/dev/stdin' ,   'utf8'   )

) ;