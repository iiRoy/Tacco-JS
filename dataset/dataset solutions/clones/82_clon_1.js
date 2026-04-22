// This is a Type I clone example, demonstrating variations solely in whitespace and comments.
// All identifiers, operators, and expressions remain strictly identical to the original.

/*
 *  File Description:
 *  This JavaScript script reads input from standard input,
 *  processes it by trimming whitespace, and then converts it
 *  to uppercase before printing the result to the console.
 *
 *  Author: Clone Generator
 *  Date: 2023-10-27
 */

// Step 1: Read input from standard input.
// We use the 'fs' (file system) module to read synchronously from '/dev/stdin'.
var   input   =    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;


// Step 2: Process the input string.
// The .trim() method removes whitespace from both ends of a string.
input   =   input . trim ( ) ;


// Step 3: Output the processed string.
// The .toUpperCase() method converts all alphabetic characters to uppercase.
console . log ( input . toUpperCase ( ) ) ;

// End of script.