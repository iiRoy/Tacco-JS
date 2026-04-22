/*
 * This file implements a solution for a programming problem.
 * It uses a custom input reader and processes an array of numbers.
 */

'use strict'; // Enforce strict mode for cleaner code.

/**
 * Custom input reader class.
 * @param {string} s - The raw input string, typically from stdin.
 */
function _ ( s ) {
    // Split the input string into lines.
    let l = s.split( '\n' );

    // If the last line is empty (due to a trailing newline), remove it.
    if ( l[ l.length - 1 ] === '' ) {
        l.pop();
    }

    // Store the processed lines.
    this.l = l;

    // Initialize a pointer to the current line being read.
    this.y = 0;
}

/**
 * Reads a line, splits it by spaces, and converts parts to numbers.
 * Increments the line pointer.
 * @returns {number[]} An array of integers from the current line.
 */
_.prototype.ints = function ( ) {
    // Access the current line, then increment the line pointer.
    return this.l[ this.y++ ]
               .split( ' ' ) // Split the line by spaces.
               .map( v => +v ); // Convert each string part to a number.
};

/**
 * Reads all remaining lines from the current position to the end,
 * converting each line to a number.
 * Resets the line pointer to the end of the input.
 * @returns {number[]} An array of integers from the remaining lines.
 */
_.prototype.intv = function ( ) {
    // Store the current line pointer.
    const y = this.y;
    // Move the line pointer to the end of the input.
    this.y = this.l.length;
    // Slice the remaining lines and convert them to numbers.
    return this.l.slice( y ).map( v => +v );
};

/**
 * Reads all remaining lines from the current position to the end,
 * returning them as strings.
 * Resets the line pointer to the end of the input.
 * @returns {string[]} An array of strings from the remaining lines.
 */
_.prototype.strv = function ( ) {
    // Store the current line pointer.
    const y = this.y;
    // Move the line pointer to the end of the input.
    this.y = this.l.length;
    // Slice and return the remaining lines as strings.
    return this.l.slice( y );
};

/**
 * Reads a specified number of lines from the current position,
 * returning them as strings.
 * Increments the line pointer by the number of lines read.
 * @param {number} n - The number of lines to read.
 * @returns {string[]} An array of strings.
 */
_.prototype.strn = function ( n ) {
    // Store the current line pointer.
    const y = this.y;
    // Advance the line pointer by 'n'.
    this.y += n;
    // Slice and return 'n' lines as strings.
    return this.l.slice( y, y + n );
};

// Instantiate the custom input reader by reading from standard input.
const $ = new _( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );

// Immediately Invoked Function Expression (IIFE) to encapsulate the main logic.
( ( ) => {

    /*
     * Start of the main problem-solving logic.
     * This section reads input, performs calculations, and prints the result.
     */

    // Read the first line containing 'n' and 'k'.
    const nk = $.ints( );
    // Extract 'n' from the first element.
    const n = nk[ 0 ];
    // Extract 'k' from the second element.
    const k = nk[ 1 ];

    // Read the array 'a' from the next line.
    const a = $.ints( );

    // Initialize an array to store all possible contiguous subarray sums.
    const rr = [ ];

    // Outer loop: iterates through all possible starting indices 'i'.
    for ( let i = 0; i < n; i++ ) {
        // Initialize the current sum for the subarray starting at 'i'.
        let s = 0;
        // Inner loop: iterates through all possible ending indices 'j' from 'i' to 'n-1'.
        for ( let j = i; j < n; j++ ) {
            // Add the current element to the sum.
            s += a[ j ];
            // Push the current subarray sum into the 'rr' array.
            rr.push( s );
        }
    }

    // Sort the 'rr' array in descending order.
    // This is crucial for selecting the largest sums later.
    rr.sort( ( a, b ) => b - a );

    // Initialize the result variable, which will store the maximum possible XOR sum.
    let res = 0;

    // Iterate from the most significant bit (MSB) down to the least significant bit (LSB).
    // The maximum possible value for a sum is around 10^9 * 2000 = 2 * 10^12, which fits in 64-bit integer.
    // 2^41 is approximately 2.19 * 10^12, so 41 bits are sufficient.
    for ( let d = 41; d >= 0; d-- ) {
        // Calculate the current bit's value (e.g., 2^41, 2^40, ..., 2^0).
        let border = Math.pow( 2, d );

        // Filter 'rr' to find numbers that, when combined with 'res + border',
        // have 'res + border' as a submask.
        // This is a common technique for maximizing XOR sums bit by bit.
        let num = rr.filter( e => ( ( e & ( res + border ) ) === ( res + border ) ) ).length;

        /*
         * The following line is a debug statement, commented out in the final code.
         * It would print the current bit, border value, count of matching elements,
         * and the matching elements themselves.
         */
        // console.log(d, border, num, rr.filter(e=>(e&(res+border)) === (res+border)))

        // If 'num' (count of elements satisfying the bit condition) is greater than or equal to 'k',
        // it means we can potentially include this bit in our 'res'.
        if ( num >= k ) {
            // Add the current bit's value to 'res'.
            // This effectively "sets" the d-th bit in 'res'.
            res += border;
        }
    }

    // Print the final calculated maximum XOR sum.
    console.log( res );

    /*
     * End of the main problem-solving logic.
     */

} ) ( ); // Execute the IIFE.