/*
 * This is a JavaScript program designed to take a numerical input.
 * It processes the input to determine if it's an odd or even number.
 * Based on this determination, it performs a specific calculation and prints the result.
 */

// Defines the primary function responsible for the program's logic.
function   Main   (   input   )
{
    // First, the raw input string is pre-processed.
    // Any leading or trailing whitespace characters are removed from the input string.
    // Subsequently, the cleaned string is converted into an integer value.
    input   =   parseInt   (   input.trim   (   )   )   ;

    // A conditional check is performed to ascertain whether the integer input is odd or even.
    // An input number is considered odd if the remainder of its division by 2 is exactly 1.
    if   (   input   %   2   ==   1   )
    {
        // If the evaluated input number is indeed odd,
        // the program calculates the product of two values:
        // 1. The floor of (input divided by 2).
        // 2. The ceiling of (input divided by 2).
        // This result is then outputted to the console.
        console.log   (   Math.floor   (   input   /   2   )   *   Math.ceil   (   input   /   2   )   )   ;
    }
    else   // This block executes if the input number is determined to be even.
    {
        // For an even input number, the program calculates the square of (input divided by 2).
        // This calculation is performed using the Math.pow function.
        // The final computed value is subsequently displayed in the console.
        console.log   (   Math.pow   (   input   /   2   ,   2   )   )      ;
    }
}


// --- Program Entry Point ---

// The Main function is invoked here, passing the program's input.
// The input is asynchronously read from the standard input stream ("/dev/stdin").
// The 'fs' module is utilized for file system operations, specifically reading the file.
// The content is read as a UTF-8 encoded string.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;

// --- End of Program Execution ---