/*
 * This JavaScript program is designed to read numerical data
 * from standard input, parse these numbers, and then
 * compute their cumulative sum.
 *
 * It demonstrates basic file I/O, string processing with regex,
 * array iteration, and type conversion in Node.js.
 */

// Declare and initialize the accumulator variable.
// This variable will hold the running total of all numbers found.
var   ans   =   0   ;


// Start of the main processing logic.
// 1. Utilize the 'fs' module for file system operations.
// 2. Read the entire content from standard input synchronously.
// 3. The input content is treated as a UTF-8 encoded string.
// 4. Use a regular expression to extract all sequences of digits (numbers).
// 5. Iterate over each extracted numeric string.
require (   "fs"   )
  .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )
  .   match   (   /\d+/g   )
  .   forEach   (
    function   (   elem   )   {
      // For each element (which is a string representation of a number):
      // Convert the string to an integer using base 10.
      // Add this integer value to our accumulator 'ans'.
      ans   +=   parseInt   (   elem   ,   10   )   ;
    }
  )   ; // End of forEach loop and chained method calls.


// After processing all numbers, display the final sum.
console   .   log   (   ans   )   ;

// End of the JavaScript program.