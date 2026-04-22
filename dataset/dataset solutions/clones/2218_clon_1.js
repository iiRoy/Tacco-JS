'use strict' ; /* This directive enforces strict parsing and error handling in JavaScript. */

// This is a Type I clone of the original code.
// Extensive whitespace and comment modifications have been applied.
// All identifiers, operators, and core expressions remain exactly as they were.

const   main    =   input   =>  {
    /*
     * The 'main' function serves as the entry point for processing the input data.
     * It expects an array where the first element is a string representing 'n',
     * and the second element is a space-separated string representing the 'p' array.
     */


    const   n   =   parseInt(   input[0]   )   ; // Parse the first line of input as an integer 'n'.
                                             // 'n' typically represents the number of elements.


    const   p   =   input[1]    .   split(' ')   .   map(   val   =>   parseInt(val)   )   ; /* Process the second line of input:
                                                                                          *   1. Split the string by spaces to get an array of string numbers.
                                                                                          *   2. Use 'map' to convert each string number into an actual integer.
                                                                                          * 'p' will be an array of integers. */


    const   count   =   [ ]   ; // Initialize an empty array named 'count'.
                              // This array will store flags (0 or 1) for each element in 'p'.

    // Outer loop: Iterates 'n' times, corresponding to each element in the 'p' array.
    for (   let   i   =   0   ;   i   <   n   ;   i   ++   )   {
        count[i]    =   1   ; // Initially assume the i-th element of 'p' is "good" (set flag to 1).

        // Inner loop: Compares the current element p[i] with all preceding elements p[j].
        for (   let   j   =   0   ;   j   <   i   ;   j   ++   )   {
            // Conditional check: If p[i] is strictly greater than any p[j] where j < i...
            if  (   p[i]   >   p[j]   )   {
                count[i]    =   0   ; /* ...then p[i] is NOT "good" by the problem's criteria.
                                       * Set its flag in the 'count' array to 0. */
                break   ; // Once a violation is found, there's no need to check further for p[i].
                          // Exit the inner loop immediately.
            }
        }
    }


    let ans = 0   ; // Initialize a variable 'ans' to store the final answer.

    /*
     * The 'map' method is used here to iterate through the 'count' array.
     * While 'map' typically returns a new array, it's used for its side effect
     * of incrementing 'ans' based on the values in 'count'.
     */
    count   .   map(   val   =>   {
        // If an element in 'count' is 1, it signifies a "good" element from 'p'.
        if  (   val   ==   1   )   {
            ans   ++   ; // Increment the total answer.
        }
    }   )   ; /* End of the 'map' function call. */


    console   .   log(   ans   )   ; // Print the final calculated answer to the standard output.

}   // This marks the end of the 'main' function definition.


// The 'main' function is immediately called with input read from the file system.
// It reads the content of '/dev/stdin' (standard input), decodes it as UTF-8,
// and then splits the content into an array of strings based on newline characters.
main(   require("fs")   .   readFileSync(   "/dev/stdin"   ,   "utf8"   )   .   split('\n')   )   ; // Execute the primary logic.