/*
 * This is a Type I clone of a JavaScript program.
 * It reads input from standard input, processes it,
 * and then prints a calculated result to the console.
 * The purpose is to count specific occurrences based on array indices and values.
 */
"use strict" /* Enforce strict mode for better code quality and error handling */


// Import the 'fs' (file system) module to read from standard input.
// Read the entire content of /dev/stdin as a UTF-8 string.
var   input   =   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ;


// Split the entire input string into an array of lines, using the newline character as a delimiter.
var readlines = input . split ( "\n" ) ;


// The first line of the input is assigned to the variable 'n'.
var n = readlines [ 0 ] ;


/*
 * The second line contains a sequence of numbers separated by spaces.
 * First, split this line by spaces.
 * Then, use the map function to convert each resulting string segment into a Number type.
 * This array of numbers is stored in the variable 'a'.
 */
var a = readlines [ 1 ] . split ( " " ) . map ( Number ) ;


// Initialize a counter variable 'ans' to zero. This will store our final answer.
var ans = 0 ;


// Begin a loop that iterates from 'i' equals 0 up to (but not including) 'n'.
// 'i' will represent the current index in the array 'a'.
for ( let i = 0 ;   i   <   n ; i ++ )
{
  // Inside the loop, check two conditions simultaneously:
  // 1. Is the current index 'i' an even number? (i % 2 === 0)
  // 2. Is the element at the current index 'a[i]' an odd number? (a[i] % 2 === 1)
  if ( i % 2 === 0   &&   a [ i ] % 2 === 1 )
  {
    // If both conditions are met, increment the 'ans' counter by one.
    ans ++ ;
  }
}


// After the loop has completed, print the final value of 'ans' to the console.
console . log ( ans ) ;