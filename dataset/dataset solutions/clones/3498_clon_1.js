"use strict"; /* This directive enables strict mode for the entire script. */

/**
 * Defines a custom input parser class.
 * It processes input line by line and token by token.
 *
 * @param {string} s - The raw input string.
 * @param {function} f - An optional function to parse tokens (defaults to Number).
 */
function I( s, f ) {
    // Stores the input string, split into an array of lines.
    this._s = s.split( "\n" );

    // _c: Current token index within the current line.
    this._c = 0;

    // _l: Current line index.
    this._l = 0;

    // _f: Function used to convert tokens (e.g., Number, String).
    this._f = f || Number;
}

/**
 * Reads and returns the next token from the input.
 * Advances the internal cursor to the next token.
 *
 * @returns {any} The parsed token, or undefined if no more input.
 */
I.prototype.a = function( ) {
    // Get the current line based on the line index.
    var l = this._s[ this._l ];

    // If the current line is undefined (end of input or empty line list), return.
    if ( !l ) {
        return;
    }

    // Trim whitespace from the line and split it into an array of tokens.
    var t = l.trim( ).split( " " );

    // Get the token at the current token index.
    var a = t[ this._c ];

    // Increment the token index for the next call.
    this._c++;

    // Check if we have processed all tokens in the current line.
    if ( t.length === this._c ) {
        // Reset token index for the next line.
        this._c = 0;
        // Advance to the next line.
        this._l++;
    }

    // Parse and return the token using the specified parser function.
    return this._f( a );
};

/**
 * Reads and returns all tokens from the current line.
 * Advances the internal cursor to the next line.
 *
 * @returns {Array<any>} An array of parsed tokens from the current line, or undefined.
 */
I.prototype.l = function( ) {
    // Get the current line.
    var l = this._s[ this._l ];

    // If the current line is undefined, return.
    if ( !l ) {
        return;
    }

    // Reset the token cursor as we're reading the whole line.
    this._c = 0;
    // Advance to the next line.
    this._l++;

    // Split the line into tokens, map them using the parser function, and return.
    return l.split( " " ).map( this._f );
};

// Export the I class for use in other modules.
module.exports = I;

/**
 * The main function to solve the problem.
 * It reads two numbers N and M, finds all divisors of M,
 * and then determines the largest divisor of M that is less than or equal to M/N.
 *
 * @param {string} input - The raw input string containing N and M.
 */
function main( input ) {
    // Initialize the input parser with the provided input string.
    const o = new I( input );

    // Read the first number, N, using the parser.
    const N = o.a( );

    // Read the second number, M, using the parser.
    const M = o.a( );

    // Initialize an array to store the divisors of M.
    const divisors = [ ];

    /*
     * Find divisors up to the square root of M.
     * If 'i' is a divisor, then M/i is also a divisor.
     * We only add 'i' in this loop to avoid duplicates and maintain order for the first half.
     */
    for ( let i = 1; i <= Math.sqrt( M ); i++ ) {
        // Check if 'i' divides M evenly.
        if ( M % i === 0 ) {
            // Add 'i' to the divisors list.
            divisors.push( i );
        }
    }

    /*
     * Iterate through the already found divisors in reverse order.
     * For each divisor 'i', its pair 'j = M / i' is also a divisor.
     * Add these 'j' values to the divisors list, ensuring they are distinct
     * from the ones already added (specifically, if j > the last element, it's new).
     * This effectively adds the larger half of the divisors.
     */
    for ( let i = divisors.length - 1; i >= 0; i-- ) {
        const j = M / divisors[ i ];

        // Only add 'j' if it's greater than the largest divisor already found.
        // This handles cases where M is a perfect square (i * i = M)
        // and prevents adding the square root twice if it was already added as 'i'.
        if ( j > divisors[ divisors.length - 1 ] ) {
            divisors.push( j );
        }
    }

    // Initialize 'max' to 1, as 1 is always a divisor and a possible answer.
    let max = 1;

    /*
     * Iterate through all found divisors to find the largest one
     * that satisfies the condition: M / divisor >= N.
     * This is equivalent to: divisor <= M / N.
     */
    for ( let i = 0; i < divisors.length; i++ ) {
        // Check the condition for the current divisor.
        if ( M / divisors[ i ] >= N ) {
            // If the condition is met, update 'max' with this divisor.
            // Since we iterate through sorted divisors, this will correctly find the largest one.
            max = divisors[ i ];
        }
    }

    // Output the final maximum divisor found.
    console.log( max );
}

// Read input from standard input and pass it to the main function.
main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );