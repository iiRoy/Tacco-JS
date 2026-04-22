/*
 * This program demonstrates the calculation of the Least Common Multiple (LCM)
 * of two numbers and processes input from standard input.
 * It's structured into functions for clarity and modularity.
 */

// This function calculates the Least Common Multiple (LCM) of two positive integers.
// It relies on the Greatest Common Divisor (GCD) for its computation.
function   lcm   (   a   ,   b   )
{
    // Define an inner anonymous arrow function 'g' to compute the GCD
    // using the Euclidean algorithm. This is a recursive implementation.
    var   g   =   (   n   ,   m   )   =>   m   ?   g (   m   ,   n   %   m   )   :   n   ;

    // The formula for LCM(a, b) is (a * b) / GCD(a, b).
    // This is a standard mathematical property linking LCM and GCD.
    return   a   *   b   /   g (   a   ,   b   )   ;
}


// The Main function serves as the primary entry point for processing the program's logic.
// It takes raw string input, parses it, performs calculations, and outputs the result.
function   Main   (   input   )
{
    // First, process the raw input string:
    // 1. Remove any leading or trailing whitespace characters.
    // 2. Split the string into an array of substrings using a space as the delimiter.
    // 3. Map over the array, converting each string element into an integer.
    const   array   =   input
        .   trim   (   )                               // Remove unnecessary whitespace from ends
        .   split   (   ' '   )                           // Break the string into parts based on spaces
        .   map   (   s   =>   parseInt   (   s   )   )   ;   // Convert each part into an integer number

    // Calculate the Least Common Multiple (LCM) using the first two numbers
    // obtained from the parsed input array.
    const   ans   =   lcm   (   array   [   0   ]   ,   array   [   1   ]   )   ;

    // Finally, print the calculated answer to the standard output console.
    console   .   log   (   ans   )   ;
}

// This section is responsible for reading the input and initiating the program execution.
// It reads data from standard input, typically a file or piped stream, and passes it
// to the Main function for processing.
Main   (
    require   (   "fs"   )           // Access the built-in Node.js 'fs' (file system) module.
        .   readFileSync   (         // Use the synchronous file reading method.
            "/dev/stdin"   ,       // Specify the path to the standard input stream.
            "utf8"                   // Define the character encoding for reading the file content.
        )
)   ;