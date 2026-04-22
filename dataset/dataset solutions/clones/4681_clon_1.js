/*
 * This is a Type I clone of the provided JavaScript code.
 *
 * According to the definition:
 * - Every identifier, variable name, function name, operator, and expression
 *   remains completely unchanged from the original.
 * - Only whitespace (indentation, spacing, blank lines) and comments
 *   (added, removed, or modified) are altered.
 *
 * The purpose is to make the code visually different while preserving
 * its exact logical and structural identity.
 */

// Define the primary function responsible for processing the input
function   main
(
    input /* The input array received by the function */
)
{
    // Initialize variable 'n' by converting the first element of the input array to a number.
    // The '- 0' operation is a common JavaScript idiom for type coercion to number.
    var   n   =   input[0]   -   0
    ;

    // 'cnt' serves as a counter, initialized to 1.
    var   cnt   =   1
    ;

    // 'ans' accumulates the sum, starting from 0.
    var   ans   =   0
    ;

    /*
     * This 'for' loop calculates the smallest integer 'cnt' such that
     * the sum of integers from 1 up to 'cnt' is greater than or equal to 'n'.
     *
     * - Initialization: 'cnt' is reset to 1 (though it's already 1).
     * - Condition: The loop continues as long as 'ans' (the accumulated sum) is less than 'n'.
     * - Increment: 'cnt' is incremented by 1 in each iteration.
     */
    for
    (
        cnt   =   1
        ;
        ans   <   n
        ;
        cnt ++
    )
    {
        // Add the current value of 'cnt' to the running total 'ans'.
        ans   +=   cnt
        ;
    }

    // After the loop, 'cnt' will be one more than the actual number
    // that made the sum exceed or equal 'n'.
    // Therefore, 'cnt - 1' gives the desired result.
    console . log (   cnt   -   1   )
    ;
}


/*
 * This section handles reading input from standard input and calling the main function.
 *
 * 1. `require('fs')`: Imports the Node.js file system module.
 * 2. `.readFileSync('/dev/stdin', 'utf8')`: Reads the content of standard input synchronously,
 *    decoding it as a UTF-8 string.
 * 3. `.trim()`: Removes leading and trailing whitespace (like newlines) from the input string.
 * 4. `.split("\n")`: Splits the string into an array of lines, using the newline character as a delimiter.
 * 5. `main(...)`: Calls the main function with this processed array of input lines.
 */
main
(
    require( 'fs' )
        . readFileSync( '/dev/stdin' , 'utf8' )
        . trim()
        . split( "\n" )
)
;