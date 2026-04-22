// This is the beginning of the JavaScript code file.
// It enforces strict mode for better error handling and cleaner code.
'use strict'

/*
 *  The main function processes the input.
 *  @param {string} inp - The raw input string from stdin.
 */
function  main ( inp )
{
    // Define a constant for the modulo operation.
    // This is a common large prime number used in competitive programming.
    const   mod   =   1e9   +   7 ;

    // Process the input string:
    // 1. Remove leading/trailing whitespace.
    // 2. Split into an array of strings based on newline characters.
    inp   =   inp . trim ( ) . split ( '\n' ) ;


    // Extract the first line, which contains the number of elements (N).
    // Convert it to a numeric type.
    const   N   =   Number ( inp . shift ( ) ) ;

    // Process the second line of input:
    // 1. Access the first (and now only) remaining element of the 'inp' array.
    // 2. Split it by spaces to get individual number strings.
    // 3. Map each string to its numeric equivalent.
    inp   =   inp [ 0 ] . split ( ' ' ) . map ( n   =>   Number ( n ) ) ;

    // Initialize the answer variable.
    let   ans   =   0 ;

    /*
     *  Outer loop: iterates from the first element up to N-1.
     *  The variable 'i' represents the index of the first number in a pair.
     */
    for   (   let   i   =   0 ;   i   <   N ;   i ++   )
    {
        /*
         *  Inner loop: iterates from the element *after* 'i' up to N-1.
         *  The variable 'j' represents the index of the second number in a pair.
         *  This ensures each pair (inp[i], inp[j]) is considered exactly once.
         */
        for   (   let   j   =   i   +   1 ;   j   <   N ;   j ++   )
        {
            // Calculate the bitwise XOR of inp[i] and inp[j].
            // Then, apply the modulo operation to inp[j] only.
            // The result is added to the 'ans' accumulator.
            // Note: Operator precedence means % is applied before ^.
            // (inp[i] ^ (inp[j] % mod))
            ans   +=   inp [ i ]   ^   inp [ j ]   %   mod ;
        }
    }

    // Output the final calculated answer to the console.
    console . log ( ans ) ;

}   // End of main function.

// Call the main function with input read from standard input.
// The 'fs' module is used for file system operations, specifically reading the file.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;

// This marks the end of the JavaScript program.