/*
 * This JavaScript program processes numerical data from standard input.
 * It's designed to find the maximum frequency of any number, considering
 * its immediate neighbors (n-1, n, n+1) as potential matches.
 *
 * The program first expands the input numbers into a set of triplets,
 * then sorts these numbers, and finally counts the longest consecutive
 * sequence of identical numbers.
 */
"use strict"     ; // Enforce strict parsing and error handling for cleaner code.


// The primary function that orchestrates the entire logic.
function   main   (   input   )   {

    // Step 1: Parse the input string.
    // It splits the input by any whitespace or newline characters,
    // then converts each resulting string fragment into an integer.
    input   =   input
        .   split   (   /\s|\n/   )   // Split by whitespace or newlines.
        .   map   (   v   =>   ~~v   )   ; // Convert to integer using bitwise NOT.


    // Step 2: Extract relevant numbers.
    // The first element of the input array is often a count or metadata,
    // so we slice the array from the second element onwards.
    const   nums   =   input   .   slice   (   1   ,   input   .   length   )   ;


    // Step 3: Expand each number into a triplet (n-1, n, n+1).
    // An empty array 'nums2' is initialized to store these expanded values.
    let   nums2   =   [   ]   ;

    // Loop through each number in the 'nums' array.
    for   (   let   i   =   0   ;   i   <   nums   .   length   ;   i++   )   {

        // Add the number minus one to 'nums2'.
        nums2   .   push   (   nums   [   i   ]   -   1   )   ;

        // Add the number itself to 'nums2'.
        nums2   .   push   (   nums   [   i   ]   )   ;

        // Add the number plus one to 'nums2'.
        nums2   .   push   (   nums   [   i   ]   +   1   )   ;
    }


    // Step 4: Sort the expanded array.
    // This arranges all generated numbers in ascending order, which is crucial
    // for efficiently counting consecutive identical elements later.
    const   nums3   =   nums2   .   sort   (   (   a   ,   b   )   =>   a   -   b   )   ;


    // Step 5: Find the maximum frequency of any number.
    // Initialize variables for tracking the maximum count and current count.
    let   ans   =   1   ;           // Stores the overall maximum frequency.
    let   tmpcnt   =   1   ;        // Stores the frequency of the current number.
    let   tmp   =   Number   .   MAX_SAFE_INTEGER   ;   // Stores the current number being counted.
                                                      // Initialized to a very large value to ensure
                                                      // the first element of 'nums3' is always treated as new.


    // Iterate through the sorted array 'nums3'.
    for   (   let   i   =   0   ;   i   <   nums3   .   length   ;   i++   )   {

        // Check if the current number is the same as the previously observed number.
        if   (   tmp   ==   nums3   [   i   ]   )   {

            // If it is, increment the current consecutive count.
            tmpcnt++   ;
        }   else   {

            // If it's a new number, reset the current number and count.
            tmp   =   nums3   [   i   ]   ;
            tmpcnt   =   1   ;
        }

        // Update the maximum frequency found so far.
        ans   =   Math   .   max   (   tmpcnt   ,   ans   )   ;
    }


    // Step 6: Output the result.
    // Print the final maximum frequency to the console.
    console   .   log   (   ans   )   ;
}

// Entry point of the program.
// Reads the entire content of standard input as a UTF-8 string
// and passes it to the 'main' function for processing.
main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;