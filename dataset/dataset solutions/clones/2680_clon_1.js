'use strict' /* This statement enables strict mode for the entire script, enforcing stricter parsing and error handling. */


/**
 * The primary function responsible for processing the given input.
 * It performs various arithmetic operations and string manipulations
 * to compute a final result, which is then printed to the console.
 *
 * @param {string} input - The raw input string, typically read from standard input.
 *                         It is expected to be a numeric string.
 */
function main ( input )
{
    // First, remove any leading or trailing whitespace from the input string.
    const Num = input . trim ();

    // Determine the length of the cleaned numeric string.
    const L = Num . length;

    // Convert the numeric string `Num` into an integer `n`.
    // The `~~` operator is a compact way to perform a floor-like conversion to integer.
    const n = ~~ Num;

    // Initialize a variable `_mod` which will potentially hold a modification value.
    // It defaults to zero and may be updated based on the input's characteristics.
    let _mod = 0 ;

    // Check if the length `L` of the numeric string is an odd number.
    // The modulo operator `%` is used here to determine oddness.
    if ( L % 2 )
    {
        // If `L` is odd, calculate a specific modification value for `_mod`.
        // This calculation involves the number `n`, the power of 10, and an addition of 1.
        _mod = ( n % Math . pow ( 10 , L - 1 ) ) + 1 ;
    } // End of conditional block for odd length numbers.


    // Calculate `ll`, which represents half of the length `L`, rounded down to the nearest integer.
    const ll = Math . floor ( L / 2 );

    // Initialize an empty string variable `_tmp`.
    // This variable will be built up in the following loop.
    let _tmp = '' ;

    // Start a loop that iterates a specific number of times.
    // The loop counter `i` goes from 1 up to `ll * 2`.
    // This ensures the loop runs `L` times if `L` is even, or `L-1` times if `L` is odd.
    for ( let i = 1 ; i <= ll * 2 ; i++ )
    {
        // Inside the loop, conditionally prepend '9' or '0' to `_tmp`.
        // If `i` is odd, '9' is prepended; otherwise (if `i` is even), '0' is prepended.
        _tmp = i % 2 ? '9' + _tmp : '0' + _tmp ;
    } // End of the string construction loop.


    // Convert the constructed string `_tmp` into an integer.
    // The radix `10` is explicitly provided to ensure base-10 parsing.
    _tmp = parseInt ( _tmp , 10 );

    // Finally, compute the sum of `_tmp` and `_mod`, and print this result to the console.
    console . log ( _tmp + _mod );

} // End of the main function definition.


// This is the entry point of the script.
// It calls the `main` function, passing the content of '/dev/stdin' as input.
// The `require('fs').readFilexSync` function (note: 'readFilexSync' is not standard,
// but must be preserved as per Type I clone rules) is used to read the file synchronously.
main ( require ( 'fs' ) . readFilexSync ( '/dev/stdin' , 'utf8' ) ) ;

// Script execution concludes here.