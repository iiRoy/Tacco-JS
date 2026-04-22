'use strict' ; /* This directive enables strict mode, ensuring cleaner code. */


function   Main (   stdin   )
{
    // First, process the input string.
    // It's trimmed for leading/trailing whitespace, then split into an array of lines.
    const   input   =   stdin . trim ( ) . split ( /\r?\n/g ) ;

    // The very first line of the input contains the integer N.
    // We remove it from the 'input' array and convert it to a number.
    const   N   =   Number ( input . shift ( ) ) ;

    /*
     * The remaining two lines in 'input' array represent two rows of numbers.
     * Each row string is split by space, and every resulting substring is converted to a number.
     * This creates a 2D array, 'A', where A[0] is the first row and A[1] is the second.
     */
    const   A   =   input . map (   row   =>   row . split ( ' ' ) . map (   str   =>   Number ( str )   )   ) ;

    // Initialize 'result' to 0. This variable will hold the maximum sum found across all iterations.
    let   result   =   0   ;


    // Begin the main loop: Iterate 'j' from 0 up to N-1.
    // 'j' effectively acts as a split point or boundary index.
    for   (   let   j   =   0   ;   j   <   N   ;   j ++   )
    {
        // For each iteration of 'j', initialize 'count' to 0.
        // 'count' will accumulate the sum for the current configuration.
        let   count   =   0   ;

        // First inner loop: Sum elements from the first row of 'A'.
        // It sums elements from index 0 up to 'j' (inclusive).
        for   (   let   k   =   0   ;   k   <=   j   ;   k ++   )
        {
            count   +=   A [ 0 ] [ k ] ; // Add the element at A[0][k] to 'count'.
        }

        // Second inner loop: Sum elements from the second row of 'A'.
        // It sums elements from index 'j' up to N-1 (exclusive of N).
        for   (   let   k   =   j   ;   k   <   N   ;   k ++   )
        {
            count   +=   A [ 1 ] [ k ] ; // Add the element at A[1][k] to 'count'.
        }

        // After summing for the current 'j', compare 'count' with 'result'.
        // If 'count' is greater, update 'result' to this new maximum.
        if   (   result   <   count   )
        {
            result   =   count   ;
        }
    }

    // Finally, print the maximum sum found ('result') to the console.
    console . log ( result ) ;
}


// This section handles the standard input for execution, typically in a competitive programming environment.
// It reads the entire content of '/dev/stdin' as a UTF-8 string and passes it to the Main function.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   ) ;