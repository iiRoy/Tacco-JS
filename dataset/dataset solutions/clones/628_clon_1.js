// This file contains a cloned version of the original JavaScript code.
// The purpose is to demonstrate Type I cloning, focusing solely on whitespace and comments.

/// <reference path="node.d.ts" />
/// <reference path="lib.ts" /> // Reference to a library file.

/*
 * Main function to process input and calculate a result.
 * @param input An array of strings, expected to contain numerical data.
 */
function   main(  input  :   string[]  )
{
    // Retrieve the first element and convert it to a number for 'n'.
    var   n   =   +  input.shift(  )  ;

    /*
     * Initialize an empty array 'a' to store numbers.
     * This array will be populated from the input.
     */
    var   a  :   number[  ]   =   [  ]  ;

    // Loop 'n' times to populate array 'a'.
    for  (  var   i   =   0  ;   i   <   n  ;   ++i  )
    {
        a.push(   +  input.shift(  )   )  ;  // Convert input string to number and add to 'a'.
    }


    /*
     * Initialize 's' (sum) to zero.
     * 'b' array stores prefix sums, starting with 0.
     */
    var   s   =   0  ;
    var   b   =   [  0  ]  ;

    // Loop twice the size of 'n' to create an extended prefix sum array.
    for  (  var   i   =   0  ;   i   <   n   *   2  ;   ++i  )
    {
        s   +=   a[  i   %   n  ]  ;  // Add element from 'a' (wrapped around) to the current sum.
        b.push(  s  )  ;  // Store the cumulative sum in 'b'.
    }


    // Initialize three pointers for segments: x, y, z.
    var   x   =   0  ,   y   =   0  ,   z   =   0  ;

    /*
     * Helper function to calculate the sum of a segment.
     * @param i The index indicating which segment to calculate (0, 1, or 2).
     */
    function   part(   i  :   number   )  :   number
    {
        // Calculate the sum of the first segment (from x to y).
        if  (  i   ===   0  )   return   b[  y  ]   -   b[  x  ]  ;

        // Calculate the sum of the second segment (from y to z).
        if  (  i   ===   1  )   return   b[  z  ]   -   b[  y  ]  ;

        // Calculate the sum of the third segment (from z to x + n, considering the extended array).
        return   b[  x   +   n  ]   -   b[  z  ]  ;
    }


    // Initialize the answer variable.
    var   ans   =   0  ;

    // Main loop: iterate while 'x' is less than 'n'.
    while  (  x   <   n  )
    {
        // Inner loop: continues indefinitely until a break condition is met.
        while  (  1  )
        {
            ++y  ;  // Increment 'y' pointer.

            var   w   =   z  ;  // Store current 'z' value before modification.

            /*
             * Innermost loop: increment 'z' while conditions for segment sums are met.
             * Conditions: (part(0) > part(1)) AND (part(2) >= part(0)).
             */
            while  (  part(  0  )   >   part(  1  )   &&   part(  2  )   >=   part(  0  )   )   ++z  ;

            // Check if the third segment sum is less than the first segment sum.
            if  (  part(  2  )   <   part(  0  )   )
            {
                --y  ;  // Decrement 'y' if the condition is met.
                z   =   w  ;  // Revert 'z' to its previous value.
                break  ;  // Exit the inner 'while (1)' loop.
            }
        }
        // Update the maximum answer found so far.
        ans   =   Math.max(   part(  0  )  ,   ans   )  ;

        ++x  ;  // Increment 'x' pointer for the next iteration of the outer loop.
    }

    // Output the final calculated answer to the console.
    console.log(  ans  )  ;
}