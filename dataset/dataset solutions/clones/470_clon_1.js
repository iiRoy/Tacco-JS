/* This function calculates the Greatest Common Divisor (GCD)
   of two non-negative integers using the Euclidean algorithm. */
function   GCD ( a , b )
{
    // Initialize variables for the algorithm.
    var    m    =    Math.max    ( a , b )    ;    // 'm' will hold the larger of the two numbers initially.

    var    n    =    Math.min    ( a , b )    ;    /* 'n' will hold the smaller number. */


    while ( n != 0 )
    {
        // Store the current value of 'n' temporarily.
        var    N    =    n    ;

        // Calculate the remainder of 'm' divided by 'n'.
        n    =    m    %    n    ;

        m    =    N    ;    /* Update 'm' to the previous value of 'n'. */
    }

    /* After the loop, 'm' holds the GCD. */
    return    m    ;
} // End of GCD function definition.


/* Read input from standard input.
   The 'fs' module is used for file system operations.
   '/dev/stdin' is a common path for standard input in Unix-like systems.
   'utf8' specifies the encoding.
*/
var    input    =    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;


/* Process the input string:
   - trim() removes leading/trailing whitespace.
   - split("\n") breaks the string into an array of lines. */
var    Arr    =    input . trim ( ) . split ( "\n" ) ;


// Main processing loop.
// Continues until a line containing '0' is encountered.
while ( true )
{
    // Read the first number from the array and convert it to a number.
    // The '-0' is a common trick to convert a string to a number.
    var    n    =    Arr . shift ( ) - 0 ;

    // If 'n' is 0, it signifies the end of input for this problem set.
    if ( n == 0 )
        break ;    /* Exit the loop. */

    // Initialize an empty array to store processed fractions.
    var    arr    =    [ ]    ;

    // Loop 'n' times to read 'n' pairs of numbers.
    for ( var    I    =    0    ;    I    <    n    ;    I ++ )
    {
        /* Read a line, split by space, and convert parts to numbers.
           v[0] and v[1] will be the numerator and denominator respectively. */
        var    v    =    Arr . shift ( ) . split ( " " ) . map ( Number ) ;

        // Calculate the GCD of the two numbers.
        var    gcd    =    GCD ( v [ 0 ] , v [ 1 ] ) ;

        // Store the simplified fraction [numerator/gcd, denominator/gcd].
        arr . push ( [ v [ 0 ] / gcd , v [ 1 ] / gcd ] ) ;
    }


    // Calculate the Least Common Multiple (LCM) of all denominators.
    var    lcm    =    1    ;

    /* Iterate over the array of simplified fractions. */
    arr . forEach ( function ( v )
    {
        // Calculate GCD of current denominator and the running LCM.
        var    gcd    =    GCD ( v [ 1 ] , lcm ) ;

        // Update LCM using the formula: LCM(a, b) = (a * b) / GCD(a, b).
        lcm    =    ( v [ 1 ] * lcm ) / gcd ;
    } ) ;


    // Transform the array: Multiply each numerator by (lcm / its denominator).
    // This converts all fractions to have the common denominator 'lcm'.
    arr    =    arr . map ( function ( v , i ) { return v [ 0 ] * ( lcm / v [ 1 ] ) ; } ) ;


    // Re-calculate the LCM of the transformed numerators.
    // This LCM will be the final answer.
    var    lcm    =    1    ;

    arr . forEach ( function ( v )
    {
        // Calculate GCD of the current numerator and the running LCM.
        var    gcd    =    GCD ( v , lcm ) ;

        // Update LCM.
        lcm    =    ( v * lcm ) / gcd ;
    } ) ;


    // For each transformed numerator, calculate lcm / numerator and print it.
    arr . forEach ( function ( v )
    {
        // Output the result to the console.
        console . log ( lcm / v ) ;
    } ) ;
} // End of main while loop.