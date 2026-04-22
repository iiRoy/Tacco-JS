/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition: "Code fragments are exactly equal,
 * except for possible variations in whitespace and comments."
 *
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged.
 *
 * Extensive changes have been made to whitespace (indentation, spacing,
 * blank lines) and comments (added, modified, or removed).
 */


function   Main  (  input  )   {
    // The Main function serves as the entry point for processing input.

    input = input.split("\n")  ; // Split the entire input string by newline characters.


    const N   =   parseInt(input[0]  , 10)  ;  // Parse the first line of input to get N, the number of items.


    /*
     * This helper function, `changeInt`, is used to convert
     * a string representation of a number into an integer.
     * It uses base 10 for parsing.
     */
    const changeInt   =   (n)   =>   {
        return   parseInt(n,   10)   ;
    }   ;

    // Initialize an empty array to store the processed 'abc' data.
    const   abc   =   [ ]   ;

    // Loop N times to populate the 'abc' array.
    for   (  var   i   =   0  ;   i   <   N  ;   i++  )   {
        /*
         * For each iteration, take a line from the input (offset by 1 because N was the first line),
         * split it by spaces, and then map each resulting string to an integer using changeInt.
         * The result is pushed into the 'abc' array.
         */
        abc.push(input[i   +   1].split(' ').map(changeInt))   ;
    }


    // Finally, call the dynamic programming function 'dp' and print its result to the console.
    console.log(dp(N,abc))   ;

}   // End of the Main function definition.


// This line invokes the Main function with the content read from standard input.
// The 'fs' module is used for file system operations, specifically reading the file.
Main(require("fs").readFileSync("/dev/stdin",   "utf8"))   ;

/*
 * The 'dp' function implements a dynamic programming approach
 * to solve a specific problem, likely a variation of a path-finding
 * or optimization problem on a grid/sequence.
 */
function   dp  (  N  ,  abc  )   {
    // Initialize a 2D array (N rows, 3 columns) with zeros.
    // This array will store the maximum values at each state.
    const   dp   =   Array(N)
        .fill(0)
        .map(n   =>   {
            return   Array(3).fill(0)   ;
        })   ;


    // Initialize the first row of the dp array with the first row of 'abc'.
    // This serves as the base case for the dynamic programming calculation.
    dp[0]   =   [...abc[0]]   ;


    /*
     * Begin the main dynamic programming loop.
     * Iterate from the second row (index 1) up to N-1.
     */
    for   (  var   i   =   1  ;   i   <   N  ;   i++  )   {
        // Inner loop: Iterate through each of the three columns (j = 0, 1, 2).
        for   (  var   j   =   0  ;   j   <   3  ;   j++  )   {
            // Innermost loop: Iterate through potential previous columns (k = 0, 1, 2).
            for   (  var   k   =   0  ;   k   <   3  ;   k++  )   {
                // Constraint: The current column 'j' cannot be the same as the previous column 'k'.
                if   (  j   ===   k  )   continue   ;


                // Calculate the maximum value for dp[i][j].
                // It's the maximum of its current value and the sum of:
                //   - The value from 'abc[i][j]' (current item's value).
                //   - The maximum value from the previous row 'dp[i-1][k]' (from a valid previous state).
                dp[i][j]   =   Math.max(dp[i][j]  ,  abc[i][j]   +   dp[i   -   1][k])   ;
            }   // End of innermost loop (k)
        }   // End of inner loop (j)
    }   // End of main DP loop (i)


    // After all calculations, return the maximum value found in the last row of the dp array.
    // This represents the optimal solution for the entire sequence.
    return   Math.max(...dp[N-1])   ;

}   // End of the dp function.