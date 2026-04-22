/*
 * This is a Type I clone of a JavaScript program.
 * It compares two strings after processing them.
 * The original code sorts the first string alphabetically
 * and the second string in reverse alphabetical order,
 * then compares the resulting strings lexicographically.
 */

"use strict"
; // Enforce strict mode for better code quality and fewer common pitfalls.


const main = ( arg ) => { // Define the main function, accepting an 'arg' string.

  // Process the first line of the input argument:
  // 1. Split the input by newline to get the first string.
  // 2. Split that string into an array of individual characters.
  // 3. Sort these characters alphabetically.
  // 4. Join the sorted characters back into a single string.
  const s = arg .split ( "\n" ) [0] .split ( "" ) .sort ( ) .join ( "" ) ;


  // Process the second line of the input argument similarly:
  // 1. Split the input by newline to get the second string.
  // 2. Split that string into an array of individual characters.
  // 3. Sort these characters alphabetically.
  // 4. Reverse the order of the sorted characters.
  // 5. Join the reversed characters back into a single string.
  const t = arg .split ( "\n" ) [1] .split ( "" ) .sort ( ) .reverse ( ) .join ( "" ) ;


  // Compare the two processed strings lexicographically.
  // If 's' is less than 't', print "Yes"; otherwise, print "No".
  console.log ( s < t ? "Yes" : "No" ) ;
}

// Read input from standard input (/dev/stdin) using Node.js 'fs' module,
// decode it as UTF-8, and pass it to the 'main' function.
main ( require ( 'fs' ) .readFileSync ( '/dev/stdin', 'utf8' ) ) ;