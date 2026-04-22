/* This is a Type I clone of a JavaScript program.
 * It strictly adheres to the definition: only whitespace and comments are altered.
 * All identifiers, keywords, operators, and expressions remain precisely the same.
 */
'use strict' // Enforce strict mode for better code quality.

// Main function to process the input and solve the problem.
function    Main(  input  )   {

    // Split the input string by newline characters to get an array of lines.
    input   =   input .   split (  "\n"  )   ;

    // Parse the first line as an integer 'n'.
    const   n   =   parseInt (  input [  0  ]  ,   10  )   ;

    // Parse the second line: split by space, then map each part to an integer.
    const   arr   =   input [  1  ]  .   split (  ' '  )  .   map (  v   =>   parseInt (  v  ,   10  )  )   ;

    // Calculate the total sum of all elements in the 'arr' array using reduce.
    const   sum   =   arr .   reduce (  (  pre  ,   cur  )   =>   pre   +   cur  )   ;


    // Initialize 'min' to -1, which will be updated with the minimum absolute difference.
    let   min   =   -1   ;
    // Initialize 'tmp' to 0, used to accumulate sums for sub-arrays.
    let   tmp   =   0   ;


    // Loop through the array to find the optimal split point.
    // The loop runs 'n - 1' times, considering all possible split positions.
    for   (   let   i   =   0   ;   i   <   n   -   1   ;   i   ++   )   {
        // Add the current element to 'tmp' (sum of the left part).
        tmp   +=   arr [  i  ]   ;

        // Calculate the absolute difference between the sum of the left part (tmp)
        // and the sum of the right part (sum - tmp).
        // This is equivalent to Math.abs(tmp - (sum - tmp)) which simplifies to Math.abs(2 * tmp - sum).
        // Or, as in the original, Math.abs(sum - 2 * tmp).
        const   abs   =   Math .   abs (  sum   -   2   *   tmp  )   ;

        // If 'min' is still its initial value (-1) or the current absolute difference
        // is smaller than the current 'min', update 'min'.
        if   (   min   <   0   ||   min   >   abs   )   {
            min   =   abs   ; // Update the minimum absolute difference found so far.
        }
    }


    // Output the final minimum absolute difference to the console.
    console .   log (  min  )   ;
}

// Read input from standard input and pass it to the Main function.
Main (  require (  "fs"  )  .   readFileSync (  "/dev/stdin"  ,   "utf8"  )  )   ;