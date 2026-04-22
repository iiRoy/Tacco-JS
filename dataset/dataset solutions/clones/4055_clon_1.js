/*
 * This JavaScript function, named 'Main', is designed to process
 * a block of input data provided as a single string.
 * It parses the input to extract numerical arrays and then performs
 * a specific calculation to find a maximum sum based on these arrays.
 *
 */
function Main(  input  )
{

    // Split the entire input string into an array of lines.
    var   inp   =   input . split (   '\n'   )   ;

    // Extract the first line, which is expected to be 'N'.
    var   N   =   inp [ 0 ]   ;

    // Split the second line into an array of strings, representing 'tmp' values.
    var   tmp   =   inp [ 1 ] . split (   ' '   )   ;

    // Split the third line into an array of strings, representing 'tmp2' values.
    var   tmp2   =   inp [ 2 ] . split (   ' '   )   ;


    // Declare and initialize a new Array object, which will become a 2D array.
    var   A   =   new   Array   ;

    // Initialize the first sub-array.
    A [ 0 ]   =   new   Array   ;

    // Initialize the second sub-array.
    A [ 1 ]   =   new   Array   ;


    /* The original code had a commented-out console.log statement here.
     * It has been intentionally removed in this cloned version to alter
     * the visual appearance while maintaining functional equivalence. */


    // Loop through two rows (i = 0 and i = 1) to populate the 2D array A.
    for
    (
        var   i   =   0   ;
        i   <   2   ;
        i   ++
    )
    {
        // Loop through N columns for each row.
        for
        (
            var   j   =   0   ;
            j   <   N   ;
            j   ++
        )
        {
            // If it's the first row (i = 0), parse values from 'tmp'.
            if   (   i   ===   0   )
            {
                A [ i ] [ j ]   =   parseInt (   tmp [ j ]   )   ;
            }
            // If it's the second row (i = 1), parse values from 'tmp2'.
            else   if   (   i   ===   1   )
            {
                A [ i ] [ j ]   =   parseInt (   tmp2 [ j ]   )   ;
            }
        }
    }


    // Initialize a variable to keep track of the maximum sum found.
    var   maxVal   =   0   ;


    // This loop iterates from 0 up to N-1, determining the split point for sums.
    for
    (
        var   tmp   =   0   ;
        tmp   <=   N   -   1   ;
        tmp   ++
    )
    {
        // Initialize the sum for the current iteration.
        var   sum   =   0   ;

        // Sum elements from the first row (A[0]) from index 0 up to N - 1 - tmp.
        for
        (
            var   l   =   0   ;
            l   <=   N   -   1   -   tmp   ;
            l   ++
        )
        {
            sum   +=   A [ 0 ] [ l ]   ;
        }

        // Sum elements from the second row (A[1]) from index N - 1 - tmp up to N - 1.
        for
        (
            var   m   =   N   -   1   -   tmp   ;
            m   <=   N   -   1   ;
            m   ++
        )
        {
            sum   +=   A [ 1 ] [ m ]   ;
        }

        // Update maxVal if the current sum is greater.
        if   (   sum   >   maxVal   )
        {
            maxVal   =   sum   ;
        }
    }

    // Output the final maximum value to the console.
    console . log (   '%d'   ,   maxVal   )   ;

}

// DO NOT MODIFY THE FOLLOWING LINE: This handles standard input/output and calls the Main function.
Main (   require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;