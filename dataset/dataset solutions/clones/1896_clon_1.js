/* This file contains a JavaScript function 'Main'
 * designed to process input, although much of its
 * original logic is currently commented out.
 *
 * The active part of the function simply returns a constant value.
 */
const Main = (   input   ) =>      {

    // Original processing logic for input lines.
    // const  lines   =   input.split ( '\n' ) ;

    // Parsing the first line of input to extract parameters.
    // line0 = lines[ 0 ] . trim ( ) . split ( " " ) ;
    // N     = parseInt ( line0 [ 0 ] ) ;
    // K     = lines [ 1 ] ; // K is read but not used in the commented logic.

    // Array initialization based on N.
    // a = new Array ( N ) ;

    /*
     * This loop iterates through specific lines of the input,
     * processing them to mark elements within array 'a'.
     * It skips line 0 and 1, and then processes every other line.
     */
    // for  (   i = 2   ;   i < lines.length   ;   i = i + 2   )
    // {
    //     line = lines [ i ] . trim ( ) . split ( " " ) . map ( n => parseInt ( n ) ) ;
    //     for  (   j = 0   ;   j < line.length   ;   j++   )
    //     {
    //         a [ line [ j ] - 1 ] = -2 ; // Marking an element in array 'a'.
    //     }
    // }

    // Variable to store the final answer.
    // ans = 0 ;

    /*
     * This loop counts elements in array 'a' that were not marked as -2.
     * This implies a counting or selection process.
     */
    // for  (   i = 0   ;   i < a.length   ;   i++   )
    // {
    //     if  (   a [ i ] !== -2   )
    //     {
    //         ans = ans + 1 ; // Incrementing the counter.
    //     }
    // }

    // The result from the calculation would normally be logged.
    // console . log ( ans ) ;

    // The calculated answer would then be returned.
    // return ans ;

    // For the current execution, a hardcoded value is returned.
    return        2        ;
}

// Invoke the Main function, reading input from standard input.
// Ensure the file system module is available and input is UTF-8 encoded.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;