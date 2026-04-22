/*
 * This is a JavaScript program designed to solve a specific problem.
 * It reads input, performs calculations, and then prints the result.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Define the main function that processes the input for the problem.
function    Main    (   input   )
{
    // The input string is expected to contain three space-separated numbers.
    // These numbers are destructured into 'l' (left), 'r' (right), and 'd' (divisor).
    const   [   l   ,   r   ,   d   ]   =   input   .   split   (   " "   )   .   map   (   Number   )   ;


    // Initialize a variable 'ans' to count the numbers that meet the criteria.
    var     ans     =   0   ;

    // Start a loop that iterates through all integers from 'l' up to 'r', inclusive.
    for     (   i   =   l   ;   i   <=  r   ;   i   ++  )
    {
        // Inside the loop, check if the current number 'i' is perfectly divisible by 'd'.
        // The modulo operator (%) returns the remainder of a division.
        if      (   i   %   d   ==  0   )
        {
            // If the remainder is 0, it means 'i' is divisible by 'd'.
            // Increment the counter 'ans'.
            ans     ++  ;
        }
    }

    // After the loop completes, print the final count 'ans' to the standard output.
    console .   log (   ans   )   ;
}

// This section handles the execution of the Main function.
// It reads the entire content of '/dev/stdin' (standard input) as a UTF-8 string.
// This is typical for competitive programming environments using Node.js.
Main    (   require (   "fs"    )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;

// End of the JavaScript program file.