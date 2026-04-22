/*
 * This is a JavaScript program designed to solve a specific string manipulation problem.
 * It takes input from standard input, processes two strings, and calculates a result.
 */

// Define the main function that encapsulates the core logic.
function Main( input )
{
    // First, we parse the input string.
    // The input is expected to be two lines, each representing a string.

    // Split the input by newline, take the first line, and then split it into an array of characters.
    let s = ( input . split( "\n" ) [ 0 ] ) . split( "" ) ; // This variable 's' will hold the first string as an array of characters.

    // Do the same for the second line to get the second string.
    let t = ( input . split( "\n" ) [ 1 ] ) . split( "" ) ; // This variable 't' will hold the second string as an array of characters.

    // Initialize a variable 'num' which will be used to count differences.
    // NOTE: The original code re-initializes 'num' inside the loop, which means only the last iteration's 'num' is considered.
    // This behavior must be preserved exactly as per Type I cloning rules.
    // The 'num' variable declared with 'var' has function scope, but its assignment `num = 0;` happens inside the loop.
    // This is a crucial detail for Type I.

    // Outer loop: Iterate through possible starting positions for string 't' within string 's'.
    // The loop runs from index 0 up to `s.length - t.length`.
    for ( let i = 0 ; i <= s . length - t . length ; i++ )
    {
        // Re-initialize 'num' for each iteration of the outer loop.
        // This is a key part of the original algorithm's logic.
        var num = 0 ; // Count of mismatches for the current window.

        // Inner loop: Compare characters of 't' with the current window of 's'.
        for ( let a = 0 ; a < t . length ; a++ )
        {
            // Check if the character at current position 'a' in 't'
            // is different from the character at 'i + a' in 's'.
            if ( t [ a ] != s [ i + a ] )
            {
                // If they are different, increment the mismatch counter.
                num++ ; // Increment the number of differences.
            }
        }
    } // End of the outer loop. At this point, 'num' holds the count from the *last* iteration of the outer loop.


    // After all iterations, evaluate the final value of 'num'.
    // This 'num' reflects the mismatch count for the *last* possible substring comparison.
    if ( num > t . length )
    {
        // If 'num' is greater than the length of 't',
        // print the length of 't'.
        console . log( t . length ) ; // Output 't.length'.
    }
    else
    {
        // Otherwise (if 'num' is less than or equal to 't.length'),
        // print the value of 'num'.
        console . log( num ) ; // Output the final 'num' value.
    }
} // End of the Main function definition.


// This section handles reading input and calling the main function.
// It uses Node.js 'fs' module to read from standard input.
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;
// The readFileSync method reads the entire file synchronously.
// "/dev/stdin" is the standard input path on Unix-like systems.
// "utf8" specifies the encoding.