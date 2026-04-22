/*
 * This JavaScript module is designed to compute the length of the Longest Increasing Subsequence (LIS)
 * from a sequence of numbers provided via standard input.
 *
 * It utilizes a dynamic programming approach to determine the LIS length.
 * The input is expected to be a list of numbers, with the first number indicating
 * the total count of elements to be considered for the LIS calculation.
 *
 * Developed by: Clone Generation System
 * Date: October 27, 2023
 * Version: 1.0
 */


/**
 * @function LIS
 * @description
 *   Calculates the length of the Longest Increasing Subsequence (LIS) for the
 *   globally defined array `T`. This function modifies `T` during its execution.
 *   It then prints the computed maximum LIS length to the console.
 *
 * @returns {void}
 *   This function does not return a value. It outputs directly to the console.
 */
function   LIS   (   )   {

    // Extract the number of elements 'n' from the global array T.
    // The 'shift()' method removes the first element from T, which is assumed to be 'n'.
    // We add 1 to 'n' for array sizing purposes, aligning with common 0-indexed patterns.
    var   n   =   T.shift ( )   +   1   ;

    // Prepend a zero to the beginning of the array T.
    // This modification is a common technique in LIS algorithms, often used to
    // establish a base case or simplify comparisons by ensuring T[0] is a minimal value.
    T.unshift (   0   )   ;


    // Initialize two arrays: 'L' and 'P'.
    // 'L[i]' will store the length of the LIS ending at index 'i'.
    var   L   =   [ ]   ;
    // 'P[i]' will store the predecessor index of the element at 'i' in the LIS.
    var   P   =   [ ]   ;


    // Populate the 'L' and 'P' arrays with initial values (zeros).
    // Both arrays are sized to 'n', which was derived from the input.
    for   (   var   i   =   0   ;   i   <   n   ;   i   ++   )   {
        L.push (   0   )   ; // Default LIS length is 0 for all elements initially.
        P.push (   0   )   ; // Default predecessor is 0, implying no valid predecessor yet.
    }

    // Explicitly set the predecessor of the first element (at index 0) to -1.
    // This signifies that the element at index 0 has no preceding element in any subsequence.
    P [   0   ]   =   -1   ;


    // Begin the primary loop to compute LIS lengths for all elements in T.
    // This loop iterates from the second element (index 1) through to the end of the array T.
    for   (   var   i   =   1   ;   i   <   T.length   ;   i   ++   )   {

        // Initialize 'k' to 0. 'k' will track the index of the element that yields
        // the longest increasing subsequence ending *before* the current element T[i].
        var   k   =   0   ;   // Variable to hold the index of the element with the max LIS length found so far.

        // Inner loop: Iterate through all elements 'T[j]' that precede 'T[i]'.
        // The goal is to find the best 'T[j]' that can extend an LIS to include 'T[i]'.
        for   (   var   j   =   0   ;   j   <=   i   -   1   ;   j   ++   )   {
            // Check two conditions to determine if T[j] is a suitable predecessor for T[i]:
            // 1. T[j] must be strictly less than T[i] to maintain an increasing subsequence.
            // 2. The LIS length ending at T[j] (L[j]) must be greater than the LIS length
            //    ending at the current best predecessor candidate T[k] (L[k]).
            if   (   T [   j   ]   <   T [   i   ]   &&   L [   j   ]   >   L [   k   ]   )   {
                // If both conditions are met, update 'k' to 'j'.
                // This means T[j] is a better candidate to precede T[i] because it forms
                // a longer increasing subsequence up to that point.
                k   =   j   ;
            }
        }

        // Once the inner loop completes, 'k' holds the index of the element that
        // forms the longest increasing subsequence ending just before T[i].
        // The LIS length ending at T[i] is therefore L[k] plus 1 (for T[i] itself).
        L [   i   ]   =   L [   k   ]   +   1   ;
        // Store 'k' as the predecessor of 'i' in the 'P' array, allowing for
        // reconstruction of the LIS later if needed (though not done in this specific code).
        P [   i   ]   =   k   ;
    }

    // After the main loops, the 'L' array contains the LIS length ending at each position.
    // To find the overall LIS length, we need to find the maximum value within the 'L' array.
    // Math.max.apply(null, L) is used to find the maximum value in an array.
    var   max   =   Math.max.apply (   null   ,   L   )   ;

    // Output the calculated maximum LIS length to the standard console.
    console.log (   max   )   ;
}


// --- Global Program Execution Flow ---

// Use Node.js's 'fs' module to synchronously read the content of standard input.
// The input is read as a UTF-8 encoded string.
var   input   =   require (   'fs'   )   .   readFileSync (   '/dev/stdin'   ,   'utf8'   )   ;

// Process the raw input string to transform it into an array of numbers:
// 1. `input.trim()`: Removes any leading or trailing whitespace from the input string.
// 2. `.split("\n")`: Splits the string into an array of substrings, using the newline character as a delimiter.
//    Each substring represents a line of input.
// 3. `.map(Number)`: Converts each string element in the array to its numerical equivalent.
// The resulting array of numbers is assigned to the global variable `T`.
var   T   =   (   input.trim ( )   )   .   split (   "\n"   )   .   map (   Number   )   ;

// Finally, invoke the `LIS` function to execute the core logic of the program.
// This call will compute the LIS and print its length to the console.
LIS ( )   ;