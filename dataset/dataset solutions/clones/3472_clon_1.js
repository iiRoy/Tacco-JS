/* This JavaScript code is a Type I clone.
 * It is functionally identical to the original source.
 * Only whitespace (spacing, indentation, blank lines)
 * and comments (additions, modifications) have been altered.
 * No changes have been made to identifiers, operators, or logic.
 */

// Declare a global variable 'abk'.
// This variable will be used to store and manipulate numerical data.
var abk
;


/**
 * Function 'ex' performs specific operations on two elements
 * of the global array 'abk' based on the provided indices.
 *
 * @param {number} a - The first index for the array 'abk'.
 * @param {number} n - The second index for the array 'abk'.
 */
function ex ( a , n )
{
    // Check if the element at index 'a' is odd.
    // If it is odd (remainder is 1 when divided by 2),
    // then decrement its value by 1.
    abk [ a ] % 2 == 1
        && -- abk [ a ]
    ;

    // Divide the element at index 'a' by 2.
    abk [ a ] /= 2
    ;

    // Add the current value of abk[a] to abk[n].
    abk [ n ] += abk [ a ]
    ;
} // End of function 'ex'


/**
 * The main function 'Main' orchestrates the primary logic.
 * It processes input, initializes 'abk', runs a loop,
 * and outputs results.
 *
 * @param {string} a - The input string, typically read from a file.
 */
function Main ( a )
{
    // Initialize a loop counter 'e' and a limit 'n'.
    // 'n' is derived from the input string 'a'.
    // The global 'abk' array is also initialized here.
    for (
        var n = (
            abk = a
                . split ( "\n" ) // Split the input string by newline characters.
                [ 0 ]            // Take the first line of the input.
                . split ( /\s/ ) // Split the first line by any whitespace characters.
                . map (          // Map each resulting string part to a number.
                    function ( a )
                    {
                        return a - 0
                        ; // A common idiom to convert string to number.
                    }
                )                // End of map function.
        ) [ 2 ]                  // Get the element at index 2 from the mapped array, assign it to 'n'.
        ,
        e = 1
        ;                        // Initialize loop counter 'e' to 1.

        e <= n                   // Loop condition: continue as long as 'e' is less than or equal to 'n'.
        ;

        e ++                     // Increment 'e' after each iteration.
    )
    {
        // Inside the loop:
        // Check if 'e' is an odd number.
        e % 2 == 1
            ? ex ( 0 , 1 )       // If 'e' is odd, call 'ex' with indices 0 and 1.
            : ex ( 1 , 0 )       // If 'e' is even, call 'ex' with indices 1 and 0.
        ;
    } // End of the 'for' loop.

    // After the loop, print the final values of abk[0] and abk[1]
    // to the console, formatted as integers.
    console . log ( "%d %d" , abk [ 0 ] , abk [ 1 ] )
    ;
} // End of function 'Main'


// Program execution starts here.
// Read the input from standard input (/dev/stdin) synchronously.
// The input is read as a UTF-8 encoded string.
// Then, pass this string to the 'Main' function for processing.
Main (
    require ( "fs" )
        . readFileSync ( "/dev/stdin" , "utf8" )
)
;