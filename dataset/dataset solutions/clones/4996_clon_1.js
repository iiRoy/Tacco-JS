/*
 * This JavaScript file presents a Type I clone of an original source.
 * The core logic and all functional elements remain precisely the same.
 * Only whitespace (spacing, indentation, line breaks) and comments have been
 * altered or introduced to create a visually distinct, yet functionally identical, piece of code.
 */

'use strict' ; // Enable strict mode for better code quality and error handling.


// Declare a constant 'lines' to store the input.
const   lines   =   require ( "fs" ) // Utilize the built-in 'fs' module for file system operations.
    .   readFileSync ( "/dev/stdin" ,   "utf8" )  // Synchronously read the content from standard input, interpreting it as UTF-8.
    .   split ( "" )
; // After reading, split the entire content into an array of individual characters.


let    answer    =    "Yes" ;  // Initialize the 'answer' variable; it will hold "Yes" or "No".


// Begin a 'for' loop to iterate through each character in the 'lines' array.
for  (  let   i  =  0  ;   i  <  lines.length  ;   i++   )
{
  // Initialize a counter for the current character being examined.
  let    count    =    0  ;

  // Use 'forEach' to iterate over all characters in the 'lines' array again.
  // This inner loop counts occurrences of the character at 'lines[i]'.
  lines . forEach (  num   =>   {
    // Compare the character at the current outer loop index 'i' with 'num' from the inner loop.
    if  (  lines [ i ]   ==   num   )
    {
      count ++ ; // If they match, increment the counter.
    }
  } ) ; // End of the inner 'forEach' loop.

  // After counting, check if the total occurrences of the current character is odd.
  if  (  count   %   2   !=   0   )
  {
    answer    =    "No" ; // If the count is odd, set the answer to "No".
    break  ; // An odd count means the condition is failed, so we can exit the loop early.
  }
} // End of the outer 'for' loop.


// Finally, print the determined 'answer' to the console.
console . log ( answer ) ;

/*
 * This program essentially checks if every unique character in the input
 * appears an even number of times. If even a single character appears an odd number of times,
 * the answer becomes "No". Otherwise, it remains "Yes".
 */