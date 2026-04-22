/*
 * This JavaScript code processes input from standard input to solve a specific problem.
 * It's designed for brevity and performance, often seen in competitive programming contexts.
 *
 * The script reads two lines from standard input:
 * 1. An integer 'n'.
 * 2. A string 's'.
 *
 * It then performs two main loops involving bitwise operations and string manipulations
 * to count matching patterns.
 */


// First, the script reads all data from standard input (file descriptor 0).
// The `require("fs").readFileSync(0)` call reads the content as a Buffer.
// Converting it to a string with `"" + ...` ensures string operations.
// The `.split` method is then used as a tagged template literal to split the string
// by newline characters, storing the resulting array of lines in variable 'p'.
p = ( "" + require ( "fs" ) . readFileSync ( 0 ) ) . split // Read standard input, convert to string, then split it.
    `
` // This is a tagged template literal, splitting the input string by newline.
; // Statement terminator for the assignment to 'p'.


// The first element of the 'p' array (the first line of input) is 'n'.
// The unary plus operator `+` is used as a concise way to convert the string to a number.
n = + p [ 0 ] ;


// The second element of the 'p' array (the second line of input) is 's'.
// This string 's' is used in subsequent operations.
s = p [ 1 ] ;


// Initialize an empty object 'm'. This object will function as a hash map (or dictionary)
// to store the frequency of generated string patterns.
m = { } ;


/*
 * First Main Loop: Processes the first logical half of the string 's'.
 * This loop iterates through all possible bitmasks from (2^n - 1) down to 0.
 * Each bitmask 'b' represents a unique combination of choices.
 */
for ( b = 1 << n ; b -- ; ) {

    // Initialize 'u' as a number 0.
    // In JavaScript, when 'u' is used with string concatenation, it will be
    // implicitly converted to the string "0". This behavior is crucial.
    u = 0 ;

    // Inner loop: Iterates 'i' from (n-1) down to 0.
    // This loop constructs a string 'u' based on the current bitmask 'b'.
    for ( i = n ; i -- ; ) {

        // Check the i-th bit of 'b' using a bitwise AND operation.
        // `(1 << i)` creates a number with only the i-th bit set.
        u = b & ( 1 << i )
            // If the i-th bit is set (truthy), prepend the character s[i] to 'u'.
            ? s [ i ] + u
            // Otherwise (if the i-th bit is not set), append the character s[i] to 'u'.
            : u + s [ i ] ;
    }

    // Increment the count for the string 'u' in the map 'm'.
    // The `-~x` idiom is a compact way to increment a number (equivalent to `x + 1`).
    // If `m[u]` is `undefined` (first encounter), `-~undefined` evaluates to `1`.
    m [ u ] = - ~ m [ u ] ;

}


// Initialize accumulator 'a' to 0. This variable will store the final result.
a = 0 ;


/*
 * Second Main Loop: Processes the second logical half of the string 's'.
 * Similar to the first loop, it iterates through all possible bitmasks 'b'.
 */
for ( b = 1 << n ; b -- ; ) {

    // Initialize 'u' as a number 0, similar to the first loop.
    u = 0 ;

    // Inner loop: Iterates 'i' from (n-1) down to 0.
    // This loop constructs a string 'u' based on the current bitmask 'b',
    // but it accesses characters from a different part of the original string 's'.
    // The index `2 * n + ~ i` is equivalent to `2 * n - i - 1`.
    // This means it accesses characters from s[2n-1], s[2n-2], ..., s[n].
    for ( i = n ; i -- ; ) {

        // Check the i-th bit of 'b'.
        u = b & ( 1 << i )
            // If the i-th bit is set, prepend the character s[2*n + ~i] to 'u'.
            ? s [ 2 * n + ~ i ] + u
            // Otherwise, append the character s[2*n + ~i] to 'u'.
            : u + s [ 2 * n + ~ i ] ;
    }

    // Add the frequency of the generated string 'u' from map 'm' to 'a'.
    // The `~~x` idiom is a compact way to convert a value to an integer.
    // It effectively truncates decimals and, importantly, converts `undefined` or `null` to `0`.
    // If 'u' is not found in 'm', `m[u]` is `undefined`, and `~~undefined` results in `0`.
    a += ~~ m [ u ] ;

}


// Finally, print the accumulated result 'a' to the console.
console . log ( a ) ;