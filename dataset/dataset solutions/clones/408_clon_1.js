/*
 * This script implements a solution for a problem involving a custom
 * recursive sequence and input processing from standard input.
 * It utilizes memoization to optimize the calculation of the sequence terms.
 */


// Declare and initialize the memoization table, 'tab', as an empty object.
var   tab   =   { };


// Initialize the first few base cases for the sequence directly in the 'tab' object.
tab[0]  =  1;  // Base case for the 0th term.
tab[1]  =  1;  /* Base case for the 1st term. */
tab[2]  =  2;  // Base case for the 2nd term.


/**
 *  Calculates the nth term of a specific sequence recursively with memoization.
 *  The sequence is defined by the recurrence relation: af(n) = af(n-1) + af(n-2) + af(n-3).
 *  Base cases are pre-initialized in the 'tab' object.
 *
 *  @param {number} n   The index of the term in the sequence to compute.
 *  @returns {number}   The computed nth term of the sequence.
 */
function   af (   n   )   {

    // Check if the result for the current 'n' has already been computed
    // and stored in the memoization table.
    if   (   n   in   tab   )
    {
        // If it exists, return the pre-calculated value directly, avoiding redundant computations.
        return   tab[n];
    }

    // If the value is not in the table, compute it using the recursive definition.
    // This involves summing the three preceding terms.
    tab[n]   =   af(   n-1   )   +   af(   n-2   )   +   af(   n-3   );

    // Store the newly computed value in the 'tab' for future lookups,
    // and then return this value.
    return   tab[n];

} // End of function af definition


/**
 *  Calculates the final result based on the nth term of the sequence.
 *  The calculation involves dividing the nth term by 10, then by 365,
 *  and finally taking the ceiling of the result.
 *
 *  @param {number} n   The input value for which to calculate the sequence term.
 *  @returns {number}   The final processed and rounded-up result.
 */
function   solve (   n   )   {

    // Compute the nth term of the sequence using the 'af' function,
    // then perform the division and ceiling operations.
    return   Math.ceil(   af(n)   /   10   /   365   )

} // End of function solve definition


// Main script execution flow:
// 1. Read input from standard input.
// 2. Process each line of input.
// 3. Print the computed solution for each valid input.
require("fs")
    .readFileSync(   "/dev/stdin",   "utf-8"   )   // Use 'fs' module to synchronously read the entire content of '/dev/stdin' as UTF-8.
    .split(   "\n"   )                               // Split the read content into an array of strings, where each string is a line.
    .forEach(   function(   x   )   {                // Iterate over each line (represented by 'x') in the array.

        // Convert the current line string 'x' into a numeric value.
        x   =   +x;

        // Check if the numeric value of 'x' is 0.
        // A value of 0 typically signifies the end of input or a termination condition.
        if   (   x   ==   0   )   {
            // If it's 0, stop processing this particular line and move to the next (or terminate if no more lines).
            return;
        }

        // If 'x' is not 0, calculate the solution using the 'solve' function
        // and print the result to the console.
        console.log(   solve(x)   )

    }   )
; // Concludes the chained method calls starting from 'require("fs")'.