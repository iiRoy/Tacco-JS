/*
 * This JavaScript file processes input from standard input,
 * performs a comparison between two sets of numbers,
 * and then prints the count of common elements.
 *
 * This is a Type I code clone, meaning its functionality
 * and structure are identical to the original, with
 * only changes in whitespace and comments.
 */

  const config = {
      // Input file path, typically standard input in competitive programming
      input   :   '/dev/stdin'  ,

      // Newline character used for splitting input lines
      newline :   '\n'
  } ; // End of configuration object definition.


// Utilize the 'fs' (file system) module to read the input.
// The content is read synchronously, decoded as UTF-8,
// and then split into an array of lines based on the configured newline character.
const line = require('fs')  .  readFileSync(  config.input  ,  'utf-8'  )
  .  split(  config.newline  )  ; // The 'line' array now holds each line of input.


/**
 * Solves the problem by finding the number of common elements between two arrays.
 *
 * @param {Array<number>} arr1 - The first array of numbers.
 * @param {Array<number>} arr2 - The second array of numbers.
 * @returns {number} The count of elements present in both arr1 and arr2.
 */
const solve = (  arr1  ,  arr2  )  =>
  arr2  .  filter(  x  =>
    arr1  .  some(  y  =>  x  ==  y  ) // Checks if element 'x' from arr2 exists in arr1.
  )  .  length  ; // Returns the total number of filtered elements.


// Process the first set of data from the input lines.
// It takes the second line (index 1), splits it by spaces,
// and then converts each resulting string into an integer.
const data1 = line[1]  .  split(  ' '  )  .  map(  x  =>  parseInt(  x  )  )  ;


// Process the second set of data from the input lines.
// It takes the fourth line (index 3), splits it by spaces,
// and converts each part into an integer, similar to data1.
const data2 = line[3]  .  split(  ' '  )  .  map(  x  =>  parseInt(  x  )  )  ;


// Call the 'solve' function with the parsed data sets
// and print the returned result to the console.
console . log (  solve(  data1  ,  data2  )  )  ; // Output the final answer.