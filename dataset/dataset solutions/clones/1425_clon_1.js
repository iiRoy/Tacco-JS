/**
 * This JavaScript file processes input from standard input,
 * counts the occurrences of each letter (case-insensitive),
 * and then prints the count for each letter of the alphabet.
 */

// Define a function to read input from standard input.
// This function uses Node.js 'fs' module to read the content of /dev/stdin.
function   stdin   (   )    {


  // Return the content of /dev/stdin as a UTF-8 string.
  return    require (   "fs"   ) .   readFileSync (   "/dev/stdin"   ,   "utf8"   ) ;

} // End of stdin function definition.


// Initialize an array 'alpha' containing all lowercase English alphabet letters.
// This array will be used to iterate through each letter later.
var   alpha   =   'abcdefghijklmnopqrstuvwxyz' .   split (   ''   )   ,


  // Initialize 'res' by processing the standard input.
  // The input string is split into individual characters, and then
  // a reduce operation is performed to count letter frequencies.
  res   =   stdin (   ) .   split (   ''   ) .   reduce (   function   (   memo   ,   c   )    {

    // Convert the current character 'c' to lowercase for case-insensitive counting.
    c   =   c .   toLowerCase (   ) ;

    // Check if the character is an alphabet letter using a regular expression.
    // If it is, increment its count in the 'memo' object.
    // If it's the first occurrence, initialize its count to 1.
    // The 'null' part is for non-alphabetic characters, which are ignored.
    c .   match (   / [ a-zA-z ] /   )   ?   memo [   c   ]   =   memo [   c   ]   +   1   ||   1   :   null   ;


    // Return the updated memo object for the next iteration.
    return   memo   ;

  }   ,   {   }   ) ; // The initial value for the reduce operation is an empty object.


// Iterate over each letter in the 'alpha' array.
alpha .   forEach (   function   (   c   )    {

  // For each letter, print its count.
  // If a letter was not found in the input, its count will be 0.
  console .   log (   c   +   '   :   '   +   (   res [   c   ]   ?   res [   c   ]   :   0   )   ) ;

}   ) ; // End of forEach loop.

/*
 * This entire script demonstrates a common pattern for processing
 * character frequencies from standard input in Node.js.
 * It's concise and uses functional programming constructs like reduce and forEach.
 */