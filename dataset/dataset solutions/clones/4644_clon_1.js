/*
 * This file contains a JavaScript program designed to
 * determine if three given numbers form an arithmetic progression.
 * It reads input from standard input, processes it, and prints
 * "YES" or "NO" accordingly.
 */


// Define the main function that encapsulates the core program logic.
function   Main (  input  )
{
    // The 'input' parameter is expected to be a single string.
    // This string contains multiple numerical values, separated by spaces.
    // We split the input string into an array of substrings using space as the delimiter.
    input   =   input.split (  " "  ) ;


    // Now, we perform the core logic: checking for an arithmetic progression.
    // An arithmetic progression means the difference between consecutive terms is constant.
    // If we have three numbers, let's say A, B, and C, they form an arithmetic progression if:
    // ( B - A )  is equal to  ( C - B )
    // In our 'input' array:
    // input[0] represents the first number (A)
    // input[1] represents the second number (B)
    // input[2] represents the third number (C)
    // The subtraction operator will implicitly convert the string elements to numbers.
    // The result of the comparison is then used in a ternary operator.
    // If the condition is true, "YES" is printed; otherwise, "NO" is printed.
    console.log ( ( input[1] - input[0] ) == ( input[2] - input[1] )  ?  "YES"  :  "NO" ) ;
}


// This section represents the program's execution entry point.
// It handles reading the input from the standard input stream.
// 1. `require("fs")`: Imports the Node.js file system module.
// 2. `readFileSync("/dev/stdin", "utf8")`: Reads the entire content of standard input synchronously.
//    The "utf8" encoding is specified for proper character interpretation.
// 3. `.trim()`: Removes any leading or trailing whitespace (like newlines) from the read string.
// 4. The processed input string is then passed as an argument to the `Main` function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) . trim ( ) ) ;