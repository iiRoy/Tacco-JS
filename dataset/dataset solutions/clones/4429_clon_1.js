/*
 * This JavaScript file processes a single string input.
 * It's designed to take a string, extract its first character,
 * its last character, and the length of the substring between them,
 * then concatenate these three parts into a new string which is printed to console.
 *
 * This implementation adheres to a specific problem requirement
 * where the input is typically read from standard input.
 */

function   Main  (  input  )
{
    // First, convert the input string into an array of characters.
    // This allows easy access to individual characters by index.
    const   number   =   input.split  (  ''  )  ;

    // Next, extract the middle part of the string.
    // This substring starts at index 1 and its length is the total length minus 2
    // (to exclude the first and last characters).
    const   S   =   input.substr  (  1  ,   number.length   -   2  )  ;

    // Retrieve the very first character of the original input string.
    const   head   =   number  [  0  ]  ;

    // Retrieve the very last character of the original input string.
    const   tail   =   number  [  number.length   -   1  ]  ;

    // Finally, construct the output string by concatenating:
    // 1. The first character (head)
    // 2. The length of the middle substring (S.length)
    // 3. The last character (tail)
    // And then print this resulting string to the console.
    console.log  (  head   +   S.length   +   tail  )  ;
}


// The following line is responsible for reading the input.
// It uses Node.js's 'fs' module to synchronously read from '/dev/stdin'.
// The content is read as a UTF-8 encoded string and then passed to the Main function.
Main  (  require  (  "fs"  )  .readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;