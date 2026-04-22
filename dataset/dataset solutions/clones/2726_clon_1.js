// This is a Type I clone of an original JavaScript file.
// It demonstrates extensive use of whitespace and comments
// while maintaining exact structural and logical equivalence.

   "use strict"   ; // Enforces strict parsing and error handling in the script.


// Configure the module system.
// This line ensures that the current module is treated as an ES module,
// setting the '__esModule' property to true on the 'exports' object.
Object . defineProperty ( exports ,   "__esModule" ,   {   value :   true   } ) ;


/*
 * Import the Node.js 'fs' (file system) module.
 * The 'fs' module provides an API for interacting with the file system,
 * allowing operations like reading and writing files.
 */
var   fs   =   require (   "fs"   )   ;


// Read the entire content of the standard input synchronously.
// The path "/dev/stdin" is a common Unix-like path for standard input.
// The data is read as a string encoded in UTF-8.
var   input   =   fs . readFileSync (   "/dev/stdin"   ,   "utf8"   )   ;


/*
 * Parse the input string into an integer.
 * The 'parseInt' function takes two arguments:
 * 1. The string to parse.
 * 2. The radix (base) to use for parsing, which is 10 for decimal numbers.
 * The result is stored in the variable 'r'.
 */
var   r   =   parseInt (   input   ,   10   )   ;


// Calculate and print the final result to the console.
// The expression `3 * r * r` calculates three times the square of 'r'.
// This result is then outputted to the standard output.
console . log (   3   *   r   *   r   )   ;

// End of the program execution.
// No further operations are performed after this point.