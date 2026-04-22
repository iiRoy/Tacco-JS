/*
 * This is a Type I clone of the original JavaScript code.
 *
 * According to the definition, this means:
 * - All code fragments are exactly equal, except for possible variations
 *   in whitespace and comments.
 * - Identifiers, variable names, function names, operators, and expressions
 *   remain completely unchanged.
 *
 * This version introduces extensive changes in spacing, indentation, and comments
 * to appear visually different while preserving the exact same functionality
 * and underlying structure.
 */

"use strict" ; /* Enforce strict mode for cleaner code and error handling. */

function    Main /* This is the main function that processes the input */
    ( input /* The raw input string provided to the program */ )
{
    // First, split the entire input string into an array of individual lines.
    input = input . split ( "\n" ) ;

    var line = input . map (
        function ( v /* 'v' represents each line string from the input array */ )
        {
            /*
             * For each line, we split it by spaces to get individual string numbers,
             * and then convert each of those string numbers into actual Number types.
             */
            return v . split ( " " ) . map ( Number ) ;
        }
    ) ; // End of the 'map' operation that transforms input lines.

    var ans = "" ; // Initialize an empty string to accumulate the results.

    /*
     * Iterate through the processed lines.
     * The loop continues as long as the sum of the first two numbers in the current line is not zero.
     * This acts as the termination condition for the problem.
     */
    for ( var i = 0 ; line [ i ] [ 0 ] + line [ i ] [ 1 ] ; i ++ )
    {
        // Sort the numbers within the current line array in ascending order.
        line [ i ] . sort ( ) ;

        // Join the sorted numbers back into a space-separated string,
        // remove any leading/trailing whitespace (though 'join' typically won't add it),
        // and append a newline character for formatting.
        ans += line [ i ] . join ( " " ) . trim ( ) + "\n" ;
    } // End of the primary processing loop.

    // Finally, print the accumulated answer string to the standard output.
    console . log ( ans ) ;
} /* End of the Main function definition. */


/*
 * This 'debug' function is typically used for local testing,
 * especially in a browser environment where input might come from an HTML element.
 */
function debug ( )
{
	// Retrieve the value from an HTML input element with the ID "input".
	var input = document . getElementById ( "input" ) . value ;

	// Call the Main function with the retrieved browser input.
	Main ( input ) ;
} /* End of the debug function. */


// This part of the code handles execution when run in a Node.js environment.
// It reads the entire content of standard input (from /dev/stdin),
// decodes it as UTF-8, and passes it to the Main function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Execute the main program logic.