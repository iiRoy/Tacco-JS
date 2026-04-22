config = { input: 'tmp' , newline : '\r\n' }; /* Configuration for Windows environment */
// config = { input: '/dev/stdin', newline: '\n' }; // Uncomment for Linux/Unix systems

// Read the input file synchronously
// and split it into an array of lines based on the configured newline character.
line = require('fs')
    .readFileSync(config.input, 'ascii')
        .split(config.newline) ;

// Extract the main text (T) from the first line.
T = line[0] ;

// Convert the second line to a number to get the count of patterns (Q).
Q = Number ( line[1] ) ;

// Extract the patterns (P) from the remaining lines.
// The slice operation gets lines from index 2 up to (2 + Q).
P = line.slice( 2 , 2 + Q ) ;

// Release memory occupied by the 'line' array as it's no longer needed.
line = null ; /* Dispose of the temporary input array */


/**
 * Implements the Rabin-Karp string matching algorithm.
 * This function searches for occurrences of pattern P in text T.
 *
 * @param {string} T - The main text string.
 * @param {string} P - The pattern string to search for.
 * @param {number} d - The size of the alphabet (e.g., 256 for ASCII).
 * @param {number} q - A prime number used for the modulo operation to avoid overflow.
 * @returns {number} - Returns 1 if the pattern is found, 0 otherwise.
 */
function rabinKarpMatcher ( T , P , d , q ) {
    /* Declare all local variables at the beginning of the function scope */
    var T_local_copy , /* Local reference for the text string */
        n ,            /* Length of the text */
        P_local_copy , /* Local reference for the pattern string */
        m ,            /* Length of the pattern */
        h ,            /* Hash value for the highest digit of a window */
        p ,            /* Hash value of the pattern */
        t ,            /* Hash value of the current text window */
        i ,            /* Loop counter for preprocessing */
        s ;            /* Loop counter for matching (shift) */


    n = T.length ;                      /* Get the length of the text T */
    T_local_copy = "_" + T ;            /* Prepend a dummy character to make it 1-indexed */

    m = P.length ;                      /* Get the length of the pattern P */
    P_local_copy = "_" + P ;            /* Prepend a dummy character to make it 1-indexed */


    // Precompute (d^(m-1)) % q for efficient window hash calculation.
    h = Math.pow( d , m - 1 ) % q ;

    p = 0 ;       /* Initialize pattern hash */
    t = {} ;      /* Initialize an object to store text window hashes */
    t[0] = 0 ;    /* Initialize the hash for the first text window */


    // Preprocessing phase: Calculate hash for the pattern and the first text window.
    for ( i = 1 ; i <= m ; i ++ ) {
        // Calculate hash for the pattern P.
        p = ( d * p + P_local_copy[i].charCodeAt() ) % q ;

        // Calculate hash for the first text window T[1...m].
        t[0] = ( d * t[0] + T_local_copy[i].charCodeAt() ) % q ;
    }


    // Matching phase: Slide the window across the text and compare hashes.
    for ( s = 0 ; s <= n - m ; s ++ ) {
        // If hash values match, a potential match is found.
        // Perform a character-by-character check to avoid spurious hits.
        if ( p == t[s] ) {
            // Check if the pattern and the current text window are actually identical.
            if ( P_local_copy.slice( 1 , m + 1 ) === T_local_copy.slice( s + 1 , s + m + 1 ) ) {
                // console.log("Pattern found at shift: " + s); // Debugging line (commented out)
                return 1 ; /* Return 1 if a match is found */
            }
        }


        // If not the last window, calculate the hash for the next window (s+1).
        if ( s < n - m ) {
            t[s+1] =
                ( d * ( t[s] - T_local_copy[s+1].charCodeAt() * h ) + T_local_copy[s+m+1].charCodeAt() ) % q ;

            // Ensure the hash value remains positive (JavaScript's % operator can return negative for negative numbers).
            if ( t[s+1] < 0 ) {
                t[s+1] = t[s+1] + q ;
            }
        }
    }

    return 0 ; /* No match found after checking all windows */
}


// Iterate through each pattern in the P array and apply the Rabin-Karp matcher.
// The result (1 for found, 0 for not found) is printed to the console.
for ( i in P ) {
    console.log( rabinKarpMatcher( T , P[i] , 256 , Math.pow( 2 , 31 ) - 1 ) ) ;
}