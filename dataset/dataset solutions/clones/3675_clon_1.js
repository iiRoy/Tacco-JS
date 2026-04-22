// This JavaScript program reads input from standard input (stdin)
// and performs a series of string manipulations and calculations.
// It appears to be solving a problem that involves counting matching
// string combinations generated from different parts of an input string.

// First, read all the data from standard input (file descriptor 0).
// The `require("fs").readFileSync(0)` call reads the entire content
// as a Buffer, which is then converted to a string using `"" + ...`.
// This string is then split into an array of lines using a newline
// character as the delimiter. The result is stored in the variable `m`.
m = ( "" + require( "fs" ) . readFileSync( 0 ) ) . split`
`;

// Initialize `n` with the value of the first line of input.
// This `n` is likely a number representing a length or count.
// Also, initialize `a` to 0. `a` will serve as an accumulator for the final result.
n = m[ a = 0 ] ;

// Store the second line of input in the variable `s`.
// This `s` string will be used to generate other strings.
s = m[ 1 ] ;


// This is the first major processing block.
// It generates `2^n` different strings based on the first `n` characters of `s`.
// It then uses the `m` array (which now also serves as a hash map/frequency counter)
// to store the occurrences of each generated string.
for ( b = 1 << n ; b-- ; m[ u ] = -~m[ u ] ) { // Outer loop: `b` iterates from `2^n - 1` down to `0`.
                                                // `1 << n` is equivalent to `Math.pow(2, n)`.
                                                // The post-loop expression `m[u] = -~m[u]` increments
                                                // the count for the string `u` (generated in the inner loop).
                                                // `-~x` is a compact way to write `x + 1` for numbers,
                                                // and `0 + 1` if `x` is `undefined` (first access).

    // Inner loop: Constructs a unique string `u` for each value of `b`.
    // `u` and `i` are initialized to `n`. `i` then decrements from `n-1` down to `0`.
    for ( u = i = n ; i-- ; ) {
        // This conditional (ternary) operator builds the string `u`.
        // It checks the `i`-th bit of `b` (using `b & (1 << i)`).
        // If the bit is set, `s[i]` (a character from the first half of `s`) is prepended to `u`.
        // Otherwise, `s[i]` is appended to `u`.
        u = ( b & ( 1 << i ) ) ? s[ i ] + u : u + s[ i ] ;
    }
}


// This is the second major processing block.
// It again generates `2^n` different strings, but this time using characters
// from the second half of the string `s`.
// It then accumulates the counts of these newly generated strings (if they
// were found in the `m` frequency map from the first block) into `a`.
for ( b = 1 << n ; b-- ; a += ~~m[ u ] ) { // Outer loop: `b` again iterates from `2^n - 1` down to `0`.
                                            // The post-loop expression `a += ~~m[u]` adds the count
                                            // of the string `u` (generated in the inner loop) to `a`.
                                            // `~~m[u]` converts `undefined` to `0` (if `u` was not
                                            // found in the first set of generated strings) and otherwise
                                            // converts the count to an integer.

    // Inner loop: Constructs a unique string `u` for each value of `b`.
    // `u` and `i` are initialized to `n`. `i` then decrements from `n-1` down to `0`.
    for ( u = i = n ; i-- ; ) {
        // This conditional (ternary) operator builds the string `u`.
        // It checks the `i`-th bit of `b`.
        // The characters are taken from `s[2 * n + ~i]`. `~i` is `-(i + 1)`.
        // So `2 * n + ~i` is `2 * n - i - 1`. This accesses characters from the
        // second half of `s` (from index `n` to `2*n-1`) in a specific, reversed order.
        // If the bit is set, the character is prepended to `u`.
        // Otherwise, the character is appended to `u`.
        u = ( b & ( 1 << i ) ) ? s[ 2 * n + ~i ] + u : u + s[ 2 * n + ~i ] ;
    }
}


// Finally, print the accumulated result stored in `a` to the console.
console . log ( a ) ;