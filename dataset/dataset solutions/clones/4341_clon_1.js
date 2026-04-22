/*
 * This JavaScript program processes numerical input from standard input.
 * It reads two integers, performs a specific arithmetic calculation,
 * and then outputs the result to the console.
 *
 * This is a Type I clone, focusing on extensive whitespace and comments
 * while maintaining exact structural and lexical equivalence to the original.
 */


// --- Section: Input Reading and Initial Processing ---

// Declare a variable 'input' to store the raw data obtained from standard input.
// The 'require' function is used to load the 'fs' (file system) module.
// 'readFileSync' reads the entire content of '/dev/stdin' (standard input) synchronously.
// The content is then decoded using 'utf8' encoding.
// Finally, the 'split' method divides the string into an array of substrings,
// using the newline character ('\n') as the delimiter.
var    input    =    require (   'fs'   ) .   readFileSync  (  '/dev/stdin'  ,   'utf8'   ) .   split   (   '\n'   ) ;


// --- Section: Variable Declaration and Parsing ---

// Declare a variable 'n' using 'let' (block-scoped).
// The 'parseInt' function is used to convert the first element of the 'input' array (at index 0)
// from a string representation to an integer. This represents our first number.
let    n    =    parseInt (   input [   0   ]   ) ;


// Declare another variable 'a' using 'let'.
// Similarly, 'parseInt' is used to convert the second element of the 'input' array (at index 1)
// into an integer. This represents our second number.
let    a    =    parseInt (   input [   1   ]   ) ;


// --- Section: Calculation and Output ---

// Access the 'console' object, and call its 'log' method.
// The expression inside 'log' calculates 'n' multiplied by 'n' (n squared),
// and then subtracts the value of 'a' from that result.
// The final computed value is then printed to the standard output.
console .   log   (   n   *   n   -   a   ) ;

// --- End of Program Execution ---