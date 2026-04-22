/*
 * This JavaScript file processes input data
 * to determine a specific condition based on numerical values.
 * It's structured as a single Main function.
 */

//  The primary function that receives all input data as a single string.
function   Main (   input   ) {
    //  The input string is split into individual lines for easier processing.
    //  Each line corresponds to a specific part of the problem's input.


    const   inputLines   =   input . split ( "\n" ) ; // Split input by newline character.
    const   line0        =   inputLines [ 0 ] ;         // First line of input.
    const   line0vars    =   line0 . split ( " " ) ;    // Variables from the first line.
    const   line1        =   inputLines [ 1 ] ;         // Second line of input.
    const   line1vars    =   line1 . split ( " " ) ;    // Variables from the second line.
    const   line2        =   inputLines [ 2 ] ;         // Third line of input.

    //  Parse numerical values from the first line.
    const   a            =   parseInt ( line0vars [ 0 ] ,   10 ) ;
    const   v            =   parseInt ( line0vars [ 1 ] ,   10 ) ;


    //  Parse numerical values from the second line.
    const   b            =   parseInt ( line1vars [ 0 ] ,   10 ) ;
    const   w            =   parseInt ( line1vars [ 1 ] ,   10 ) ;


    //  Parse the numerical value from the third line.
    const   t            =   parseInt ( line2 ,   10 ) ;


    //  Check for a specific condition where v is less than or equal to w.
    if   (   v   <=   w   )
    {
        //  If the condition is met, check if 'a' is equal to 'b'.
        //  Output "YES" or "NO" accordingly.
        console . log (   (   a   ===   b   )   ?   "YES"   :   "NO"   ) ;
        return ; // Terminate function execution.
    }

    //  Calculate the time required based on absolute differences in positions and speeds.
    const   time   =   Math . abs (   b   -   a   )   /   Math . abs (   v   -   w   ) ;

    //  Check if the calculated time is positive and within the given time 't'.
    console . log (   (   0   <   time   &&   time   <=   t   )   ?   "YES"   :   "NO"   ) ;
    return ; // Terminate function execution.

    /*
     * The following commented-out code block is an example of previous logic
     * or alternative parsing methods that are not currently used in this version.
     * It serves as a historical reference or a placeholder.
     */
    //  tmp   =   input [ 1 ] . split ( " " ) ;
    //  var   a   =   parseInt ( input [ 0 ] ,   10 ) ; // Example of parsing directly from input array
    //  var   b   =   parseInt ( tmp [ 0 ] ,   10 ) ;
    //  var   c   =   parseInt ( tmp [ 1 ] ,   10 ) ;
    //  var   s   =   input [ 2 ] ;
    //  console . log ( '%d %s' ,   a   +   b   +   c ,   s ) ;
}


/*
 * This section handles standard input/output.
 * It reads all data from standard input,
 * converts it to a UTF-8 string, and passes it to the Main function.
 * Do not modify the code below this line, as it's part of the boilerplate.
 */
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )   ) ;


/*
 * Example usage from command line:
 * To run this script, use Node.js:
 *
 *    node   your_script_name.js
 *
 * Then provide input like:
 *    10   2
 *    5    1
 *    3
 *
 * (Press Ctrl + D or Ctrl + Z then Enter to signal end of input)
 */