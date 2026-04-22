/* This is a JavaScript program
 * designed to read input from stdin
 * and perform a specific logical check.
 *
 * This code determines an output based on arithmetic operations
 * and parity checks on four input numbers.
 */


// Import the 'fs' module, which provides file system functionalities.
// We then use 'readFileSync' to synchronously read the content of '/dev/stdin'.
// The 'utf8' encoding is specified for the input data.
var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;


// Declare four variables (a, b, c, d) using array destructuring.
// The 'input' string is first trimmed to remove leading/trailing whitespace.
// Then, it's split into an array of strings based on space characters.
// Finally, 'map(Number)' converts each string element in the array to a number.
var   [ a , b , c , d ]   =   input . trim () . split ( " " ) . map ( Number ) ;


/*
 * The core logic of the program resides in this conditional statement.
 * It checks two conditions joined by a logical AND (&&) operator.
 *
 * Condition 1: `(a*b+1)%2==0`
 *   - Checks if `(a*b+1)` is an even number.
 *   - This is equivalent to checking if `a*b` is an odd number.
 *
 * Condition 2: `(a+b+1)%2`
 *   - Checks if `(a+b+1)` is an odd number (because `X % 2` evaluates to 1 for odd X, which is truthy).
 *   - This is equivalent to checking if `a+b` is an even number.
 *
 * If BOTH conditions are true, the program outputs "No".
 * Otherwise, if at least one condition is false, it outputs "Yes".
 */
if   (
        ( ( a * b ) + 1 ) % 2   ==   0
        &&
        ( ( a + b ) + 1 ) % 2
)
{
    // Output "No" if the combined condition is met.
    console . log ( "No" ) ;
}
else
{
    // Output "Yes" in all other cases.
    console . log ( "Yes" ) ;
}

// End of the JavaScript program.