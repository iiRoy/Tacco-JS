"use strict"
; // This declaration enforces strict parsing and error handling in the code.

/*
 * The main function serves as the primary entry point for processing the input data.
 * It is designed to accept an array of strings, typically representing lines read from a file or standard input.
 */
const   main   =   (   input   )   =>
{
  // Step 1: Parse the first element of the input array to determine the value of 'n'.
  // 'n' is expected to be an integer, representing a key parameter for subsequent operations.
  const   n   =   parseInt(   input[0]   ,   10   ) ;


  // Step 2: Process the second element of the input array to create a numerical data array 'd'.
  // The string is split by spaces, and each resulting substring is converted into a number.
  let   d   =   input[1]
                  .split(   ' '   )  // Splits the string into an array of substrings based on space delimiter.
                  .map(   p   =>   Number(   p   )   ) ; // Converts each substring 'p' into a numerical type.

  // Step 3: Sort the numerical array 'd' in ascending order.
  // The custom comparison function (p,q) => p-q ensures a proper numerical sort.
  d   =   d.sort(   (p,q)   =>   p   -   q   ) ;


  // Step 4: Calculate and output the difference between two specific elements in the sorted array 'd'.
  // The elements are located at indices n/2 and n/2 - 1, which are relevant for median-like calculations.
  console.log(   d[   n   /   2   ]   -   d[   n   /   2   -   1   ]   ) ;
} // End of the main function definition.


// --- Program Execution Entry Point ---
// This block handles reading input from /dev/stdin and invoking the main processing function.
// It uses Node.js's 'fs' module to synchronously read the file.
main(
  require("fs")  // Imports the built-in 'fs' (file system) module.
    .readFileSync(   "/dev/stdin"   ,   "utf8"   )  // Reads the entire content of standard input as a UTF-8 string.
    .split(   '\n'   )  // Splits the read string into an array of lines, based on newline characters.
) ;
// The program concludes after the main function has executed.