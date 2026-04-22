/* This is a Type I clone of a JavaScript program.
 * It demonstrates extensive whitespace and comment variations
 * while preserving the exact logic and identifiers.
 */

const /* Input module */ input = require ( "fs" ) . readFileSync ( /* Path to stdin */ "/dev/stdin", "utf8" ) ;

// Split the input into lines
const lines = input . split ( '\n' ) ;

// Convert the first line to a number
const X = lines [ 0 ] - 0 ; // The `- 0` ensures numeric conversion

/*
 * Initialize an array to store powers of 5.
 * The first two elements are 0 and 1, corresponding to 0^5 and 1^5.
 */
let five = [ 0 , 1 ] ;


// Calculate the maximum value for the powers of 5 to consider
const max = X * X ;

/*
 * Loop to populate the 'five' array with i^5 values.
 * The loop continues as long as the last element added is less than 'max'.
 */
for ( let i = 2 ; five [ five . length - 1 ] < max ; i ++ )
{
    five . push ( Math . pow ( i , 5 ) ) ; // Add i raised to the power of 5
}
; /* Semicolon to prevent ASI issues with the immediately invoked function expression */

( ( ) =>
{ // Immediately invoked function expression for scope encapsulation
    /*
     * Nested loops to find two numbers from the 'five' array
     * (let's call them A and B) such that:
     * A - B = X OR A + B = X
     */
    for ( let i = 0 ; i < five . length ; i ++ )
    {
        for ( let j = 0 ; j < five . length ; j ++ )
        {
            // Check the first condition: five[i] - five[j] === X
            if ( five [ i ] - five [ j ] === X )
            {
                console . log ( i , j ) ; // Output the indices
                return ; // Exit the function once a solution is found
            }
            // Check the second condition: five[i] + five[j] === X
            else if ( five [ i ] + five [ j ] === X )
            {
                console . log ( i , -j ) ; // Output the indices, with -j for the second term
                return ; // Exit the function once a solution is found
            }
        } // End of inner loop (j)
    } // End of outer loop (i)
} ) ( ) ; // Invoke the function
// End of program