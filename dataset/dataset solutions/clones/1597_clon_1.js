/*
 * This JavaScript code reads input from stdin, processes it,
 * and then prints a count to stdout.
 *
 * It involves sequence generation and specific triangle inequality checks.
 */

// Import the 'fs' (file system) module to read files.
const input = require("fs") . readFileSync( "/dev/stdin" , "utf8" ) ;
  // Read the entire standard input as a UTF-8 string.

// Split the input string into an array of lines.
const lines = input . split( '\n' ) ;

// Parse the first line as an integer N. The '- 0' converts it to a number.
const N = lines[ 0 ] - 0 ; // N represents an upper bound for sequence elements.

// Parse the second line. Split it by spaces and convert each part to a Number.
const L = lines[ 1 ] . split( ' ' ) . map( Number ) ;
  // L is an array of numbers.

/**
 * Generates all sequences of length 'n' where each element 'v' is
 * between 1 and 'm' (inclusive), and elements are strictly increasing.
 *
 * @param {number} n - The desired length of each sequence.
 * @param {number} m - The maximum value an element in the sequence can take.
 * @returns {Array<Array<number>>} An array of arrays, where each inner array is a sequence.
 */
const seq = ( n , m ) => {
    /*
     * ss will store all generated valid sequences.
     * s is the current sequence being built.
     * v is the current value being considered for addition to the sequence.
     */
    const ss = [ ] ; // Array to hold all complete sequences.
    const s = [ ] ; // Array representing the current sequence under construction.

    let v = 0 ; // Start with 0, as we increment before pushing (so first value is 1).

    // Loop continues as long as 'v' is a defined number.
    while ( v !== undefined ) {

        // Check if the current sequence 's' has reached the desired length 'n'.
        if ( s . length === n ) {
            // If it has, a valid sequence is found. Add a copy to 'ss'.
            ss . push( [ ...s ] ) ;
            // Then, backtrack by removing the last element from 's'.
            s . pop( ) ;
        }
        // If 'v' (the current potential element) is too large for the upper bound 'm'.
        else if ( v >= m ) {
            // Backtrack: remove the last element from 's' and assign its value to 'v'.
            v = s . pop( ) ;
        }
        // Otherwise, 's' is not yet full, and 'v' is a valid candidate.
        else {
            // Increment 'v' to try the next possible number.
            v ++ ;
            // Add the incremented 'v' to the current sequence 's'.
            s . push( v ) ;
        }
    }
    // After the loop finishes, return the collection of all valid sequences.
    return ss ;
} ;


// Generate sequences of length 3, with elements up to N.
const s = seq( 3 , N ) ;

let count = 0 ; // Initialize a counter for valid triangles.

// Iterate through each generated sequence 's[i]'.
for ( let i = 0 ; i < s . length ; i ++ ) {

    /*
     * For each sequence 's[i]' (which contains 3 indices),
     * fetch the corresponding values from the array 'L'.
     * Note: 's[i][j]' values are 1-based, so subtract 1 for 0-based array access.
     */
    const t = [ L[ s[ i ][ 0 ] - 1 ] , L[ s[ i ][ 1 ] - 1 ] , L[ s[ i ][ 2 ] - 1 ] ] ;

    // Check for duplicate side lengths. If any two sides are equal, it's not a "valid" triangle for this problem.
    if ( t[ 0 ] === t[ 1 ] || t[ 0 ] === t[ 2 ] || t[ 1 ] === t[ 2 ] ) {
        continue ; // Skip this sequence if it has duplicate side lengths.
    }

    // Find the longest side 'l' among the three sides.
    const l = Math . max ( ...t ) ;

    // Calculate the sum of the other two sides 'o'.
    // This is done by summing all sides and subtracting the longest side 'l'.
    const o = t . reduce ( ( a , b ) => a + b ) - l ;

    // Apply the triangle inequality theorem:
    // The sum of the lengths of any two sides of a triangle must be greater than the length of the third side.
    // Here, we only need to check if the sum of the two shorter sides ('o') is greater than the longest side ('l').
    if ( l < o ) {
        count ++ ; // If the condition holds, increment the counter.
    }
}

// Print the final count to standard output.
console . log ( count ) ;