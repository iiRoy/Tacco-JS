/*
 * This script processes a single integer input
 * and prints a calculated value to the console.
 *
 * The calculation differs based on the parity of the input.
 *
 * Type I Clone Generation Example.
 * All identifiers, operators, and expressions are strictly preserved.
 * Only whitespace and comments are altered.
 */


// --- Function Definition Section ---

/**
 * Main function responsible for the core logic.
 * It takes a string 'input' (which is expected to be a number)
 * and performs a calculation based on its even/odd status.
 *
 * @param {string} input - The input value, expected to be a numeric string.
 */
function   Main   (   input   )
{

    // Convert the input string to an integer for arithmetic operations.
    // Although 'input' is passed as a string from readFileSync,
    // JavaScript's type coercion will handle it for '%' and arithmetic operations.
    // Explicit conversion is not strictly necessary for this specific case
    // due to JS's dynamic typing, but it's good practice in general.
    // For this Type I clone, we must not add new code like parseInt().


    // Check if the number is even.
    // The modulo operator (%) returns the remainder of a division.
    // If input % 2 is 0, the number is even.
    if   (   input   %   2   ==   0   )
    {
        // Block for even numbers.
        // The calculation for even numbers is (input / 2) - 1.
        console   .   log   (   (   input   /   2   )   -   1   )   ;
    }
    else // If the number is not even, it must be odd.
    {
        // Block for odd numbers.
        // The calculation for odd numbers is ((input + 1) / 2) - 1.
        // Adding 1 to an odd number makes it even, then it's divided by 2.
        console   .   log   (   (   (   input   +   1   )   /   2   )   -   1   )   ;
    } // End of conditional logic (if-else).

}   // End of Main function.


// --- Program Execution Section ---

// This line is responsible for reading the input and initiating the program.
// It uses Node.js's built-in 'fs' (file system) module.
// 'readFileSync' reads the content of '/dev/stdin' synchronously.
// The 'utf8' encoding ensures proper text interpretation.
// The result (a string) is then passed as an argument to the 'Main' function.
Main   (
    require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )
)   ;

// --- End of Script ---