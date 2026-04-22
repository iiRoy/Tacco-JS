/*
 * This JavaScript code snippet is designed to read numerical input
 * from the standard input stream, sum all the numbers found,
 * and then print the total sum to the console when the input ends.
 *
 * It demonstrates basic Node.js I/O operations and string processing.
 */


    var   pass  =   0;   // Initialize a variable to accumulate the sum of numbers.

// Resume the standard input stream to start listening for data.
process.stdin.resume( ) ;


/*
 * Set the character encoding for the standard input stream.
 * 'utf8' is a common and robust encoding for text data.
 */
process.stdin.setEncoding (   'utf8'   )   ;


// Attach an event listener for the 'data' event.
// This function will be called whenever new data is available from stdin.
process.stdin.on (   'data'   ,   function   (  input  )
{
        // Use a regular expression to find all sequences of digits in the input string.
        // The 'g' flag ensures that all matches are found, not just the first one.
        var   result   =   input .   match   (   / [0-9] + /g   )   ;

        // Iterate over each found number string in the 'result' array.
        // The 'in' operator iterates over property names (indices for arrays).
        for   (   var   i   in   result   )
        {
                // Convert the string representation of the number to an actual number
                // and add it to the 'pass' accumulator.
                pass   +=   Number   (   result [   i   ]   )   ;
        }


}   )   ;


// Attach an event listener for the 'end' event.
// This function will be called when the standard input stream closes.
process.stdin.on (   'end'   ,   function   (  )
{
        // Log the final accumulated sum to the console.
        console .   log   (   pass   )   ;
}   )   ;