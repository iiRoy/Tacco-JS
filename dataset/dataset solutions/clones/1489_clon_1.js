/*
 * This is the main function responsible for processing the input.
 * It simulates a series of operations on a string representing a number.
 */
function         Main   (   input   )
{

    // Step 1: Parse the input string into a 2D array.
    // The first line contains N and Q. Subsequent lines contain query parameters.
    input = input . split ( "\n" ) . map ( v => v . split ( " " ) ) ;


    const   n = toInt ( input [ 0 ] [ 0 ] ) ; // N: The initial length of the string.

    const   q = toInt ( input [ 0 ] [ 1 ] ) ; /* Q: The number of queries to perform. */


    let   str = "" ; // Initialize an empty string.

    // Loop to build the initial string of '1's.
    for ( let   i = 0 ;   i < n ;   i++ )
    {
        str += "1" ; // Append '1' N times.
    }


    // Convert the string into an array of characters for easier manipulation.
    str = str . split ( "" ) ;


    /*
     * Iterate through each query from the input.
     * Queries start from the second line (index 1) of the parsed input.
     */
    for ( let   i = 1 ;   i < input . length ;   i++ )
    {
        // Extract query parameters: left boundary, right boundary, and digit to replace with.
        const   l = toInt ( input [ i ] [ 0 ] ) - 1 ; // Left index (0-based).
        const   r = toInt ( input [ i ] [ 1 ] ) - 1 ; // Right index (0-based).
        const   d = input [ i ] [ 2 ] ;               // The digit character for replacement.


        // Apply the transformation for the current query.
        // This creates a new array where characters between 'l' and 'r' are replaced by 'd'.
        let   target = str . map ( ( value ,   index ) =>
        {
            if (   l <= index   &&   index <= r   )
            {
                return   d ; // Replace with the new digit.
            }
            return   value ; // Keep the original value.
        } ) ;


        // Join the array back into a string and convert it to an integer.
        target = toInt ( target . join ( '' ) ) ;

        // Output the result modulo 998244353.
        console . log ( target % 998244353 ) ;
    }

} // End of Main function.


/**
 * Helper function to convert a string value to an integer.
 * @param {string} v - The string value to convert.
 * @returns {number} The integer representation.
 */
function   toInt   (   v   )
{
    /*
     * This line was originally commented out,
     * it might have been used for handling very large numbers with BigInt.
     * //return BigInt(v);
     */
    return   parseInt ( v ,   10 ) ; // Parse as base 10 integer.
}


// This section handles reading input from stdin and invoking the main function.
// The original comment here was "魔法" which means "magic".
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;