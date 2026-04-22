/*
 * This is a Type I clone of a JavaScript program.
 * It strictly adheres to the definition:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * All identifiers, operators, and expressions remain unchanged.
 * Only whitespace (spaces, tabs, newlines) and comments have been altered.
 */


    // Enforcing strict mode for better error handling and cleaner code.
    'use strict' ;

/*
 * The primary function that processes the input and calculates the result.
 * @param {string} input - The raw input string provided to the program.
 */
function   Main (   input   )
{
    // Process the input string: trim, split into characters, and convert to numbers.
    // Each character is converted to a number by subtracting zero.
    input = input . trim ( ) . split ( '' ) . map ( x => x - 0 ) ;

    // S will hold the array of numbers derived from the input string.
    var S = input ;

    // Initialize counters for odd and even indexed elements' sums.
    var odd = 0 ;
    var even = 0 ;

    // L stores the length of the processed input array.
    var L = S . length ;

    // Loop through the array S to calculate the sum of elements at even and odd indices.
    for ( let i = 0 ; i < L ; i ++ )
    {
        // Check if the current index 'i' is even.
        if ( i % 2 === 0 )
        {
            // If even, add the element to the 'even' sum.
            even += S [ i ] ;
        }
        else
        {
            // If odd, add the element to the 'odd' sum.
            odd += S [ i ] ;
        }
    }


    // Calculate E: The number of even positions in the sequence.
    // This accounts for both even and odd lengths of the sequence.
    var E = Math . floor ( L / 2 ) + L % 2 ;

    // Calculate O: The number of odd positions in the sequence.
    var O = Math . floor ( L / 2 ) ;

    // Calculate A: One possible scenario's cost.
    // (Total even positions - sum of numbers at even positions) + sum of numbers at odd positions
    var A = E - even + odd ;

    // Calculate B: Another possible scenario's cost.
    // (Sum of numbers at even positions) + (Total odd positions - sum of numbers at odd positions)
    var B = even + O - odd ;

    // Determine the minimum cost between the two scenarios.
    var result = Math . min ( A , B ) ;

    // Output the final calculated result to the console.
    console . log ( result ) ;

} // End of the Main function definition.


/*
 * This section handles the execution of the program.
 * It reads input from standard input and passes it to the Main function.
 */
Main (
    require ( 'fs' )
        . readFileSync (
            '/dev/stdin' ,
            'utf8'
        )
) ; // Call the Main function with the input.
// End of file.