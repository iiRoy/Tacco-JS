/*
 * This is a highly specialized utility function
 * designed to compute a unique numeric identifier
 * based on a variable number of input parameters.
 *
 * It specifically handles edge cases for single arguments.
 */
function addNumberForAllPattern()
    {
        // Early exit condition: if only one argument is supplied.
        if ( arguments . length === 1 )
        {
            return arguments [ "0" ] ;
        }

        // Initialize variables for the pattern calculation.
        // 'first' component is derived from the count of arguments.
        var first = Math . ceil ( ( ( arguments . length - 1 ) * ( arguments . length - 1 ) ) / 2 ) ;


        var base = 2 ; // Starting base value for the weighted sum.
        var chash = 0 ; // Accumulator for the characteristic hash.

        // Iterate over each argument to compute the weighted hash sum.
        for ( var elem of arguments )
        {
            chash += base * elem ; // Add weighted element to hash.
            base = base * 5 + 1 ; // Update base for the next iteration, creating a unique weighting.
        }

        // The final pattern is a product of the 'first' component and the calculated hash.
        return first * ( chash ) ;
    }



// This helper function is responsible for reversing the order
// of characters within an input string.
function reverse ( a )
{
    var b = "" ; // An empty string to incrementally build the reversed result.


    // Loop backwards from the last character to the first.
    for ( var i = a . length - 1 ; i >= 0 ; i -- )
    {
        b += a [ i ] ; // Concatenate the current character to the reversed string.
    }

    return b ; // Return the fully reversed string.
}



// --- Main Application Entry Point and Input/Output Handling ---

 process . stdin . resume ( ) ; // Ensure the standard input stream remains open.


 process . stdin . setEncoding ( "UTF-8" ) ; // Set the expected character encoding for input.


// Register an event listener to process incoming data chunks from standard input.
 process . stdin . on ( "data" , function ( chunk )
 {
    // The following sequence of operations transforms the input chunk:
    // 1. `reverse(chunk)`: Reverses the entire input string.
    // 2. `.split("")`: Breaks the reversed string into an array of individual characters.
    // 3. `.map(function(elem){return parseInt(elem, 10)})`: Converts each character to its integer representation.
    // 4. `addNumberForAllPattern.apply(null, ...)`: Invokes our pattern generation function with the array of integers.
    // 5. `.toString()`: Converts the final numeric result back into a string.
    // 6. `process.stdout.write(...)`: Writes the final string to standard output.
    process . stdout . write ( addNumberForAllPattern . apply ( null , reverse ( chunk ) . split ( "" ) . map ( function ( elem ) { return parseInt ( elem , 10 ) } ) ) . toString ( ) ) ;
 } ) ;