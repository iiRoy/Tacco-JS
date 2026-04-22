/*
 * This file contains a set of utility functions for competitive programming
 * followed by the main logic of the program.
 */

/*
 * myin: A function to read all input from standard input (stdin).
 * It uses Node.js 'fs' module to read synchronous file content.
 */
function   myin (   )   {
  // Reads the entire content of /dev/stdin as UTF-8, then trims whitespace.
  return require("fs") . readFileSync (   "/dev/stdin"   ,   "utf8"   ) . trim (   )   ;
}

/*
 * myout: A simple utility function to print data to standard output (stdout).
 * It wraps `console.log` for consistent output.
 */
function myout (   t   )   {
  // Logs the provided argument 't' to the console.
  console . log (   t   )   ;
}

// Explanation of the 'no' parameter for the 'myconv' function:
// 0: No operation; returns the input 'i' as is.
// 1: Converts the input 'i' to an integer using parseInt().
// 2: Splits the input string 'i' by a half-width space (" ").
// 3: Splits the input string 'i' by a newline character ("\n").
// 4: Splits by space, then maps each resulting string to a Number.
// 5: Splits by newline, then maps each resulting string to a Number.
// 6: Splits the input string 'i' into an array of individual characters.
// 7: Splits into individual characters, then maps each character to a Number.
function myconv (   i   ,   no   )   {
  switch (   no   )   {
    case 0   :   // Case 0: Return input without any modification.
      return i   ;
    case 1   :   // Case 1: Parse input as an integer.
      return parseInt (   i   )   ;
    case 2   :   // Case 2: Split string by space.
      return i . split (   " "   )   ;
    case 3   :   // Case 3: Split string by newline.
      return i . split (   "\n"   )   ;
    case 4   :   // Case 4: Split by space, then convert to numbers.
      return i . split (   " "   ) . map (   (   a   )   =>   Number (   a   )   )   ;
    case 5   :   // Case 5: Split by newline, then convert to numbers.
      return i . split (   "\n"   ) . map (   (   a   )   =>   Number (   a   )   )   ;
    case 6   :   // Case 6: Split string into individual characters.
      return i . split (   ""   )   ;
    case 7   :   // Case 7: Split into characters, then convert to numbers.
      return i . split (   ""   ) . map (   (   a   )   =>   Number (   a   )   )   ;
  }
}

/*
 * Main function: This is the entry point for the program's core logic.
 * It takes the raw input string, processes it, and computes the final result.
 */
function Main (   input   )   {
    // Convert the raw input string by splitting it into an array of lines.
    input   =   myconv (   input   ,   3   )   ;

    // The first line of input represents N, converted to an integer.
    var   N   =   myconv (   input [   0   ]   ,   1   )   ;

    // The second line of input is a space-separated list, converted to an array of numbers.
    var   list   =   myconv (   input [   1   ]   ,   4   )   ;

    // Initialize a temporary list 'tmpList' of size N, filled with zeros.
    var   tmpList   =   new Array (   N   ) . fill (   0   )   ;

    // Iterate through the 'list' array.
    // If an element `list[i]` matches `i + 1`, set `tmpList[i]` to 1.
    for   (   var   i   =   0   ;   i   <   N   ;   i   ++   )   {
        if   (   list [   i   ]   ==   i   +   1   )   {
            tmpList [   i   ]   =   1   ;
        }
    }

    // Initialize the 'output' variable to store the final count.
    var   output   =   0   ;

    // Iterate from the second element (index 1) up to N-1 to check pairs.
    for   (   var   i   =   1   ;   i   <   N   ;   i   ++   )   {
        // Get the value of the previous element in tmpList.
        var   mae   =   tmpList [   i   -   1   ]   ;
        // Get the value of the current element in tmpList.
        var   ato   =   tmpList [   i   ]   ;

        // Condition 1: For elements other than the very first pair (i != 1),
        // if the previous element is 0 and the current element is 1.
        if   (   i   !=   1   &&   mae   ==   0   &&   ato   ==   1   )   {
            output   ++   ;
        }
        // Condition 2: For the very first pair (i == 1),
        // if either the current element is 1 or the previous element is 1.
        else   if   (   i   ==   1   &&   (   ato   ==   1   ||   mae   ==   1   )   )   {
            output   ++   ;
        }
    }

    // A commented-out line from the original code, possibly for debugging:
    // myout(tmpList);

    // Print the final calculated output.
    myout (   output   )   ;
}

// Call the Main function, providing the input obtained from `myin()`.
Main (   myin (   )   )   ;