// This JavaScript file processes numerical data from standard input.
// It computes a sequence using dynamic programming and then applies
// a specific calculation to each input number.

/*
 * This section handles the initial setup of the program.
 * It reads the input and initializes necessary data structures.
 */

var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Reads data from stdin, interpreting it as UTF-8.

// The input string is trimmed of leading/trailing whitespace and then split into an array of lines.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Initialize the dynamic programming array 'dp' with its initial base values.
// These values are crucial for the recursive calculation that follows.
var dp = [ 1 , 2 , 4 ] ;

// This loop calculates the subsequent values for the 'dp' array.
// It follows a specific recurrence relation: dp[i] = dp[i-1] + dp[i-2] + dp[i-3].
// The calculation is performed up to an index of 31.
for ( var i = 3 ; i <= 31 ; i ++ )
{
    // The current dp value is the sum of the three preceding values in the sequence.
    dp [ i ] = dp [ i - 1 ] + dp [ i - 2 ] + dp [ i - 3 ] ;
} // End of the dynamic programming calculation loop.


/*
 * This section processes each number provided in the input array.
 * It continues until a '0' is encountered, signaling the end of input.
 */
while ( true )
{
    // Extracts the first element from the 'Arr' array and converts it to a number.
    // The '-0' is a common JavaScript idiom for type coercion to a number.
    var n = Arr . shift ( ) - 0 ;

    // If the extracted number 'n' is 0, it signifies the end of the input sequence.
    if ( n == 0 )
    {
        break ; // Exit the while loop if 'n' is 0.
    }

    // Calculates the final result for the current number 'n'.
    // It retrieves a pre-computed value from the 'dp' array, divides it by 3650,
    // and then rounds the result up to the nearest whole number using Math.ceil().
    // The result is then printed to the console.
    console . log ( Math . ceil ( dp [ n - 1 ] / 3650 ) ) ;

} // End of the input processing loop.

// The program has finished executing all operations.