/* This is a Type I clone of the original JavaScript code.
 * All logic and structure are preserved exactly.
 * Only whitespace and comments have been altered significantly.
 * This version aims for maximum visual difference while maintaining functional equivalence.
 */

// Define the main program entry point function
function Main(   input   )
{
    // Split the entire input string by newline characters into an array
    var   inp   =   input . split ( "\n" )   ;

    // The first element of the input array is parsed as N
    var   N   =   inp [ 0 ]   ;

    // Remove the first element from the 'inp' array, as it's now stored in N
    inp . shift (   )   ;

    // Assign the remaining elements of 'inp' to a new array variable A
    var   A   =   inp   ;


    // Loop N times, iterating through a specific process for each iteration
    for   (   var   i   =   0   ;   i   <   N   ;   i ++   )
    {
        // Create a shallow copy of array A for manipulation within the loop
        var   arr   =   A . slice (   0   ,   A . length   )   ;

        // Remove one element from the copied array at the current index 'i'
        arr . splice (   i   ,   1   )   ;

        // Use the reduce method to find the maximum value in the modified 'arr'
        // The result is then printed to the console
        console . log (   arr . reduce (   (   a   ,   b   )   =>   a   >   b   ?   a   :   b   )   )   ;
    } // End of the main processing loop

} // End of Main function definition


// This section handles the execution of the Main function.
// It reads input from standard input (/dev/stdin) using Node.js 'fs' module.
Main (   require ( "fs" ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;