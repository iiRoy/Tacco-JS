/*
 * This file contains JavaScript code for processing input and performing
 * string matching using the Rabin-Karp algorithm.
 *
 * Configuration settings are defined at the top to control input source
 * and newline character handling, allowing flexibility between
 * different operating system environments (e.g., Windows vs. Linux).
 */

// config = { input: 'tmp', newline: '\r\n' }; // Example configuration for a Windows system
// The following line sets the configuration for standard input on a Linux/Unix system.
config = { input: '/dev/stdin', newline: '\n' }; /* Standard input configuration for Linux */


// Declare a variable 'line' to hold the input data.
// It will be populated by reading from the configured input source.
line = require('fs').readFileSync( config.input, 'ascii' ) // Read the entire file content synchronously in ASCII encoding.
    .split( config.newline ) ; // Split the raw content into an array of strings, using the configured newline character.

// Extract the primary text string (T) from the first line of input.
T = line[0] ;

// Parse the second line of input to determine the number of patterns (Q).
// The 'Number()' constructor ensures the string is converted to an integer.
Q = Number( line[1] ) ;

// Extract the pattern strings (P) from the input.
// The patterns start from the third line (index 2) and continue for 'Q' lines.
P = line.slice( 2, 2 + Q ) ;

// Explicitly set the 'line' variable to null to release memory resources.
// This is a good practice for large arrays after they are no longer needed.
line = null ; // Dispose of the 'line' array to free up memory.


/**
 * Implements the Rabin-Karp string matching algorithm.
 * This function searches for occurrences of a given pattern P within a text T.
 * It uses a rolling hash technique to efficiently compare substrings.
 *
 * @param {string} T - The main text string (the haystack) in which to search.
 * @param {string} P - The pattern string (the needle) to search for.
 * @param {number} d - The radix (base) for the hash function, typically 256 for extended ASCII characters.
 * @param {number} q - A large prime number used as a modulus for the hash calculation to prevent overflow and reduce collisions.
 * @returns {number} Returns 1 if the pattern is found within the text, otherwise returns 0.
 */
function rabinKarpMatcher
(
    T, // Parameter: The text string.
    P, // Parameter: The pattern string.
    d, // Parameter: The radix for hashing.
    q  // Parameter: The prime modulus for hashing.
)
{
    // Declare local variables used within this function.
    // Note: 'T' and 'P' declared here will shadow the function parameters
    // after their first assignment within this function, allowing them to be modified internally.
    var T, n, P, m, h, p, t, i, s;

    // Determine the length of the text string.
    n = T.length ;

    // Prepend an underscore to the text string. This is a common technique
    // in some algorithm implementations to make strings 1-indexed rather than 0-indexed,
    // simplifying array access logic in loops.
    T = "_" + T ; // Modify the local 'T' variable for 1-indexing.

    // Determine the length of the pattern string.
    m = P.length ;

    // Prepend an underscore to the pattern string, similar to the text, for 1-indexing.
    P = "_" + P ; // Modify the local 'P' variable for 1-indexing.

    // If the pattern is longer than the text, it's impossible to find a match.
    if ( m > n )
    {
        return 0 ; // Return 0 immediately as no match can exist.
    }

    // Precompute the value of (d^(m-1)) % q.
    // This value is used in the rolling hash calculation to subtract the contribution
    // of the leading character when shifting the window.
    h = Math.pow( d, m - 1 ) % q ;

    p = 0 ; // Initialize the hash value for the pattern to zero.
    t = {} ; // Initialize an object to store hash values for text windows.
    t[0] = 0 ; // Initialize the hash for the first text window (at shift 0).

    /*
     * Preprocessing phase:
     * Calculate the hash value for the pattern (p) and for the first text window (t[0]).
     * This loop iterates 'm' times, corresponding to the length of the pattern.
     */
    for ( i = 1 ; i <= m ; i++ )
    {
        // Compute the pattern hash using Horner's method: p = (d * p + P[i].charCodeAt()) % q.
        p = ( d * p + P[i].charCodeAt() ) % q ;

        // Compute the hash for the initial text window: t[0] = (d * t[0] + T[i].charCodeAt()) % q.
        t[0] = ( d * t[0] + T[i].charCodeAt() ) % q ;
    }

    /*
     * Matching phase:
     * Iterate through all possible shifts 's' from 0 up to (n - m).
     * For each shift, compare hashes and, if they match, perform a full string comparison.
     */
    for ( s = 0 ; s <= n - m ; s++ )
    {
        // If the hash of the current text window matches the pattern's hash,
        // a potential match has been found (a "hit").
        if ( p == t[s] )
        {
            // To confirm a true match and avoid spurious hits (hash collisions),
            // perform a direct character-by-character comparison of the substrings.
            if ( P.slice( 1, m + 1 ) === T.slice( s + 1, s + m + 1 ) )
            {
                // If the strings are identical, the pattern has been found.
                // console.log("Pattern found at shift: " + s); // This line is commented out in the original.
                return 1 ; // Return 1 to indicate a successful match.
            }
        }

        // If this is not the last possible text window,
        // calculate the hash for the next window using the rolling hash technique.
        if ( s < n - m )
        {
            /*
             * Rolling hash calculation:
             * t[s+1] = (d * (t[s] - T[s+1].charCodeAt() * h) + T[s+m+1].charCodeAt()) % q
             * This formula efficiently updates the hash by:
             * 1. Subtracting the contribution of the character leaving the window (T[s+1])
             * 2. Multiplying by 'd' to shift existing characters' contributions
             * 3. Adding the contribution of the new character entering the window (T[s+m+1])
             * All operations are performed modulo 'q' to keep the hash value within bounds.
             */
            t[s + 1] =
                (
                    d
                    *
                    (
                        t[s]
                        -
                        T[s + 1].charCodeAt()
                        *
                        h
                    )
                    +
                    T[s + m + 1].charCodeAt()
                )
                %
                q
            ;
        }
    }

    // If the loop completes without returning 1, it means the pattern was not found in the text.
    return 0 ; // Return 0 to indicate no match.
}


// Loop through each pattern stored in the 'P' array.
// The 'for...in' loop iterates over the keys (indices) of the array.
for
(
    i
    in
    P
)
{
    // For each pattern, call the Rabin-Karp matcher function.
    // The radix 'd' is set to 256 (for extended ASCII).
    // The modulus 'q' is set to a large prime number (2^31 - 1) to minimize collisions.
    // The result (1 or 0) is then printed to the console.
    console.log
    (
        rabinKarpMatcher
        (
            T, // The global text string.
            P[i], // The current pattern from the 'P' array.
            256, // Radix (base) for the hash function.
            Math.pow(2, 31) - 1 // A large prime number as the modulus.
        )
    ) ;
}