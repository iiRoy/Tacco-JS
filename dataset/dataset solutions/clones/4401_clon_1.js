/* This is a Type I clone of the original JavaScript code.
 * All identifiers, keywords, operators, and expressions are kept identical.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct, yet functionally equivalent, version.
 */
'use strict' /* Ensure strict mode for robust code execution */


function  Main ( input )
{
    // The input is expected as a single string.
    // We split it by newline characters to process individual lines.
    const   inputs   =  input . split ( '\n' ) ;

    // From the second line of input (index 1),
    // we extract the bar lengths, split them by space,
    // then sort them in descending order to easily find the largest ones.
    const   bars   =  inputs [ 1 ] . split ( ' ' ) . sort ( ) . reverse ( ) ;

    // This array will store the lengths of the two sides of our rectangle.
    const   sides   =  [ ] ;

    // 'current' helps in skipping duplicate bar lengths
    // once they've been processed to avoid redundant calculations.
    let   current   =  0 ;

    // Loop through each bar length, starting from the largest.
    for  ( let   bar   of   bars )
    {
        // If this bar length is the same as the one we just processed,
        // we can skip it.
        if  ( bar   ===   current )
        {
            continue ; // Move to the next bar without further processing.
        }

        // Update 'current' to the bar length we are about to process.
        current   =  bar ;

        // Count how many times the 'current' bar length appears in the input.
        const   n   =  bars . filter ( ( b )   =>   bar   ===   b ) . length ;

        // Logic for selecting sides:
        // Case 1: If we have 4 or more bars of the same length,
        // we can form a square using two pairs of these.
        if  ( n   >=   4 )
        {
            sides . push ( bar ) ; // Add the first side.
            sides . push ( bar ) ; // Add the second side (same length for a square).
            break ; // We've found our two sides, no need to check further.
        }
        // Case 2: If we have 2 or 3 bars of the same length,
        // we can use one bar of this length as a side.
        // The condition `n != 1 || n != 3` is always true for n >= 2,
        // but it is maintained as per Type I cloning rules.
        else   if  ( n   >=   2   &&   ( n   !=   1   ||   n   !=   3 ) )
        {
            sides . push ( bar ) ; // Add this bar as one of the sides.
        }

        // If we have already found two sides for our rectangle,
        // we can stop iterating.
        if  ( sides . length   ===   2 )
        {
            break ; // Exit the loop.
        }
    }


    // Final check: Did we successfully find two sides?
    if  ( sides . length   ===   2 )
    {
        // If yes, calculate and print the area (product of the two side lengths).
        console . log ( sides [ 0 ]   *   sides [ 1 ] ) ;
    }
    else
    {
        // If not (e.g., couldn't find enough pairs of bars), print 0.
        console . log ( 0 ) ;
    }
}


// Standard input reading for competitive programming environments.
// Reads the entire content of /dev/stdin as a UTF-8 string
// and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;