/*
 * This is a JavaScript program designed to process some input data.
 * It calculates a specific sum based on several arrays derived from the input.
 *
 * This code is a Type I clone, preserving all logic and identifiers.
 * Only whitespace and comments have been altered for visual distinction.
 */

// Define the main function that takes the raw input string
function    Main   (   input   )
{

    // First, split the entire input string by newline characters
    input   =   input .   split   (   "\n"   )   ;

    // The first line of input (index 0) is expected to be 'n',
    // which is then split into individual characters.
    n   =   input   [   0   ]   .   split   (   ""   )   ;


    // The second line (index 1) contains space-separated numbers for array 'a'.
    // These are parsed into actual numbers using a mapping function.
    a   =   input   [   1   ]   .   split   (   " "   )   .   map   (   (   a   )   =>   Number   (   a   )   )   ;

    // The third line (index 2) contains space-separated numbers for array 'b'.
    // These are also parsed into numbers.
    b   =   input   [   2   ]   .   split   (   " "   )   .   map   (   (   b   )   =>   Number   (   b   )   )   ;

    // The fourth line (index 3) contains space-separated numbers for array 'c'.
    // These are parsed into numbers as well.
    c   =   input   [   3   ]   .   split   (   " "   )   .   map   (   (   c   )   =>   Number   (   c   )   )   ;


    // Initialize the accumulator variable 'ans' to zero.
    // This variable will store the final calculated sum.
    var   ans   =   0   ;

    // Begin a loop that iterates 'n' times.
    // 'n' is implicitly converted to a number for the loop condition.
    for   (   var   i   =   0   ;   i   <   n   ;   i   ++   )   {

        // Add the value from array 'b' at an index derived from array 'a'.
        // The index is `a[i]-1` because array 'a' likely contains 1-based indices.
        ans   +=   b   [   a   [   i   ]   -   1   ]   ;

        // Check a specific condition: if the current element of 'a'
        // is one greater than the previous element of 'a'.
        // This condition is relevant for adding bonus values from array 'c'.
        if   (   a   [   i   ]   ==   a   [   i   -   1   ]   +   1   )   {

            // If the condition is met, add a value from array 'c'.
            // The index for 'c' is derived from the *previous* element of 'a'.
            ans   +=   c   [   a   [   i   -   1   ]   -   1   ]   ;

        }   // End of the conditional block for 'if' statement

    }   // End of the main 'for' loop

    // After the loop completes, print the final calculated answer to the console.
    console   .   log   (   ans   )   ;

}   // End of the Main function definition

// This part of the script is responsible for reading input from standard input
// and then calling the Main function with that input.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;