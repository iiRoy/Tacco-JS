/*
 * This script demonstrates basic Node.js I/O operations.
 * It reads a line from standard input and prints its reverse.
 */

// Ensure the standard input stream remains open.
process . stdin . resume ( ) ;

// Set the character encoding for standard input to UTF-8.
process . stdin . setEncoding ( 'utf8' ) ;


// This section handles reading data from the standard input.

// First, we require the 'fs' (file system) module
// to read from the '/dev/stdin' special file, which represents standard input.
var   input =   require ( 'fs' ) . readFileSync (   '/dev/stdin'   ,   'utf8'   ) ;

// Split the entire input content by newline characters to get an array of lines.
var   lines   =   input . split (   "\n"   ) ;

// We are interested only in the very first line of input.
var   line    =   lines [   0   ] ;

// Finally, print the reversed first line to standard output.
// - Convert the string to an array of characters.
// - Reverse the order of characters.
// - Join the characters back into a string.
console . log (   line . split (   ""   ) . reverse ( ) . join (   ""   )   ) ;