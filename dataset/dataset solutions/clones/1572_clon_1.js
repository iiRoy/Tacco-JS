/*
 * This is a JavaScript file designed to process a specific type of numerical input.
 * It reads three numbers from a single line of standard input, performs a calculation,
 * and then outputs the result to the console.
 */

// Define the primary function that encapsulates the core logic of the program.
// This function takes the raw input as a single string argument.
function   Main   (   input   )
{
    // The first step is to split the entire input string by newline characters.
    // Although the problem typically uses only the first line, this standard
    // practice prepares for multi-line inputs.
    input   =   input.split (   "\n"   )   ;

    // Extract the first numerical value from the first line of the input.
    // The line is split by spaces, and the first segment is converted to a number.
    const   N   =   input [   0   ] .   split   (   ' '   )   [   0   ]   -   0   ;

    // Extract the second numerical value from the first line of the input.
    // Similar to N, the second segment after splitting by space is parsed.
    const   X   =   input [   0   ] .   split   (   ' '   )   [   1   ]   -   0   ;

    // Extract the third numerical value from the first line of the input.
    // This value is the third segment obtained after splitting the line by space.
    const   T   =   input [   0   ] .   split   (   ' '   )   [   2   ]   -   0   ;


    // Perform the calculation required by the problem statement.
    // This involves dividing N by X, rounding the result up to the nearest integer
    // using Math.ceil(), and then multiplying that rounded value by T.
    // The final computed value is then displayed on the console.
    console .   log   (   Math .   ceil   (   N   /   X   )   *   T   )   ;
}


// --- Standard Input Handling Section ---
// This part of the code is responsible for reading data from standard input
// and passing it to the 'Main' function. It should not be altered.
// It ensures compatibility with typical competitive programming environments.
Main   (   require (   "fs"   ) .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;