/*
 * This is a Type I clone of the original JavaScript code.
 * According to the definition, all identifiers, variable names, function names,
 * operators, and expressions remain completely unchanged.
 *
 * The modifications are strictly limited to variations in whitespace
 * (indentation, spacing, blank lines) and the addition of comments.
 * The goal is to make the code visually distinct while preserving its
 * exact logical and structural equivalence to the original.
 */

function Main  (   input   )   {

    // Declare a constant 'N' and parse the input string to an integer value.
    const N =    parseInt (   input   )   ;


    // Initialize an empty array named 'a' using the 'var' keyword.
    var a   =   [   ]   ;


    // Begin conditional logic: Check if the value of N is exactly 3.
    if  (   N   ==  3   )   {

        // If N is 3, assign a predefined array of integers to 'a'.
        a   =   [   2   ,   3   ,   25    ]   ;

    }   else    {

        /*
         * If N is not 3, proceed with a more elaborate population strategy for array 'a'.
         * This involves a nested loop structure to generate elements.
         */
        for (   var i   =   0   ;   i   <   30000   /   12   ;   i   ++   )   {

            // The inner loop iterates over a fixed set of numbers.
            for (   var j   of  [   2   ,   4   ,   3   ,   9   ,   8   ,   10   ,   6   ,   12    ]   )   {

                // Calculate a value based on 'i' and 'j' and add it to array 'a'.
                a   .   push   (   i   *   12   +   j   )   ;

            }   // End of the inner 'for...of' loop.

        }   // End of the outer 'for' loop.

        // Modify array 'a' by removing elements from index N up to the end of the array.
        a   .   splice   (   N   ,   a   .   length   -   N   )   ;

        // Another conditional check: Determine if N is an odd number.
        if  (   N   %   2   ==  1   )   {

            // If N is odd, the element at index (N-1) in array 'a' is updated to 30000.
            a   [   N   -   1   ]   =   30000   ;

        }   // End of the 'N % 2 == 1' condition block.

    }   // End of the main 'if-else' block for N.


    // Output the elements of array 'a' to the console, joined by a single space character.
    console   .   log   (   a   .   join   (   " "   )   )   ;

}   // End of the 'Main' function definition.


/*
 * This line invokes the 'Main' function.
 * It reads the input from '/dev/stdin' using Node.js's 'fs' module
 * and passes the content as a UTF-8 string.
 */
Main    (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;