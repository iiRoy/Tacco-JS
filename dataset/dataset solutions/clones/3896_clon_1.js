/*
 * This is a JavaScript program designed to process
 *  some input based on specific conditions.
 * It demonstrates basic control flow and array manipulation.
 */
function     Main  (   input   )
{
    // The 'input' parameter initially holds a single string.
    // We split it by newline characters to get an array of lines.
    input   =   input .   split ( "\n" )   ;

    /*
     * NMX is expected to be the first line of input,
     * split by spaces. It contains configuration values.
     */
    var     NMX =   input [ 0 ] .   split ( " " )   ;

    /*
     * A is expected to be the second line of input,
     * also split by spaces. It contains data elements.
     */
    var     A   =   input [ 1 ] .   split ( " " )   ;


    // This loop iterates based on the second element of NMX.
    for  (  var   i   =   0 ;
        i   <   NMX [ 1 ]   ;
          i ++  )
    {
        // Inside the loop, we check a condition involving elements from A and NMX.
        if  (   A [ i ]   >   NMX [ 2 ]   )
        {
            // If the primary condition is true, we then evaluate a secondary condition.
            if  (   i   >   NMX [ 1 ]   -   i   )
            {
                // If the secondary condition is true, log a calculated value and exit.
                console   .   log ( NMX [ 1 ]   -   i )   ;
                return  ; // Terminate function execution.
            }
            else
            {
                // Otherwise (if secondary condition is false), log 'i' and exit.
                console   .   log ( i )   ;
                return  ; // Terminate function execution.
            }
        }
    }
} /* End of the Main function block. */


// This section handles the execution flow:
// It reads input from standard input and passes it to the Main function.
Main (
    require ( "fs" ) // Access the Node.js 'fs' (file system) module.
        .   readFileSync ( "/dev/stdin" ,   "utf8" ) // Read the entire content of stdin as UTF-8.
)   ;
// The program finishes after Main completes or returns.