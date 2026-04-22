/* This script reads input from standard input, processes it, and prints results to standard output. */

const   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) . trim ( ) ;

// The input string is then split into an array of lines.
const   lines   =   input . trim ( ) . split ( "\n" ) ;


/* Main processing loop. Continues as long as there are more than one line
 * remaining in the 'lines' array, indicating more test cases to process. */
while ( lines . length   >   1 )
{
    // Extract the first line, which contains the counts c1 and c2 for the two arrays.
    const   [ c1 ,   c2 ]   =   lines . shift ( ) . trim ( ) . split ( " " ) . map ( Number ) ;

    // Initialize two empty arrays, d1 and d2, to store the numbers for the current test case.
    const   d1   =   [ ] ,   d2   =   [ ] ;

    // Populate array d1 with 'c1' numbers from the subsequent lines.
    while ( d1 . length   <   c1 )
    {
        d1 . push ( parseInt ( lines . shift ( ) . trim ( ) ) ) ; // Parse integer from line.
    }

    // Populate array d2 with 'c2' numbers from the subsequent lines.
    while ( d2 . length   <   c2 )
    {
        d2 . push ( parseInt ( lines . shift ( ) . trim ( ) ) ) ; // Another integer parse.
    }


    // Calculate the sum of elements in array d1.
    const   sD1   =   d1 . reduce ( ( s ,   v )   =>   s   +   v ,   0 ) ;
    // Calculate the sum of elements in array d2.
    const   sD2   =   d2 . reduce ( ( s ,   v )   =>   s   +   v ,   0 ) ;

    /*
     * Conditional logic based on the sums of the two arrays.
     * This handles different scenarios for finding a solution.
     */
    if ( sD1   ===   sD2 )
    {
        // If sums are equal, sort d1 to easily find the smallest common element.
        d1 . sort ( ( a , b )   =>    a   -   b ) ;

        // Initialize 'rs' (result) to -1 (not found) and 'i' for iteration.
        let   rs   =   -1 ,   i   =   0 ;

        // Search for the smallest common element between d1 and d2.
        while ( rs   ===   -1   &&   i   <   c1 )
        {
            if ( d2 . includes ( d1 [ i ] ) )
            {
                rs   =   d1 [ i ] ; // Found a common element.
            }
            i ++ ; // Increment index.
        }

        if ( rs   ===   -1 )
        {
            // No common element found.
            console . log ( -1 ) ;
        }
        else
        {
            // Found a common element, print it twice.
            console . log ( rs   +   ' '   +   rs ) ;
        }
    }
    else   if ( ( sD1   +   sD2 ) % 2 )
    {
        // If the total sum is odd, it's impossible to make sums equal by swapping one element.
        console . log ( -1 ) ;
    }
    else
    {
        // When sums are not equal but their total is even, a swap might be possible.
        const   sD   =   ( sD1   +   sD2 )   /   2 ; // The target sum for each array after swap.
        let   m1 ,   m2 ,   sum   =   201 ; // m1, m2 store the elements to be swapped; sum stores their total.
                                        // 201 is used as an initial high value, assuming elements are <= 100.

        // Iterate through elements of d1 to find a suitable swap.
        for ( let   i   =   0 ;   i   <   c1 ;   i ++ )
        {
            const   t1   =   d1 [ i ] ; // Element from d1 to potentially swap out.
            const   t2   =   sD   -   sD1   +   t1 ; // The element from d2 that would need to be swapped in.

            // Check if t2 exists in d2 and if this swap results in a smaller total sum (t1 + t2).
            if ( d2 . includes ( t2 )   &&   sum   >   t1   +   t2 )
            {
                sum   =   t1   +   t2 ; // Update minimum total sum.
                m1   =   t1 ; // Store the element from d1.
                m2   =   t2 ; // Store the element from d2.
            }
        }

        if ( sum   <   201 )
        {
            // A valid swap was found (sum is less than the initial high value).
            console . log ( m1   +   ' '   +   m2 ) ;
        }
        else
        {
            // No suitable swap found that makes the sums equal.
            console . log ( -1 ) ;
        }
    }
}
// End of file comment.
/* This concludes the processing of all test cases provided in the input. */