/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact semantic and syntactic structure,
 * only varying in whitespace and comments.
 */

// Importing a specific utility from the 'console' module.
// Note: 'count' is not actually used in this specific script,
// but it's part of the original import statement.
const   { count } } = require( "console" ) ;


// Main function definition.
// This function calculates a specific value based on input 'N' and 'M'.
function   main ( lines )
{
    // Destructuring assignment to get N and M from the 'na()' helper function.
    // The 'na()' function reads a line, splits it by space, and converts parts to numbers.
    const   [ N , M ]   =   na ( ) ;

    // The core calculation: N * (N-1) / 2 + M * (M-1) / 2
    // This formula typically represents the sum of numbers from 1 to N-1
    // (or the number of unique pairs that can be formed from N items)
    // plus the same calculation for M.
    const   ans   =   N * ( N - 1 ) / 2   +   M * ( M - 1 ) / 2 ;

    // Return the final calculated answer.
    return   ans ;
}


// --- Input Processing Helper Functions ---

// Read the entire standard input, decode it as UTF-8,
// trim any leading/trailing whitespace, and then split it into an array of lines.
const   lines   =   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) . trim ( ) . split ( "\n" ) ;

// Initialize a counter for tracking the current line being processed from the 'lines' array.
let   lineCount   =   0 ;

// Helper function `s()`: retrieves the next line from the 'lines' array
// and increments the line counter.
const   s   =   ( )   =>   lines [ lineCount ++ ] ;

// Helper function `n()`: retrieves the next line using `s()` and converts it to a Number.
const   n   =   ( )   =>   Number ( s ( ) ) ;

// Helper function `b()`: retrieves the next line using `s()` and converts it to a BigInt.
const   b   =   ( )   =>   BigInt ( s ( ) ) ;

// Helper function `sa()`: retrieves the next line using `s()` and splits it by space,
// returning an array of strings.
const   sa   =   ( )   =>   s ( ) . split ( ' ' ) ;

// Helper function `na()`: retrieves the next line using `sa()` (splits by space)
// and then maps each resulting string part to a Number.
const   na   =   ( )   =>   sa ( ) . map ( Number ) ;

// Helper function `ba()`: retrieves the next line using `sa()` (splits by space)
// and then maps each resulting string part to a BigInt.
const   ba   =   ( )   =>   sa ( ) . map ( BigInt ) ;

// --- Script Execution ---

// Call the main function, passing the array of input lines.
// The result of the main function is stored in the 'ans' constant.
const   ans   = main( lines ) ;

// Print the final computed answer to the console.
console . log (   ans   ) ;
// End of script execution.