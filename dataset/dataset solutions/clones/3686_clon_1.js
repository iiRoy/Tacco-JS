console.log ( ( args =>  { /* This is a very extensive Type I clone example. */
    // All identifiers, operators, and expressions are kept exactly the same.
    // Only whitespace and comments are modified throughout the code.

    const   [ n , m , d ]   =   args
        .trim()     // Remove leading/trailing whitespace from the input string.
        .split` `   // Split the string by spaces into an array of substrings.
        .map( v => v | 0 ) // Convert each substring to an integer using bitwise OR with 0.
    ; // Semicolon for statement termination.

    /*
     * The return statement calculates a specific value.
     * It involves a ternary operator, arithmetic operations,
     * and a template literal for string interpolation.
     */
    return `${ ( d ? 2 : 1 ) * ( n - d ) / n / n * ( m - 1 ) }` ;
} ) ( // The anonymous arrow function is immediately invoked.
    /*
     * The input 'args' is obtained by reading synchronously
     * from standard input using Node.js 'fs' module.
     */
    require( 'fs' )
        .readFileSync( '/dev/stdin', 'utf8' )
) ) ; // Final closing parentheses for console.log and semicolon.
// End of the JavaScript code.