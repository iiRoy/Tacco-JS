/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and
 * expressions are preserved exactly as they were in the source.
 * Only whitespace (spaces, tabs, newlines) and comments have been altered
 * to create a visually distinct but functionally identical version.
 */

// Define the main function that processes the input string.
function   main
(  input
)
{
    // Split the input string by newline characters to get individual lines.
    var   lines   =   input.split ( '\n' ) ;

    // Take the first line and split it by spaces to get initial parameters.
    var   line0   =   lines [ 0 ] . split ( ' ' ) ;

    // Parse the first element of line0 as an integer for 'n'.
    var   n       =   parseInt ( line0 [ 0 ] ) ;

    // Parse the second element of line0 as an integer for 'a'.
    var   a       =   parseInt ( line0 [ 1 ] ) ;

    // Parse the third element of line0 as an integer for 'b'.
    var   b       =   parseInt ( line0 [ 2 ] ) ;

    /*
     * Take the second line, split it by spaces, and map each part
     * to an integer, storing the results in array 'x'.
     */
    var   x       =   lines [ 1 ] . split ( ' ' ) . map ( t => parseInt ( t ) ) ;


    // Initialize a variable 'ans' to store the accumulated answer.
    var   ans     =   0 ;


    // Loop through the array 'x' from the first element up to the second-to-last.
    for
    (
        var   i   =   0 ; // Initialize loop counter 'i' to 0.
        i   <   n   -   1 ; // Continue as long as 'i' is less than 'n - 1'.
        i++                 // Increment 'i' after each iteration.
    )
    {
        // Calculate the cost for the current segment:
        // Option 1: 'a' times the difference between consecutive elements of 'x'.
        // Option 2: Fixed cost 'b'.
        // Add the minimum of these two options to 'ans'.
        ans   +=   Math.min ( a   *   (   x [ i   +   1 ]   -   x [ i ]   ) ,   b   ) ;
    }

    // Output the final calculated answer to the console.
    console . log ( ans ) ;
}


// --- Program Entry Point ---
// Read input from standard input, decode it as UTF-8, and pass it to the main function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;