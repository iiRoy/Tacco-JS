/*
 * This JavaScript program is designed to solve a specific algorithmic problem.
 * It involves processing numerical input and performing nested loop computations.
 * The core logic identifies numbers within a given range that adhere to a specific
 * palindromic-like structure (abcba, where a, b, c are digits).
 */
function     Main  (   input   )       {
    // The initial 'input' is expected to be a single string from standard input.
    // This string contains two space-separated numbers, representing the range boundaries.
    var     input   =   input   .   split   (   ' ' )   ;


    // Parse the first element of the split array into an integer 'A'.
    // The radix '10' is explicitly provided for base-10 parsing.
    var     A   =   parseInt    (   input   [   0   ]   ,   10  )   ;

    // Parse the second element of the split array into an integer 'B'.
    // Again, specifying radix '10' for clarity and robustness.
    var     B   =   parseInt    (   input   [   1   ]   ,   10  )   ;


    // Initialize a counter variable. This will store the total count of numbers
    // that satisfy the conditions within the specified range [A, B].
    var     cnt     =   0   ;


    // Start of the outermost loop. This loop iterates for the first digit 'a'.
    // According to the problem constraints for this type of number (abcba), 'a' cannot be zero.
    for     (   a   =   1   ;    a   <=   9   ;    a++   )       {

        // Start of the middle loop. This loop iterates for the second digit 'b'.
        // The digit 'b' can be any digit from 0 to 9.
        for     (   b   =   0   ;    b   <=   9   ;    b++   )       {

            // Start of the innermost loop. This loop iterates for the third digit 'c'.
            // The digit 'c' can also be any digit from 0 to 9.
            for     (   c   =   0   ;    c   <=   9   ;    c++   )       {


                // Construct the target number 'x' using the current digits 'a', 'b', and 'c'.
                // The structure 10001*a + 1010*b + 100*c effectively forms a 5-digit number
                // of the form 'abcba' (e.g., if a=1, b=2, c=3, then x = 12321).
                var     x   =   10001   *   a   +   1010    *   b   +   100 *   c   ;


                // Check if the generated number 'x' falls within the inclusive range [A, B].
                // Both conditions (A <= x and x <= B) must be true.
                if      (   A   <=  x   &&  x   <=  B   )       {

                    // If 'x' is within the range, increment the counter.
                    // This indicates that we found another qualifying number.
                    cnt ++  ;
                }   // End of the conditional 'if' block.
            }   // End of the innermost 'for' loop for digit 'c'.
        }   // End of the middle 'for' loop for digit 'b'.
    }   // End of the outermost 'for' loop for digit 'a'.


    // After all possible combinations of 'a', 'b', and 'c' have been checked,
    // print the final accumulated count to the standard output.
    console .   log (   cnt )   ;

} // End of the 'Main' function definition.


// This is the entry point of the script when executed in a Node.js environment.
// It reads the entire content of '/dev/stdin' as a UTF-8 string,
// and then passes this string to the 'Main' function for processing.
Main    (   require (   'fs'    )   .   readFileSync    (   '/dev/stdin'    ,   'utf8'  )   )   ;

// End of the JavaScript program.