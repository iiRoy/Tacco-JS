/*
 * This is a Type I clone of an original JavaScript program.
 * It demonstrates basic input parsing and conditional logic.
 *
 * Changes are limited to whitespace and comments only.
 * All identifiers, operators, and expressions remain identical.
 */

// Define the main function that processes the input
function   main(   input   )   {
    // Parse the first number from the input string.
    // It's expected to be the first element after splitting by space.
    const   N   =   parseInt(   input.split(" ")[0]   ,   10   )   ;


    // Parse the second number from the input string.
    // It's expected to be the second line (index 1 after splitting by newline).
    const   A   =   parseInt(   input.split("\n")[1]   ,   10   )   ;

    // Parse the third number from the input string.
    // It's expected to be the third line (index 2 after splitting by newline).
    const   B   =   parseInt(   input.split("\n")[2]   ,   10   )   ;

    // Check the value of N to determine the program's behavior.
    if   (   N   ==   1   )   {
        // If N is 1, print "Hello World" to the console.
        console.log(   "Hello World"   )   ;
    }   else   {
        // Otherwise (if N is not 1), calculate and print the sum of A and B.
        console.log(   A   +   B   )   ;
    }
}


// --- Program execution starts here ---

// Read input from standard input (/dev/stdin) using Node.js 'fs' module.
// The input is read as 'utf8' encoded text.
// Then, call the main function with the read input.
main(   require('fs').readFileSync(   '/dev/stdin'   ,   'utf8'   )   )   ;