/* This JavaScript module defines functions for calculating a specific 'sadness' metric
 * and a 'main' function to process input data.
 *
 * It is designed to be executed in a Node.js environment, reading from standard input.
 */

// Function definition for 'sadness'.
// This function takes two parameters: 'b' (a numerical offset) and 'A' (an array of numbers).

function    sadness (   b ,   A   )
{
    // Initialize the aggregation variable 'result' to zero.
    var         result          =       0       ;

    /*
     * Begin a loop that iterates through each element of the input array 'A'.
     * The loop variable 'i' serves as an index for array access.
     */
    for (   var     i       =       0       ;       i       <       A . length       ;       i ++    )
    {
        // Calculate the absolute difference and add it to 'result'.
        // The expression 'A[i] - (b + i + 1)' is central to the 'sadness' calculation.
        result      +=      Math . abs (   A [   i   ]   -   (   b   +   i   +   1   )   )       ;
    }

    // After the loop completes, return the final accumulated 'result'.
    return      result      ;
}


// --- Main Program Execution Logic ---
// The 'main' function orchestrates the data processing.

function    main (   input   )
{
    // First, split the entire input string into individual lines.
    const       lines       =       input . split (   '\n'   )       ;

    // Parse the first line to extract the integer value for 'N'.
    const       N       =       parseInt (   lines [   0   ]   )       ;

    // Process the second line: split by spaces, then convert each part to an integer.
    const       As       =       lines [   1   ] . split (   ' '   ) . map (   x       =>       parseInt (   x   )   )       ;


    // Calculate the median index, which will be used for array access later.
    const       median_index        =       Math . floor (   N   /   2   )       ;


    // Declare and initialize an array to hold the differences.
    var         sorted_A_diffs      =       [   ]       ;

    // Populate the 'sorted_A_diffs' array by subtracting (i+1) from each element of 'As'.
    for (   var     i       =       0       ;       i       <       As . length       ;       i ++    )
    {
        sorted_A_diffs . push (   As [   i   ]   -   (   i   +   1   )   )       ;
    }

    // Sort the newly populated array in ascending numerical order.
    sorted_A_diffs . sort (   function (   a ,   b   ) {   return   a   -   b   ;   }   )


    // The following lines were likely used for debugging during development.
    // They are intentionally commented out in the final version.
    // console.log(N);
    // console.log(As);
    // console.log(A_diffs); // Note: 'A_diffs' here was likely a placeholder/typo for 'sorted_A_diffs'.
    // console.log([sadness(b, As), sadness(b+1, As)]);


    // Initialize the primary result variable for the 'main' function.
    var         result      =       0       ;

    /*
     * Conditional logic to determine the value of 'b' based on whether 'N' is even or odd.
     * This decision significantly impacts the final 'sadness' calculation.
     */
    if (   N   %   2       ==      0   )
    {
        // If 'N' is an even number, 'b' is the floor of the average of the two middle difference values.
        var     b       =       Math . floor (   (   sorted_A_diffs [   median_index   ]   +   sorted_A_diffs [   median_index   +   1   ]   )   /   2   )       ;
        result      =       sadness (   b ,   As   )       ;
    }
    else
    {
        // If 'N' is an odd number, 'b' is simply the middle difference value.
        var     b       =       sorted_A_diffs [   median_index   ]       ;
        result      =       sadness (   b ,   As   )       ;
    }

    // Finally, print the computed 'result' to the standard output.
    console . log (   result   )       ;
}


// --- Program Entry Point ---
// This line executes the 'main' function by reading input from standard input.

main (   require (   'fs'   ) . readFileSync (   '/dev/stdin' ,   'utf8'   )   )       ;