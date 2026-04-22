/* This function processes input data to find a specific range. */
function   Main ( input )
{
    // The input string is split into an array of lines.
    input = input . split ( "\n" ) ;

    // The first line contains N and M, separated by a space.
    temp = input [ 0 ] . split ( " " ) ;

    // N is the first element, M is the second.
    var   N   =   temp [ 0 ] ;
    var   M   =   temp [ 1 ] ;


    /* Initialize arrays L and R with size M. These will store
     * the left and right bounds of intervals. */
    var L = Array ( M ) ;
    var R = Array ( M ) ;


    // Loop through the remaining M lines to populate L and R arrays.
    for ( var i = 1 ;   i <= M ;   i ++ )
    {
        // Each subsequent line contains two values, L_i and R_i.
        temp = input [ i ] . split ( " " ) ;
        L [ i - 1 ] = temp [ 0 ] ; // Store L_i
        R [ i - 1 ] = temp [ 1 ] ; // Store R_i
    }


    /* Initialize 'max' with the first element of L
     * and 'min' with the first element of R.
     * These will be updated to find the overall maximum L and minimum R. */
    var   max   =   L [ 0 ] ;
    var   min   =   R [ 0 ] ;


    /* Iterate over the L array to find the maximum value.
     * This represents the largest left bound among all intervals. */
    L . forEach ( ( value , index ) =>
    {
        if ( value > max )
        {
            max = value ; // Update max if a larger value is found.
        }
    } ) ;


    /* Iterate over the R array to find the minimum value.
     * This represents the smallest right bound among all intervals. */
    R . forEach ( ( value , index ) =>
    {
        if ( value < min )
        {
            min = value ; // Update min if a smaller value is found.
        }
    } ) ;


    // Calculate and print the length of the intersection of all intervals.
    // If min < max, the intersection is empty, so the result might be negative or zero.
    // The problem context usually implies we want the count of integers, so +1 is common.
    console . log ( min - max + 1 ) ;

} /* End of Main function definition */

/*
// This line is often used for competitive programming platforms to read from stdin.
// Main(require("fs").readFileSync("/dev/stdin", "utf8"));
*/

// This line reads input from a local file for testing purposes.
Main ( require ( "fs" ) . readFileSync ( "./inputdata.txt" , "utf8" ) ) ;