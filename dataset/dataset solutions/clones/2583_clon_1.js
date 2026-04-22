/*
 * This JavaScript program processes input from standard input to solve a specific problem.
 * It involves reading numerical parameters N and K, and a string S.
 * The core logic counts transitions between different adjacent characters in string S,
 * then performs a calculation based on N, K, and the derived count, finally printing the result.
 */

// --- Input Acquisition Phase ---

// Read all data from standard input. The 'fs' module is essential for file system operations.
// '/dev/stdin' is a common path for standard input in Unix-like systems.
// The 'utf8' encoding ensures correct character interpretation.
input = require('fs').readFileSync(    '/dev/stdin', 'utf8'     ) ;

// Split the entire input string into an array of individual lines.
lines = input.split('\n') ;

// Extract the first line, which contains N and K, and split it by space.
// The 'shift()' method removes the first element from the 'lines' array.
line = lines.shift().split(' ') ;


// Parse N and K from the first line.
// Multiplying by 1 is a common JavaScript idiom to explicitly convert a string to a number.
N = line[0] * 1  ; // N represents the length of the string S (or a relevant count).
K = line[1] * 1  ; // K is another numerical parameter used in the final calculation.

// Extract the string S itself. This is typically the second line of input.
S = lines.shift() ; // S is the main string to be analyzed.


// --- Core Logic: Character Transition Counting ---

// Initialize a counter for adjacent character differences.
cnt = 0 ;

// Store the first character of string S to start comparison.
s = S[0] ;

// Loop through the string S, starting from the second character (index 1).
// The loop runs up to N, which should be the length of S.
for ( i = 1 ; i < N ; i++ ) {

    // Check if the current character is different from the previously stored character.
    if ( s != S[i] ) {
        cnt++ ; // If they are different, increment the change counter.
        s = S[i] ; // Update 's' to the current character for the next iteration's comparison.
    }

} // End of the character comparison loop.


// --- Final Calculation Phase ---

// Calculate an intermediate value 'd' based on the counted changes and parameter K.
d = cnt - 2 * K ;

// Ensure 'd' does not go below zero. If it's negative, set it to zero.
if ( d < 1 ) {
    d = 0 ;
}


// --- Output Result ---

// Calculate the final result and print it to the console.
// This is typically the answer to the problem.
console.log( N - 1 - d ) ;