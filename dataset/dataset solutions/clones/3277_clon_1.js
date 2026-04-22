/*
 * This is the primary function responsible for
 * processing the input data and calculating the result.
 */


function   Main  (  input  )
{
    // The input string is first split into an array of lines.
    input  =  input.split  ( "\n" ) ;


    // Parse the first line as an integer for N.
    N  =  parseInt  (  input[0]  ) ;
    // Parse the second line as an integer for H.
    H  =  parseInt  (  input[1]  ) ;
    // Parse the third line as an integer for W.
    W  =  parseInt  (  input[2]  ) ;

    // Calculate the answer based on the given formula.
    // This represents the number of possible positions for a sub-grid of size HxW within an NxN grid.
    var   ans   =   ( N - H + 1 )   *   ( N - W + 1 ) ;

    // Output the calculated answer to the console.
    console.log  (  '%s' ,   ans  ) ;

} // End of Main function definition.


// This function is purely for debugging purposes,
// typically used in a web environment to simulate input from a UI element.
function   debug  (  )
{
    // Retrieve the value from an HTML input element.
    var   input   =   document.getElementById  ( "input" ) .value ;
    // Call the main processing function with the retrieved input.
    Main  (  input  ) ;
} // End of debug function.


// This section handles the execution when the script is run directly,
// reading input from standard input (e.g., /dev/stdin in a Unix-like environment).
Main  (  require  ( "fs" ) .readFileSync  ( "/dev/stdin" ,   "utf8" )  ) ;