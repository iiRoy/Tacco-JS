/*
 * This JavaScript file processes input from standard input
 * to calculate the number of correctly solved problems and
 * the total penalties incurred.
 *
 * It simulates a programming contest scoring system.
 */
"use strict" ; // Enforce strict mode for better code quality.


// Import the Node.js file system module.
const fs = require( 'fs' ) ;



// Read all input from stdin, convert to string, split by newlines,
// and then split each line by spaces to get an array of arrays.
let input = fs.readFileSync( 0 ) . toString( ) . split( "\n" ) . map( ( a ) => a . split( " " ) ) ;


// The first line of input contains N (number of problems/contestants) and M (total submissions).
const n = parseInt( input[ 0 ] [ 0 ] ) ; // Extract N (number of distinct problems/users to check).
const m = parseInt( input[ 0 ] [ 1 ] ) ; // M is not directly used in the current logic, but parsed.


let correct = 0 ; // Initialize counter for correctly solved problems.
let penalties = 0 ; // Initialize counter for total penalties.


// Discard the first line of input, as it contained N and M, which have already been parsed.
input = input . slice( 1 ) ;


// Iterate through each possible problem ID from 1 to N.
for ( let i = 1 ; i <= n ; i ++ )
{
  // Find the index of the very first 'AC' (Accepted) submission for the current problem 'i'.
  let firstCorrect = input . findIndex( ( a ) => a[ 0 ] == i && a[ 1 ] === 'AC' ) ;

  // If no 'AC' submission was found for this problem, it means it was not solved.
  if ( firstCorrect === -1 )
  {
    continue ; // Move to the next problem.
  }

  // If an 'AC' was found, count all 'wrong' submissions for this problem
  // that occurred *before* the first 'AC' submission.
  const wrongs = input . filter( ( a , j ) => ( a[ 0 ] == i ) && j < firstCorrect ) ;

  // Each wrong submission before the first correct one adds to penalties.
  penalties += wrongs . length ;

  // Increment the count of correctly solved problems.
  correct ++ ;
}


// Output the final count of correctly solved problems and total penalties, separated by a space.
console . log( correct + " " + penalties ) ;