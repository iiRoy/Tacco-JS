// This is a Type I clone of the original JavaScript code.
// It demonstrates extensive variations in whitespace and comments
// while strictly adhering to the Type I definition:
// every identifier, variable name, function name, operator, and expression
// remains completely unchanged.

/*
 *  Module Imports and Input Processing
 *  -----------------------------------
 *  The 'fs' module is imported implicitly by 'require("fs")'.
 *  The standard input (file descriptor 0) is read synchronously.
 *  The content is converted to a string and then split by newline characters.
 *  The resulting array of lines is stored in 'm'.
 */

m = ( "" + require( "fs" ) . readFileSync( 0 ) ) . split`
` ;


// Variable Initialization
// -----------------------
// 'n' gets the value of the first line from input 'm'.
// 'a' is initialized to 0 during the assignment to 'n'.
n = m[ a = 0 ] ;

// 's' gets the value of the second line from input 'm'.
s = m[ 1 ] ;


/*
 *  First Main Processing Loop
 *  --------------------------
 *  This loop iterates '2^n' times, where 'n' is from the input.
 *  Each iteration 'b' represents a unique combination (a bitmask).
 *  The loop processes these combinations to construct strings,
 *  and then updates counts in the 'm' array.
 */
for ( b = 1 << n ; b -- ; )
{
    // 'u' is a temporary variable used to build a string in each iteration.
    u = 0 ;

    /*
     *  Inner Loop for String Construction (Part 1)
     *  -------------------------------------------
     *  This loop runs 'n' times.
     *  It checks each bit of 'b' (from 'n-1' down to '0').
     *  Based on the bit, it either prepends or appends a character from 's' to 'u'.
     *  Specifically, if the i-th bit is set, s[i] is prepended; otherwise, it's appended.
     */
    for ( i = n ; i -- ; )
    {
        u = b & ( 1 << i )
            ? s[ i ] + u     // Prepend s[i] if the i-th bit is 1.
            : u + s[ i ] ;   // Append s[i] if the i-th bit is 0.
    }

    // Increment the count for the constructed string 'u' in the 'm' array.
    // The '-~' operator is a compact way to perform 'x = x + 1' or 'x++'.
    // If m[u] is undefined, -~undefined evaluates to 1.
    m[ u ] = -~m[ u ] ;
}


/*
 *  Second Main Processing Loop
 *  ---------------------------
 *  This loop also iterates '2^n' times, similar to the first.
 *  It constructs new strings based on a different indexing scheme for 's',
 *  and then accumulates values from 'm' into 'a'.
 */
for ( b = 1 << n ; b -- ; )
{
    // Reset 'u' for the new string construction in this loop.
    u = 0 ;

    /*
     *  Inner Loop for String Construction (Part 2)
     *  -------------------------------------------
     *  This loop runs 'n' times.
     *  It checks each bit of 'b' (from 'n-1' down to '0').
     *  Based on the bit, it either prepends or appends a character from 's' to 'u'.
     *  The character index is different: '2 * n + ~i'.
     *  Note: '~i' is equivalent to '-(i + 1)'.
     */
    for ( i = n ; i -- ; )
    {
        u = b & ( 1 << i )
            ? s[ 2 * n + ~i ] + u     // Prepend character from a different index if bit is 1.
            : u + s[ 2 * n + ~i ] ;   // Append character from a different index if bit is 0.
    }

    // Add the count associated with the newly constructed string 'u' to 'a'.
    // The '~~' operator is used for a fast floor-like conversion to integer,
    // effectively converting 'undefined' or 'null' to 0 if 'm[u]' doesn't exist.
    a += ~~m[ u ] ;
}


// Final Output
// ------------
// The accumulated result in 'a' is printed to the standard output.
console . log( a ) ;