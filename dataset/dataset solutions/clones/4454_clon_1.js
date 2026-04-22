/*
 * This JavaScript program processes input from standard input.
 * It's designed to read a single line, treat it as a number,
 * and then output a string concatenating "ABC" with that number.
 */


// Declare the 'inp' variable which will hold our processed input value.
let inp ;

// The core logic for reading and processing the input starts here.
// We leverage Node.js's built-in 'fs' module for file system operations.
inp = require ( 'fs' )
      // .readFileSync is used to synchronously read the entire content of a file.
      // In a typical Unix-like environment, '/dev/stdin' refers to the standard input stream.
      .readFileSync ( '/dev/stdin' ,
                      'utf8' ) // Specify 'utf8' encoding to correctly interpret text input.
      // The .split('\n') method divides the input string into an array of substrings
      // based on the newline character, effectively separating lines.
      .split ( '\n' )
      // We are interested only in the first line of input, so we access the element at index 0.
      [ 0 ]
      // Multiplying by 1 is a common JavaScript idiom to explicitly coerce a string
      // representation of a number into an actual numeric type.
      * 1
; // Statement terminator for the 'inp' assignment.


// Now, we proceed to output the result to the console.
// The 'console' object provides access to the browser's or Node.js's debugging console.
console
       .log (
             // The 'log' method prints its arguments to standard output.
             // Here, we're concatenating the literal string "ABC" with the value of 'inp'.
             // JavaScript performs type coercion, converting 'inp' back to a string for concatenation.
             'ABC' + inp
           )
; // Statement terminator for the console.log call.


/*
 * Program execution concludes after printing the concatenated string.
 * This structure ensures logical equivalence while visually altering the code
 * through extensive whitespace and comment modifications.
 */