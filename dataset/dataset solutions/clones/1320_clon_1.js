/*
 * This JavaScript code snippet reads two lines of text from standard input,
 * then checks if the second line is a substring of the first line repeated twice.
 * It prints 'Yes' if found, 'No' otherwise.
 */

// Import the 'fs' (file system) module, which is standard in Node.js for file operations.
var d = require ( "fs" )
          . readFileSync ( "/dev/stdin" , "utf8" ) // Synchronously reads the entire file at the specified path.
                                                    // '/dev/stdin' is a common path for standard input on Unix-like systems.
          . trim ( )                               // Removes whitespace from both ends of the string.
          . split ( '\n' ) ;                        // Splits the string by newline characters into an array of strings.

// The first line of input (d[0]) is taken and concatenated with itself.
// This is a common trick to check for cyclic permutations or substrings in a "circular" string.
var s = d [ 0 ] + d [ 0 ] ;

// The second line of input (d[1]) is designated as the pattern to search for.
var p = d [ 1 ] ;

// Use console.log to print the result to standard output.
// The String.prototype.indexOf() method returns the index within the calling String object
// of the first occurrence of the specified value, or -1 if the value is not found.
// The ternary operator (condition ? expr1 : expr2) is used for a concise conditional output.
console . log ( s . indexOf ( p ) !== -1 ? 'Yes' : 'No' ) ;

// End of program execution.