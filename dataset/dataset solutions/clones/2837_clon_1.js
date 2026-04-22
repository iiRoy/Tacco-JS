/*
 * This JavaScript program processes two numerical inputs
 * from standard input, typically provided via a file descriptor.
 * It implements a specific conditional logic to produce an output.
 */

// Establish a convenient alias for the console logging function.
log = console.log;


// --- Data Acquisition and Initial Processing ---

// Utilize the 'fs' (file system) module to synchronously read
// the entire content of the standard input stream.
// The input is expected to be UTF-8 encoded.
var stdin = require("fs") . readFileSync( "/dev/stdin" , "UTF-8" );

// Process the raw input string:
// 1. Split the string by spaces to get an array of string representations of numbers.
// 2. Map each string element to its numerical equivalent.
var lines = stdin
    .split( " " ) // Separate the input string into individual components.
    .map( Number ) // Convert each component into a numeric type.
; // Semicolon added for clarity, though optional here.


// --- Variable Assignment from Processed Input ---

// Assign the first numerical value from the 'lines' array to variable N.
var N = lines[ 0 ];

// Assign the second numerical value from the 'lines' array to variable K.
var K = lines[ 1 ];


// --- Core Logic and Output Generation ---

// Calculate the difference between N and K. This value is used if K is not 1.
var diff = N - K;

// Implement conditional logic based on the value of K.
if ( K === 1 ) // Check if the second input number is exactly 1.
{
    // If K is 1, the problem specification dictates an output of 0.
    log( 0 );
}
else // This block executes if K is any number other than 1.
{
    // In all other cases, output the previously calculated difference.
    log( diff );
}

// End of script execution.