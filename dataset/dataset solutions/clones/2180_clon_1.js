"use strict" ;

// This is a Type I clone example.
// All variable names, function names, and expressions
// remain identical to the original code.
// Only whitespace and comments have been altered significantly.


function   main (   input   ) {

    /*
     *   The main function processes the input array.
     *   It reads `k` and `n` values from the input.
     */

    let   k   =   input [ 0 ] .   split (   " "   ) ;

    // Extracting the second element for 'k'
    k   =   k [ 1 ] ;


    let   n   =   input [ 1 ] .   split (   " "   ) ;


    // --- Start of expectation pre-calculation ---
    // This section computes the expected values for each element in 'n'.
    let   exp   =   [ ] ;

    for   (   let   i   =   0   ;   i   <   n .   length   ;   i ++   )   {

        // The formula for expectation is (2 + value) / 2
        exp [ i ]   =   (   2   +   parseInt (   n [ i ] ,   10   )   )   /   2   ;

    }
    // --- End of expectation pre-calculation ---


    // --- Start of cumulative sum calculation ---
    // This part calculates the prefix sums of the 'exp' array.
    let   sum   =   [   0   ]   ;

    for   (   let   i   =   0   ;   i   <   n .   length   ;   i ++   )   {

        // sum[i+1] is sum[i] plus the current expectation exp[i]
        sum [ i + 1 ]   =   sum   [   i   ]   +   exp [ i ]   ;

    }
    // --- End of cumulative sum calculation ---


    // --- Start of calculation for the sum of adjacent 'k' terms ---
    // This loop finds the maximum sum of 'k' consecutive elements.
    let   max   =   0   ;

    for   (   let   i   =   k   -   1   ;   i   <   n .   length   ;   i ++   )   {

        // Calculate the sum of 'k' terms ending at index 'i'
        let   max_n   =   sum [ i ]   -   sum [ i   -   k ]   ;

        // Update 'max' if 'max_n' is greater
        max   =   (   max   <   max_n   )   ?   max_n   :   max   ;

    }

    // Output the final maximum sum to the console.
    console .   log (   max   ) ;

}


// Execute the main function with input from standard input.
// The input is read, trimmed, and split by newlines.
main (   require ( 'fs' ) .   readFileSync ( '/dev/stdin' ,   'utf8' ) .   trim ( ) .   split ( "\n" )   ) ;