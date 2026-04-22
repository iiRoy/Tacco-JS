/*
 * This is a highly optimized script for a very specific task.
 * It reads input from standard input, processes it, and prints a result.
 * The calculation involves specific numeric constants.
 */

// Initialize a variable 'x' by reading input from standard input.
// The input is read as UTF-8, trimmed, and then split by whitespace characters.
x = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( / \s / ) ;


// Initialize the loop counter 'i' to zero.
// This variable will be used to access elements of the 'x' array.
i = 0 ;


// The main processing loop.
// Interestingly, the primary action (calculation and logging) occurs in the
// initialization part of the 'for' loop statement.
for ( console . log ( Math . floor ( x [ i ++ ] * x [ i ++ ] / 0.000003305785 ) / 1000000 ) ;
      // The loop continues as long as 'i' is less than 'x.length - 1'.
      i < x . length - 1 ;
      // There is no update expression in this for loop.
      // The 'i' variable is incremented within the 'console.log' expression.
    )
{
    // This loop intentionally has an empty body.
    // All significant computation and output happens in the 'for' loop's
    // initialization clause before the first semicolon.
} // End of the main processing loop.

/*
 * The script completes execution after the loop finishes.
 * The final output is already displayed to the console.
 * No further operations are performed.
 */