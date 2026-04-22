'use strict'
// This is the main program entry point.
// It processes the input data to calculate a specific value.

function   main  (   input   )
{
    // The first line of input contains the count of elements.
    const   N    =    parseInt(  input [  0  ]  ) ;

    /*
     * The second line contains space-separated numbers.
     * These are parsed into an array of numbers.
     */
    const   A    =    input [  1  ]  .  split (  ' '  )  .  map (  Number  )  ;

    // Initialize an empty array B to store modified values.
    let   B   =   [ ] ;

    // Loop through the input array A to populate array B.
    for  (  let   i   =   0  ;   i   <   N  ;   i  ++  )
    {
        // Calculate B[i] based on A[i], its index, and a constant.
        B  .  push  (  A [  i  ]  -  i  +  1  ) ;
    }

    // Sort array B in ascending order.
    B  .  sort (  )  ;

    // Declare a variable 'b' which will hold the median or pseudo-median.
    let   b  ;

    // Calculate the middle index 'n'.
    const   n    =    Math  .  floor (  N  /  2  )  ;

    // Determine 'b' based on whether N is odd or even.
    if  (  N  %  2  )
    {
        // If N is odd, 'b' is the middle element of the sorted array B.
        b    =    B [  n  ]  ;
    }
    else
    {
        // If N is even, 'b' is the floor of the average of the two middle elements.
        b    =    Math  .  floor (  (  B [  n  ]  +  B [  n  -  1  ]  )  /  2  )  ;
    }

    // Initialize 'ans' to accumulate the sum of absolute differences.
    let   ans   =   0  ;

    // Iterate over each element 'k' in the sorted array B.
    for  (  let   k   of   B  )
    {
        // Add the absolute difference between 'k' and 'b' to 'ans'.
        ans    +=    Math  .  abs (  k  -  b  )  ;
    }

    // Output the final calculated answer to the console.
    console  .  log (  ans  )  ;
}


// Read input from standard input, decode it as UTF-8, split by newlines,
// and pass it to the main function.
main (  require (  'fs'  )  .  readFileSync (  '/dev/stdin'  ,  'utf8'  )  .  split (  '\n'  )  )