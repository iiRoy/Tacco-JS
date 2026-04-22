/*
 * This JavaScript module is designed to process a sequence of numerical inputs.
 * It identifies and calculates the maximum sum within a sliding window (sub-array)
 * of a specified size 'k' from a larger progression of 'n' numbers.
 * The program reads its input from standard input, processes it iteratively,
 * and prints the resulting maximum sum for each test case to standard output.
 *
 * This implementation is a Type I clone, meaning its functionality and core structure
 * are identical to an original source, with only variations in whitespace and comments.
 *
 * Author: Code Clone Generation System
 * Version: 1.0
 * Date: 2023-10-27
 */

// The entire logic is encapsulated within an Immediately Invoked Function Expression (IIFE).
// This pattern helps to prevent global scope pollution.
(   function    (   input   )   {

    // Declare all variables that will be used within this scope at the beginning.
    // 'inputs' will store lines of input after initial processing.
    // 'tmp' is a temporary variable used for parsing and intermediate storage.
    // 'i' serves as a general-purpose loop counter.
    // 'n' represents the total count of numbers in the current progression.
    // 'k' denotes the fixed size of the sliding window for sum calculation.
    // 'progression' is an array holding the numbers for the current test case.
    // 'sum' temporarily stores the sum of numbers within the current window.
    // 'sums' is an array that accumulates all calculated window sums.
    // 'max' will ultimately store the highest sum found among all windows.
    var inputs  =   input
                        .   replace (   /\r/g    ,    ''    ) // Remove carriage returns for consistent line endings.
                        .   split   (   "\n"     )   ,         // Split the input string into an array of lines.
        tmp,
        i,
        n,
        k,
        progression,
        sum,
        sums,
        max; // End of variable declarations.


    // This 'while' loop processes multiple test cases.
    // It continues indefinitely until a specific termination condition is met inside.
    while   (   true   )   {

        // Initialize or re-initialize arrays for each new test case.
        // 'progression' will hold the sequence of numbers for the current test.
        progression =   [   ]   ;

        // 'sums' will store the calculated sums of all windows for the current test.
        sums        =   [   ]   ;


        // Read the first line of the current test case. This line contains 'n' and 'k'.
        // 'inputs.shift()' removes and returns the first element (line) from the 'inputs' array.
        // '.split(' ')' then breaks this line into parts based on spaces.
        tmp = inputs . shift (   ) . split (   ' '   )   ;


        // Parse the values for 'n' and 'k' from the 'tmp' array.
        // 'parseInt' converts string representations to integer numbers.
        n   =   parseInt (   tmp [   0   ]   )   ; // 'n' is the first value.
        k   =   parseInt (   tmp [   1   ]   )   ; // 'k' is the second value.


        // Check for the termination condition: both 'n' and 'k' are zero.
        if  (   n   ==   0   &&   k   ==   0   )
        {
            // If the condition is met, break out of the 'while(true)' loop,
            // signaling the end of input processing.
            break   ;
        }


        // This 'for' loop reads 'n' individual numbers from the input
        // and populates the 'progression' array for the current test case.
        for (   i   =   0   ;   i   <   n   ;   i ++   )
        {
            // Read the next line (which should be a single number) and parse it.
            tmp = parseInt (   inputs . shift (   )   )   ;

            // Add the parsed number to the 'progression' array.
            progression . push (   tmp   )   ;
        }


        // This 'for' loop iterates through the 'progression' array
        // to calculate the sum of each sliding window of size 'k'.
        // The loop runs as long as a full window of 'k' elements can be formed.
        for (   i   =   0   ;   i   <=   n   -   k   ;   i ++   )
        {
            // Reset the 'sum' variable for each new window calculation.
            sum =   0   ;

            // Create a sub-array (slice) representing the current window.
            // 'progression.slice(i, i + k)' extracts elements from index 'i' up to (but not including) 'i + k'.
            // Then, 'forEach' iterates over this window to sum its elements.
            progression . slice (   i   ,   i   +   k   ) . forEach (   function   (   num   )   {
                sum += num ; // Add the current number in the window to 'sum'.
            }   )   ;

            // After summing all elements in the current window, store the total sum.
            sums . push (   sum   )   ;
        }


        // Now, find the maximum sum among all the calculated window sums.

        // Initialize 'max' with the first sum from the 'sums' array.
        // 'sums.shift()' also removes this element, so subsequent iterations
        // will only compare against the remaining elements.
        max = sums . shift (   )   ;

        // Iterate through the remaining sums in the 'sums' array.
        sums . forEach (   function   (   currentSum   )   {
            // If the current sum is greater than the currently stored 'max',
            // update 'max' to this new higher value.
            if  (   currentSum   >   max   )   {
                max = currentSum ;
            }
        }   )   ;

        // Print the final maximum sum found for the current test case to the console.
        console . log (   max   )   ;

    } // End of the main 'while(true)' loop.

// The IIFE is immediately invoked.
// It reads the entire content of '/dev/stdin' as a UTF-8 string.
// 'require("fs")' loads Node.js's File System module.
// 'readFileSync' reads the file synchronously.
} ) (   require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ; // End of IIFE invocation.